precision highp float;
precision highp int;

attribute vec4 a_blendWeight;
attribute vec4 a_blendIndex;
attribute vec4 a_color;
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_eyeSpacePos;
varying vec2 v_texCoord;
varying float v_waveIntensity;

uniform vec4 u_matrixPalette[60*3];
uniform mat4 worldViewMat;
uniform float u_offsetX;
uniform float u_offsetY;
uniform float u_waveSpeed;
uniform float u_speedUV;
uniform int u_animated;
uniform float u_boost;

vec4 getSkinned(vec3 v, float w)
{
    float blendWeight = a_blendWeight[0];

    int matrixIndex = int (a_blendIndex[0]) * 3;
    vec4 matrixPalette1 = u_matrixPalette[matrixIndex] * blendWeight;
    vec4 matrixPalette2 = u_matrixPalette[matrixIndex + 1] * blendWeight;
    vec4 matrixPalette3 = u_matrixPalette[matrixIndex + 2] * blendWeight;


    blendWeight = a_blendWeight[1];
    if (blendWeight > 0.0)
    {
        matrixIndex = int(a_blendIndex[1]) * 3;
        matrixPalette1 += u_matrixPalette[matrixIndex] * blendWeight;
        matrixPalette2 += u_matrixPalette[matrixIndex + 1] * blendWeight;
        matrixPalette3 += u_matrixPalette[matrixIndex + 2] * blendWeight;

        blendWeight = a_blendWeight[2];
        if (blendWeight > 0.0)
        {
            matrixIndex = int(a_blendIndex[2]) * 3;
            matrixPalette1 += u_matrixPalette[matrixIndex] * blendWeight;
            matrixPalette2 += u_matrixPalette[matrixIndex + 1] * blendWeight;
            matrixPalette3 += u_matrixPalette[matrixIndex + 2] * blendWeight;

            blendWeight = a_blendWeight[3];
            if (blendWeight > 0.0)
            {
                matrixIndex = int(a_blendIndex[3]) * 3;
                matrixPalette1 += u_matrixPalette[matrixIndex] * blendWeight;
                matrixPalette2 += u_matrixPalette[matrixIndex + 1] * blendWeight;
                matrixPalette3 += u_matrixPalette[matrixIndex + 2] * blendWeight;
            }
        }
    }

    vec4 _skinnedPosition;
    vec4 postion = vec4(v , w);
    _skinnedPosition.x = dot(postion, matrixPalette1);
    _skinnedPosition.y = dot(postion, matrixPalette2);
    _skinnedPosition.z = dot(postion, matrixPalette3);
    _skinnedPosition.w = postion.w;

    return _skinnedPosition;
}

vec4 getSkinnedPos(){
  if(u_animated == 1)
  { return getSkinned(a_position, 1.0); }
  return vec4(a_position, 1.0);
}

vec3 getSkinnedNormal(){
  vec4 norm;
  if(u_animated == 1){
    norm =  getSkinned(a_normal, 0.0);
  }else{
    norm =  vec4(a_normal, 0.0);
  }
  return normalize((worldViewMat * norm).xyz);
}

vec2 animateUV(){
  vec2 texCoord = a_texCoord;
  texCoord.y = 1.0 - texCoord.y;
  // prevent banding / dithering on iPad2
  float offX = mod(CC_Time.y * u_speedUV * u_offsetX,1.0);
  float offY = mod(CC_Time.y * u_speedUV * u_offsetY,1.0);
  texCoord.x += offX + u_offsetX;
  texCoord.y += offY + u_offsetY;
  return texCoord;
}

float getWaveIntensity(){
  const float pi2 = 6.28318530718;
  const float waveOffset = 0.65;

  float spedTime = mod(CC_Time.y, 30.0) * u_waveSpeed;
  float wave1 = cos(spedTime*pi2) / 2.0 + 0.5;
  float wave2 = cos(spedTime * waveOffset * pi2) / 2.0 + 0.5;

  return (wave1 + wave2) / 2.0 + u_boost;
}

void main(void){
  vec4 pos = getSkinnedPos();
  gl_Position = CC_MVPMatrix * pos;
  v_eyeSpacePos = (worldViewMat * pos).xyz;
  v_normal = getSkinnedNormal();
  v_waveIntensity = getWaveIntensity();
  v_color = a_color;
  v_texCoord = animateUV();
}


