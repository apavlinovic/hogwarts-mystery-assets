precision highp float;
precision highp int;

varying vec3  v_normal;
varying vec4 v_color;
varying float v_waveIntensity;

uniform mat4 worldViewMat;
uniform vec4 innerColor;
uniform vec4 outerColor;
uniform float speed;
uniform float alpha;

#ifdef USE_FOG
    varying float v_eyeDepth;
    uniform vec3 u_fogColor;
    uniform float u_maxFogDistance;
    uniform float u_minFogDistance;
    uniform float u_maxFog;
#endif

void main(void){
    
    vec3 dir = vec3(0,0,1);
    float eDotn = abs(dot(dir, v_normal));
    
    float falloff = eDotn*eDotn * v_waveIntensity * innerColor.a;
    float finalAlpha = alpha*falloff*v_color.a;
    gl_FragColor.rgb = (mix(outerColor, innerColor, falloff).rgb + v_color.rgb) * finalAlpha;
    gl_FragColor.a = finalAlpha;
    
    #ifdef USE_FOG
        float fogT = (v_eyeDepth - u_minFogDistance) / u_maxFogDistance;
        fogT = clamp(fogT, 0.0, u_maxFog);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, u_fogColor*finalAlpha, fogT);
    #endif
}
