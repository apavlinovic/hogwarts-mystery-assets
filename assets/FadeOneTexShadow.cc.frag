//This shader multiplies a shadow ontop of one texture
//then fades to color based on vertex color(red)

precision highp float;
precision highp int;

varying vec2 v_texCoord;
varying vec2 v_texCoord1;
varying vec4 v_color;

uniform sampler2D tex1;
uniform sampler2D tex2; //shadow
uniform vec3 color;

void main(void){
    vec3 t1Color = texture2D(tex1, v_texCoord).rgb;
    vec3 t2Color = texture2D(tex2, v_texCoord1).rgb;

    vec3 withShadow = t1Color * t2Color;

    vec3 finalC = mix(withShadow,
                      color,
                      v_color.r);

    gl_FragColor = vec4(finalC, 1.0);
}
