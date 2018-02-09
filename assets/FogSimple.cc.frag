precision highp float;
precision highp int;

varying highp vec2 v_texCoord;
varying highp vec2 v_texCoord1;
varying highp vec4 v_color;

uniform float u_time;
uniform vec4 u_fadeMask;
uniform sampler2D tex1;
uniform sampler2D tex2;

float getOpacity(){
    vec4 edgeOpacity = texture2D(tex2, v_texCoord1);
    edgeOpacity = edgeOpacity * u_fadeMask;
    return 1.0 - dot(edgeOpacity, vec4(1.0)) - v_color.r;
}

void main(void){
    vec4 color = texture2D(tex1, v_texCoord);
    float opacity = getOpacity();
    gl_FragColor = vec4(color.rgb, color.a * opacity);
}
