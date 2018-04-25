precision highp float;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
uniform vec2 u_lightOrigin;
uniform float u_radialDecay;
uniform float u_linearDecay;
uniform float u_iterations;
uniform float u_length;




const int   c_samplesX    = 15;  // must be odd
const int   c_samplesY    = 15;  // must be odd
const float c_textureSize = 512.0;

const int   c_halfSamplesX = c_samplesX / 2;
const int   c_halfSamplesY = c_samplesY / 2;
const float c_pixelSize = (1.0 / c_textureSize);

float Gaussian (float sigma, float x)
{
    return exp(-(x*x) / (2.0 * sigma*sigma));
}

vec4 BlurredPixel (in vec2 uv)
{
    float c_sigmaX = 15.0;
    float c_sigmaY = 15.0;

    float total = 0.0;
    vec4 ret = vec4(0.0);

    for (int iy = 0; iy < c_samplesY; ++iy)
    {
        float fy = Gaussian (c_sigmaY, float(iy) - float(c_halfSamplesY));
        float offsety = float(iy-c_halfSamplesY) * c_pixelSize;
        for (int ix = 0; ix < c_samplesX; ++ix)
        {
            float fx = Gaussian (c_sigmaX, float(ix) - float(c_halfSamplesX));
            float offsetx = float(ix-c_halfSamplesX) * c_pixelSize;
            total += fx * fy;
            ret += texture2D(CC_Texture0, uv + vec2(offsetx, offsety)).rgba * fx * fy;
        }
    }
    return ret / total;
}

void main(){
    gl_FragColor = BlurredPixel(v_texCoord) * v_fragmentColor;
}
