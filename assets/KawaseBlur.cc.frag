precision highp float;

uniform sampler2D u_inputTexture;
uniform float u_kernel;

varying vec2 v_coords1;
varying vec2 v_coords2;
varying vec2 v_coords3;
varying vec2 v_coords4;

void main()
{
    vec4 color1 = texture2D(u_inputTexture, v_coords1);
    vec4 color2 = texture2D(u_inputTexture, v_coords2);
    vec4 color3 = texture2D(u_inputTexture, v_coords3);
    vec4 color4 = texture2D(u_inputTexture, v_coords4);
    
    gl_FragColor = vec4((color1 + color2 + color3 + color4) * 0.25);
}
