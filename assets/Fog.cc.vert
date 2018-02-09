
precision highp float;
precision highp int;

attribute highp vec4 a_position;
attribute highp vec3 a_normal;
attribute highp vec4 a_color;
attribute highp vec2 a_texCoord;
attribute highp vec2 a_texCoord1;
attribute highp vec2 a_texCoord2;

uniform float u_waveOffsetFrequency;
uniform float u_waveSpeed;
uniform float u_waveAmount;

varying vec2 v_texCoord;
varying vec2 v_texCoord1;
varying vec4 v_color;


float getHeightOffset(float offset){
    float v1 = u_waveOffsetFrequency * offset;
    v1 = (v1 + CC_Time[1]) * u_waveSpeed;
    float v2 = sin(v1) * u_waveAmount * 1.3;
    return v2;
}
void main(void){
    float heightOffset = getHeightOffset(a_texCoord1[1]) * (1.0 - a_color.b);
    vec4 pos = a_position;
    pos.y += heightOffset;// * 2.0;
    gl_Position = CC_MVPMatrix * pos;

    v_texCoord = a_texCoord;
    v_texCoord.y = 1.0 - v_texCoord.y;

    v_texCoord1 = a_texCoord2;
    v_texCoord1.y = 1.0 - v_texCoord1.y;

    v_color = a_color;
}
