precision highp int;
precision highp float;

attribute vec3 a_position;

#ifdef USE_SOFT_NORMALS
    attribute vec3 a_softNormal;
#else
    attribute vec3 a_normal;
#endif
attribute vec4 a_blendWeight;
attribute vec4 a_blendIndex;

// Uniforms
uniform int u_animated;
uniform mat4 worldViewMat;
const int SKINNING_JOINT_COUNT = 60;
uniform vec4 u_matrixPalette[SKINNING_JOINT_COUNT * 3];
uniform float u_outlineSize;

vec4 getPosition(vec3 v, float w)
{
    if (u_animated == 0)
    {
        return vec4(v, w);
    }
    
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

void main()
{
    vec4 position = getPosition(a_position, 1.0);
#ifdef USE_SOFT_NORMALS
    vec4 norm = getPosition(a_softNormal, 0.0);
#else
    vec4 norm = getPosition(a_normal, 0.0);
#endif
    
    vec4 viewPos = worldViewMat * position;
    float depth = -viewPos.z;
    float normScale = u_outlineSize * (depth / 250.0);
    
    position.xyz += normalize(norm.xyz) * normScale;
    gl_Position = CC_MVPMatrix * position;
}
