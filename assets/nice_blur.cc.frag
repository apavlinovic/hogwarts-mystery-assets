precision highp float;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

//#define pow2(x) (x * x)
//const float pi = atan(1.0) * 4.0;
//const float sigma = 0.1;
//float gaussian(vec2 i) {
//    return 1.0 / (2.0 * pi * pow2(sigma)) * exp(-((pow2(i.x) + pow2(i.y)) / (2.0 * pow2(sigma))));
//}

void main(){
    vec4 col = vec4(0.0);
    int steps = 10;
    for (int x = -steps; x < steps; x++) {
        for (int y = -steps; y < steps; y++) {
            vec2 xy = vec2(x,y) / float(steps) * RADIUS;
//            float d = gaussian(xy);
            float d = RADIUS - (distance(xy, vec2(0.0)) / RADIUS);
            vec4 res = texture2D(CC_Texture0, v_texCoord + xy * d) / float(steps*steps*2*2);
            float c = (res.r + res.g + res.b) * 10.0;
            col += vec4(vec3(c*0.5, c, c), res.a);
        }
    }
    gl_FragColor = col * v_fragmentColor;
}
