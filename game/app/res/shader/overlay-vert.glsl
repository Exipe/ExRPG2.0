#version 300 es

layout(location = 0) in vec2 vertPos;
layout(location = 1) in vec2 texPos;
layout(location = 2) in vec2 shapePos;

layout(location = 3) in vec2 posOffset;
layout(location = 4) in vec2 texOffset;
layout(location = 5) in vec2 shapeOffset;

uniform mat3 projection;
uniform mat3 view;

out vec2 lightCoords;
out vec2 texCoords;
out vec2 shapeCoords;

void main() {
    vec2 vertCoords = (projection * view * vec3(vertPos + posOffset, 1)).xy;
    lightCoords = (vertCoords + vec2(1.0, 1.0)) * 0.5;

    texCoords = texPos + texOffset;
    shapeCoords = shapePos + shapeOffset;

    gl_Position = vec4(vertCoords, 1, 1);
}