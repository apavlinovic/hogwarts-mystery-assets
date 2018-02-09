precision highp float;
precision highp int;


varying vec3 v_test;

void main(void){
    gl_FragColor = vec4(v_test, 1.0);
}
