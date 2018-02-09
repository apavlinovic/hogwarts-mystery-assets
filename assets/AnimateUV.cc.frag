precision highp float;
precision highp int;

uniform float alpha;

varying vec2 v_texCoord;
varying vec4 v_color;

#ifdef USE_FOG
    varying float v_eyeDepth;
    uniform vec3 u_fogColor;
    uniform float u_maxFogDistance;
    uniform float u_minFogDistance;
    uniform float u_maxFog;
#endif

void main(void){
    vec4 color = texture2D(CC_Texture0, v_texCoord);
    float finalAlpha = color.a * alpha * v_color.a;
    gl_FragColor.rgb = (v_color.rgb + color.rgb) * finalAlpha;
    gl_FragColor.a = finalAlpha;
    
    #ifdef USE_FOG
        float fogT = (v_eyeDepth - u_minFogDistance) / u_maxFogDistance;
        fogT = clamp(fogT, 0.0, u_maxFog);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, u_fogColor*finalAlpha, fogT);
    #endif
}
