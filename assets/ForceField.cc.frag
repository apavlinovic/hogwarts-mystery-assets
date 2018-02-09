precision highp float;
precision highp int;

uniform sampler2D tex1;

varying vec2 v_texCoord;
varying vec3 v_color;

uniform float Y_Wave1_Freq;
uniform float Y_Wave1_Amp;
uniform float Y_Wave2_Freq;
uniform float Y_Wave2_Amp;
//uniform float Y_Wave3_Speed;
//uniform float EdgeIntensity;
uniform float Y_Amp;
uniform float X_Wave_Freq;

float amplifiedSin(float amplitude, float frequency, float speed){
    return amplitude * sin(frequency + speed * CC_Time[1]);
}

void main(void){
    vec2 uv = vec2(0);

    float wave1Freq = amplifiedSin(1.0, Y_Wave1_Freq * v_texCoord.x, 0.1);
    float wave1 = amplifiedSin(Y_Wave1_Amp, v_texCoord.x * wave1Freq, 1.0);
    float wave2 = amplifiedSin(Y_Wave2_Amp, Y_Wave2_Freq * v_texCoord.x, 1.0);
    float temp = wave1 + wave2;
    float temp2 = temp * Y_Amp;
    float temp3 = temp2 * (1.0 - v_color.r);
    float temp4 = temp3 *(1.0 - v_color.b);

    uv.y =  temp4 + v_texCoord.y;
    uv.x = amplifiedSin(1.0, X_Wave_Freq * v_texCoord.x, 1.0);
    uv.y = 1.0 - uv.y;
    vec4 color = texture2D(tex1, uv) ;
    gl_FragColor = vec4(color.xyz + vec3(0.3 * v_color.b), 2.0 * color.a * (1.0 - v_texCoord.g));
}
