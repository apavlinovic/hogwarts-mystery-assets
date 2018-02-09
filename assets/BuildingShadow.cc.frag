precision highp float;
precision highp int;

varying vec2 v_texCoord;

uniform sampler2D shadow;
uniform float alpha;

float Luminance(vec3 c){
    return dot(c, vec3(0.22, 0.707, 0.071));
}

void main(void){
    vec3 color = texture2D(shadow, v_texCoord).rgb;
    float colorAlpha = Luminance(color);
    gl_FragColor = vec4(color, alpha*colorAlpha);
}
