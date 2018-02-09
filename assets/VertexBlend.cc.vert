precision highp float;
precision highp int;

attribute highp vec4 a_position;
attribute highp vec4 a_color;
attribute highp vec2 a_texCoord;
attribute highp vec2 a_texCoord1;

varying highp vec2 v_texCoord;
varying highp vec2 v_texCoord1;
varying highp vec4 v_color;

uniform sampler2D tex1;
uniform sampler2D tex2;
uniform sampler2D tex3;
uniform float multX;
uniform float multY;

void main(void){
    gl_Position = CC_MVPMatrix * a_position;
    
    v_texCoord = a_texCoord;
    v_texCoord.y = 1.0 - v_texCoord.y;
    
    v_texCoord.x *= multX;
    v_texCoord.y *= multY;

    v_texCoord1 = a_texCoord1;
    v_texCoord1.y = 1.0 - v_texCoord1.y;

    v_color = a_color;
}
