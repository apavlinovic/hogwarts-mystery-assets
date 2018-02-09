
varying vec2 v_texCoord;

uniform float alpha;

void main()
{
    vec4 texColor = texture2D(CC_Texture0, v_texCoord);
    
    // mimic: glAlphaFunc(GL_GREATER)
    // pass if ( incoming_pixel >= CC_alpha_value )
    // fail if incoming_pixel < CC_alpha_value
    
    // constant tuned for visual happiness. Not magic!
    if ( texColor.a <= 0.75 ){
        discard;
    }
    texColor.a *= alpha;
    gl_FragColor = texColor;
    
}