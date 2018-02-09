precision highp int;
precision highp float;

#ifdef HAS_DIFFUSE_TEXTURE
    uniform sampler2D u_diffuseMap;
    varying vec2 v_diffuseCoords;
#endif

#ifdef USE_DIFFUSE_COLOR
    uniform vec3 u_diffuseColor;
#endif

#ifdef USE_DIFFUSE_COLOR_ADJUST
    uniform vec3 u_tintColor;
    uniform float u_brightness;
#endif

#ifdef USE_SPECULAR
    uniform vec3 u_specColor;
    #ifdef USE_SPECULAR_RADIUS
        uniform float u_specMinRadius;
        uniform float u_specMaxRadius;
    #endif
    #ifdef HAS_SPECULAR_TEXTURE
        uniform sampler2D u_specularMap;
        varying vec2 v_specularCoords;
    #endif
#endif

#ifdef HAS_NORMAL_TEXTURE
    uniform float u_normalMapHeight;
    uniform sampler2D u_normalMap;
    varying vec2 v_normalCoords;
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

#ifdef HAS_DIFFUSE2_TEXTURE
    uniform sampler2D u_secondDiffuseMap;
    varying vec2 v_diffuse2Coords;
#endif

#ifdef USE_EMISSIVE
    #if defined(HAS_EMISSIVE_TEXTURE)
        uniform sampler2D u_emissiveMap;
        varying vec2 v_emissiveCoords;
    #elif defined(USE_EMISSIVE_COLOR)
        uniform vec3 u_emissiveColor;
    #else
        MalformedEmissive
    #endif
#endif

#ifdef USE_LIGHTMAP
    #ifdef HAS_LIGHTMAP_TEXTURE
        uniform sampler2D u_lightmapMap;
        varying vec2 v_lightmapCoords;
    #elif defined(USE_LIGHTMAP_COLOR)
        uniform vec3 u_lightmapColor;
    #else
        MalformedLightmap
    #endif

    #ifdef USE_LIGHTMAP_BRIGHTNESS
        uniform float u_lmPower;
    #endif
#endif

#ifdef HAS_DIRTMAP_TEXTURE
    uniform sampler2D u_dirtMap;
    varying vec2 v_dirtmapCoords;
#endif

#ifdef USE_RIM
    uniform float u_rimAngle;
    #if defined(HAS_RIM_TEXTURE)
        uniform sampler2D u_rimMap;
        varying vec2 v_rimMapCoords;
    #elif defined(USE_RIM_COLOR)
        uniform vec3 u_rimColor;
    #else
        MalformedRim
    #endif
#endif

uniform float alpha;

#if defined(NEEDS_NORMALS)
    varying vec3 v_eyeSpacePos;
    #ifndef HAS_NORMAL_TEXTURE
        varying vec3 v_normal;
    #endif
#elif defined(USE_FOG)
    varying float v_eyeSpaceDepth;
#endif

#ifdef USE_FOG
    uniform vec3 u_fogColor;
    uniform float u_maxFogDistance;
    uniform float u_minFogDistance;
    uniform float u_maxFog;
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

    #if defined(USE_DIRLIGHT_SHADOWMAP) || defined(USE_SPOTLIGHT_SHADOWMAP)
        #define USE_SHADOWMAP
    #endif
#endif

#if defined(USE_EMISSIVE) || defined(USE_LIGHTMAP) || defined(USE_RIM)
    #define HAS_EMISSIVE_COMP
#endif

#ifdef USE_AMBIENT_COLOR
    uniform vec3 u_AmbientLightSourceColor;
#endif

#ifdef USE_COLOR_UNIFORM
    uniform vec4 u_color;
#endif

#ifdef USE_VERT_COLOR
    varying vec4 v_vertColor;
#endif

//Transparency is either from a uniform, or in the diffuse texture
#if defined(USE_TRANSPARENCY) && !defined(USE_TRANSPARENCY_TEXTURE)
    uniform float u_opacityAmount;
#endif

#ifdef HAS_DYNAMIC_LIGHT
    #ifndef USE_VERTEX_LIGHTING
        #if (MAX_DIRECTIONAL_LIGHT_NUM > 0)
            uniform vec3 u_DirLightSourceColor[MAX_DIRECTIONAL_LIGHT_NUM];
            uniform vec3 u_DirLightSourceDirection[MAX_DIRECTIONAL_LIGHT_NUM];
            #ifdef HAS_NORMAL_TEXTURE
                varying vec3 v_dirLightDirection[MAX_DIRECTIONAL_LIGHT_NUM];
            #endif
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
            #ifdef HAS_NORMAL_TEXTURE
                varying vec3 v_spotLightDirection[MAX_SPOT_LIGHT_NUM];
            #endif
        #endif
    #else
        #ifdef USE_SHADOWMAP
            //The rgb component for v_lightColor/v_specColor is the combined contribution, and w is the lambert/specular intensity of the shadow-casting light (if applicable). We need to multiply w by the light/specular color to get the final result. This is done to cut down on the amount of varyings passed.
            varying vec4 v_lightColor;
            #ifdef USE_DIRLIGHT_SHADOWMAP
                uniform vec3 u_DirLightSourceColor[MAX_DIRECTIONAL_LIGHT_NUM];
            #else
                uniform vec3 u_SpotLightSourceColor[MAX_SPOT_LIGHT_NUM];
            #endif
        #else
            varying vec3 v_lightColor;
        #endif

        #ifdef USE_SPECULAR
            #ifdef USE_SHADOWMAP
                varying vec4 v_specColor;
            #else
                varying vec3 v_specColor;
            #endif
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

const float ShadowBias = 0.0001;
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

#ifdef USE_SPECULAR
vec3 computeSpecularLight(vec3 normalVector, vec3 lightDirection, vec3 eyeDirection)
{
    vec3 halfVector = normalize(lightDirection + eyeDirection);
    float specFactor = max(dot(halfVector, normalVector), 0.0);

#ifdef HAS_SPECULAR_TEXTURE
    vec4 specTexel = texture2D(u_specularMap, v_specularCoords);
#endif
    
#ifdef USE_SPECULAR_RADIUS
    float cosMin = cos(u_specMinRadius);
    float cosMax = cos(u_specMaxRadius);
#else //Must have specular texture.
    float cosMin = specTexel.g;
    float cosMax = specTexel.b;
#endif
    specFactor = clamp((specFactor - cosMax) / (cosMin - cosMax), 0.0, 1.0);
    float specAmount = specFactor*specFactor*specFactor;

#ifdef HAS_SPECULAR_TEXTURE
    specAmount = specAmount * specTexel.r;
#endif
    
    return u_specColor * specAmount;
}
#endif
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
        #ifdef USE_DIFFUSE_COLOR
        vec3 diffuseColor = u_diffuseColor;
        #endif
    
        #ifdef HAS_DIFFUSE_TEXTURE
            #if defined(USE_TRANSPARENCY_TEXTURE)
                vec4 diffuseTexColor = texture2D(u_diffuseMap, v_diffuseCoords);
                #ifndef USE_DIFFUSE_COLOR
                    vec3 diffuseColor = diffuseTexColor.rgb;
                #endif
            #elif !defined(USE_DIFFUSE_COLOR)
                vec3 diffuseColor = texture2D(u_diffuseMap, v_diffuseCoords).rgb;
            #endif
        #endif

        #if !defined(USE_DIFFUSE_COLOR) && !defined(HAS_DIFFUSE_TEXTURE)
        vec3 diffuseColor = vec3(0.0);
        #endif
    
        #ifdef USE_DIFFUSE_COLOR_ADJUST
        diffuseColor *= (u_tintColor * u_brightness);
        #endif
    #else
        vec3 diffuseColor = vec3(0.0);
        #ifdef USE_TRANSPARENCY_TEXTURE
        vec4 diffuseTexColor = vec4(diffuseColor, 1.0);
        #endif
    #endif
    
    #ifdef HAS_DIFFUSE2_TEXTURE
    diffuseColor = mix(diffuseColor, texture2D(u_secondDiffuseMap, v_diffuse2Coords).rgb, v_vertColor.r);
    #endif
    #ifdef HAS_DIRTMAP_TEXTURE
    diffuseColor *= texture2D(u_dirtMap, v_dirtmapCoords).rgb;
    #endif
    
    #ifdef USE_SPECULAR
    vec3 specularColor = vec3(0.0);
    #endif
    
    #if defined(USE_AMBIENT_COLOR)
        vec3 lightColor = u_AmbientLightSourceColor;
    #elif defined(USE_BAKED_DIFFUSE)
        vec3 lightColor = vec3(0.0);
    #elif defined(USE_COLOR_UNIFORM)
        vec3 lightColor = u_color.rgb;
    #else
        vec3 lightColor = vec3(0.0);
    #endif
    
    #if defined(HAS_DYNAMIC_LIGHT) && defined(USE_VERTEX_LIGHTING)
        lightColor += v_lightColor.rgb;

        #if defined(USE_DIRLIGHT_SHADOWMAP)
            vec3 shadowLight = u_DirLightSourceColor[0] * (v_lightColor.w * shadowVal);
            lightColor += shadowLight;
        #elif defined(USE_SPOTLIGHT_SHADOWMAP)
            vec3 shadowLight = u_SpotLightSourceColor[0] * (v_lightColor.w * shadowVal);
            lightColor += shadowLight;
        #endif
    
        #ifdef USE_SPECULAR
            #ifdef HAS_SPECULAR_TEXTURE
                float specIntensity = texture2D(u_specularMap, v_specularCoords).r;
                specularColor = v_specColor.rgb * specIntensity;
                #ifdef USE_SHADOWMAP
                    specularColor += (v_specColor.w * specIntensity) * shadowLight * u_specColor;
                #endif
            #else
                specularColor = v_specColor.rgb;
                #ifdef USE_SHADOWMAP
                    specularColor += v_specColor.w * shadowLight * u_specColor;
                #endif
            #endif
        #endif
    #endif
    
    
    #ifdef NEEDS_NORMALS
        vec3 eyeDir = normalize(v_eyeSpacePos);
        #ifdef HAS_NORMAL_TEXTURE
        vec3 normal = normalize((2.0 * texture2D(u_normalMap, v_normalCoords).xyz - 1.0) * vec3(u_normalMapHeight,u_normalMapHeight,1.0));
        #else
        vec3 normal = normalize(v_normal);
        #endif
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
    
            #ifndef USE_BAKED_DIFFUSE
            lightColor += curLightColor;
            #endif
    
            #ifdef USE_SPECULAR
            specularColor += computeSpecularLight(normal, -ldir, -eyeDir) * curLightColor;
            #endif
    
            #if MAX_DIRECTIONAL_LIGHT_NUM > 1
                #ifdef HAS_NORMAL_TEXTURE
                ldir = normalize(v_dirLightDirection[1]);
                #else
                ldir = normalize(u_DirLightSourceDirection[1]);
                #endif
                
                curLightColor = computeLighting(normal, -ldir, u_DirLightSourceColor[1], 1.0);
                #ifndef USE_BAKED_DIFFUSE
                lightColor += curLightColor;
                #endif
    
                #ifdef USE_SPECULAR
                specularColor += computeSpecularLight(normal, -ldir, -eyeDir) * curLightColor;
                #endif
            #endif
    
            #if MAX_DIRECTIONAL_LIGHT_NUM > 2
                #ifdef HAS_NORMAL_TEXTURE
                ldir = normalize(v_dirLightDirection[2]);
                #else
                ldir = normalize(u_DirLightSourceDirection[2]);
                #endif
                
                curLightColor = computeLighting(normal, -ldir, u_DirLightSourceColor[2], 1.0);
                #ifndef USE_BAKED_DIFFUSE
                lightColor += curLightColor;
                #endif
    
                #ifdef USE_SPECULAR
                specularColor += computeSpecularLight(normal, -ldir, -eyeDir) * curLightColor;
                #endif
            #endif
    
            #if MAX_DIRECTIONAL_LIGHT_NUM > 3
                #ifdef HAS_NORMAL_TEXTURE
                ldir = normalize(v_dirLightDirection[3]);
                #else
                ldir = normalize(u_DirLightSourceDirection[3]);
                #endif
                
                curLightColor = computeLighting(normal, -ldir, u_DirLightSourceColor[3], 1.0);
                #ifndef USE_BAKED_DIFFUSE
                lightColor += curLightColor;
                #endif
    
                #ifdef USE_SPECULAR
                specularColor += computeSpecularLight(normal, -ldir, -eyeDir) * curLightColor;
                #endif
            #endif
        #endif

        #if (MAX_POINT_LIGHT_NUM > 0)
            ldir = v_vertexToPointLightDirection[0] * u_PointLightSourceRangeInverse[0];
            attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
            vec3 vertToLight = normalize(v_vertexToPointLightDirection[0]);
            curLightColor = computeLighting(normal, vertToLight, u_PointLightSourceColor[0], attenuation);
    
            #if !defined(USE_BAKED_DIFFUSE) || NUM_SCENE_POINT_LIGHTS <= 0
            lightColor += curLightColor;
            #endif
    
            #ifdef USE_SPECULAR
            specularColor += computeSpecularLight(normal, vertToLight, -eyeDir) * curLightColor;
            #endif
    
            #if MAX_POINT_LIGHT_NUM > 1
                ldir = v_vertexToPointLightDirection[1] * u_PointLightSourceRangeInverse[1];
                attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
                vertToLight = normalize(v_vertexToPointLightDirection[1]);
                curLightColor = computeLighting(normal, vertToLight, u_PointLightSourceColor[1], attenuation);
    
                #if !defined(USE_BAKED_DIFFUSE) || NUM_SCENE_POINT_LIGHTS <= 1
                lightColor += curLightColor;
                #endif
    
                #ifdef USE_SPECULAR
                specularColor += computeSpecularLight(normal, vertToLight, -eyeDir) * curLightColor;
                #endif
    
                #if MAX_POINT_LIGHT_NUM > 2
                    ldir = v_vertexToPointLightDirection[2] * u_PointLightSourceRangeInverse[2];
                    attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
                    vertToLight = normalize(v_vertexToPointLightDirection[2]);
                    curLightColor = computeLighting(normal, vertToLight, u_PointLightSourceColor[2], attenuation);
    
                    #if !defined(USE_BAKED_DIFFUSE) || NUM_SCENE_POINT_LIGHTS <= 2
                    lightColor += curLightColor;
                    #endif
    
                    #ifdef USE_SPECULAR
                    specularColor += computeSpecularLight(normal, vertToLight, -eyeDir) * curLightColor;
                    #endif
                #endif
            #endif
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
    
            #if !defined(USE_BAKED_DIFFUSE) || NUM_SCENE_SPOT_LIGHTS <= 0
            lightColor += curLightColor;
            #endif
    
            #ifdef USE_SPECULAR
            specularColor += computeSpecularLight(normal, vertexToSpotLightDirection, -eyeDir) * curLightColor;
            #endif
    
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
                #if !defined(USE_BAKED_DIFFUSE) || NUM_SCENE_SPOT_LIGHTS <= 1
                lightColor += curLightColor;
                #endif
    
                #ifdef USE_SPECULAR
                specularColor += computeSpecularLight(normal, vertexToSpotLightDirection, -eyeDir) * curLightColor;
                #endif
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
                #if !defined(USE_BAKED_DIFFUSE) || NUM_SCENE_SPOT_LIGHTS <= 2
                lightColor += curLightColor;
                #endif
    
                #ifdef USE_SPECULAR
                specularColor += computeSpecularLight(normal, vertexToSpotLightDirection, -eyeDir) * curLightColor;
                #endif
            #endif
        #endif
    #endif
    
    
    //Rim and possibly reflection use fresnel
    #if defined(USE_RIM) || defined(USE_REFLECTION_ANGLE)
    float fresnel = dot(eyeDir, normal);
    #endif
    
    //Calculate emissive component, based on emmisive, rim, and lightmap
    #ifdef HAS_EMISSIVE_COMP
        vec3 emissiveComponent = vec3(0.0);
    #endif
    
    #ifdef USE_LIGHTMAP
        #ifdef HAS_LIGHTMAP_TEXTURE
            #ifdef USE_LIGHTMAP_BRIGHTNESS
                emissiveComponent += u_lmPower * (diffuseColor * texture2D(u_lightmapMap, v_lightmapCoords).rgb);
            #else
                emissiveComponent += 4.0 * (diffuseColor * texture2D(u_lightmapMap, v_lightmapCoords).rgb);
            #endif
        #elif defined(USE_LIGHTMAP_COLOR)
            #ifdef USE_LIGHTMAP_BRIGHTNESS
                emissiveComponent += u_lmPower * (diffuseColor * u_lightmapColor);
            #else
                emissiveComponent += 4.0 * (diffuseColor * u_lightmapColor);
            #endif
        #endif
    #endif
    
    #ifdef USE_EMISSIVE
        #if defined(HAS_EMISSIVE_TEXTURE)
            #ifdef USE_EMISSIVE_VERT_COLOR
                emissiveComponent += (texture2D(u_emissiveMap, v_emissiveCoords).rgb * v_vertColor.g);
            #else
                emissiveComponent += texture2D(u_emissiveMap, v_emissiveCoords).rgb;
            #endif
        #elif defined(USE_EMISSIVE_COLOR)
            #ifdef USE_EMISSIVE_VERT_COLOR
                emissiveComponent += (u_emissiveColor * v_vertColor.g);
            #else
                emissiveComponent += u_emissiveColor;
            #endif
        #endif
    #endif
    
    #ifdef USE_RIM
        float rimAmount = 1.0 - clamp((fresnel * fresnel * u_rimAngle), 0.0, 1.0);
    
        #ifdef USE_RIM_VERT_COLOR
            rimAmount *= v_vertColor.b;
        #endif
    
        #if defined(HAS_RIM_TEXTURE)
            emissiveComponent += (texture2D(u_rimMap, v_rimMapCoords).rgb) * rimAmount;
        #elif defined(USE_RIM_COLOR)
            emissiveComponent += u_rimColor * rimAmount;
        #endif
    #endif
    
    #ifdef HAS_REFLECTION_TEXTURE
        float reflectIntensity = u_reflectionAmount;
        vec3 reflectTexel = textureCube(u_reflectionCubeMap, v_reflectVector).rgb;
        #ifdef USE_REFLECTION_ANGLE
            float reflectFresnel = 1.0 - clamp((fresnel * fresnel * u_reflectionAngle), 0.0, 1.0);
            reflectIntensity *= reflectFresnel;
        #endif
        #ifdef USE_REFLECTION_TINT
            reflectTexel *= u_reflectionTintColor;
        #endif
    #endif
    
    const vec3 desaturateColor = vec3(0.3, 0.6, 0.1);
    
    //Handle transparency. If using cutout, then modulate the emissive, specular, and reflection.
    #ifdef USE_TRANSPARENCY
        #ifdef USE_TRANSPARENCY_TEXTURE
            float opacity = diffuseTexColor.a;
        #else
            float opacity = u_opacityAmount;
        #endif
    
        #ifdef USE_TRANSPARENCY_CUTOUT
            #ifdef USE_SPECULAR
            specularColor *= opacity;
            #endif
    
            #ifdef HAS_EMISSIVE_COMP
            emissiveComponent *= opacity;
            #endif
    
            #ifdef HAS_REFLECTION_TEXTURE
            reflectIntensity *= opacity;
            #endif
    
            #ifdef USE_DIFFUSE
            diffuseColor *= opacity;
            #endif
        #endif
    
        //Add to the opacity based on specular, rim, and reflection.
        float opacityBoost = 0.0;
        #ifdef USE_SPECULAR
            opacityBoost = dot(specularColor, desaturateColor);
        #endif
        #ifdef USE_RIM
            opacityBoost = max(opacityBoost, rimAmount);
        #endif
        #ifdef HAS_REFLECTION_TEXTURE
            vec3 finalReflect = reflectTexel * reflectIntensity;
            float reflectDesaturate = dot(finalReflect, desaturateColor);
            opacityBoost = max(opacityBoost, reflectDesaturate);
        #endif
        opacity = clamp(opacity + opacityBoost, opacity, 1.0);
    #else
        float opacity = 1.0;
    #endif
    
    
    //Determine final color, based on diffuse lighting, specular, emissive, and reflection.
    vec3 finalColor = vec3(0.0);
    
    #ifdef USE_SPECULAR
        finalColor += specularColor;
    #endif
    
    #ifdef HAS_EMISSIVE_COMP
        finalColor += emissiveComponent;
    #endif
    
    #ifdef HAS_REFLECTION_TEXTURE
        #ifndef USE_TRANSPARENCY
        vec3 finalReflect = reflectTexel * reflectIntensity;
        #endif
        finalColor += finalReflect;
        diffuseColor = diffuseColor * (1.0 - reflectIntensity);
    #endif
    
    #ifdef USE_UNLIT_DIFFUSE
        finalColor += diffuseColor;
    #else
        finalColor += diffuseColor * (lightColor);
    #endif
    
    #ifdef USE_FOG
        #ifdef NEEDS_NORMALS
        float v_eyeSpaceDepth = -v_eyeSpacePos.z;
        #endif
        float fogT = (v_eyeSpaceDepth - u_minFogDistance) / u_maxFogDistance;
        fogT = clamp(fogT, 0.0, u_maxFog);
        finalColor = mix(finalColor, u_fogColor*opacity, fogT);
    #endif
    
    gl_FragColor = vec4(finalColor, opacity * alpha);
}



