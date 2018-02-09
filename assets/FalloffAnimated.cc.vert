precision highp float;
precision highp int;

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec4 a_color;
attribute vec4 a_blendWeight;
attribute vec4 a_blendIndex;

varying vec3  v_normal;
varying vec4 v_color;
varying float v_waveIntensity;

uniform int u_animated;
uniform vec4 u_matrixPalette[60 * 3];
uniform mat4 worldViewMat;
uniform vec4 innerColor;
uniform vec4 outerColor;
uniform float speed;

#ifdef USE_FOG
    varying float v_eyeDepth;
#endif

const float pi2 = 6.28318530718;

vec4 getPosition(vec3 v, float w)
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

void main(void){
    
    vec4 pos;
    vec4 norm;
    if (u_animated == 1){
        pos = getPosition(a_position, 1.0);
        norm = getPosition(a_normal, 0.0);
    }
    else {
        pos = vec4(a_position, 1.0);
        norm = vec4(a_normal, 0.0);
    }
    gl_Position = CC_MVPMatrix * pos;
    v_normal = normalize((worldViewMat * norm).xyz);
    
    float spedTime = mod(CC_Time.y, 30.0) *speed;
    float wave1 = cos(spedTime*pi2) / 2.0 + 0.5;
    const float waveOffset = 0.65;
    float wave2 = cos(spedTime*waveOffset*pi2) /2.0 + 0.5;
    
    const float boost = 0.5;
    v_waveIntensity = ( (wave1+wave2)/2.0 + boost );

    v_color = a_color;

    #ifdef USE_FOG
        v_eyeDepth = -(worldViewMat * pos).z;
    #endif
}
