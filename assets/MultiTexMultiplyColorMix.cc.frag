varying vec2 v_texCoord;
varying vec2 v_texCoord2;


uniform sampler2D tex1;
uniform sampler2D tex2;
uniform float alpha;
uniform vec3 mixColor;
uniform float mixRatio;

void main(void){
    highp vec3 t1Color = texture2D(tex1, v_texCoord).rgb;
    highp vec3 t2Color = texture2D(tex2, v_texCoord2).rgb;
    highp vec3 realColor = vec3(t1Color * t2Color);
    highp vec3 newColor = mix(realColor, mixColor, mixRatio);
    
    gl_FragColor = vec4(newColor, alpha);
}
