uniform sampler2D u_diffuseMap;

varying vec2 v_diffuseCoords;

void main()
{
    vec4 diffuseTexColor = texture2D(u_diffuseMap, v_diffuseCoords);
    if (diffuseTexColor.a < 0.75)
        discard;
    
    gl_FragColor = vec4(1.0,1.0,1.0,1.0);
}