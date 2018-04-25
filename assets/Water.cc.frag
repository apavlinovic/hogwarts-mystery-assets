precision highp float;
precision highp int;

varying vec3 v_viewDir;
varying vec3 v_normalWorld;
varying vec2 v_color;
varying vec2 v_foamCoords;

#ifdef HAS_NORMAL_TEXTURE
    uniform sampler2D u_normalMap;
    uniform float u_mixer;
    uniform float u_normalMapHeight;
    varying vec3 v_binormalWorld;
    varying vec3 v_tangentWorld;
    varying vec2 v_texCoord1;
    varying vec2 v_texCoord2;
#endif

uniform vec3 u_diffuseColor;
uniform sampler2D u_foamTexture;
uniform samplerCube u_reflectionCubeMap;
uniform float u_reflectionAmount;
uniform float u_reflectionAngle;
uniform float u_transparency;

#ifdef USE_FOG
    varying float v_eyeDepth;
    uniform vec3 u_fogColor;
    uniform float u_maxFogDistance;
    uniform float u_minFogDistance;
    uniform float u_maxFog;
#endif

void main(void){
    #ifdef HAS_NORMAL_TEXTURE
        float height = u_normalMapHeight*v_color.g;
        //Convert tangent space normal to world space
        vec3 norm = normalize(v_normalWorld);
        vec3 binorm = normalize(v_binormalWorld);
        vec3 tang = normalize(v_tangentWorld);

        vec3 normal1 = normalize((2.0 * texture2D(u_normalMap, v_texCoord1).xyz - 1.0) * vec3(height,height,1.0));
        vec3 normal2 = normalize((2.0 * texture2D(u_normalMap, v_texCoord2).xyz - 1.0) * vec3(height,height,1.0));
        normal1 = normalize(tang*normal1.x + binorm*normal1.y + norm*normal1.z);
        normal2 = normalize(tang*normal2.x + binorm*normal2.y + norm*normal2.z);
        vec3 normal = normalize(mix(normal1, normal2, u_mixer));
    #else
        vec3 normal = normalize(v_normalWorld);
    #endif
    
    float foamR = texture2D(u_foamTexture, v_foamCoords).r * v_color.r;
    float foamReflectCoef = clamp(1.0 - (10.0*foamR), 0.0, 1.0);
    
    vec3 reflectVector = reflect(-v_viewDir, normal);
    vec3 reflectTexel = textureCube(u_reflectionCubeMap, reflectVector).rgb;
    
    float fresnel = dot(normalize(-v_viewDir), normal);
    float reflectFresnel = 1.0 - clamp((fresnel * fresnel * u_reflectionAngle), 0.0, 1.0);
    float reflectIntensity = u_reflectionAmount * reflectFresnel * foamReflectCoef;
    vec3 finalReflect = reflectTexel * reflectIntensity;
    
    const vec3 desaturateColor = vec3(0.3, 0.6, 0.1);
    float reflectDesaturate = dot(finalReflect, desaturateColor);
    float opacity = clamp(u_transparency + reflectDesaturate, 0.0, 1.0);
    vec3 emissiveComp = (u_diffuseColor + foamR) * u_transparency;
    
    gl_FragColor = vec4(emissiveComp + finalReflect, opacity);
    
    #ifdef USE_FOG
        float fogT = (v_eyeDepth - u_minFogDistance) / u_maxFogDistance;
        fogT = clamp(fogT, 0.0, u_maxFog);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, u_fogColor*opacity, fogT);
    #endif
}
