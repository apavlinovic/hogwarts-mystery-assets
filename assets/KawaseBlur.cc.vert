attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform float u_kernel;
uniform vec2 u_textureSize;

varying vec2 v_coords1;
varying vec2 v_coords2;
varying vec2 v_coords3;
varying vec2 v_coords4;

void main()
{
    gl_Position = vec4(a_position, 0.0, 1.0);
    
    vec2 offset = vec2((0.5 + u_kernel)/u_textureSize.x, (0.5 + u_kernel)/u_textureSize.y);
    
    v_coords1 = a_texCoord + vec2(offset.x, offset.y);
    
    v_coords2 = a_texCoord + vec2(-offset.x, offset.y);
    
    v_coords3 = a_texCoord + vec2(offset.x, -offset.y);
    
    v_coords4 = a_texCoord + vec2(-offset.x, -offset.y);
}