precision lowp float;
varying vec4 v_color;
varying vec2 v_texCoord;
varying float v_alphaValue;

void main()
{
    float alphaVal = 1.0 - clamp(v_alphaValue, 0.0, 1.0);
//    gl_FragColor = mix(vec4(0.0, 1.0, 0.0, 1.0), vec4(1.0, 0.0, 0.0, 1.0), alphaVal);
    gl_FragColor = alphaVal * v_color * texture2D(CC_Texture0, v_texCoord);
}
