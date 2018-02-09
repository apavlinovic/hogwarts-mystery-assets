precision highp float;
precision highp int;

varying highp vec2 v_texCoord;
varying highp vec4 v_color;
varying highp float v_distance;
varying highp float v_height;

uniform float u_time;
uniform float u_fogSpeed;
uniform float u_blueAmount;
uniform float u_opacityOffset;
uniform float u_opacityIntensity;
uniform float u_blue;
uniform float u_green;
uniform float u_red;
uniform sampler2D tex1;

vec2 uvWarp(){
    vec2 warpSample = texture2D(tex1, v_texCoord).rg;
    float alph = v_color.a * 2.0 -1.0;
    float fogDelta = CC_SinTime[2] * 2.0 * u_fogSpeed;
    float redDistort = alph * warpSample.r;
    vec2 uvOffset = vec2(redDistort + fogDelta, warpSample.g + fogDelta);
    return v_texCoord + uvOffset;
}

vec3 getColor(float inRed){
    float blue = 1.4 * inRed;
    float alph = v_color.a * 2.0 - 1.0;
    return vec3(u_red * alph + inRed, u_green * alph + inRed, u_blue * alph + blue);
}

float getOpacity(float inBlue){

    float blueOff = inBlue + u_opacityOffset;
    float intensity = blueOff * u_opacityIntensity;
    float red = v_color.r * 2.0  - 1.0;
    
    float invVertexRed = 1.0 - (red);
    return invVertexRed * intensity;
}


float getClearOpacity(){
    float mt = u_time;
    if(mt <= 2.0){
        return 1.0;
    }else{
        mt -= 2.0;
        float r = mix(0.0, 1400.0, mt * 4.0);
        return smoothstep(r-200.0, r, v_distance);
    }
}

float getHighlight(){
    float mt = u_time;
    if(mt <= 2.0){
        float allowedDist = mix(0.0, 500.0, mt * 2.0);
        return 1.0 - smoothstep(0.0, allowedDist, v_distance);
    }else{
        mt -= 2.0;
        float r = mix(0.0, 1400.0, mt * 4.0);
        return 1.0 - smoothstep(0.0, r + 800.0, v_distance);
    }
}


void main(void){
    vec2 warpedUvs = uvWarp();
    vec3 warpedColor = texture2D(tex1, warpedUvs).rgb;
    vec3 highlight = mix(vec3(0.0), vec3(1.0, 0.84, 0.2), getHighlight());
    vec3 finalColor = getColor(warpedColor.r) + highlight;
    float opacity = getOpacity(warpedColor.b) * getClearOpacity();
    gl_FragColor = vec4(finalColor, opacity);
}

