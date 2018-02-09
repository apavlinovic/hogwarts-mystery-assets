varying vec2 v_texCoord;
varying vec2 v_texCoord2;
varying float v_glow;

uniform vec4 color;
uniform float alpha;

void main(void){
    gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) * v_glow + color.rgb, alpha);
}
