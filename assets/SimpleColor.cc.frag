uniform vec4 color;
uniform float alpha;

varying vec4 v_color;

#ifdef USE_FOG
    varying float v_eyeDepth;
    uniform vec3 u_fogColor;
    uniform float u_maxFogDistance;
    uniform float u_minFogDistance;
    uniform float u_maxFog;
#endif

void main(void){
    gl_FragColor = vec4(color.rgb , color.a * alpha * v_color.a);
    
    #ifdef USE_FOG
        float fogT = (v_eyeDepth - u_minFogDistance) / u_maxFogDistance;
        fogT = clamp(fogT, 0.0, u_maxFog);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, u_fogColor, fogT);
    #endif
}
