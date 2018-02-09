precision highp float;
precision highp int;

varying vec2 v_texCoord;
varying vec4 v_color;

uniform sampler2D tex1;
uniform vec3 color;

void main(void){
    vec3 t1Color = texture2D(tex1, v_texCoord).rgb;

    vec3 finalC =  mix(t1Color,
                       color,
                       v_color.r);
    gl_FragColor = vec4(finalC, 1.0);
}