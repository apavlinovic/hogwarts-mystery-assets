precision highp float;
precision highp int;

varying lowp vec2 v_texCoord;
varying lowp vec4 v_color;

uniform sampler2D tex1;
uniform sampler2D tex2;
uniform sampler2D tex3;

void main(void){
    vec3 t1Color = texture2D(tex1, v_texCoord).rgb;

    // every doc says don't branch,
    // but bailing out early tested faster than straight mixing
    
    if(v_color.r<0.1){
        gl_FragColor = vec4(t1Color, 1.0);
        return;
    }
    
    vec3 t2Color =  texture2D(tex2, v_texCoord).rgb;
    vec3 mixC =  mix(t1Color,
                       t2Color,
                       v_color.r);
    if(v_color.g < 0.1){
        gl_FragColor = vec4(mixC, 1.0);
        return;
    }
    
    vec3 t3Color =  texture2D(tex3, v_texCoord).rgb;
    vec3 finalC = mix(mixC,
                      t3Color,
                      v_color.g);
    gl_FragColor = vec4(finalC, 1.0);
}
