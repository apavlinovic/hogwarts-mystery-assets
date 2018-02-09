attribute vec3 a_position;
attribute vec3 a_normal;

attribute vec4 a_blendWeight;
attribute vec4 a_blendIndex;

varying vec3 v_normal;

void main(void){
    v_normal = normalize(a_normal);
    gl_Position = CC_MVPMatrix * vec4(a_position, 1.0);
}
