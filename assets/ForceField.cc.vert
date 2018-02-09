precision highp float;
precision highp int;

attribute highp vec4 a_position;
attribute highp vec4 a_color;
attribute highp vec2 a_texCoord;

varying vec2 v_texCoord;
varying vec3 v_color;


void main(void){
    gl_Position = CC_MVPMatrix * a_position;

    vec2 uv = a_texCoord;
    v_texCoord = uv;

    v_color = a_color.xyz;
}

