#version 300 es
precision highp float;

uniform vec4 color;

in vec2 texCoords;
uniform sampler2D tex;

out vec4 fragColor;

bool isOpaque(float offX, float offY) {
    return texture(tex, texCoords+vec2(offX, offY)).a > 0.0;
}

void main() {
    ivec2 size = textureSize(tex, 0);
    float offX = 1.0 / float(size.x);
    float offY = 1.0 / float(size.y);

    if(!isOpaque(0.0, 0.0) && (isOpaque(offX, 0.0) || isOpaque(0.0, offY) || isOpaque(-offX, 0.0) || isOpaque(0.0, -offY))) {
        fragColor = color;
    }
}