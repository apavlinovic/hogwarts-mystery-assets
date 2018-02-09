//#extension GL_OES_standard_derivatives : enable

uniform highp vec2 u_texture_size;

uniform sampler2D tex;

varying vec2 v_texCoord;
varying vec2 v_texCoord2;

uniform int u_coordSet;
uniform int u_hasMipmaps;

float logOfScaling(in vec2 pixel_coordinate) // in texel units
{
    // 1 for .5, 2 for .25, etc; same as mipmap formula.
    // may be negative for stretching
    vec2  dx_vtc        = dFdx(pixel_coordinate); // expensive, extension! Don't use in other shaders
    vec2  dy_vtc        = dFdy(pixel_coordinate); 
    float delta_max_sqr = max(dot(dx_vtc, dx_vtc), dot(dy_vtc, dy_vtc));
    float mml = 0.5 * log2(delta_max_sqr);
    return mml;// max 0, here for mipmap formula
}

void main(void){
    vec2 coord = u_coordSet == 0 ? v_texCoord: v_texCoord2;
    
    vec4 color = texture2D(tex, coord);
    gl_FragColor = color;
    
    float logOfScaling = logOfScaling(coord * u_texture_size);
    float shrinking = max(0.0, logOfScaling);
    float stretching = max(0.0, -logOfScaling);
    if( shrinking > 0.5 ){
        float extremeDensity = max(0.0, logOfScaling-1.0) / 2.0;
        float mediumDensity = logOfScaling;
        
        color = mix(color, vec4(1,1,0,1), mediumDensity-0.5);
        color = mix(color, vec4(1,0,0,1), extremeDensity);
    } else if ( stretching > 0.5 ){
        float extremeStretching = stretching / 2.0;
        color = mix(color, vec4(0,1,0,1), extremeStretching);
    }
 
    gl_FragColor = color;
}
