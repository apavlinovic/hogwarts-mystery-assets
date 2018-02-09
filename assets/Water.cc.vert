precision highp float;
precision highp int;

attribute highp vec4 a_position;
attribute highp vec3 a_normal;
attribute highp vec4 a_color;
attribute highp vec2 a_texCoord;
attribute highp vec2 a_texCoord1;
attribute highp vec2 a_texCoord2;
attribute highp vec2 a_texCoord3;

uniform float u_waveOffsetFrequency;
uniform float u_waveSpeed;
uniform float u_waveAmount;

varying highp vec2 v_texCoord;
varying highp vec2 v_texCoord1;
varying highp vec2 v_texCoord2;
varying highp vec2 v_texCoord3;
varying highp vec4 v_color;
//varying vec3 v_test;

float getHeightOffset(float offset){
    //Ask Andreas about all the wierd math that happens here...
    float v1 = u_waveOffsetFrequency * offset;
    v1 = (v1 + CC_Time[1]) * u_waveSpeed;
    float v2 = sin(v1) * u_waveAmount * 1.3;
    return v2;
}

void main(void){
    //This vertex shader does all sorts of wierd math stuff to offset
    //the vertices in a wave motion. Passes a long to the fragment 
    //shader everything we need to texture the water correctly

    float heightOffset = getHeightOffset(a_texCoord2[1]);
    vec4 pos = a_position;
    pos.y += heightOffset;// * 2.0;
    gl_Position = CC_MVPMatrix * pos;

    v_texCoord = a_texCoord;
    v_texCoord.y = 1.0 - v_texCoord.y;

    v_texCoord1 = a_texCoord1;
    v_texCoord1.y = 1.0 - v_texCoord1.y;

    v_texCoord2 = a_texCoord2;
    v_texCoord2.y = 1.0 - v_texCoord2.y;

    v_texCoord3 = a_texCoord3;
    v_texCoord3.y = 1.0 - v_texCoord3.y;

    v_color = a_color;
    //v_test = vec3(heightOffset);
}
