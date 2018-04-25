precision highp float;
precision highp int;

varying vec4 v_color;
varying vec2 v_texCoord;
varying vec2 v_texCoord1;

uniform float alpha;
uniform sampler2D u_tex1;
uniform sampler2D u_tex2;

#ifdef USE_FOG
    varying float v_eyeDepth;
    uniform vec3 u_fogColor;
    uniform float u_maxFogDistance;
    uniform float u_minFogDistance;
    uniform float u_maxFog;
#endif

void main(void){
  vec4 tex1Color = texture2D(u_tex1, v_texCoord);
  vec4 tex2Color = texture2D(u_tex2, v_texCoord1) * v_color.r;
  vec4 color = tex1Color + tex2Color;
  color.a = tex1Color.a * v_color.a * alpha;
  gl_FragColor = vec4(vec3(color.rgb * color.a), color.a);
    
  #ifdef USE_FOG
    float fogT = (v_eyeDepth - u_minFogDistance) / u_maxFogDistance;
    fogT = clamp(fogT, 0.0, u_maxFog);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, u_fogColor, fogT);
  #endif
    
}
