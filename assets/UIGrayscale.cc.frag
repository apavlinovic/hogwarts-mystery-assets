precision highp float;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

uniform float brightnessMultiplier;

void main(){
    vec4 texColor = texture2D(CC_Texture0, v_texCoord);
    float colorValue = (texColor.r + texColor.g + texColor.b)/3. * brightnessMultiplier;
    texColor.g = texColor.b = texColor.r = colorValue;
    gl_FragColor = texColor * v_fragmentColor;
}
