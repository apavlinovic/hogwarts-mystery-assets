uniform vec2 u_origin;
uniform float u_width;
uniform float u_height;

varying vec2 v_position;

bool insideRect(){
    if(v_position.x > u_origin.x && v_position.x < (u_origin.x + u_width)){
        if(v_position.y > u_origin.y && v_position.y < (u_origin.y + u_height)){
            return true;
        }
    }
    return false;
}

void main(void){
    float alpha = insideRect() ? 0.0 : 1.0;
    gl_FragColor = vec4(0.0,0.0,0.0, 0.7 * alpha);
}
