//This shader mixes to textures based on vertex color (green),
//multiplies shadows on top and then fades to a color based on
//vertex color (red)

precision highp float;
precision highp int;

varying vec2 v_texCoord;
varying vec2 v_texCoord1;
varying vec4 v_color;

uniform sampler2D tex1;
uniform sampler2D tex2;
uniform sampler2D tex3; //shadow
uniform vec3 color;


void main(void){
    // smasher throwing in a constant multiplier here -
    // textures were much bigger than used area, and causing android performance probs
    // remove when textures are smaller
    vec3 t1Color = texture2D(tex1, v_texCoord).rgb;
    vec3 t2Color = texture2D(tex2, v_texCoord).rgb;
    vec3 t3Color = texture2D(tex3, v_texCoord1).rgb;

    vec3 mix1 =  mix(t1Color,
                    t2Color,
                    v_color.g);

    vec3 withShadow = mix1 * t3Color;

    vec3 finalC = mix(withShadow,
                      color,
                      v_color.r);

    gl_FragColor = vec4(finalC, 1.0);
}
