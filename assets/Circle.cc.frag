precision highp float;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
uniform float innerRadius;
uniform float outerRadius;

float circle(in vec2 st, in float radius, in float inner_radius){
    float aa_buffer = 0.005;
    vec2 dist = vec2(0.5)-st;
	float len = length(dist);
    
    if(inner_radius > 0.0 && len < inner_radius+aa_buffer) {
		return smoothstep(inner_radius-aa_buffer,
	                         inner_radius+aa_buffer,
	                         len);
    }else {
        return 1.-smoothstep(radius-aa_buffer,
                             radius+aa_buffer,
                             len);
    }
}

void main(){
    vec4 texColor = texture2D(CC_Texture0, v_texCoord);
    
    float alpha = circle(v_texCoord, outerRadius, innerRadius);

    gl_FragColor = vec4(texColor.rgb, alpha * v_fragmentColor.a);
}
