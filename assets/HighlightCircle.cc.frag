uniform vec2 u_origin;
uniform float u_width;
uniform float u_height;

varying vec2 v_position;

bool insideElipse(){
    //float dist = distance(v_position, u_origin);
    //return dist < u_radius;
    /*
    float squaredPosX = pow((v_position.x - u_origin.x), 2.0);
    float squaredPosY = pow((v_position.y - u_origin.y), 2.0);
    float squaredW = pow(u_width, 2.0);
    float squaredH = pow(u_height, 2.0);
    return (squaredPosX / squaredH) + (squaredPosY / squaredH) <= 1.0;
     */
    vec2 scaledPos = vec2(v_position.x - u_origin.x , (v_position.y - u_origin.y) * u_height/u_width);
    float dist = distance(scaledPos, vec2(0,0));
    return dist < u_width;
}

void main(void){
    float alpha = insideElipse() ? 0.0 : 1.0;
    gl_FragColor = vec4(0.0,0.0,0.0, 0.7 * alpha);
}
