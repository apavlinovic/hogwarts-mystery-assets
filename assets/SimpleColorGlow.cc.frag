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
    texColor = vec3(.18,.42,.62);
    
    gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) * v_glow + texColor.rgb, alpha);
}
