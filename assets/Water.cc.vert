precision highp float;
precision highp int;

attribute vec4 a_position;
attribute vec4 a_color;
attribute vec2 a_texCoord;
attribute vec2 a_texCoord1;
attribute vec4 a_blendWeight;
attribute vec4 a_blendIndex;
attribute vec3 a_normal;
#ifdef HAS_NORMAL_TEXTURE
    attribute vec3 a_tangent;
    attribute vec3 a_binormal;
#endif

varying vec3 v_viewDir;
varying vec3 v_normalWorld;
varying vec2 v_color;
varying vec2 v_foamCoords;

#ifdef HAS_NORMAL_TEXTURE
    varying vec2 v_texCoord1;
    varying vec2 v_texCoord2;
    varying vec3 v_binormalWorld;
    varying vec3 v_tangentWorld;
    uniform float u_waveSpeed;
#endif

uniform vec4 u_matrixPalette[60 * 3];
uniform mat4 worldViewMat;
uniform vec3 u_cameraPosition;
uniform int u_animated;
uniform float u_foamSpeed;

#ifdef USE_FOG
    varying float v_eyeDepth;
#endif

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
    vec4 norm;
    if(u_animated == 1){
        pos = getPosition(a_position.xyz, 1.0);
        norm = getPosition(a_normal, 0.0);
    }
    else{
        pos = a_position;
        norm = vec4(a_normal, 0.0);
    }
    gl_Position = CC_MVPMatrix * pos;
    
    v_normalWorld = normalize((CC_MVMatrix * norm).xyz);
#ifdef HAS_NORMAL_TEXTURE
    v_tangentWorld = normalize((CC_MVMatrix * getPosition(a_tangent, 0.0)).xyz);
    v_binormalWorld = normalize((CC_MVMatrix * getPosition(a_binormal, 0.0)).xyz);
    
    v_texCoord1 = vec2(a_texCoord1.x, u_waveSpeed*CC_Time.y + a_texCoord1.y);
    vec2 tempCoord = vec2(-a_texCoord1.y, -a_texCoord1.x);
    v_texCoord2 = vec2(tempCoord.x, -0.2*CC_Time.y + tempCoord.y);
#endif
    
    vec3 wPos = (CC_MVMatrix * pos).xyz;
    v_viewDir = u_cameraPosition - wPos;
    v_color = a_color.rg;
    
    v_foamCoords = vec2(a_texCoord.x+CC_Time.y*u_foamSpeed, a_texCoord.y);
    v_foamCoords.y = 1.0 - v_foamCoords.y;
    
    #ifdef USE_FOG
        v_eyeDepth = -(worldViewMat * pos).z;
    #endif
}
