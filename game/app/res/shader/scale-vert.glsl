#version 300 es

precision highp float;

/*
   Hyllian's xBR-lv2 Shader
   
   Copyright (C) 2011-2016 Hyllian - sergiogdb@gmail.com

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in
   all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   THE SOFTWARE.

   Incorporates some of the ideas from SABR shader. Thanks to Joshua Street.
*/

layout(location = 0) in vec2 vertPos;
layout(location = 1) in vec2 texPos;

uniform vec2 texSize;

uniform mat3 projection;
uniform mat3 model;

out vec2 texCoords;
out vec4 t1;
out vec4 t2;
out vec4 t3;
out vec4 t4;
out vec4 t5;
out vec4 t6;
out vec4 t7;

void main() {
    texCoords = texPos;

    vec2 ps = vec2(1.0/texSize.x, 1.0/texSize.y);
    float dx = ps.x;
    float dy = ps.y;

    t1 = texPos.xxxy + vec4( -dx, 0, dx,-2.0*dy); // A1 B1 C1
	t2 = texPos.xxxy + vec4( -dx, 0, dx,    -dy); //  A  B  C
	t3 = texPos.xxxy + vec4( -dx, 0, dx,      0); //  D  E  F
	t4 = texPos.xxxy + vec4( -dx, 0, dx,     dy); //  G  H  I
	t5 = texPos.xxxy + vec4( -dx, 0, dx, 2.0*dy); // G5 H5 I5
	t6 = texPos.xyyy + vec4(-2.0*dx,-dy, 0,  dy); // A0 D0 G0
	t7 = texPos.xyyy + vec4( 2.0*dx,-dy, 0,  dy); // C4 F4 I4

    gl_Position = vec4(projection * model * vec3(vertPos, 1), 1);
}