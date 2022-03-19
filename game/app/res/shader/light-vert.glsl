#version 300 es

layout(location = 0) in vec2 vertPos;

uniform mat3 projection;
uniform mat3 view;
uniform mat3 model;

out vec2 coords;

void main() {
    gl_Position = vec4((projection * view * model * vec3(vertPos, 1)).xy, 1, 1);
    coords = vertPos;
}