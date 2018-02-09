precision highp float;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

uniform vec4 color;

float distSqr(vec2 pt1, vec2 pt2){
    float a = pt1.x - pt2.x;
    float b = pt1.y - pt2.y;
    return (a * a) + (b * b);
}

void main(){
    vec4 texColor = texture2D(CC_Texture0, v_texCoord);

    // get distance from center - maybe squared is fine
    // float distSqrrd = distSqr(v_texCoord, vec2(0.5,0.5));
    float yDist = v_texCoord.y - 0.5;
    float xDist = v_texCoord.x - 0.5;
    float dist = abs(xDist + (yDist / 6.));
    
    float onNess = 1.0 - (dist * 2.);
    // float onNess = distSqrrd > 0.25 ? 0.0 : 1.0 - (distSqrrd * 4.0);
    
    // woo premultiplied alphas
    vec4 whiteness = vec4(color.r * color.a, color.g * color.a, color.b * color.a, color.a) * onNess * texColor.a;
    gl_FragColor = (texColor + whiteness) * v_fragmentColor;
}
