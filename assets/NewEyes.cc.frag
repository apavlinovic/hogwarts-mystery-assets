precision highp int;
precision highp float;

#if defined(USE_DIFFUSE)
uniform sampler2D u_diffuse;
uniform sampler2D u_mask;
varying vec2 v_diffuseCoords;
uniform vec3 u_diffuseColor;
#endif

#ifdef USE_SPECULAR
uniform vec3 u_specColor;
uniform float u_specMinRadius;
uniform float u_specMaxRadius;
#endif

#ifdef HAS_REFLECTION_TEXTURE
    uniform samplerCube u_reflectionCubeMap;
    varying vec3 v_reflectVector;
    uniform float u_reflectionAmount;
    #ifdef USE_REFLECTION_ANGLE
        uniform float u_reflectionAngle;
    #endif
    #ifdef USE_REFLECTION_TINT
        uniform vec3 u_reflectionTintColor;
    #endif
#endif

#ifdef USE_FOG
    uniform vec3 u_fogColor;
    uniform float u_maxFogDistance;
    uniform float u_minFogDistance;
    uniform float u_maxFog;
#endif

uniform float alpha;

varying vec3 v_eyeSpacePos;
varying vec3 v_normal;
varying vec3 v_headNormal;

#if ((MAX_DIRECTIONAL_LIGHT_NUM > 0) || (MAX_POINT_LIGHT_NUM > 0) || (MAX_SPOT_LIGHT_NUM > 0))
    #define HAS_DYNAMIC_LIGHT
    #if defined(USE_DIRLIGHT_SHADOWMAP) || defined(USE_SPOTLIGHT_SHADOWMAP)
        #define USE_SHADOWMAP
    #endif
#endif

#ifdef USE_AMBIENT_COLOR
    uniform vec3 u_AmbientLightSourceColor;
#endif


#ifdef HAS_DYNAMIC_LIGHT
    #ifdef USE_VERTEX_LIGHTING
        varying vec3 v_lightColor;
    #else
        #if (MAX_DIRECTIONAL_LIGHT_NUM > 0)
            uniform vec3 u_DirLightSourceColor[MAX_DIRECTIONAL_LIGHT_NUM];
            uniform vec3 u_DirLightSourceDirection[MAX_DIRECTIONAL_LIGHT_NUM];
        #endif

        #if (MAX_POINT_LIGHT_NUM > 0)
            uniform vec3 u_PointLightSourceColor[MAX_POINT_LIGHT_NUM];
            uniform float u_PointLightSourceRangeInverse[MAX_POINT_LIGHT_NUM];
            varying vec3 v_vertexToPointLightDirection[MAX_POINT_LIGHT_NUM];
        #endif

        #if (MAX_SPOT_LIGHT_NUM > 0)
            uniform vec3 u_SpotLightSourceColor[MAX_SPOT_LIGHT_NUM];
            uniform vec3 u_SpotLightSourceDirection[MAX_SPOT_LIGHT_NUM]; 
            uniform float u_SpotLightSourceInnerAngleCos[MAX_SPOT_LIGHT_NUM];
            uniform float u_SpotLightSourceOuterAngleCos[MAX_SPOT_LIGHT_NUM];
            uniform float u_SpotLightSourceRangeInverse[MAX_SPOT_LIGHT_NUM];
            varying vec3 v_vertexToSpotLightDirection[MAX_SPOT_LIGHT_NUM];
        #endif
    #endif

    #ifdef USE_SHADOWMAP
        #ifdef USE_SHADOW_SAMPLER
            uniform sampler2DShadow u_shadowMap;
        #else
            uniform sampler2D u_shadowMap;
        #endif

        #ifdef USE_CASCADES
            uniform float u_cascadeSplits[NUM_CASCADES];
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

        #ifdef USE_POISSON_DISK
            uniform vec2 u_diskKernel[NUM_DISK_SAMPLES];
            uniform float u_diskRadius;
            uniform float u_shadowTexelSize;
        #endif
    #endif
#endif

#ifdef USE_SHADOWMAP
float randomAngle(vec3 pos, float freq)
{
    float dt = dot((pos * freq), vec3(53.1215, 21.1352, 9.1322));
    return fract(sin(dt) * 2105.2354) * 6.283285;
}

const float ShadowBias = 0.001;
float shadowValForKernelPos(vec2 pos, float depth, int index)
{
    float shadowAmount = 0.0;
    #ifdef USE_POISSON_DISK
        #ifdef USE_ROTATED_DISK
        float rotAngle = randomAngle(vec3(pos, depth), 15.0);
        float sinAngle = sin(rotAngle);
        float cosAngle = cos(rotAngle);
        #endif
    
        float radius = u_diskRadius / float(index+1);
        for (int i = 0; i < NUM_DISK_SAMPLES; ++i)
        {
            vec2 coordOffset = u_diskKernel[i] * (radius * u_shadowTexelSize);
            #ifdef USE_ROTATED_DISK
            coordOffset = vec2(coordOffset.x*cosAngle - coordOffset.y*sinAngle, coordOffset.x*sinAngle + coordOffset.y*cosAngle);
            #endif
            
            float curD = texture2D(u_shadowMap, pos + coordOffset).r;
            float depthDelta = (depth-ShadowBias) - curD;
            shadowAmount += float(depthDelta <= 0.0);
        }
    
        shadowAmount /= float(NUM_DISK_SAMPLES);
    
    #else
        //We can avoid dependent texture read on directional light
        #ifdef USE_DIRLIGHT_SHADOWMAP
            #ifdef USE_CASCADES
                #ifdef USE_SHADOW_SAMPLER
                shadowAmount = shadow2DEXT(u_shadowMap, v_shadowTexCoords[index]);
                #else
                float curD = texture2D(u_shadowMap, v_shadowTexCoords[index].xy).r;
                shadowAmount = float(depth - ShadowBias <= curD);
                #endif
            #else
                #ifdef USE_SHADOW_SAMPLER
                shadowAmount = shadow2DEXT(u_shadowMap, v_shadowTexCoords);
                #else
                float curD = texture2D(u_shadowMap, v_shadowTexCoords).r;
                shadowAmount = float(depth - ShadowBias <= curD);
                #endif
            #endif
        #else
            //Gotta use values passed in for spotlight, due to w component.
            #ifdef USE_SHADOW_SAMPLER
            shadowAmount = shadow2DEXT(u_shadowMap, vec3(pos, depth));
            #else
            float curD = texture2D(u_shadowMap, pos).r;
            shadowAmount = float(depth - ShadowBias <= curD);
            #endif
        #endif
    #endif
    const float minLight = 0.3;
    return clamp((shadowAmount - minLight) / (1.0 - minLight), minLight, 1.0);
}
#endif

#if defined(HAS_DYNAMIC_LIGHT) && !defined(USE_VERTEX_LIGHTING)
vec3 computeLighting(vec3 normalVector, vec3 lightDirection, vec3 lightColor, float attenuation)
{
    float diffuse = max(dot(normalVector, lightDirection), 0.0);
    vec3 diffuseColor = lightColor * diffuse * attenuation;
    
    return diffuseColor;
}
#endif


//This is a fake specular highlight, which will follow the camera. Use normal instead of light vector when computing the halfVector.
#ifdef USE_SPECULAR
vec3 computeSpecularLight(vec3 normalVector, vec3 eyeDirection)
{
    vec3 halfVector = normalize(normalVector + eyeDirection);
    float specFactor = max(dot(halfVector, normalVector), 0.0);
    
    float cosMin = cos(u_specMinRadius);
    float cosMax = cos(u_specMaxRadius);
    
    specFactor = clamp((specFactor - cosMax) / (cosMin - cosMax), 0.0, 1.0);
    float specAmount = specFactor*specFactor*specFactor;
    
    return u_specColor * specAmount;
}
#endif


void main()
{
    float shadowVal = 1.0;
    #ifdef USE_SHADOWMAP
        int index = 0;
        #ifdef USE_CASCADES
            for (int i = 0; i < NUM_CASCADES-1; ++i)
            {
                index += int(v_viewDepth > u_cascadeSplits[i]);
            }
            #ifdef USE_DIRLIGHT_SHADOWMAP
            vec3 shadowCoords = v_shadowTexCoords[index];
            #else
            vec3 shadowCoords = v_shadowTexCoords[index].xyz / v_shadowTexCoords[index].w;
            #endif
        #else
            #ifdef USE_DIRLIGHT_SHADOWMAP
                #ifdef USE_SHADOW_SAMPLER
                vec3 shadowCoords = v_shadowTexCoords;
                #else
                vec3 shadowCoords = vec3(v_shadowTexCoords, v_shadowDepth);
                #endif
            #else
            vec3 shadowCoords = v_shadowTexCoords.xyz / v_shadowTexCoords.w;
            #endif
        #endif
    
        //In the current implementation, only spotlights need to worry about things outside the shadowmap range. Directional shadows are set up so that all rendered receivers will be in valid shadow texture space.
        #ifdef USE_SPOTLIGHT_SHADOWMAP
        if (shadowCoords.x >= 0.0 && shadowCoords.x <= 1.0 && shadowCoords.y >= 0.0 && shadowCoords.y <= 1.0)
        #endif
        {
            float curDepth = shadowCoords.z;
            shadowVal = shadowValForKernelPos(shadowCoords.xy, curDepth, index);
        }
    
        #ifdef DRAW_CASCADE_REGIONS
        if (index == 0)
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        else if (index == 1)
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        else if (index == 2)
            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
        else if (index == 3)
            gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
        return;
        #endif
    #endif
    
    
    #ifdef USE_DIFFUSE
    vec3 gradient = texture2D(u_diffuse, v_diffuseCoords).rgb;
    vec3 maskColor = texture2D(u_mask, v_diffuseCoords).rgb;
    vec3 diffuseColor = mix(vec3(1.0), u_diffuseColor, maskColor.g) * gradient;
    
    //Darken based on head-space normal.
    vec3 headNorm = normalize(v_headNormal);
    float yFactor = smoothstep(0.4, 1.2, 1.0 - headNorm.x);
    float zFactor = smoothstep(0.1, 1.0, headNorm.z);
    diffuseColor *= (yFactor*zFactor);
    #else
    vec3 diffuseColor = vec3(0.0);
    #endif
    
    #ifdef USE_AMBIENT_COLOR
    vec3 lightColor = u_AmbientLightSourceColor;
    #else
    vec3 lightColor = vec3(0.0);
    #endif
    
    #if defined(HAS_DYNAMIC_LIGHT) && defined(USE_VERTEX_LIGHTING)
    lightColor += v_lightColor;
    #endif
    
    vec3 eyeDir = normalize(v_eyeSpacePos);
    vec3 normal = normalize(v_normal);
    
    //For the eyes, specular isn't dependent on light sources.
    #ifdef USE_SPECULAR
    vec3 specularColor = computeSpecularLight(normal, -eyeDir);
    #endif
    
    //Do lighting calculations. Loops are manually unrolled because old devices seem to be incapable of doing this for some damn reason...
    #if defined(HAS_DYNAMIC_LIGHT) && !defined(USE_VERTEX_LIGHTING)
        vec3 curLightColor;
        vec3 ldir;
        float attenuation;
        #if (MAX_DIRECTIONAL_LIGHT_NUM > 0)
            //Index 0 is the shadowcasting light.
    
            #ifdef HAS_NORMAL_TEXTURE
                ldir = normalize(v_dirLightDirection[0]);
            #else
                ldir = normalize(u_DirLightSourceDirection[0]);
            #endif
    
            #ifdef USE_DIRLIGHT_SHADOWMAP
                curLightColor = computeLighting(normal, -ldir, u_DirLightSourceColor[0], 1.0) * shadowVal;
            #else
                curLightColor = computeLighting(normal, -ldir, u_DirLightSourceColor[0], 1.0);
            #endif
    
            lightColor += curLightColor;
    
            #if MAX_DIRECTIONAL_LIGHT_NUM > 1
                #ifdef HAS_NORMAL_TEXTURE
                ldir = normalize(v_dirLightDirection[1]);
                #else
                ldir = normalize(u_DirLightSourceDirection[1]);
                #endif
                
                curLightColor = computeLighting(normal, -ldir, u_DirLightSourceColor[1], 1.0);
                lightColor += curLightColor;
            #endif
    
            #if MAX_DIRECTIONAL_LIGHT_NUM > 2
                #ifdef HAS_NORMAL_TEXTURE
                ldir = normalize(v_dirLightDirection[2]);
                #else
                ldir = normalize(u_DirLightSourceDirection[2]);
                #endif
                
                curLightColor = computeLighting(normal, -ldir, u_DirLightSourceColor[2], 1.0);
                lightColor += curLightColor;
            #endif
    
            #if MAX_DIRECTIONAL_LIGHT_NUM > 3
                #ifdef HAS_NORMAL_TEXTURE
                ldir = normalize(v_dirLightDirection[3]);
                #else
                ldir = normalize(u_DirLightSourceDirection[3]);
                #endif
                
                curLightColor = computeLighting(normal, -ldir, u_DirLightSourceColor[3], 1.0);
                lightColor += curLightColor;
            #endif
        #endif

        #if (MAX_POINT_LIGHT_NUM > 0)
        for (int i = 0; i < MAX_POINT_LIGHT_NUM; ++i)
        {
            ldir = v_vertexToPointLightDirection[i] * u_PointLightSourceRangeInverse[i];
            attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
            lightColor += computeLighting(normal, normalize(v_vertexToPointLightDirection[i]), u_PointLightSourceColor[i], attenuation);
        }
        #endif

        #if (MAX_SPOT_LIGHT_NUM > 0)
            ldir = v_vertexToSpotLightDirection[0] * u_SpotLightSourceRangeInverse[0];
            attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
            vec3 vertexToSpotLightDirection = normalize(v_vertexToSpotLightDirection[0]);
            
            #ifdef HAS_NORMAL_TEXTURE
            vec3 spotLightDirection = normalize(v_spotLightDirection[0]);
            #else
            vec3 spotLightDirection = normalize(u_SpotLightSourceDirection[0]);
            #endif
    
            float spotCurrentAngleCos = dot(spotLightDirection, -vertexToSpotLightDirection);
    
            attenuation *= smoothstep(u_SpotLightSourceOuterAngleCos[0], u_SpotLightSourceInnerAngleCos[0], spotCurrentAngleCos);
    
            #ifdef USE_SPOTLIGHT_SHADOWMAP
                curLightColor = computeLighting(normal, vertexToSpotLightDirection, u_SpotLightSourceColor[0], attenuation) * shadowVal;
            #else
                curLightColor = computeLighting(normal, vertexToSpotLightDirection, u_SpotLightSourceColor[0], attenuation);
            #endif
    
            lightColor += curLightColor;
    
            #if MAX_SPOT_LIGHT_NUM > 1
                // Compute range attenuation
                ldir = v_vertexToSpotLightDirection[1] * u_SpotLightSourceRangeInverse[1];
                attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
                vertexToSpotLightDirection = normalize(v_vertexToSpotLightDirection[1]);
                
                #ifdef HAS_NORMAL_TEXTURE
                spotLightDirection = normalize(v_spotLightDirection[1]);
                #else
                spotLightDirection = normalize(u_SpotLightSourceDirection[1]);
                #endif

                // "-lightDirection" is used because light direction points in opposite direction to spot direction.
                spotCurrentAngleCos = dot(spotLightDirection, -vertexToSpotLightDirection);

                // Apply spot attenuation
                attenuation *= smoothstep(u_SpotLightSourceOuterAngleCos[1], u_SpotLightSourceInnerAngleCos[1], spotCurrentAngleCos);
                
                curLightColor = computeLighting(normal, vertexToSpotLightDirection, u_SpotLightSourceColor[1], attenuation);
                lightColor += curLightColor;
            #endif
    
            #if MAX_SPOT_LIGHT_NUM > 2
                // Compute range attenuation
                ldir = v_vertexToSpotLightDirection[2] * u_SpotLightSourceRangeInverse[2];
                attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
                vertexToSpotLightDirection = normalize(v_vertexToSpotLightDirection[2]);
                
                #ifdef HAS_NORMAL_TEXTURE
                spotLightDirection = normalize(v_spotLightDirection[2]);
                #else
                spotLightDirection = normalize(u_SpotLightSourceDirection[2]);
                #endif
                
                // "-lightDirection" is used because light direction points in opposite direction to spot direction.
                spotCurrentAngleCos = dot(spotLightDirection, -vertexToSpotLightDirection);
                
                // Apply spot attenuation
                attenuation *= smoothstep(u_SpotLightSourceOuterAngleCos[2], u_SpotLightSourceInnerAngleCos[2], spotCurrentAngleCos);
                
                curLightColor = computeLighting(normal, vertexToSpotLightDirection, u_SpotLightSourceColor[2], attenuation);
                lightColor += curLightColor;
            #endif
        #endif
    #endif
    
    
    //Determine final color, based on diffuse lighting, specular, and reflection.
    vec3 finalColor = vec3(0.0);
    
    #ifdef USE_SPECULAR
    finalColor += specularColor;
    #endif
    
    #ifdef HAS_REFLECTION_TEXTURE
        vec3 reflectTexel = textureCube(u_reflectionCubeMap, v_reflectVector).rgb;
        float reflectAmount = u_reflectionAmount;
        #ifdef USE_REFLECTION_ANGLE
            float fresnel = dot(eyeDir, normal);
            float reflectFresnel = 1.0 - clamp((fresnel * fresnel * u_reflectionAngle), 0.0, 1.0);
            reflectAmount *= reflectFresnel;
        #endif
        #ifdef USE_REFLECTION_TINT
            reflectTexel *= u_reflectionTintColor;
        #endif
        finalColor += (reflectTexel * reflectAmount);
        diffuseColor = diffuseColor * (1.0 - reflectAmount);
    #endif
    
    #ifdef USE_UNLIT_DIFFUSE
    finalColor += diffuseColor;
    #else
    finalColor += diffuseColor * (lightColor);
    #endif
    
    #ifdef USE_FOG
        float eyeSpaceDepth = -v_eyeSpacePos.z;
        float fogT = (eyeSpaceDepth - u_minFogDistance) / u_maxFogDistance;
        fogT = clamp(fogT, 0.0, u_maxFog);
        finalColor = mix(finalColor, u_fogColor, fogT);
    #endif
        
    gl_FragColor = vec4(finalColor, alpha);
}



