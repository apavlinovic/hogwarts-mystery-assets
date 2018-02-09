precision highp float;
precision highp int;

varying vec2 v_texCoord;
varying vec4 v_color;

void main(void){
    vec4 tColor = texture2D(CC_Texture0, v_texCoord);

    vec3 nColor = mix(tColor.rgb,
                      v_color.rgb,
                      v_color.a);

    gl_FragColor = vec4(nColor, tColor.a);
}
