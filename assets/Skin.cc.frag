precision highp int;
precision highp float;

uniform sampler2D u_colorMap;
uniform sampler2D u_secondaryMaps;

uniform float u_specularity;
uniform vec3 u_specColor;
uniform float u_rimAngle;
uniform vec3 u_rimColor;

varying vec2 v_texCoords;
varying vec3 v_eyeSpacePos;
varying vec3 v_normal;

uniform float alpha;

uniform vec3 u_shadeColor;

//House robes will swap colors/logos based on the house.
#ifdef IS_HOUSEROBE_SHADER
    uniform sampler2D u_mask;
    uniform sampler2D u_emblemTexture;
    uniform vec3 u_robeColor;
    uniform float u_houseSet; //0 or 1, used in blending.
    varying vec2 v_emblemTexCoords;
#endif

//House clothes also swap colors based on the house.
#ifdef IS_HOUSECLOTH_SHADER
    uniform sampler2D u_mask;
    uniform vec3 u_primaryColor;
    uniform vec3 u_secondaryColor;
#endif

//Outfits use a mask and color sets to colorize the diffuse texture.
#ifdef IS_OUTFIT_SHADER
    uniform sampler2D u_mask;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
#endif

#ifdef IS_AVATAR_HAIR_SHADER
    uniform vec3 u_hairColor;
#endif

#ifdef IS_AVATAR_SKIN_SHADER
    uniform vec3 u_skinColor;
#endif

#ifdef IS_AVATAR_FACE_SHADER
    uniform sampler2D u_mask;
    uniform vec3 u_skinColor;
    uniform vec3 u_browColor;
    uniform vec3 u_lipColor;
#endif

#if ((MAX_DIRECTIONAL_LIGHT_NUM > 0) || (MAX_POINT_LIGHT_NUM > 0) || (MAX_SPOT_LIGHT_NUM > 0))
    #define HAS_DYNAMIC_LIGHT
    #if defined(USE_DIRLIGHT_SHADOWMAP) || defined(USE_SPOTLIGHT_SHADOWMAP)
        #define USE_SHADOWMAP
    #endif
#endif

#ifdef USE_FOG
    uniform vec3 u_fogColor;
    uniform float u_maxFogDistance;
    uniform float u_minFogDistance;
    uniform float u_maxFog;
#endif

#ifdef USE_AMBIENT_COLOR
    uniform vec3 u_AmbientLightSourceColor;
#endif

#ifdef HAS_DYNAMIC_LIGHT
    #ifdef USE_VERTEX_LIGHTING
        #define NUM_LIGHTS MAX_DIRECTIONAL_LIGHT_NUM+MAX_POINT_LIGHT_NUM+MAX_SPOT_LIGHT_NUM

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

const float ShadowBias = 0.01;
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
//Specular power and intensity are the r and g channels of secondary texture. Optinally, specular power can be a passed in uniform.
float computeSpecularAmount(vec3 normalVector, vec3 lightDirection, vec3 eyeDirection, float specG)
{
    vec3 halfVector = normalize(lightDirection + eyeDirection);
    float specFactor = max(dot(halfVector, normalVector), 0.0);
    
#if defined(IS_HAIR_SHADER) || defined(IS_CLOTH_SHADER)
    specFactor = pow(specFactor, u_specularity);
#else
    float specPower = (u_specularity) * (1.0 - specG);
    specFactor = pow(specFactor, specPower);
#endif
    
    return specFactor;
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
    
    vec3 eyeDir = normalize(v_eyeSpacePos);
    vec3 normal = normalize(v_normal);
    
    //DIFFUSE CALCULATIONS. This is the main differentiation between the various flavors of this shader.
    #if defined(IS_HOUSEROBE_SHADER)
        vec3 maskColor = texture2D(u_mask, v_texCoords).rgb;
        vec3 houseColor = clamp((vec3(1.0) - maskColor) + u_robeColor, 0.0, 1.0);
        vec3 robeColor = texture2D(u_colorMap, v_texCoords).rgb * houseColor;
        vec4 emblemColor = texture2D(u_emblemTexture, v_emblemTexCoords);
        vec3 diffuseColor = mix(robeColor, emblemColor.rgb, emblemColor.a * u_houseSet);
    #elif defined(IS_HOUSECLOTH_SHADER)
        vec3 maskColor = texture2D(u_mask, v_texCoords).rgb;
        vec3 primaryColor = clamp((vec3(1.0 - maskColor.r)) + u_primaryColor, 0.0, 1.0);
        vec3 secondaryColor = clamp((vec3(1.0 - maskColor.g)) + u_secondaryColor, 0.0, 1.0);
        vec3 combinedColor = primaryColor * secondaryColor;
        vec3 diffuseColor = texture2D(u_colorMap, v_texCoords).rgb * combinedColor;
    #elif defined(IS_OUTFIT_SHADER)
        vec3 maskColor = texture2D(u_mask, v_texCoords).rgb;
        vec3 maskCombine = vec3(clamp(1.0 - (maskColor.r + maskColor.g + maskColor.b), 0.0, 1.0));
        vec3 c1 = u_color1 * maskColor.r;
        vec3 c2 = u_color2 * maskColor.g;
        vec3 c3 = u_color3 * maskColor.b;
        vec3 combinedColor = c1 + c2 + c3 + maskCombine;
        vec3 diffuseColor = texture2D(u_colorMap, v_texCoords).rgb * combinedColor;
    #elif defined(IS_AVATAR_HAIR_SHADER)
        vec3 diffuseColor = texture2D(u_colorMap, v_texCoords).rgb * u_hairColor;
    #elif defined(IS_AVATAR_SKIN_SHADER)
        vec3 diffuseColor = texture2D(u_colorMap, v_texCoords).rgb * u_skinColor;
    #elif defined(IS_AVATAR_FACE_SHADER)
        vec3 maskColor = texture2D(u_mask, v_texCoords).rgb;
        vec3 gradientColor = texture2D(u_colorMap, v_texCoords).rgb;
        vec3 maskedColor = mix(u_skinColor, vec3(1.0), maskColor.b);
        vec3 diffuseColor = mix(maskedColor, u_browColor, maskColor.g);
        diffuseColor = mix(diffuseColor, u_lipColor, maskColor.r) * gradientColor;
    #else
        vec3 diffuseColor = texture2D(u_colorMap, v_texCoords).rgb;
    #endif
    
    #if defined(USE_SPECULAR) || defined(USE_RIM) || defined(USE_EMISSIVE)
    vec3 specTexel = texture2D(u_secondaryMaps, v_texCoords).rgb;
    #endif
    
    #ifdef USE_SPECULAR
    vec3 specularColor = vec3(0.0);
    #endif
    
    vec3 lightColor = vec3(0.0);
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
            specularColor = v_specColor.rgb;
            #ifdef USE_SHADOWMAP
                specularColor += (v_specColor.w) * shadowLight;
            #endif
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
    
            lightColor += curLightColor;
                
            #ifdef USE_SPECULAR
            specularColor += computeSpecularAmount(normal, -ldir, -eyeDir, specTexel.g) * curLightColor;
            #endif
    
            #if MAX_DIRECTIONAL_LIGHT_NUM > 1
                #ifdef HAS_NORMAL_TEXTURE
                ldir = normalize(v_dirLightDirection[1]);
                #else
                ldir = normalize(u_DirLightSourceDirection[1]);
                #endif
                
                curLightColor = computeLighting(normal, -ldir, u_DirLightSourceColor[1], 1.0);
                lightColor += curLightColor;
                
                #ifdef USE_SPECULAR
                specularColor += computeSpecularAmount(normal, -ldir, -eyeDir, specTexel.g) * curLightColor;
                #endif
            #endif
    
            #if MAX_DIRECTIONAL_LIGHT_NUM > 2
                #ifdef HAS_NORMAL_TEXTURE
                ldir = normalize(v_dirLightDirection[2]);
                #else
                ldir = normalize(u_DirLightSourceDirection[2]);
                #endif
                
                curLightColor = computeLighting(normal, -ldir, u_DirLightSourceColor[2], 1.0);
                lightColor += curLightColor;
                
                #ifdef USE_SPECULAR
                specularColor += computeSpecularAmount(normal, -ldir, -eyeDir, specTexel.g) * curLightColor;
                #endif
            #endif
    
            #if MAX_DIRECTIONAL_LIGHT_NUM > 3
                #ifdef HAS_NORMAL_TEXTURE
                ldir = normalize(v_dirLightDirection[3]);
                #else
                ldir = normalize(u_DirLightSourceDirection[3]);
                #endif
                
                curLightColor = computeLighting(normal, -ldir, u_DirLightSourceColor[3], 1.0);
                lightColor += curLightColor;
                
                #ifdef USE_SPECULAR
                specularColor += computeSpecularAmount(normal, -ldir, -eyeDir, specTexel.g) * curLightColor;
                #endif
            #endif
        #endif

        #if (MAX_POINT_LIGHT_NUM > 0)
            ldir = v_vertexToPointLightDirection[0] * u_PointLightSourceRangeInverse[0];
            attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
            vec3 vertToLight = normalize(v_vertexToPointLightDirection[0]);
            curLightColor = computeLighting(normal, vertToLight, u_PointLightSourceColor[0], attenuation);
            lightColor += curLightColor;
    
            #ifdef USE_SPECULAR
            specularColor += computeSpecularAmount(normal, vertToLight, -eyeDir, specTexel.g) * curLightColor;
            #endif
    
            #if MAX_POINT_LIGHT_NUM > 1
                ldir = v_vertexToPointLightDirection[1] * u_PointLightSourceRangeInverse[1];
                attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
                vertToLight = normalize(v_vertexToPointLightDirection[1]);
                curLightColor = computeLighting(normal, vertToLight, u_PointLightSourceColor[1], attenuation);
                lightColor += curLightColor;
    
                #ifdef USE_SPECULAR
                specularColor += computeSpecularAmount(normal, vertToLight, -eyeDir, specTexel.g) * curLightColor;
                #endif
    
                #if MAX_POINT_LIGHT_NUM > 2
                    ldir = v_vertexToPointLightDirection[2] * u_PointLightSourceRangeInverse[2];
                    attenuation = clamp(1.0 - dot(ldir, ldir), 0.0, 1.0);
                    vertToLight = normalize(v_vertexToPointLightDirection[2]);
                    curLightColor = computeLighting(normal, vertToLight, u_PointLightSourceColor[2], attenuation);
                    lightColor += curLightColor;
    
                    #ifdef USE_SPECULAR
                    specularColor += computeSpecularAmount(normal, vertToLight, -eyeDir, specTexel.g) * curLightColor;
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
    
            lightColor += curLightColor;
                
            #ifdef USE_SPECULAR
            specularColor += computeSpecularAmount(normal, vertexToSpotLightDirection, -eyeDir, specTexel.g) * curLightColor;
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
                lightColor += curLightColor;
                
                #ifdef USE_SPECULAR
                specularColor += computeSpecularAmount(normal, vertexToSpotLightDirection, -eyeDir, specTexel.g) * curLightColor;
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
                lightColor += curLightColor;
                
                #ifdef USE_SPECULAR
                specularColor += computeSpecularAmount(normal, vertexToSpotLightDirection, -eyeDir, specTexel.g) * curLightColor;
                #endif
            #endif
        #endif
    #endif
    
    //Shade component adds additional diffuse to darker areas. Treated as emissive by the debug options (Cloth shader doesn't get this component)
    #ifdef USE_EMISSIVE
        float lambertR = 0.5 * lightColor.r;
        float shadeIntensity = smoothstep(0.0, 1.0, 1.0 - lambertR);
        #if defined(IS_SKIN_SHADER)
            float shadeFactor = shadeIntensity * specTexel.r;
            vec3 shadeColor = u_shadeColor * shadeFactor;
            #if defined(IS_AVATAR_SKIN_SHADER) || defined(IS_AVATAR_FACE_SHADER)
                float inverseFactor = 1.0 - shadeFactor;
                shadeColor *= inverseFactor;
            #endif
        #elif defined(IS_HAIR_SHADER)
            vec3 shadeColor = u_shadeColor * shadeIntensity;
        #endif
    #endif
    
    #ifndef USE_DIFFUSE
    diffuseColor = vec3(0.0);
    #endif
    
    //Rim is a part of diffuse, but if diffuse is cheated off, we still want to show the rim. Blue component of secondary texture is a rim mask.
    #ifdef USE_RIM
        float fresnel = dot(eyeDir, normal);
        fresnel = 1.0 - clamp((fresnel * fresnel * u_rimAngle), 0.0, 1.0);
        #ifdef IS_SKIN_SHADER
            diffuseColor += u_rimColor * (fresnel * specTexel.b);
        #else
            diffuseColor += u_rimColor * (fresnel * specTexel.r);
        #endif
    #endif
    
    
    //Add ambient light at the end.
    #ifdef USE_AMBIENT_COLOR
    const vec3 desaturateColor = vec3(0.3, 0.6, 0.1);
    float amount = dot(u_AmbientLightSourceColor, desaturateColor);
    vec3 desaturated = vec3(amount, amount, amount);
    
    lightColor += u_AmbientLightSourceColor*0.5 + desaturated*0.5;
    #endif
    
    //Determine final color, based on diffuse, specular, and emissive.
    vec3 finalColor = vec3(0.0);
    #ifdef USE_SPECULAR
        #ifdef IS_HAIR_SHADER
            finalColor += (specularColor * u_specColor * specTexel.r);
        #else
            finalColor += (specularColor * u_specColor * specTexel.g);
        #endif
    #endif
    
    #if defined(USE_EMISSIVE) && (defined(IS_HAIR_SHADER) || defined(IS_SKIN_SHADER))
    diffuseColor += shadeColor;
    #endif
    
    #ifdef USE_UNLIT_DIFFUSE
    finalColor += diffuseColor;
    #else
    finalColor += diffuseColor * lightColor;
    #endif
    
    #ifdef USE_FOG
        float eyeSpaceDepth = -v_eyeSpacePos.z;
        float fogT = (eyeSpaceDepth - u_minFogDistance) / u_maxFogDistance;
        fogT = clamp(fogT, 0.0, u_maxFog);
        finalColor = mix(finalColor, u_fogColor, fogT);
    #endif
    gl_FragColor = vec4(finalColor, alpha);
}



