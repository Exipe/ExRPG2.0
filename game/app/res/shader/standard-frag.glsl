#version 300 es
precision highp float;

uniform bool enableLight;
uniform vec2 texOffset;

in vec2 texCoords;
uniform sampler2D tex;

in vec2 lightCoords;
uniform sampler2D lightMap;

out vec4 fragColor;

void main() {
    fragColor = texture(tex, texCoords + texOffset);

    if(enableLight) {
        vec4 light = texture(lightMap, lightCoords);
        fragColor = fragColor * light;
    }
}