uniform vec3 eyePos;
uniform float alpha;
uniform float intensity;
uniform vec4 u_color;

varying vec2 TextureCoordOut;
varying vec3 v_position;
varying vec3 v_normal;

void main(void){
    vec4 texC = texture2D(CC_Texture0, TextureCoordOut);

    vec3 norm = normalize(v_normal);
    vec3 dir = vec3(0,0,1);//-normalize(v_position);
    float eDotn = abs(dot(dir, norm));
    float rimC = 1.0 - max(eDotn, 0.0);
    rimC = mix(0.0,1.0, (rimC-0.5) / 0.5);
    rimC = max(0.0,rimC);
    
    float newAlpha = texC.a*alpha;

    gl_FragColor = vec4(vec3(intensity) * rimC + (texC.rgb * u_color.r), newAlpha);
}
