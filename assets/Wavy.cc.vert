attribute vec4 a_position;
attribute vec2 a_texCoord;

varying vec2 v_texCoord;

uniform float contentScale;

float normalizeTime(float fullTime, float duration){
    return mod(fullTime, duration) / duration;
}

float badSin(float t){
    return 1.0 - abs(0.5-t)*2.0;
}


float wave(float time, float d1, float d2){
    float n1 = normalizeTime(time, d1 );
    float n2 = normalizeTime(time, d2 );
    return badSin(n1) + badSin(n2) - 1.0;
}

void main()
{
    highp float time = CC_Time.y * 2.0;
    highp vec4 basePos = CC_PMatrix * a_position; 
    
    v_texCoord = a_texCoord;
    
    // pass some some magic to atan to avoid discontinuity
    highp float angle =  atan(v_texCoord.x * 0.5 +0.3, v_texCoord.y* 0.5 +0.3) / 6.28 * 15.0;
    
    basePos.x += wave(time+angle, 13.0, 6.0) * 6.0 * contentScale;
    basePos.y += wave(time+angle, 14.0, 6.5) * 6.0 * contentScale;
    
    gl_Position = basePos;
}


