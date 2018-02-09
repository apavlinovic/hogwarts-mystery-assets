precision highp float;

varying vec2 v_texCoord;

void main()
{
    const vec2 center = vec2(0.5,0.5);
    const float maxDist = 0.9; //0.707106 is true distance to corner of screen.
    const float minDist = 0.3;
    const float invRange = 1.0 / (maxDist - minDist);
    const float maxFactor = 0.9;
    
    float val = clamp((distance(v_texCoord, center) - minDist) * invRange, 0.0, maxFactor);
    val = val*val;
    gl_FragColor = vec4(0.0, 0.0, 0.0, val);
}
