precision highp float;
precision highp int;

attribute highp vec4 a_position;
attribute highp vec3 a_normal;
attribute highp vec4 a_color;
attribute highp vec2 a_texCoord;
attribute highp vec2 a_texCoord1;

uniform float u_time; //normalized?!
uniform vec2 u_center;
uniform float u_amplitude;
uniform float u_frequency;
uniform float u_phaseShift;

uniform float u_waveOffsetFrequency;
uniform float u_waveSpeed;
uniform float u_waveAmount;

varying vec2 v_texCoord;
varying vec4 v_color;
varying float v_distance;
varying float v_height;

float getHeightOffset(float offset){
    float v1 = u_waveOffsetFrequency * offset;
    v1 = (v1 + CC_Time[1]) * u_waveSpeed;
    float v2 = sin(v1) * u_waveAmount * 1.3;
    return v2;
}

float getScaledDistance(){
    float size = 1300.0;
    float d = distance(u_center, a_position.xz);
    float lerpVal = d / size;
    float sVal = mix(0.0, -1.57, lerpVal);
    return sVal;
}
float getTime(){
    float mt = u_time;
    float t = 0.0;
    if(mt <= 1.0){
        t = smoothstep(0.0, 1.0, mt);
        t = mix(0.0, 1.57, t);
    }else if(mt > 1.0  && mt <= 2.0){
        t = 1.57;
    }else{
        mt = 4.0 - mt;
        mt /= 2.0;
        t = mix(1.57, 4.71, (1.0 - mt) * 4.0);
        t = min(4.71, t);
    }
    return t;
}

float getBulgeHeight(){
    float mt = u_time;
    float t = getTime();
    float d = distance(u_center, a_position.xz);
    float sVal = getScaledDistance();
    float amplitude = 400.0;

    if(mt > 2.0){
        mt = 4.0 - mt;
        mt /= 2.0;
        float lerpVal = smoothstep(200.0, 400.0, d);
        float newAmp  = mix(200.0, 400.0, 1.0 - lerpVal);
        amplitude = mix(amplitude, newAmp, (1.0-mt) * 4.0);
    }
    return amplitude * sin(sVal + t);
}

void main(void){
    float heightOffset = getHeightOffset(a_texCoord1[1]) * (1.0 - a_color.b);
    float buldgeOffset = max(0.0, getBulgeHeight()) * (1.0 - a_color.b);
    vec4 pos = a_position;
    pos.y += heightOffset + buldgeOffset;
    //pos.y += buldgeOffset;
    gl_Position = CC_MVPMatrix * pos;

    v_texCoord = a_texCoord;
    v_texCoord.y = 1.0 - v_texCoord.y;

    v_color = a_color;
    v_distance = distance(u_center, a_position.xz);
    float d = smoothstep(100.0, 300.0, buldgeOffset);
    v_height = d;
}
