precision lowp float;

varying vec4 v_fragmentColor;
varying vec2 v_texCoord;
uniform float CC_alpha_value;
uniform sampler2D u_inputTexture;

void main()
{
    vec4 texColor = texture2D(CC_Texture0, v_texCoord);
    
    // mimic: glAlphaFunc(GL_GREATER)
    // pass if ( incoming_pixel >= CC_alpha_value ) => fail if incoming_pixel < CC_alpha_value\n
    
    vec4 inputColor = texture2D(u_inputTexture, v_texCoord);
    if ( inputColor.a > CC_alpha_value )
        discard;
        //texColor.g = 1.0;
    
    //texColor.r = texColor.a;
    
    gl_FragColor = texColor * v_fragmentColor;
}
