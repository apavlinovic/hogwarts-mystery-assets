precision highp float;
precision highp int;

varying vec2 v_texCoord;

uniform vec3 color;
uniform float multX;
uniform float multY;

void main(void){

    float alpha = multX*v_texCoord.x + multY*v_texCoord.y;
    gl_FragColor = vec4(color, alpha);
}
