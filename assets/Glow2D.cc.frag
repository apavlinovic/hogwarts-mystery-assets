
precision lowp float;
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

uniform float minEdgeIntensity;
uniform float minBaseIntensity;

uniform vec3 color;

float lookup(vec2 p, float dx, float dy)
{
    vec2 resolution = vec2(40.0);
    vec2 uv = p.xy + vec2(dx , dy ) / resolution.xy;
    vec4 c = texture2D(CC_Texture0, uv.xy);
    return 0.2126*c.r + 0.7152*c.g + 0.0722*c.b;
}

void main(void)
{
    vec4 normal = texture2D(CC_Texture0, v_texCoord);
    if ( normal.a <= 0.75 ){
        gl_FragColor = vec4(0,0,0,0);
        return;
    }else{
        
        float time = (sin(CC_Time.y * 3.0) + 1.0) / 2.0;
        
        // calc brightness (2 steps to avoid overflow)
        vec3 shrunk = normal.rgb / 3.0;
        float g = shrunk.r + shrunk.g + shrunk.b + 0.1;
        
        float minIntensity;
        if ( g > 0.1 ){
            minIntensity = minEdgeIntensity;
        } else {
            minIntensity = minBaseIntensity;
        }
        float intensity = mix(minIntensity, (1.0-time*0.8), g);
        intensity = max(0.0,intensity);
        
        vec3 glowC = color * intensity;
        
        gl_FragColor = vec4(normal.rgb + glowC.rgb, normal.a);
    }
}