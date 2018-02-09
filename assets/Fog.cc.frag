precision highp float;
precision highp int;

varying highp vec2 v_texCoord;
varying highp vec2 v_texCoord1;
varying highp vec4 v_color;

uniform float u_fogSpeed;
uniform float u_blueAmount;
uniform float u_opacityOffset;
uniform float u_opacityIntensity;
uniform float u_distortionAmount;
uniform float u_blue;
uniform float u_green;
uniform float u_red;
uniform vec4 u_fadeMask;
uniform sampler2D tex1;
uniform sampler2D tex2;

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
    
    vec4 edgeOpacity = texture2D(tex2, v_texCoord1);
    edgeOpacity = edgeOpacity * u_fadeMask;
    float maskedOpacity = edgeOpacity.x + edgeOpacity.y + edgeOpacity.z + edgeOpacity.w;
    float invVertexRed = 1.0 - (red + maskedOpacity);
    return invVertexRed * intensity;
}
void main(void){
    vec2 warpedUvs = uvWarp();
    vec3 warpedColor = texture2D(tex1, warpedUvs).rgb;
    vec3 finalColor = getColor(warpedColor.r);
    float opacity = getOpacity(warpedColor.b);
    
    vec3 blah = texture2D(tex2, v_texCoord1).rgb;
    gl_FragColor = vec4(finalColor, opacity);
}

