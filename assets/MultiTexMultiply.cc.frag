varying vec2 v_texCoord;
varying vec2 v_texCoord2;


uniform sampler2D tex1;
uniform sampler2D tex2;
uniform float alpha;

void main(void){
    highp vec3 t1Color = texture2D(tex1, v_texCoord).rgb;
    highp vec3 t2Color = texture2D(tex2, v_texCoord2).rgb;

    gl_FragColor = vec4(t1Color * t2Color, alpha);
}
