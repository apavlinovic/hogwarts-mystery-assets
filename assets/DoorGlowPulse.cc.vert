precision highp float;
precision highp int;

attribute vec4 a_position;
attribute vec4 a_color;
attribute vec2 a_texCoord;
attribute vec4 a_blendWeight;
attribute vec4 a_blendIndex;

varying vec2 v_texCoord;
varying vec4 v_color;

uniform vec4 u_matrixPalette[60 * 3];

uniform int u_animated;
uniform float speed;
uniform float amplitude;
uniform float start;

const float pi2 = 6.28318530718;


vec4 getPosition(vec3 v, float w){
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
    if(u_animated == 1){
        pos = getPosition(a_position.xyz, 1.0);
    }else{
        pos = a_position;
    }
    gl_Position = CC_MVPMatrix * pos;
    v_texCoord = a_texCoord;
    
    float spedTime = CC_Time.y*speed;
    float value = (sin(spedTime) * amplitude);
    
    float offset = start + value;
    
    v_texCoord.y =  1.0 - v_texCoord.y;
    v_texCoord.y += offset;
    
    v_color = a_color;
}
