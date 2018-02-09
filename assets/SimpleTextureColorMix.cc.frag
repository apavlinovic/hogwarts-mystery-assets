varying vec2 v_texCoord;

uniform sampler2D tex1;
uniform float alpha;
uniform vec3 mixColor;
uniform float mixRatio;

void main(void){
    highp vec4 realColor = texture2D(tex1, v_texCoord);
    highp vec3 newColor = mix(realColor.rgb, mixColor, mixRatio);
    
    gl_FragColor = vec4(newColor, realColor.a);
}
