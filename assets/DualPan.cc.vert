precision highp float;
precision highp int;

attribute vec4 a_blendWeight;
attribute vec4 a_blendIndex;
attribute vec4 a_color;
attribute vec3 a_position;
attribute vec2 a_texCoord;

varying vec4 v_color;
varying vec2 v_texCoord;
varying vec2 v_texCoord1;

uniform vec4 u_matrixPalette[60*3];
uniform mat4 worldViewMat;
uniform float u_tex1OffsetX;
uniform float u_tex1OffsetY;
uniform float u_tex2OffsetX;
uniform float u_tex2OffsetY;
uniform float u_tex1Speed;
uniform float u_tex2Speed;
uniform int u_animated;

#ifdef USE_FOG
    varying float v_eyeDepth;
#endif

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

vec2 animateUV(vec2 texCoord, vec2 offset, float speed){
  texCoord.y = 1.0 - texCoord.y;
    // prevent banding / dithering on iPad2
    float offX = mod(CC_Time.y * speed * offset.x,1.0);
    float offY = mod(CC_Time.y * speed * offset.y,1.0);
    texCoord.x += offX + offset.x;
    texCoord.y += offY + offset.x;
  return texCoord;
}


void main(void){
  vec4 pos = getSkinnedPos();
  gl_Position = CC_MVPMatrix * pos;
  v_texCoord  = animateUV(a_texCoord, vec2(u_tex1OffsetX, u_tex1OffsetY), u_tex1Speed);
  v_texCoord1 = animateUV(a_texCoord, vec2(u_tex2OffsetX, u_tex2OffsetY), u_tex2Speed);
  v_color = a_color;
    
#ifdef USE_FOG
  v_eyeDepth = -(worldViewMat * pos).z;
#endif
}
