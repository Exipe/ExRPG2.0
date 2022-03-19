#version 300 es

layout(location = 0) in vec2 vertPos;

layout(location = 1) in vec2 posOffset;
layout(location = 2) in vec2 sides;

uniform mat3 projection;
uniform mat3 view;

void main() {
    vec2 position = vertPos * sides + posOffset;
    gl_Position = vec4((projection * view * vec3(position, 1)).xy, 1, 1);
}