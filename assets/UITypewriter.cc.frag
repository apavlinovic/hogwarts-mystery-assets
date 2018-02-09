precision highp float;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

uniform float u_typingProgress;


float realColor(float colorChannel){
    float colorByte = colorChannel * 255.0;
    float color = colorByte - float(16 * int(colorByte/16.0)); // because mod doesn't exist
    color = min(color,15.0);
    return (color * 16.0 + color) / 255.0;
}


void main() {
    vec4 texColor = texture2D(CC_Texture0, v_texCoord);

    // leave transparent pixels as they are
    if (texColor.a == 0.0) {
        // gl_FragColor = vec4(0.0,0.0,0.0,0.0);
        gl_FragColor = texColor * v_fragmentColor;
    } else {
        // first get the typewriter counter # from r, g, and b most significant 4 bits
        int typewriterCounter = (int((texColor.b*255.0) + 0.3) / 16) + ((int((texColor.g*255.0) + 0.3) / 16) * 16) + ((int((texColor.r*255.0) + 0.3) / 16) * 256);

        // counter data goes down from FFF instead of up from 0 so that, 
        // if they get munged down by aliasing, they appear later instead of appearing earlier as ghostly edges
        if ((0x0FFF - typewriterCounter) > int(u_typingProgress)) {
            gl_FragColor = vec4(0.0,0.0,0.0,0.0);
        } else {
            // gl_FragColor = vec4(1.0,0.0,0.0,1.0);
            gl_FragColor.r = realColor(texColor.r) * texColor.a;
            gl_FragColor.g = realColor(texColor.g) * texColor.a;
            gl_FragColor.b = realColor(texColor.b) * texColor.a;
            gl_FragColor.a = texColor.a;
            gl_FragColor *= v_fragmentColor;
        }
    }
}
