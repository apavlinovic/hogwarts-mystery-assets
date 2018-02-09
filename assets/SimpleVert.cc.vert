attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;

varying vec2 v_texCoord;
varying vec4 v_color;

uniform vec4 u_matrixPalette[60 * 3]; // to prevent warning; not used.

void main(void){
    gl_Position = CC_MVPMatrix * a_position;

    v_texCoord = a_texCoord;
    v_texCoord.y = 1.0 - v_texCoord.y;
    v_color = a_color;
}
