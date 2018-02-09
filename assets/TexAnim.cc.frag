precision highp float;
precision highp int;

uniform vec2 untrimmedOffset; // offset of untrimmed frame in texture
uniform vec2 untrimmedSize; // untrimmed frame

uniform vec2 v_trimMinCoord;
uniform vec2 v_trimMaxCoord;
uniform float alpha;

varying vec2 v_texCoord;


void main(void){

    vec2 finalCoords = v_texCoord;
    float xWraps = 0.0;
    if (finalCoords.x < untrimmedOffset.x) {
        xWraps = ceil((untrimmedOffset.x - finalCoords.x)/untrimmedSize.x);
    }
    if (finalCoords.x > untrimmedOffset.x + untrimmedSize.x) {
        xWraps = -ceil((finalCoords.x - (untrimmedOffset.x + untrimmedSize.x))/untrimmedSize.x);
    }

    float yWraps = 0.0;
    if (finalCoords.y < untrimmedOffset.y) {
        yWraps = ceil((untrimmedOffset.y - finalCoords.y)/untrimmedSize.y);
    }
    if (finalCoords.y > untrimmedOffset.y + untrimmedSize.y) {
        yWraps = -ceil((finalCoords.y - (untrimmedOffset.y + untrimmedSize.y))/untrimmedSize.y);
    }
    finalCoords.x += xWraps * untrimmedSize.x;
    finalCoords.y += yWraps * untrimmedSize.y;

    // ignore pixels that are outside the trim area
    bool outsideTrimArea = finalCoords.x < v_trimMinCoord.x || finalCoords.y < v_trimMinCoord.y || finalCoords.x > v_trimMaxCoord.x || finalCoords.y > v_trimMaxCoord.y;
    if(outsideTrimArea){
        gl_FragColor = vec4(0);
        //discard;
    }else{
        vec4 color = texture2D(CC_Texture0, v_texCoord);
        gl_FragColor = vec4((color).rgb, color.a*alpha);
    }
}
