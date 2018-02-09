attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;
attribute vec2 a_texCoord1;

attribute vec4 a_blendWeight;
attribute vec4 a_blendIndex;

const int SKINNING_JOINT_COUNT = 60;
// Uniforms
uniform vec4 u_matrixPalette[SKINNING_JOINT_COUNT * 3];
uniform int u_animated;
uniform float u_intensity;

varying vec2 v_texCoord;
varying vec2 v_texCoord2;

varying float v_glow;


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

    vec3 norm;
    if (u_animated == 1){
        gl_Position = CC_MVPMatrix * getPosition(a_position, 1.0);
        norm = getPosition(a_normal, 0.0).xyz;
    } else {
        gl_Position = CC_MVPMatrix * vec4(a_position, 1.0);
        norm = a_normal.xyz;
    }
    
    vec3 dir = vec3(0,0,1);
    float eDotn = abs(dot(dir, norm));
    // 0 should be none, 0.5 should be edges solid, 1.0 should be solid
    float adjust = u_intensity * 2.0 - 1.0;
    
    v_glow = mix(0.0,1.0, eDotn + adjust);
    v_glow = max(0.0, v_glow); // make positive
    
    v_texCoord = a_texCoord;
    v_texCoord.y = 1.0 - v_texCoord.y;

    v_texCoord2 = a_texCoord1;
    v_texCoord2.y = 1.0 - v_texCoord2.y;
}
