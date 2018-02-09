precision highp float;
precision highp int;

uniform float u_percentage; //normalized
uniform int u_direction; // fill direction is: 0 = right, 1 = left, 2 = up, 3 = down
uniform vec4 u_color;

varying vec2 v_texCoord;
varying vec2 v_position;

float getAlpha() {
    // right
    if (u_direction == 0) {
        return float(v_position.x <= u_percentage);
    }
    // left
    else if (u_direction == 1) {
        return float(v_position.x >= 1.0 - u_percentage);
    }
    // up
    else if (u_direction == 2) {
        return float(v_position.y <= u_percentage);
    }
    // down
    else {
        return float(v_position.y >= 1.0 - u_percentage);
    }
}
void main(void){
    vec4 tex = texture2D(CC_Texture0, v_texCoord);
    float alpha = getAlpha() * u_color.a * tex.a;
    gl_FragColor = vec4(u_color.rgb * tex.rgb, alpha);
}
