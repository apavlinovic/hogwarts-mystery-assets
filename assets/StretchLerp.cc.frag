varying vec2 v_texCoord;
varying vec2 v_texCoord1;
varying vec2 v_texCoord2;


uniform sampler2D tex1;
uniform sampler2D tex2;
uniform float alpha;

uniform float xScale;
uniform float zScale;

float getStretchRatio(){
    float scaleRatio = zScale / xScale;
    float ratio = -0.33 * (scaleRatio * scaleRatio) + 1.5 * scaleRatio - 0.666;
    ratio = clamp(ratio, 0.0, 1.0);
    return ratio;
}
void main(void){
    vec2 uv = mix(v_texCoord, v_texCoord2, getStretchRatio());
    highp vec3 t1Color = texture2D(tex1, uv).rgb;
    highp vec3 t2Color = texture2D(tex2, v_texCoord1).rgb;
    gl_FragColor = vec4(t1Color * t2Color, alpha);
}
