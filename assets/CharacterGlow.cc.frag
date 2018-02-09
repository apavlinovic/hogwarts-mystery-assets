uniform vec3 eyePos;
uniform float alpha;

uniform float u_intensity;

varying vec2 TextureCoordOut;
varying vec3 v_position;
varying vec3 v_normal;

void main(void){
    vec4 texC = texture2D(CC_Texture0, TextureCoordOut);
    float thicknessMin = 0.2;
    float thicknessMax = 0.2;
    float time = (sin(CC_Time.y * 3.0) + 1.0) / 2.0;
    time = 0.0;
    float thickness = mix(thicknessMin, thicknessMax, time);
    
    

    vec3 norm = normalize(v_normal);
    vec3 dir = vec3(0,0,1);//-normalize(v_position);
    float eDotn = abs(dot(dir, norm));
    float rimC = 1.0 - max(eDotn, 0.0);
    rimC = mix(0.0,1.0, (rimC-thickness) / thickness);
    rimC = max(0.0,rimC);
    
    // for glow in entityUpgradeVC;
    // 0 is none, 1.0 is normal, 2.0 is total
    rimC = mix(0.0,2.5, rimC + ((u_intensity-1.0)));
    rimC = max(0.0,rimC);
    
    float newAlpha = texC.a*alpha;
    
    gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) * rimC + texC.rgb, newAlpha);
}

