attribute vec4 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_textureSize;

varying vec2 v_texCoord;

varying vec2 v_coords1;
varying vec2 v_coords2;
varying vec2 v_coords3;
varying vec2 v_coords4;

void main()
{
    gl_Position = CC_MVPMatrix * a_position;
    
    v_texCoord = a_texCoord;
    
    int wholePixelScreenScale = int(u_textureSize.y / 320.0 + 0.5);
    float maxBlur = 1.0; // want half a hardware pixel to sample more pixels
    
    vec2 v_halfPixelX = vec2(0.5/u_textureSize.x, 0.0); // don't take screen scale in; we want a half hardware pixel
    vec2 v_halfPixelY = vec2(0.0, 0.5/u_textureSize.x); // don't take screen scale in; we want a half hardware pixel
    
    vec2 v_topOff =  vec2(0.0, (maxBlur)/u_textureSize.y);
    vec2 v_bottomOff =  vec2(0.0, (-maxBlur)/u_textureSize.y);
    
    vec2 v_leftOff =  vec2((-maxBlur)/u_textureSize.x, 0.0);
    vec2 v_rightOff =  vec2((maxBlur)/u_textureSize.x, 0.0);
    
    v_coords1 = a_texCoord + v_topOff - v_halfPixelX;
    v_coords2 = a_texCoord + v_bottomOff + v_halfPixelX;
    v_coords3 = a_texCoord + v_leftOff - v_halfPixelY;
    v_coords4 = a_texCoord + v_rightOff + v_halfPixelY;
}
