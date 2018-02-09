precision lowp float;
uniform sampler2D tex1;
varying vec2 v_texCoord;
uniform float alpha;

#ifdef USE_FOG
    varying highp float v_eyeDepth;
    uniform vec3 u_fogColor;
    uniform highp float u_maxFogDistance;
    uniform highp float u_minFogDistance;
    uniform highp float u_maxFog;
#endif

void main()
{
    vec4 col = texture2D(tex1, v_texCoord);
    gl_FragColor = vec4(col.rgb, col.a * alpha);
    
    #ifdef USE_FOG
        float fogT = (v_eyeDepth - u_minFogDistance) / u_maxFogDistance;
        fogT = clamp(fogT, 0.0, u_maxFog);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, u_fogColor, fogT);
    #endif
}
