precision highp float;
precision highp int;

varying highp vec2 v_texCoord;
varying highp vec2 v_texCoord1;
varying highp vec2 v_texCoord2;
varying highp vec2 v_texCoord3;
varying highp vec4 v_color;

uniform sampler2D base;
uniform sampler2D detail;
uniform sampler2D foam;
uniform vec3 color;
uniform float u_baseSpeedX;
uniform float u_baseSpeedY;
uniform float u_redBaseDesat;
uniform float u_blueBaseDesat;
uniform float u_greenBaseDesat;
uniform float u_detailWaveX;
uniform float u_detailWaveY;
uniform float u_foamSpeedX;
uniform float u_foamSpeedY;

vec2 panBase(){
    vec2 baseSpeed = vec2(u_baseSpeedX, u_baseSpeedY * -1.0);
    vec2 baseOffset = CC_SinTime[2] * 2.0 * baseSpeed;
    return baseOffset + v_texCoord;
}

vec3 ColorVariation(vec3 colorIn){
    float red = 1.0 - (v_color.r * u_redBaseDesat);
    float green = 1.0 - (v_color.r * u_greenBaseDesat);
    float blue = 1.0 - (v_color.r * u_blueBaseDesat);
    vec3 colorOut = vec3(colorIn.r * red, colorIn.g * green, colorIn.b * blue);
    return colorOut;
}

vec2 WavePan(vec3 colorIn){
    vec2 detailWave = vec2(u_detailWaveX, u_detailWaveY);

    vec2 someMath = (CC_SinTime[3] * detailWave) + v_texCoord;
    return colorIn.rg * someMath;
}

vec2 foamPan(){
    vec2 foamSpeed = vec2(u_foamSpeedX, u_foamSpeedY * -1.0);
    vec2 panFoam = CC_SinTime[2] * 2.0 * foamSpeed * 2.5;
    return v_texCoord3 + panFoam;
}

void main(void){
    vec2 pannedUVs = panBase();
    vec4 pannedBaseColor = texture2D(base, pannedUVs);
    vec3 colorVar = ColorVariation(pannedBaseColor.rgb);

    vec2 wavePanUVs = WavePan(pannedBaseColor.rgb);
    vec3 detailColor = texture2D(detail, wavePanUVs).rgb;

    vec3 variationAndDetailColorMix = mix(colorVar,
                                    detailColor,
                                    detailColor.g);

    //Foam
    vec2 foamUVs = foamPan();
    float foamColor = texture2D(foam, foamUVs).r * v_color.g;
    vec3 withFoamColor = variationAndDetailColorMix + vec3(foamColor);
    vec3 atmoBlended = mix(withFoamColor,
                          color.rgb,
                          v_texCoord2.x);

    gl_FragColor = vec4(atmoBlended, v_color.a);
}
