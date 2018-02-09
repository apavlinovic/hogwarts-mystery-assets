precision highp float;

varying vec4 v_fragmentColor;
varying vec2 v_texCoord;

uniform float u_time;
uniform sampler2D u_timeMap;

void main() {
    vec4 texColor = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);
    vec4 timeColor = texture2D(u_timeMap, v_texCoord);
    
    float red = clamp(((1.0 - (timeColor.r / (u_time * 1.2))) * 3.0), 0.0, 1.0);
    float green = (1.0 - timeColor.g);
    gl_FragColor = vec4(texColor.rgb + (red * green), texColor.a);
}
