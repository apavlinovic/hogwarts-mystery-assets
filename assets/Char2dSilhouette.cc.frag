
precision lowp float;
varying vec2 v_texCoord;

uniform vec3 color;

void main(void)
{
    vec4 normal = texture2D(CC_Texture0, v_texCoord);
    gl_FragColor = vec4(color, normal.a);
}