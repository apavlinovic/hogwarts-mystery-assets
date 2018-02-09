precision highp float;
precision highp int;

attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec4 a_color;
attribute vec2 a_texCoord;
attribute vec2 a_texCoord2;
attribute vec4 a_blendWeight;
attribute vec4 a_blendIndex;

//skinning
uniform vec4 u_matrixPalette[60 * 3];
uniform u_animated;

//panning
uniform vec2 u_offset1;
uniform vec2 u_speed1;
uniform vec2 u_uvTiling1;

uniform vec2 u_offset2;
uniform vec2 u_speed2;
uniform vec2 u_uvTiling2;

//passed along to PS
varying vec2 v_texCoord;
varying vec2 v_texCoord2;
varying vec3 v_normal;
varying vec4 v_color;

vec4 getTransformedForSkin(vec3 v, float w){
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

vec4 getTransformedVec(vec4 vec, float animated){
    if(u_animated == 1){
        return CC_MVPMatrix * getTransformedForSkin(vec);
    }else{
        return CC_MVPMatrix * a_position;
    }
}

vec2 panUVs(vec2 texCoord, vec2 offset, vec2 speed){
    //Extra +offset is because we abuse this shader in roadsprite
    vec2 texCoordOut = texCoord;
    if(offset.x > 0.0){
        texCoordOut.x += mod(CC_Time.y * speed.x, 30.0) * offset.x + offset.x;
    }
    if(offset.y > 0.0){
        texCoordOut.y += mod(CC_Time.y * speed.y, 30.0) * offset.y + offset.y;
    }
    return texCoordOut;
}

void main(void){
    gl_Position = getTransformedVec(vec4(a_position, 1.0), u_animated);

    vec2 uv1 = a_texCoord * u_uvTiling1;
    v_texCoord = panUVs(uv1, u_offset1, u_speed1);

    vec2 uv2 = a_texCoord2 * u_uvTiling2;
    v_texCoord2 = panUVs(uv2, u_offset2, u_speed2);

    v_normal = a_normal;
    v_color = a_color;
}
