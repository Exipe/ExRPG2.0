#version 300 es

layout(location = 0) in vec2 vertPos;
layout(location = 1) in vec2 texPos;

uniform mat3 projection;
uniform mat3 view;
uniform mat3 model;

out vec2 lightCoords;
out vec2 texCoords;

void main() {
    vec2 vertCoords = (projection * floor(view * model * vec3(vertPos, 1))).xy;
    lightCoords = (vertCoords + vec2(1.0, 1.0)) * 0.5;
    texCoords = texPos;

    gl_Position = vec4(vertCoords, 1, 1);
}