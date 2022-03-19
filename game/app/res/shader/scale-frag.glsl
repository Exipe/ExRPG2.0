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

#define XBR_Y_WEIGHT 48.0
#define XBR_EQ_THRESHOLD 25.0
#define XBR_LV2_COEFFICIENT 2.0

// Uncomment just one of the three params below to choose the corner detection
#define CORNER_A
//#define CORNER_B
//#define CORNER_C
//#define CORNER_D

const vec4 Ao = vec4( 1.0, -1.0, -1.0, 1.0 );
const vec4 Bo = vec4( 1.0,  1.0, -1.0,-1.0 );
const vec4 Co = vec4( 1.5,  0.5, -0.5, 0.5 );
const vec4 Ax = vec4( 1.0, -1.0, -1.0, 1.0 );
const vec4 Bx = vec4( 0.5,  2.0, -0.5,-2.0 );
const vec4 Cx = vec4( 1.0,  1.0, -0.5, 0.0 );
const vec4 Ay = vec4( 1.0, -1.0, -1.0, 1.0 );
const vec4 By = vec4( 2.0,  0.5, -2.0,-0.5 );
const vec4 Cy = vec4( 2.0,  0.0, -1.0, 0.5 );
const vec4 Ci = vec4(0.25, 0.25, 0.25, 0.25);

const vec3 Y = vec3(0.2126, 0.7152, 0.0722);


vec4 saturate(vec4 value) {
    return clamp(value,0.0,1.0);
}

vec4 df(vec4 A, vec4 B)
{
	return vec4(abs(A-B));
}

float c_df(vec3 c1, vec3 c2) 
{
        vec3 df = abs(c1 - c2);
        return df.r + df.g + df.b;
}

bvec4 eq(vec4 A, vec4 B)
{
    return lessThan(df(A, B), vec4(XBR_EQ_THRESHOLD));
}

bvec4 or(bvec4 A, bvec4 B) {
    return bvec4(A.x || B.x, A.y || B.y, A.z || B.z, A.w || B.w);
}

bvec4 and(bvec4 A, bvec4 B) {
    return bvec4(A.x && B.x, A.y && B.y, A.z && B.z, A.w && B.w);
}

vec4 boolToBinary(bvec4 value) {
    return vec4(value.x ? 1.0 : 0.0, value.y ? 1.0 : 0.0, value.z ? 1.0 : 0.0, value.w ? 1.0 : 0.0);
}

vec4 weighted_distance(vec4 a, vec4 b, vec4 c, vec4 d, vec4 e, vec4 f, vec4 g, vec4 h)
{
	return (df(a,b) + df(a,c) + df(d,e) + df(d,f) + 4.0*df(g,h));
}

uniform float XBR_SCALE;
uniform vec2 texSize;

in vec2 texCoords;
uniform sampler2D tex;

in vec4 t1;
in vec4 t2;
in vec4 t3;
in vec4 t4;
in vec4 t5;
in vec4 t6;
in vec4 t7;

out vec4 fragColor;

void main() {
    bvec4 edri, edr, edr_left, edr_up, px; // px = pixel, edr = edge detection rule
    bvec4 interp_restriction_lv0, interp_restriction_lv1, interp_restriction_lv2_left, interp_restriction_lv2_up;
    vec4 fx, fx_left, fx_up; // inequations of straight lines.

    vec4 delta         = vec4(1.0/XBR_SCALE, 1.0/XBR_SCALE, 1.0/XBR_SCALE, 1.0/XBR_SCALE);
	vec4 deltaL        = vec4(0.5/XBR_SCALE, 1.0/XBR_SCALE, 0.5/XBR_SCALE, 1.0/XBR_SCALE);
	vec4 deltaU        = deltaL.yxwz;

    vec2 fp = fract(texCoords*texSize);

    vec3 A1 = texture(tex, t1.xw).rgb;
	vec3 B1 = texture(tex, t1.yw).rgb;
	vec3 C1 = texture(tex, t1.zw).rgb;

	vec3 A  = texture(tex, t2.xw).rgb;
	vec3 B  = texture(tex, t2.yw).rgb;
	vec3 C  = texture(tex, t2.zw).rgb;

	vec3 D  = texture(tex, t3.xw).rgb;
	vec3 E  = texture(tex, t3.yw).rgb;
	vec3 F  = texture(tex, t3.zw).rgb;

	vec3 G  = texture(tex, t4.xw).rgb;
	vec3 H  = texture(tex, t4.yw).rgb;
	vec3 I  = texture(tex, t4.zw).rgb;

	vec3 G5 = texture(tex, t5.xw).rgb;
	vec3 H5 = texture(tex, t5.yw).rgb;
	vec3 I5 = texture(tex, t5.zw).rgb;

	vec3 A0 = texture(tex, t6.xy).rgb;
	vec3 D0 = texture(tex, t6.xz).rgb;
	vec3 G0 = texture(tex, t6.xw).rgb;

	vec3 C4 = texture(tex, t7.xy).rgb;
	vec3 F4 = texture(tex, t7.xz).rgb;
	vec3 I4 = texture(tex, t7.xw).rgb;

    vec4 b = (XBR_Y_WEIGHT*Y) * mat4x3(B, D, H, F);
	vec4 c = (XBR_Y_WEIGHT*Y) * mat4x3(C, A, G, I);
	vec4 e = (XBR_Y_WEIGHT*Y) * mat4x3(E, E, E, E);
    vec4 d = b.yzwx;
	vec4 f = b.wxyz;
	vec4 g = c.zwxy;
	vec4 h = b.zwxy;
	vec4 i = c.wxyz;

    vec4 i4 = (XBR_Y_WEIGHT*Y) * mat4x3(I4, C1, A0, G5);
	vec4 i5 = (XBR_Y_WEIGHT*Y) * mat4x3(I5, C4, A1, G0);
	vec4 h5 = (XBR_Y_WEIGHT*Y) * mat4x3(H5, F4, B1, D0);
	vec4 f4 = h5.yzwx;

    fx      = (Ao*fp.y+Bo*fp.x); 
	fx_left = (Ax*fp.y+Bx*fp.x);
	fx_up   = (Ay*fp.y+By*fp.x);

    interp_restriction_lv0 = and(notEqual(e, f), notEqual(e, h));
    interp_restriction_lv1 = interp_restriction_lv0;

#ifdef CORNER_B
	interp_restriction_lv1      = (interp_restriction_lv0  &&  ( !eq(f,b) && !eq(h,d) || eq(e,i) && !eq(f,i4) && !eq(h,i5) || eq(e,g) || eq(e,c) ) );
#endif
#ifdef CORNER_D
	vec4 c1 = i4.yzwx;
	vec4 g0 = i5.wxyz;
	interp_restriction_lv1      = (interp_restriction_lv0  &&  ( !eq(f,b) && !eq(h,d) || eq(e,i) && !eq(f,i4) && !eq(h,i5) || eq(e,g) || eq(e,c) ) && (f!=f4 && f!=i || h!=h5 && h!=i || h!=g || f!=c || eq(b,c1) && eq(d,g0)));
#endif
#ifdef CORNER_C
	interp_restriction_lv1      = (interp_restriction_lv0  && ( !eq(f,b) && !eq(f,c) || !eq(h,d) && !eq(h,g) || eq(e,i) && (!eq(f,f4) && !eq(f,i4) || !eq(h,h5) && !eq(h,i5)) || eq(e,g) || eq(e,c)) );
#endif

    interp_restriction_lv2_left = and(notEqual(e, g), notEqual(d, g));
	interp_restriction_lv2_up   = and(notEqual(e, c), notEqual(b, c));

	vec4 fx45i = saturate((fx      + delta  -Co - Ci)/(2.0*delta ));
	vec4 fx45  = saturate((fx      + delta  -Co     )/(2.0*delta ));
	vec4 fx30  = saturate((fx_left + deltaL -Cx     )/(2.0*deltaL));
	vec4 fx60  = saturate((fx_up   + deltaU -Cy     )/(2.0*deltaU));

	vec4 wd1 = weighted_distance( e, c, g, i, h5, f4, h, f);
	vec4 wd2 = weighted_distance( h, d, i5, f, i4, b, e, i);

	edri     = and(lessThanEqual(wd1, wd2), interp_restriction_lv0);
	edr      = and(lessThanEqual(wd1, wd2), interp_restriction_lv1);
#ifdef CORNER_A
	edr      = and(edr, or(not(edri.yzwx), not(edri.wxyz)));
	edr_left = and(and(and(lessThanEqual((XBR_LV2_COEFFICIENT*df(f,g)), df(h,c)), interp_restriction_lv2_left), edr), and(not(edri.yzwx), eq(e,c)));
	edr_up   = and(and(and(greaterThanEqual(df(f,g), (XBR_LV2_COEFFICIENT*df(h,c))), interp_restriction_lv2_up), edr), and(not(edri.wxyz), eq(e,g)));
#endif
#ifndef CORNER_A
	edr_left = ((XBR_LV2_COEFFICIENT*df(f,g)) <= df(h,c)) && interp_restriction_lv2_left && edr;
	edr_up   = (df(f,g) >= (XBR_LV2_COEFFICIENT*df(h,c))) && interp_restriction_lv2_up && edr;
#endif

	fx45  = boolToBinary(edr)*fx45;
	fx30  = boolToBinary(edr_left)*fx30;
	fx60  = boolToBinary(edr_up)*fx60;
	fx45i = boolToBinary(edri)*fx45i;

	px = lessThanEqual(df(e,f), df(e,h));

	vec4 maximos = max(max(fx30, fx60), max(fx45, fx45i));

	vec3 res1 = E;
	res1 = mix(res1, mix(H, F, px.x ? 1.0 : 0.0), maximos.x);
	res1 = mix(res1, mix(B, D, px.z ? 1.0 : 0.0), maximos.z);
	
	vec3 res2 = E;
	res2 = mix(res2, mix(F, B, px.y ? 1.0 : 0.0), maximos.y);
	res2 = mix(res2, mix(D, H, px.w ? 1.0 : 0.0), maximos.w);
	
	vec3 res = mix(res1, res2, step(c_df(E, res1), c_df(E, res2)));

    fragColor = vec4(res, 1.0);
}