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
        #if NUM_TEX_COORDS > 2
        attribute vec2 a_texCoord2;
        #endif
    #endif
#endif

#ifdef HAS_NORMAL_TEXTURE
attribute vec3 a_tangent;
attribute vec3 a_binormal;
#endif


//SKINNING UNIFORMS
const int SKINNING_JOINT_COUNT = 60;
uniform vec4 u_matrixPalette[SKINNING_JOINT_COUNT * 3];
uniform int u_animated;


//TEXTURE COORDINATES
#ifdef HAS_DIFFUSE_TEXTURE
varying vec2 v_diffuseCoords;
#endif
#ifdef HAS_SPECULAR_TEXTURE
varying vec2 v_specularCoords;
#endif
#ifdef HAS_NORMAL_TEXTURE
varying vec2 v_normalCoords;
#endif
#ifdef HAS_DIFFUSE2_TEXTURE
varying vec2 v_diffuse2Coords;
#endif
#ifdef HAS_EMISSIVE_TEXTURE
varying vec2 v_emissiveCoords;
#endif
#ifdef HAS_LIGHTMAP_TEXTURE
varying vec2 v_lightmapCoords;
#endif
#ifdef HAS_DIRTMAP_TEXTURE
varying vec2 v_dirtmapCoords;
#endif
#ifdef HAS_RIM_TEXTURE
varying vec2 v_rimMapCoords;
#endif


#if defined(NEEDS_NORMALS)
    uniform mat4 worldViewMat;
    varying vec3 v_eyeSpacePos;
    #ifndef HAS_NORMAL_TEXTURE
    varying vec3 v_normal;
    #endif
#elif defined(USE_FOG)
    uniform mat4 worldViewMat;
    varying float v_eyeSpaceDepth;
#endif

#if ((MAX_DIRECTIONAL_LIGHT_NUM > 0) || (MAX_POINT_LIGHT_NUM > 0) || (MAX_SPOT_LIGHT_NUM > 0))
    #define HAS_DYNAMIC_LIGHT
    //We have a distinction between scene and fx lights, for the case of baked diffuse that wants specular. Baked diffuse means it doesn't receive diffuse lighting from scene lights, but it does receive diffuse lighting from fx lights. (No such thing as directional fx lights)
    #if !defined(NUM_FX_SPOT_LIGHTS)
        #define NUM_FX_SPOT_LIGHTS 0
    #endif
    #define NUM_SCENE_SPOT_LIGHTS MAX_SPOT_LIGHT_NUM-NUM_FX_SPOT_LIGHTS

    #if !defined(NUM_FX_POINT_LIGHTS)
        #define NUM_FX_POINT_LIGHTS 0
    #endif
    #define NUM_SCENE_POINT_LIGHTS MAX_POINT_LIGHT_NUM-NUM_FX_POINT_LIGHTS
#endif

#if defined(USE_DIRLIGHT_SHADOWMAP) || defined(USE_SPOTLIGHT_SHADOWMAP)
    #define USE_SHADOWMAP
#endif

//LIGHTING SPECIFIC UNIFORMS AND VARYINGS
#ifdef HAS_DYNAMIC_LIGHT
    #ifdef USE_VERTEX_LIGHTING
        #ifdef USE_SHADOWMAP
            varying vec4 v_lightColor;
        #else
            varying vec3 v_lightColor;
        #endif

        #ifdef USE_SPECULAR
            uniform vec3 u_specColor;
            #ifdef USE_SHADOWMAP
                varying vec4 v_specColor;
            #else
                varying vec3 v_specColor;
            #endif

            #ifdef USE_SPECULAR_RADIUS
            uniform float u_specMinRadius;
            uniform float u_specMaxRadius;
            #endif
        #endif

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
        #if MAX_DIRECTIONAL_LIGHT_NUM > 0
            #ifdef HAS_NORMAL_TEXTURE
                uniform vec3 u_DirLightSourceDirection[MAX_DIRECTIONAL_LIGHT_NUM];
                varying vec3 v_dirLightDirection[MAX_DIRECTIONAL_LIGHT_NUM];
            #endif
        #endif

        #if MAX_POINT_LIGHT_NUM > 0
            uniform vec3 u_PointLightSourcePosition[MAX_POINT_LIGHT_NUM];
            varying vec3 v_vertexToPointLightDirection[MAX_POINT_LIGHT_NUM];
        #endif

        #if MAX_SPOT_LIGHT_NUM > 0
            #ifdef HAS_NORMAL_TEXTURE
                uniform vec3 u_SpotLightSourceDirection[MAX_SPOT_LIGHT_NUM];
                varying vec3 v_spotLightDirection[MAX_SPOT_LIGHT_NUM];
            #endif
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

#ifdef HAS_REFLECTION_TEXTURE
uniform vec3 u_cameraPosition;
varying vec3 v_reflectVector;
#endif

#ifdef USE_VERT_COLOR
varying vec4 v_vertColor;
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

#if defined(HAS_DYNAMIC_LIGHT) && defined(USE_VERTEX_LIGHTING)
vec3 computeLighting(vec3 normalVector, vec3 lightDirection, vec3 lightColor, float attenuation)
{
    float diffuse = max(dot(normalVector, lightDirection), 0.0);
    vec3 diffuseColor = lightColor * diffuse * attenuation;
    
    return diffuseColor;
}

#ifdef USE_SPECULAR
float computeSpecularCoefficient(vec3 normalVector, vec3 lightDirection, vec3 eyeDirection)
{
    vec3 halfVector = normalize(lightDirection + eyeDirection);
    float specFactor = max(dot(halfVector, normalVector), 0.0);
    
#ifdef USE_SPECULAR_RADIUS
    float cosMin = cos(u_specMinRadius);
    float cosMax = cos(u_specMaxRadius);
    specFactor = clamp((specFactor - cosMax) / (cosMin - cosMax), 0.0, 1.0);
    return specFactor*specFactor*specFactor;
#else
    return pow(specFactor, 20.0);
#endif
}
#endif
#endif

void main()
{
    #ifdef HAS_DYNAMIC_LIGHT
        vec4 pos;
        #ifdef HAS_NORMAL_TEXTURE
            vec3 eTangent;
            vec3 eBinormal;
            vec3 eNormal;
        #endif
    
        if (u_animated == 1) {
            pos = getPosition(a_position, 1.0);
            
            #if defined(HAS_REFLECTION_TEXTURE) || !defined(HAS_NORMAL_TEXTURE)
                vec4 norm = getPosition(a_normal, 0.0);
            #endif
            
            #ifdef HAS_REFLECTION_TEXTURE
                vec3 wNormal = normalize((CC_MVMatrix * norm).xyz);
                vec3 wPos = (CC_MVMatrix * pos).xyz;
                vec3 viewDir = u_cameraPosition - wPos;
                v_reflectVector = reflect(-viewDir, wNormal);
            #endif
            
            #ifdef HAS_NORMAL_TEXTURE
                eTangent = normalize((worldViewMat * getPosition(a_tangent, 0.0)).xyz);
                eBinormal = normalize((worldViewMat * getPosition(a_binormal, 0.0)).xyz);
                eNormal = normalize((worldViewMat * getPosition(a_normal, 0.0)).xyz);
            #else
                v_normal = normalize((worldViewMat * norm).xyz);
            #endif
        }
        else {
            pos = vec4(a_position, 1.0);
            
            #if defined(HAS_REFLECTION_TEXTURE) || !defined(HAS_NORMAL_TEXTURE)
                vec4 norm = vec4(a_normal, 0.0);
            #endif
            
            #ifdef HAS_REFLECTION_TEXTURE
                vec3 wNormal = normalize((CC_MVMatrix * norm).xyz);
                vec3 wPos = (CC_MVMatrix * pos).xyz;
                vec3 viewDir = u_cameraPosition - wPos;
                v_reflectVector = reflect(-viewDir, wNormal);
            #endif
            
            #ifdef HAS_NORMAL_TEXTURE
                eTangent = normalize((worldViewMat * vec4(a_tangent, 0.0)).xyz);
                eBinormal = normalize((worldViewMat * vec4(a_binormal, 0.0)).xyz);
                eNormal = normalize((worldViewMat * vec4(a_normal, 0.0)).xyz);
            #else
                v_normal = normalize((worldViewMat * norm).xyz);
            #endif
        }

        //Calculate shadow coordinates
        #ifdef USE_SHADOWMAP
            //Need to manually set a bias for shadow samplers.
            const float ShadowBias = 0.0001;
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
    
        #if defined(NEEDS_NORMALS)
        v_eyeSpacePos = (worldViewMat * pos).xyz;
        #elif defined(USE_FOG)
        v_eyeSpaceDepth = -(worldViewMat * pos).z;
        #endif
    
        gl_Position = CC_MVPMatrix * pos;
    
        #ifdef USE_VERTEX_LIGHTING
            #ifdef USE_SPECULAR
                vec3 eyeDir = normalize(v_eyeSpacePos);
                vec3 specColor = vec3(0.0);
            #endif
            vec3 lightColor = vec3(0.0);
            #if MAX_DIRECTIONAL_LIGHT_NUM > 0
                //Index 0 is the shadow casting light. We pack the lambert/specular intensity into the w componenet to save on varyings.
                #ifdef USE_DIRLIGHT_SHADOWMAP
                vec3 ldir = normalize(u_DirLightSourceDirection[0]);
                v_lightColor.w = max(dot(v_normal, -ldir), 0.0);
                #ifdef USE_SPECULAR
                    v_specColor.w = computeSpecularCoefficient(v_normal, -ldir, -eyeDir);
                #endif
    
                for (int i = 1; i < MAX_DIRECTIONAL_LIGHT_NUM; ++i)
                #else
                for (int i = 0; i < MAX_DIRECTIONAL_LIGHT_NUM; ++i)
                #endif
                {
                    vec3 ldir = normalize(u_DirLightSourceDirection[i]);
                    vec3 curLight = computeLighting(v_normal, -ldir, u_DirLightSourceColor[i], 1.0);
                    #ifndef USE_BAKED_DIFFUSE
                    lightColor += curLight;
                    #endif
                    #ifdef USE_SPECULAR
                    specColor += computeSpecularCoefficient(v_normal, -ldir, -eyeDir) * u_specColor * curLight;
                    #endif
                }
            #endif
    
            #if (MAX_POINT_LIGHT_NUM > 0)
            for (int i = 0; i < NUM_SCENE_POINT_LIGHTS; ++i)
            {
                vec3 vertToLight = u_PointLightSourcePosition[i] - v_eyeSpacePos;
                vec3 ldir = vertToLight * u_PointLightSourceRangeInverse[i];
                float attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
                vertToLight = normalize(vertToLight);
                vec3 curLight = computeLighting(v_normal, vertToLight, u_PointLightSourceColor[i], attenuation);
                #ifndef USE_BAKED_DIFFUSE
                lightColor += curLight;
                #endif
                #ifdef USE_SPECULAR
                specColor += computeSpecularCoefficient(v_normal, vertToLight, -eyeDir) * u_specColor * curLight;
                #endif
            }
            for (int i = NUM_SCENE_POINT_LIGHTS; i < MAX_POINT_LIGHT_NUM; ++i)
            {
                vec3 vertToLight = u_PointLightSourcePosition[i] - v_eyeSpacePos;
                vec3 ldir = vertToLight * u_PointLightSourceRangeInverse[i];
                float attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
                vertToLight = normalize(vertToLight);
                vec3 curLight = computeLighting(v_normal, vertToLight, u_PointLightSourceColor[i], attenuation);
                lightColor += curLight;
                #ifdef USE_SPECULAR
                specColor += computeSpecularCoefficient(v_normal, vertToLight, -eyeDir) * u_specColor * curLight;
                #endif
            }
            #endif
    
            #if (MAX_SPOT_LIGHT_NUM > 0)
                #ifdef USE_SPOTLIGHT_SHADOWMAP
                //Index 0 is the shadow casting light. We pack the lambert/specular intensity into the w componenet to save on varyings.
                vec3 vertToLight = u_SpotLightSourcePosition[0] - v_eyeSpacePos;
                vec3 ldir = vertToLight * u_SpotLightSourceRangeInverse[0];
                float attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
                vertToLight = normalize(vertToLight);
                
                vec3 spotLightDirection = normalize(u_SpotLightSourceDirection[0]);
                float spotCurrentAngleCos = dot(spotLightDirection, -vertToLight);
                attenuation *= smoothstep(u_SpotLightSourceOuterAngleCos[0], u_SpotLightSourceInnerAngleCos[0], spotCurrentAngleCos);
    
                v_lightColor.w = max(dot(v_normal, vertToLight), 0.0) * attenuation;
                #ifdef USE_SPECULAR
                    v_specColor.w = computeSpecularCoefficient(v_normal, vertToLight, -eyeDir);
                #endif
    
                for (int i = 1; i < NUM_SCENE_SPOT_LIGHTS; ++i)
                #else
                for (int i = 0; i < NUM_SCENE_SPOT_LIGHTS; ++i)
                #endif
                {
                    vec3 vertToLight = u_SpotLightSourcePosition[i] - v_eyeSpacePos;
                    vec3 ldir = vertToLight * u_SpotLightSourceRangeInverse[i];
                    float attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
                    vertToLight = normalize(vertToLight);
                    
                    vec3 spotLightDirection = normalize(u_SpotLightSourceDirection[i]);
            
                    float spotCurrentAngleCos = dot(spotLightDirection, -vertToLight);
            
                    attenuation *= smoothstep(u_SpotLightSourceOuterAngleCos[i], u_SpotLightSourceInnerAngleCos[i], spotCurrentAngleCos);
            
                    vec3 curLight = computeLighting(v_normal, vertToLight, u_SpotLightSourceColor[i], attenuation);
                    #ifndef USE_BAKED_DIFFUSE
                    lightColor += curLight;
                    #endif
                    #ifdef USE_SPECULAR
                    specColor += computeSpecularCoefficient(v_normal, vertToLight, -eyeDir) * u_specColor * curLight;
                    #endif
                }
                for (int i = NUM_SCENE_SPOT_LIGHTS; i < MAX_SPOT_LIGHT_NUM; ++i)
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
                    
                    #ifdef USE_SPECULAR
                    specColor += computeSpecularCoefficient(v_normal, vertToLight, -eyeDir) * u_specColor * curLight;
                    #endif
                }
            #endif
            v_lightColor.rgb = lightColor;
            #ifdef USE_SPECULAR
            v_specColor.rgb = specColor;
            #endif
        #else
            #if MAX_DIRECTIONAL_LIGHT_NUM
                #ifdef HAS_NORMAL_TEXTURE
                    for (int i = 0; i < MAX_DIRECTIONAL_LIGHT_NUM; ++i)
                    {
                        v_dirLightDirection[i].x = dot(eTangent, u_DirLightSourceDirection[i]);
                        v_dirLightDirection[i].y = dot(eBinormal, u_DirLightSourceDirection[i]);
                        v_dirLightDirection[i].z = dot(eNormal, u_DirLightSourceDirection[i]);
                    }
                #endif
            #endif
        
            #if MAX_POINT_LIGHT_NUM
                for (int i = 0; i < MAX_POINT_LIGHT_NUM; ++i)
                {
                    #ifdef HAS_NORMAL_TEXTURE
                        vec3 dirToPointLight = u_PointLightSourcePosition[i] - v_eyeSpacePos;
                        v_vertexToPointLightDirection[i].x = dot(eTangent, dirToPointLight);
                        v_vertexToPointLightDirection[i].y = dot(eBinormal, dirToPointLight);
                        v_vertexToPointLightDirection[i].z = dot(eNormal, dirToPointLight);
                    #else
                        v_vertexToPointLightDirection[i] = u_PointLightSourcePosition[i] - v_eyeSpacePos;
                    #endif
                }
            #endif

            #if MAX_SPOT_LIGHT_NUM
                for (int i = 0; i < MAX_SPOT_LIGHT_NUM; ++i)
                {
                    #ifdef HAS_NORMAL_TEXTURE
                        vec3 dirToSpotlight = u_SpotLightSourcePosition[i] - v_eyeSpacePos;
                        v_vertexToSpotLightDirection[i].x = dot(eTangent, dirToSpotlight);
                        v_vertexToSpotLightDirection[i].y = dot(eBinormal, dirToSpotlight);
                        v_vertexToSpotLightDirection[i].z = dot(eNormal, dirToSpotlight);
                    
                        v_spotLightDirection[i].x = dot(eTangent, u_SpotLightSourceDirection[i]);
                        v_spotLightDirection[i].y = dot(eBinormal, u_SpotLightSourceDirection[i]);
                        v_spotLightDirection[i].z = dot(eNormal, u_SpotLightSourceDirection[i]);
                    #else
                        v_vertexToSpotLightDirection[i] = u_SpotLightSourcePosition[i] - v_eyeSpacePos;
                    #endif
                }
            #endif
        #endif
    #else
        if (u_animated == 1) {
            vec4 pos = getPosition(a_position, 1.0);
            #ifdef HAS_REFLECTION_TEXTURE
                vec3 wNormal = normalize((CC_MVMatrix * getPosition(a_normal, 0.0)).xyz);
                vec3 wPos = (CC_MVMatrix * pos).xyz;
                vec3 viewDir = u_cameraPosition - wPos;
                v_reflectVector = reflect(-viewDir, wNormal);
            #endif
            
            #if defined(NEEDS_NORMALS)
                vec4 norm = getPosition(a_normal, 0.0);
                v_normal = (worldViewMat * norm).xyz;
                v_eyeSpacePos = (worldViewMat * pos).xyz;
            #elif defined(USE_FOG)
                v_eyeSpaceDepth = -(worldViewMat * pos).z;
            #endif
            
            gl_Position = CC_MVPMatrix * pos;
        }
        else {
            vec4 pos = vec4(a_position, 1.0);
            #ifdef HAS_REFLECTION_TEXTURE
                vec3 wNormal = normalize((CC_MVMatrix * vec4(a_normal, 0.0)).xyz);
                vec3 wPos = (CC_MVMatrix * pos).xyz;
                vec3 viewDir = u_cameraPosition - wPos;
                v_reflectVector = reflect(-viewDir, wNormal);
            #endif
            
            #if defined(NEEDS_NORMALS)
                vec4 norm = vec4(a_normal, 0.0);
                v_normal = (worldViewMat * norm).xyz;
                v_eyeSpacePos = (worldViewMat * pos).xyz;
            #elif defined(USE_FOG)
                v_eyeSpaceDepth = -(worldViewMat * pos).z;
            #endif
            
            gl_Position = CC_MVPMatrix * pos;
        }
    #endif

    #ifdef HAS_DIFFUSE_TEXTURE
        v_diffuseCoords = a_texCoord;
        v_diffuseCoords.y = 1.0 - v_diffuseCoords.y;
    #endif
    
    #ifdef HAS_SPECULAR_TEXTURE
        v_specularCoords = a_texCoord;
        v_specularCoords.y = 1.0 - v_specularCoords.y;
    #endif
    
    #ifdef HAS_NORMAL_TEXTURE
        v_normalCoords = a_texCoord;
        v_normalCoords.y = 1.0 - v_normalCoords.y;
    #endif
    
    #ifdef HAS_DIFFUSE2_TEXTURE
        #if DIFFUSE_2_COORDS == 2
            v_diffuse2Coords = a_texCoord2;
        #elif DIFFUSE_2_COORDS == 1
            v_diffuse2Coords = a_texCoord1;
        #else
            v_diffuse2Coords = a_texCoord;
        #endif
        v_diffuse2Coords.y = 1.0 - v_diffuse2Coords.y;
    #endif
    
    #ifdef HAS_EMISSIVE_TEXTURE
        #if EMISSIVE_COORDS == 2
            v_emissiveCoords = a_texCoord2;
        #elif EMISSIVE_COORDS == 1
            v_emissiveCoords = a_texCoord1;
        #else
            v_emissiveCoords = a_texCoord;
        #endif
        v_emissiveCoords.y = 1.0 - v_emissiveCoords.y;
    #endif
    
    #ifdef HAS_LIGHTMAP_TEXTURE
        #if LIGHTMAP_COORDS == 2
            v_lightmapCoords = a_texCoord2;
        #elif LIGHTMAP_COORDS == 1
            v_lightmapCoords = a_texCoord1;
        #else
            v_lightmapCoords = a_texCoord;
        #endif
        v_lightmapCoords.y = 1.0 - v_lightmapCoords.y;
    #endif
    
    #ifdef HAS_DIRTMAP_TEXTURE
        #if DIRTMAP_COORDS == 2
            v_dirtmapCoords = a_texCoord2;
        #elif DIRTMAP_COORDS == 1
            v_dirtmapCoords = a_texCoord1;
        #else
            v_dirtmapCoords = a_texCoord;
        #endif
        v_dirtmapCoords.y = 1.0 - v_dirtmapCoords.y;
    #endif
    
    #ifdef HAS_RIM_TEXTURE
        #if RIMMAP_COORDS == 2
            v_rimMapCoords = a_texCoord2;
        #elif RIMMAP_COORDS == 1
            v_rimMapCoords = a_texCoord1;
        #else
            v_rimMapCoords = a_texCoord;
        #endif
        v_rimMapCoords.y = 1.0 - v_rimMapCoords.y;
    #endif
    
    #ifdef USE_VERT_COLOR
        v_vertColor = a_color;
    #endif
}