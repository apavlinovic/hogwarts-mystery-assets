precision highp int;
precision highp float;

//VERTEX ATTRIBUTES
attribute vec3 a_position;
attribute vec4 a_blendWeight;
attribute vec4 a_blendIndex;
attribute vec3 a_normal;
attribute vec4 a_color;

#if NUM_TEX_COORDS > 0
attribute vec2 a_texCoord;
    #if NUM_TEX_COORDS > 1
    attribute vec2 a_texCoord1;
    #endif
#endif

//SKINNING UNIFORMS
const int SKINNING_JOINT_COUNT = 60;
uniform vec4 u_matrixPalette[SKINNING_JOINT_COUNT * 3];
uniform int u_animated;


//TEXTURE COORDINATES
#ifdef USE_DIFFUSE
varying vec2 v_diffuseCoords;
#endif

#ifdef USE_EMISSIVE
varying vec2 v_emissiveCoords;
#endif

uniform mat4 worldViewMat;
uniform mat4 u_worldToHeadMat;
uniform vec3 u_cameraPosition;
varying vec3 v_eyeSpacePos;
varying vec3 v_normal;
varying vec3 v_headNormal;

#ifdef HAS_REFLECTION_TEXTURE
varying vec3 v_reflectVector;
#endif


#if ((MAX_DIRECTIONAL_LIGHT_NUM > 0) || (MAX_POINT_LIGHT_NUM > 0) || (MAX_SPOT_LIGHT_NUM > 0))
    #define HAS_DYNAMIC_LIGHT
#endif

#if defined(USE_DIRLIGHT_SHADOWMAP) || defined(USE_SPOTLIGHT_SHADOWMAP)
    #define USE_SHADOWMAP
#endif

//LIGHTING SPECIFIC UNIFORMS AND VARYINGS
#ifdef HAS_DYNAMIC_LIGHT
    #ifdef USE_VERTEX_LIGHTING
        varying vec3 v_lightColor;
        #if (MAX_DIRECTIONAL_LIGHT_NUM > 0)
            uniform vec3 u_DirLightSourceColor[MAX_DIRECTIONAL_LIGHT_NUM];
            uniform vec3 u_DirLightSourceDirection[MAX_DIRECTIONAL_LIGHT_NUM];
        #endif

        #if (MAX_POINT_LIGHT_NUM > 0)
            uniform vec3 u_PointLightSourcePosition[MAX_POINT_LIGHT_NUM];
            uniform vec3 u_PointLightSourceColor[MAX_POINT_LIGHT_NUM];
            uniform float u_PointLightSourceRangeInverse[MAX_POINT_LIGHT_NUM];
        #endif

        #if (MAX_SPOT_LIGHT_NUM > 0)
            uniform vec3 u_SpotLightSourcePosition[MAX_SPOT_LIGHT_NUM];
            uniform vec3 u_SpotLightSourceColor[MAX_SPOT_LIGHT_NUM];
            uniform vec3 u_SpotLightSourceDirection[MAX_SPOT_LIGHT_NUM]; 
            uniform float u_SpotLightSourceInnerAngleCos[MAX_SPOT_LIGHT_NUM];
            uniform float u_SpotLightSourceOuterAngleCos[MAX_SPOT_LIGHT_NUM];
            uniform float u_SpotLightSourceRangeInverse[MAX_SPOT_LIGHT_NUM];
        #endif
    #else
        #if MAX_POINT_LIGHT_NUM > 0
            uniform vec3 u_PointLightSourcePosition[MAX_POINT_LIGHT_NUM];
            varying vec3 v_vertexToPointLightDirection[MAX_POINT_LIGHT_NUM];
        #endif

        #if MAX_SPOT_LIGHT_NUM > 0
            uniform vec3 u_SpotLightSourcePosition[MAX_SPOT_LIGHT_NUM];
            varying vec3 v_vertexToSpotLightDirection[MAX_SPOT_LIGHT_NUM];
        #endif
    #endif

    #ifdef USE_SHADOWMAP
        uniform mat4 u_biasLightVPMatrix[NUM_CASCADES]; //Shadow bias * Light VP matrix. Need to change if we want just the light matrix.

//This shit's kinda crazy, but we specify different varyings for these different settings to maximize speed. Directional lights don't need to do the homogenous divide, so they can avoid dependent texture reads if they're not an array. (array of size 1 will count as dependent)
        #ifdef USE_CASCADES
            varying float v_viewDepth;
            #ifdef USE_DIRLIGHT_SHADOWMAP
                varying vec3 v_shadowTexCoords[NUM_CASCADES];
            #else
                varying vec4 v_shadowTexCoords[NUM_CASCADES];
            #endif
        #else
            #ifdef USE_DIRLIGHT_SHADOWMAP
                #ifdef USE_SHADOW_SAMPLER
                varying vec3 v_shadowTexCoords;
                #else
                varying vec2 v_shadowTexCoords;
                varying float v_shadowDepth;
                #endif
            #else
                varying vec4 v_shadowTexCoords;
            #endif
        #endif
    #endif
#endif

vec4 getPosition(vec3 v, float w)
{
    float blendWeight = a_blendWeight[0];
    
    int matrixIndex = int (a_blendIndex[0]) * 3;
    vec4 matrixPalette1 = u_matrixPalette[matrixIndex] * blendWeight;
    vec4 matrixPalette2 = u_matrixPalette[matrixIndex + 1] * blendWeight;
    vec4 matrixPalette3 = u_matrixPalette[matrixIndex + 2] * blendWeight;
    
    
    blendWeight = a_blendWeight[1];
    if (blendWeight > 0.0)
    {
        matrixIndex = int(a_blendIndex[1]) * 3;
        matrixPalette1 += u_matrixPalette[matrixIndex] * blendWeight;
        matrixPalette2 += u_matrixPalette[matrixIndex + 1] * blendWeight;
        matrixPalette3 += u_matrixPalette[matrixIndex + 2] * blendWeight;
        
        blendWeight = a_blendWeight[2];
        if (blendWeight > 0.0)
        {
            matrixIndex = int(a_blendIndex[2]) * 3;
            matrixPalette1 += u_matrixPalette[matrixIndex] * blendWeight;
            matrixPalette2 += u_matrixPalette[matrixIndex + 1] * blendWeight;
            matrixPalette3 += u_matrixPalette[matrixIndex + 2] * blendWeight;
            
            blendWeight = a_blendWeight[3];
            if (blendWeight > 0.0)
            {
                matrixIndex = int(a_blendIndex[3]) * 3;
                matrixPalette1 += u_matrixPalette[matrixIndex] * blendWeight;
                matrixPalette2 += u_matrixPalette[matrixIndex + 1] * blendWeight;
                matrixPalette3 += u_matrixPalette[matrixIndex + 2] * blendWeight;
            }
        }
    }
    
    vec4 _skinnedPosition;
    vec4 postion = vec4(v , w);
    _skinnedPosition.x = dot(postion, matrixPalette1);
    _skinnedPosition.y = dot(postion, matrixPalette2);
    _skinnedPosition.z = dot(postion, matrixPalette3);
    _skinnedPosition.w = postion.w;
    
    return _skinnedPosition;
}

#ifdef USE_VERTEX_LIGHTING
vec3 computeLighting(vec3 normalVector, vec3 lightDirection, vec3 lightColor, float attenuation)
{
    float diffuse = max(dot(normalVector, lightDirection), 0.0);
    vec3 diffuseColor = lightColor * diffuse * attenuation;
    
    return diffuseColor;
}
#endif

void main()
{
    vec4 pos;
    vec4 norm;
    if (u_animated == 1) {
        pos = getPosition(a_position, 1.0);
        norm = getPosition(a_normal, 0.0);
    }
    else {
        pos = vec4(a_position, 1.0);
        norm = vec4(a_normal, 0.0);
    }

    vec4 worldNormal = normalize(CC_MVMatrix * norm);
    v_headNormal = (u_worldToHeadMat * worldNormal).xyz;
    v_normal = normalize((worldViewMat * norm).xyz);
    v_eyeSpacePos = (worldViewMat * pos).xyz;
    gl_Position = CC_MVPMatrix * pos;
    
    #ifdef HAS_REFLECTION_TEXTURE
    vec3 wPos = (CC_MVMatrix * pos).xyz;
    vec3 viewDir = u_cameraPosition - wPos;
    v_reflectVector = reflect(-viewDir, worldNormal.xyz);
    #endif
    
    #ifdef HAS_DYNAMIC_LIGHT
        //Calculate shadow coordinates
        #ifdef USE_SHADOWMAP
            //Need to manually set a bias for shadow samplers.
            const float ShadowBias = 0.001;
            #ifdef USE_CASCADES
                vec4 viewPos = worldViewMat * pos;
                v_viewDepth = -viewPos.z;
        
                for (int i = 0; i < NUM_CASCADES; ++i)
                {
                    vec4 shadowPos = u_biasLightVPMatrix[i] * CC_MVMatrix * pos;
                    #ifdef USE_DIRLIGHT_SHADOWMAP
                        v_shadowTexCoords[i] = shadowPos.xyz;
                        #ifdef USE_SHADOW_SAMPLER
                        v_shadowTexCoords[i].z -= ShadowBias;
                        #endif
                    #else
                    v_shadowTexCoords[i] = shadowPos;
                    #endif
                    
                }
            #else
                vec4 shadowPos = u_biasLightVPMatrix[0] * CC_MVMatrix * pos;
                #ifdef USE_DIRLIGHT_SHADOWMAP
                    #ifdef USE_SHADOW_SAMPLER
                    v_shadowTexCoords = shadowPos.xyz;
                    v_shadowTexCoords.z -= ShadowBias;
                    #else
                    v_shadowTexCoords = shadowPos.xy;
                    v_shadowDepth = shadowPos.z;
                    #endif
                #else
                v_shadowTexCoords = shadowPos;
                #endif
            #endif
        #endif
    
        #ifdef USE_VERTEX_LIGHTING
            vec3 lightColor = vec3(0.0);
            #if MAX_DIRECTIONAL_LIGHT_NUM > 0
            for (int i = 0; i < MAX_DIRECTIONAL_LIGHT_NUM; ++i)
            {
                vec3 ldir = normalize(u_DirLightSourceDirection[i]);
                vec3 curLight = computeLighting(v_normal, -ldir, u_DirLightSourceColor[i], 1.0);
                lightColor += curLight;
            }
            #endif
    
            #if (MAX_POINT_LIGHT_NUM > 0)
            for (int i = 0; i < MAX_POINT_LIGHT_NUM; ++i)
            {
                vec3 vertToLight = u_PointLightSourcePosition[i] - v_eyeSpacePos;
                vec3 ldir = vertToLight * u_PointLightSourceRangeInverse[i];
                float attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
                vec3 curLight = computeLighting(v_normal, normalize(vertToLight), u_PointLightSourceColor[i], attenuation);
                lightColor += curLight;
            }
            #endif
    
            #if (MAX_SPOT_LIGHT_NUM > 0)
            for (int i = 0; i < MAX_SPOT_LIGHT_NUM; ++i)
            {
                vec3 vertToLight = u_SpotLightSourcePosition[i] - v_eyeSpacePos;
                vec3 ldir = vertToLight * u_SpotLightSourceRangeInverse[i];
                float attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
                vertToLight = normalize(vertToLight);
                
                vec3 spotLightDirection = normalize(u_SpotLightSourceDirection[i]);
                float spotCurrentAngleCos = dot(spotLightDirection, -vertToLight);
                attenuation *= smoothstep(u_SpotLightSourceOuterAngleCos[i], u_SpotLightSourceInnerAngleCos[i], spotCurrentAngleCos);
        
                vec3 curLight = computeLighting(v_normal, vertToLight, u_SpotLightSourceColor[i], attenuation);
                lightColor += curLight;
            }
            #endif
            v_lightColor = lightColor;
        #else
            #if MAX_POINT_LIGHT_NUM
            for (int i = 0; i < MAX_POINT_LIGHT_NUM; ++i)
            {
                v_vertexToPointLightDirection[i] = u_PointLightSourcePosition[i] - v_eyeSpacePos;
            }
            #endif

            #if MAX_SPOT_LIGHT_NUM
            for (int i = 0; i < MAX_SPOT_LIGHT_NUM; ++i)
            {
                v_vertexToSpotLightDirection[i] = u_SpotLightSourcePosition[i] - v_eyeSpacePos;
            }
            #endif
        #endif
    #endif

    #ifdef USE_DIFFUSE
    v_diffuseCoords = a_texCoord;
    v_diffuseCoords.y = 1.0 - v_diffuseCoords.y;
    #endif
    
    #ifdef USE_EMISSIVE
        #if EMISSIVE_COORDS == 1
            v_emissiveCoords = a_texCoord1;
        #else
            v_emissiveCoords = a_texCoord;
        #endif
        v_emissiveCoords.y = 1.0 - v_emissiveCoords.y;
    #endif
}