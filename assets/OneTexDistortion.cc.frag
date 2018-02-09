precision highp float;
precision highp int;

varying vec2 v_texCoord;
varying vec2 v_distortionX;
varying vec2 v_distortionY;
varying vec3 v_normal;
varying vec4 v_color;

uniform float u_distortionStrength;

vec2 distortUVs(vec2 distortX, vec2 distortY){
    float u = texture2D(CC_Texture1, distortX).b * u_distortionStrength;
    float v = texture2D(CC_Texture1, distortY).r * u_distortionStrength;
    return vec2(u,v);
}

void main(void){
    vec2 uv = v_texCoord + distortUVs(v_distortionX, v_distortionY);
    vec4 color = texture2D(CC_Texture0, uv);
    gl_FragColor = vec4(color.rgb, color.a * v_color.a);
}
