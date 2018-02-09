precision highp float;
precision highp int;

attribute vec4 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_size;
uniform mat4 u_inverseMV;

varying mediump vec2 v_texCoord;
varying mediump vec2 v_position;

void main(void){
    gl_Position = CC_PMatrix * a_position;
    v_texCoord = a_texCoord;
    
    vec4 posLocal = u_inverseMV * a_position;
    //this will get interpolated and give us a distance from the left and bottom edge
    v_position = vec2(posLocal.x / u_size.x, posLocal.y / u_size.y);
}
