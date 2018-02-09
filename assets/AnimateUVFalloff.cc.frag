precision highp float;
precision highp int;

varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_eyeSpacePos;
varying vec2 v_texCoord;
varying float v_waveIntensity;

uniform float alpha;
uniform sampler2D u_myTexture;

#ifdef USE_FOG
    uniform vec3 u_fogColor;
    uniform float u_maxFogDistance;
    uniform float u_minFogDistance;
    uniform float u_maxFog;
#endif

float getFalloff(){
  vec3 dir = normalize(v_eyeSpacePos);
  float eDotn = abs(dot(dir, v_normal));
  return (eDotn * eDotn * v_waveIntensity );
}
void main(void){
  vec4 texColor = texture2D(u_myTexture, v_texCoord);
  float falloff = getFalloff();

  float finalAlpha = texColor.a *  falloff * v_color.a * alpha;
  gl_FragColor.rgb = (texColor.rgb + v_color.rgb) * finalAlpha;
  gl_FragColor.a = finalAlpha;
    
  #ifdef USE_FOG
    float fogT = (-v_eyeSpacePos.z - u_minFogDistance) / u_maxFogDistance;
    fogT = clamp(fogT, 0.0, u_maxFog);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, u_fogColor*finalAlpha, fogT);
  #endif
}
