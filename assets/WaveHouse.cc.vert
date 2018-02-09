precision highp float;
precision highp int;

attribute highp vec4 a_position;
attribute highp vec3 a_normal;
attribute highp vec4 a_color;
attribute highp vec2 a_texCoord;
attribute highp vec2 a_texCoord1;
attribute vec4 a_blendWeight;
attribute vec4 a_blendIndex;

const int SKINNING_JOINT_COUNT = 60;

uniform vec4 u_matrixPalette[SKINNING_JOINT_COUNT * 3];
uniform float u_waveOffsetFrequency;
uniform float u_waveSpeed;
uniform float u_waveAmount;

varying highp vec2 v_texCoord;
varying highp vec2 v_texCoord1;
varying highp vec4 v_color;
//varying vec3 v_test;

vec4 getPosition()
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
    vec4 postion = vec4(a_position.xyz , 1.0);
    _skinnedPosition.x = dot(postion, matrixPalette1);
    _skinnedPosition.y = dot(postion, matrixPalette2);
    _skinnedPosition.z = dot(postion, matrixPalette3);
    _skinnedPosition.w = postion.w;
    
    return _skinnedPosition;
}

float getHeightOffset(float offset, float mask){
    //Ask Andreas about all the wierd math that happens here...
    float v1 = u_waveOffsetFrequency * offset;
    v1 = (v1 + CC_Time[1]) * u_waveSpeed;
    float v2 = sin(v1) * u_waveAmount;
    return v2 * mask;
}

void main(void){
    //This vertex shader does all sorts of wierd math stuff to offset
    //the vertices in a wave motion. Passes a long to the fragment 
    //shader everything we need to texture the water correctly

    float heightOffset = getHeightOffset(a_texCoord1[1], a_color.r);
    vec4 pos = getPosition();
    pos.y += heightOffset;
    gl_Position = CC_MVPMatrix * pos;

    v_texCoord = a_texCoord;
    v_texCoord.y = 1.0 - v_texCoord.y;

    v_texCoord1 = a_texCoord1;
    v_texCoord1.y = 1.0 - v_texCoord1.y;

    v_color = a_color;
    //v_test = vec3(heightOffset);
}
