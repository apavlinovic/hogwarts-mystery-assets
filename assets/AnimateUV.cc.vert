precision highp float;
precision highp int;

attribute vec4 a_position;
attribute vec4 a_color;
attribute vec2 a_texCoord;

varying vec2 v_texCoord;
varying vec4 v_color;

uniform float offsetX;
uniform float offsetY;
uniform float speed;

void main(void){
    gl_Position = CC_MVPMatrix * a_position;
    v_texCoord = a_texCoord;
    
    // extra +offsetX is because we abuse this shader in roadsprite
    
    if(offsetX > 0.0) {
        v_texCoord.x += mod(CC_Time.y * speed, 30.0) *offsetX + offsetX;
    }
    
    v_texCoord.y =  1.0 - v_texCoord.y;
    if(offsetY > 0.0) {
        v_texCoord.y += mod(CC_Time.y * speed, 30.0) *offsetY + offsetY;
    }
    
    v_color = a_color;
}
