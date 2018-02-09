precision highp float;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

float normalizeTime(float fullTime, float duration){
    return mod(fullTime, duration) / duration;
}

float badSin(float t){
    return 1.0 - abs(t-0.5)*2.0;
}

float angleDist(float normAngle1, float normAngle2){
    // need to get rid if discontinuity around 0
    
    float dist = normAngle2-normAngle1;
    if(dist <-0.5)
        dist +=1.0;
    else if (dist>0.5)
        dist -= 1.0;
    return abs(dist);
}

void main(){
    vec4 texColor = texture2D(CC_Texture0, v_texCoord);
    float bright = texColor.r/3.0 + texColor.g/3.0 + texColor.b/3.0;
    
    bool on = bright > 0.3;
    float pushedTime = CC_Time.y;
    
    float duration = 12.0;
    float nt = badSin(normalizeTime(pushedTime, duration));
    float nt2 = badSin(normalizeTime(pushedTime, duration / 13.0 * 7.0 )); // magic to get ofsetty randomness
   	float waveAngle = nt + nt2 -1.0;
    
    float myangle = atan(v_texCoord.x-0.5, v_texCoord.y-0.5) / 6.28318530718;
    float dist = angleDist(myangle, waveAngle);
    
    float onNess = on ? max(0.2-dist, 0.0) * 5.0 : 0.0;
    
    // add while and yellow bands on opposites
    vec4 whiteband = vec4(1,1,1,0) * onNess;
    gl_FragColor = (texColor + whiteband) * v_fragmentColor;
    
}
