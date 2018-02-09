attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;

varying vec4 v_color;
varying vec2 v_texCoord;
varying float v_alphaValue;

uniform float u_cutoffLow;  //alpha = 0 at this amount
uniform float u_cutoffHigh; //alpha = 1 at this amount

void main()
{
    gl_Position = CC_PMatrix * a_position;
    v_color = a_color;
    v_texCoord = a_texCoord;
    
    v_alphaValue = (v_texCoord.x - u_cutoffLow) / (u_cutoffHigh - u_cutoffLow);
}
