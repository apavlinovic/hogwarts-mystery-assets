varying vec2 v_texCoord;
varying vec2 v_texCoord2;
varying float v_glow;


uniform sampler2D tex1;
uniform sampler2D tex2;
uniform float alpha;

void main(void){
    highp vec3 t1Color = texture2D(tex1, v_texCoord).rgb;
    highp vec3 t2Color = texture2D(tex2, v_texCoord2).rgb;

    highp vec3 texColor = (t1Color * t2Color);
    
    float glow  = smoothstep(0.4, 0.95, v_glow);
    gl_FragColor = vec4( vec3(glow) + texColor.rgb, alpha);
}
