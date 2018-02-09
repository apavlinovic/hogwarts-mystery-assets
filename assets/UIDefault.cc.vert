attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void main()
{
    v_texCoord = a_texCoord;
    v_fragmentColor = a_color;
    gl_Position = CC_PMatrix * a_position;
}


