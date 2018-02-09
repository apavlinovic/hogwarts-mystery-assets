precision highp float;
precision highp int;

varying vec4 v_color;
varying vec3 v_normal;
varying vec2 v_texCoord;

uniform sampler2D tex1;
uniform mat4 worldViewMat;
uniform float u_fresnelMin;
uniform float u_fresnelMax;
uniform float u_fresnelPower;
uniform float u_fresnelStrength;

float getFresnelValue(vec3 camSpaceDir){
    float d = dot(camSpaceDir, vec3(0.0, 0.0, 1.0));
    d = clamp(1.0-d, 0.0, 1.0);

    float subMin = d - u_fresnelMin;
    float diffRange = u_fresnelMax - u_fresnelMin;
    float satDiv = clamp(subMin / diffRange, 0.0, 1.0);
    return pow(satDiv * u_fresnelStrength, u_fresnelPower);
}

void main(void){
    vec3 camSpaceDir = (worldViewMat * vec4(normalize(v_normal), 0.0)).rgb;
    float f =  1.0 - getFresnelValue(camSpaceDir);
    vec4 color = texture2D(tex1, v_texCoord);
    gl_FragColor = vec4(color.rgb, f * (color.a * 2.0) * v_color.a);
}
