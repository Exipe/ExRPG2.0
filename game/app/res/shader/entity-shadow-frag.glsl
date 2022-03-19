#version 300 es
precision highp float;

uniform vec4 color;

in vec2 texCoords;
uniform sampler2D tex;

out vec4 fragColor;

void main() {
    if(texture(tex, texCoords).a == 0.0) {
        discard;
    }

    fragColor = color;
}