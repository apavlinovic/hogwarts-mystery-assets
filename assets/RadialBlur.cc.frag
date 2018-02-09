precision highp float;

const float iterations = 32.0;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
uniform vec2 u_lightOrigin;
uniform float u_radialDecay;
uniform float u_linearDecay;
uniform float u_length;
uniform float u_intensity;

void main(){
    vec4  col = vec4(0.0);
    vec2  delta = (-v_texCoord/iterations) * u_length;
    vec2  delta2 = vec2(0.5/iterations) * u_length;

    vec2  pos = v_texCoord;
    vec2  delta2ac = vec2(0.0);
    float d = 1.0 - distance(u_lightOrigin, v_texCoord) * u_radialDecay;
    float intensity = u_intensity;
    for ( float i=0.0; i<iterations; i++ )
    {
        vec4 res = texture2D(CC_Texture0, pos + delta2ac + (u_lightOrigin-vec2(0.5))* i / iterations * u_length) * d;
        float c = res.r + res.g + res.b;
        col += vec4(vec3(c*0.5, c, c), res.a) * intensity * 0.1;
        intensity *= u_linearDecay;

        pos += delta;
        delta2ac += delta2;
    }
    gl_FragColor = col * v_fragmentColor;
}
