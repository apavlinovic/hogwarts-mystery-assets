precision highp float;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;
uniform vec3 shadowColor;
uniform vec4 thresholds;
uniform vec2 u_textureSize;

void main() {
    vec4 texColor = texture2D(CC_Texture0, v_texCoord);

    // leave transparent or colored pixels as they are
    if (texColor.a == 0.0 || !(texColor.r == texColor.g && texColor.g == texColor.b)) {
        gl_FragColor = texColor * v_fragmentColor;
    } else { // only manipulate the greyscale
        vec4 shadow;
        shadow.rgb = shadowColor;
        shadow.a = 1.0;
        if (texColor.r == 0.0) {
            gl_FragColor = shadow * v_fragmentColor * texColor.a;
        } else {

            float fullGradient = u_textureSize.x + u_textureSize.y;
            float xPos = v_texCoord.x * u_textureSize.x;
            float yPos = (1.0 - v_texCoord.y) * u_textureSize.y;
            float gradientPos = 0.0;
            if (fullGradient != 0.0) {
                gradientPos = (xPos + yPos) / fullGradient;
            }

            vec3 leftColor = color1;
            vec3 rightColor;
            float lowerThreshold = 0.0;
            float upperThreshold = 0.0;

            if (gradientPos <= thresholds[0]) {
                rightColor = color1;
                upperThreshold = thresholds[0];
            } else if (gradientPos <= thresholds[1]) {
                leftColor = color1;
                lowerThreshold = thresholds[0];
                rightColor = color2;
                upperThreshold = thresholds[1];
            } else if (gradientPos <= thresholds[2]) {
                leftColor = color2;
                lowerThreshold = thresholds[1];
                rightColor = color3;
                upperThreshold = thresholds[2];
            } else {
                leftColor = color3;
                lowerThreshold = thresholds[2];
                rightColor = color4;
                upperThreshold = thresholds[3];
            }

            float gradientRatio = 0.0;
            if (upperThreshold != lowerThreshold) {
                gradientRatio = (gradientPos - lowerThreshold) / (upperThreshold - lowerThreshold);
            }
            vec4 gradientColor;
            gradientColor.rgb = ((leftColor * (1.0 - gradientRatio)) + (rightColor * gradientRatio));
            gradientColor.a = 1.0;

            float shadowRatio = texColor.r / texColor.a;
            // gl_FragColor = vec4(gradientPos, gradientPos, gradientPos, 1.0);
            gl_FragColor = ((shadow * (1.0 - shadowRatio)) + (gradientColor * shadowRatio)) * v_fragmentColor * texColor.a;
        }
    }
}
