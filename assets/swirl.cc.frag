precision highp float;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
uniform float u_angle;

void main(){
    vec2 center = vec2(0.5);
    vec2 tc = v_texCoord - center;
    float percent = length(tc);
    float theta = percent * u_angle;
    float s = sin(theta);
    float c = cos(theta);
    tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c))) + center;
    gl_FragColor = texture2D(CC_Texture0, tc) * v_fragmentColor;
}
