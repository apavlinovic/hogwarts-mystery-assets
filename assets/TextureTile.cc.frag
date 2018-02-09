precision highp float;
precision highp int;

varying vec2 v_texCoord;

void main(void){
    gl_FragColor = texture2D(CC_Texture0, v_texCoord);
}
