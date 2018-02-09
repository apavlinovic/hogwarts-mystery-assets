precision highp float;
precision highp int;

attribute vec4 a_position;
attribute vec4 a_color;
attribute vec2 a_texCoord;

varying vec2 v_texCoord;
varying vec4 v_color;

uniform sampler2D tex3;
uniform float multX;
uniform float multY;

void main(void){
    gl_Position = CC_MVPMatrix * a_position;
    
    v_texCoord = a_texCoord;
    
    v_texCoord.x *= multX;
    v_texCoord.y *= multY;

    v_color = a_color;
}
