precision highp float;
precision highp int;

varying highp vec2 v_texCoord;
varying highp vec2 v_texCoord1;
varying highp vec4 v_color;

uniform sampler2D foam;
uniform vec3 baseColor;
uniform vec3 color;
uniform float u_baseSpeedX;
uniform float u_baseSpeedY;
uniform float u_redBaseDesat;
uniform float u_blueBaseDesat;
uniform float u_greenBaseDesat;
uniform float u_foamSpeedX;
uniform float u_foamSpeedY;

vec3 ColorVariation(vec3 colorIn){
    float red = 1.0 - (v_color.r * u_redBaseDesat);
    float green = 1.0 - (v_color.r * u_greenBaseDesat);
    float blue = 1.0 - (v_color.r * u_blueBaseDesat);
    vec3 colorOut = vec3(colorIn.r * red, colorIn.g * green, colorIn.b * blue);
    return colorOut;
}

vec2 foamPan(){
    vec2 foamSpeed = vec2(u_foamSpeedX, u_foamSpeedY * -1.0);
    vec2 panFoam = CC_SinTime[2] * foamSpeed;
    return v_texCoord + panFoam * 2.5;
}

void main(void){
    vec4 pannedBaseColor = vec4(baseColor, 0.0);
    vec3 colorVar = ColorVariation(pannedBaseColor.rgb);

    //Foam
    vec2 foamUVs = foamPan();
    float foamColor = texture2D(foam, foamUVs).r * v_color.g;
    vec3 withFoamColor = colorVar + vec3(foamColor);
    vec3 atmoBlended = mix(withFoamColor,
                          color.rgb,
                          v_texCoord1.x);

    gl_FragColor = vec4(atmoBlended, 1.0);
}
