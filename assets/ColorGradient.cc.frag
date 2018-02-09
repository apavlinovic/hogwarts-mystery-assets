precision highp float;

uniform sampler2D u_inputTexture;
varying vec2 v_texCoord;

void main()
{
    vec3 color0 = texture2D(u_inputTexture, v_texCoord).rgb;
    
    const vec2 botLeft = vec2(0.0, 0.0);
    const vec2 topRight = vec2(1.0, 1.0);
    
    float toTopRight = distance(v_texCoord, topRight);
    float toBotLeft = distance(v_texCoord, botLeft);
    
    const float maxVal = 0.707107;
    if (toBotLeft < toTopRight)
    {
        const vec2 norm = vec2(0.707107, 0.707107);
        float dist = dot(norm, v_texCoord);
        float mixAmount = 1.0 - clamp(dist / maxVal, 0.0, 1.0);
        gl_FragColor = vec4(mix(color0, vec3(0.0, 0.5, 1.0), mixAmount), 1.0);
    }
    else
    {
        const vec2 norm = vec2(-0.707107, -0.707107);
        float dist = dot(norm, (v_texCoord - vec2(1, 1)));
        float mixAmount = 1.0 - clamp(dist / maxVal, 0.0, 1.0);
        gl_FragColor = vec4(mix(color0, vec3(1.0, 0.5, 0.0), mixAmount), 1.0);
    }
}
