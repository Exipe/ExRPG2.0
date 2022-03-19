#version 300 es

layout(location = 0) in vec2 vertPos;
layout(location = 1) in vec2 texPos;

uniform mat3 projection;
uniform mat3 view;
uniform mat3 model;

out vec2 texCoords;

void main() {
    texCoords = texPos;

    gl_Position = vec4(projection * floor(view * model * vec3(vertPos, 1)), 1);
}