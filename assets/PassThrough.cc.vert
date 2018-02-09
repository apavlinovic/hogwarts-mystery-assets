attribute vec3 a_position;
attribute vec4 a_color;
attribute vec2 a_texCoord;

varying vec2 v_position;

void main(void){
    //just send the position through
    gl_Position = vec4(a_position, 1.0);
    v_position = a_position.xy;
}
