precision highp float;

uniform sampler2D u_inputTexture;
uniform sampler2D u_depthTexture;
uniform vec2 u_textureSize;
uniform vec2 u_camNearFar;

uniform float u_nearBlur;
uniform float u_farBlur;
uniform float u_focusDistance;
uniform float u_focusRange;
uniform float u_focusFalloff;

varying vec2 v_texCoord;

varying vec2 v_coords1;
varying vec2 v_coords2;
varying vec2 v_coords3;
varying vec2 v_coords4;

void main()
{
    float blurStart = 460.0;
    float toMax = 100.0;
    
    vec4 depth4 = texture2D(u_depthTexture, v_texCoord);
    vec4 color0 = texture2D(u_inputTexture, v_texCoord);

    float z_n = 2.0 * depth4.x - 1.0;
    float zNear = u_camNearFar.x;
    float zFar = u_camNearFar.y;
    float z_e = 2.0 * zNear * zFar / (zFar + zNear - z_n * (zFar - zNear));
    
    float distToFocus = (z_e - u_focusDistance);
    float intoFalloff = abs(distToFocus) - u_focusRange;
    float falloffT = clamp(intoFalloff / u_focusFalloff, 0.0, 1.0);
    
#ifdef DEBUG
    if (intoFalloff < 0.0)
    {
        gl_FragColor = color0;
    }
    else if (intoFalloff/u_focusFalloff < 1.0)
    {
        gl_FragColor = mix(color0, vec4(1.0, 1.0, 0.0, 1.0), falloffT * 0.7);
    }
    else
    {
        if (distToFocus < 0.0)
        {
            gl_FragColor = mix(color0, vec4(1.0, 0.0, 0.0, 1.0), 0.7);
        }
        else
        {
            gl_FragColor = mix(color0, vec4(0.0, 0.0, 1.0, 1.0), 0.7);
        }
    }
    return;
#endif
    
    float blurAmount = (float(distToFocus < 0.0))*falloffT*u_nearBlur + (float(distToFocus > 0.0))*falloffT*u_farBlur;
    
    vec4 color1 = texture2D(u_inputTexture, v_coords1);
    vec4 color2 = texture2D(u_inputTexture, v_coords2);
    vec4 color3 = texture2D(u_inputTexture, v_coords3);
    vec4 color4 = texture2D(u_inputTexture, v_coords4);
    
    // constants are 1/9 and (8/9)/4
    vec4 blurColor = vec4((color0* 0.1111111111) + ((color1 + color2 + color3 + color4) * 0.22222222222));
    
    gl_FragColor = mix (color0, blurColor, blurAmount );
    
}
