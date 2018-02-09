precision highp float;
precision highp int;

varying vec2 v_texCoord;
varying vec2 v_texCoord2;

void main(void){
    vec4 color = texture2D(CC_Texture0, v_texCoord);
    vec4 color2 = texture2D(CC_Texture2, v_texCoord2);

    vec3 mixedC = mix(color.rgb,
                      color2.rgb,
                      color2.a);

    gl_FragColor = vec4(mixedC, color.a + color2.a);
}
