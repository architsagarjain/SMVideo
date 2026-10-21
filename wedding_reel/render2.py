"""Renderer v2: CapCut-style beat-locked reel.
Usage: python3 render2.py RAW_DIR OUT.mp4 START END            (render frames START..END-1)
       python3 render2.py RAW_DIR - --stills t1,t2,... DIR     (write still frames)"""
import sys, os, math, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from plan2 import *
import render_reel as rr
from render_reel import (Clip, zoom_img, zoom_blur, screen, hblur, mix, flash_overlay, smooth, ease_io, ease_out,
                         clamp, kf, whip, tr_zoomin, tr_spin, tr_flash, tr_iris, tr_diag, tr_lightleak, tr_softzoom, xx, yy, WARM_WHITE)

HERE = os.path.dirname(os.path.abspath(__file__)); FD = os.path.join(HERE, "..", "fonts")
F_REG, F_ITAL = os.path.join(FD, "CormorantGaramond-Var.ttf"), os.path.join(FD, "CormorantGaramond-Italic-Var.ttf")   # Cormorant Garamond, Bold (700)
GOLD = (236, 200, 128); MAROON = (104, 22, 46); CREAM = (247, 236, 221)
_fc = {}
def font(p, s, wght=700):
    if (p, s, wght) not in _fc:
        f = ImageFont.truetype(p, s); f.set_variation_by_axes([wght]); _fc[(p, s, wght)] = f
    return _fc[(p, s, wght)]
def back_out(x, c1=1.9):
    x = clamp(x, 0, 1); c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


def heart_pts(cx, cy, s):
    th = np.linspace(0, 2 * np.pi, 80)
    return [(cx + s * 16 * math.sin(a) ** 3, cy - s * (13 * math.cos(a) - 5 * math.cos(2 * a) - 2 * math.cos(3 * a) - math.cos(4 * a))) for a in th]
def tracked(draw, text, fnt, cx, y, tr, fill):
    ws = [draw.textlength(c, font=fnt) for c in text]; total = sum(ws) + tr * (len(text) - 1); x = cx - total / 2
    for c, w in zip(text, ws): draw.text((x, y), c, font=fnt, fill=fill); x += w + tr
    return total

# ------------------------------------------------------------------ shots
class Shot:
    def __init__(self, d, raw, t0, t1):
        self.d, self.t0, self.t1 = d, t0, t1; self.dur = t1 - t0
        self.clip = Clip(os.path.join(raw, f"c{d['clip']}.mp4"))
        dt = 1 / 600; self.tl = np.arange(-1.0, self.dur + 1.0, dt)
        f = np.clip(self.tl / self.dur, 0, 1); sp = d["speed"]
        self.spd = np.interp(f, [k[0] for k in sp], [k[1] for k in sp])
        cum = np.cumsum(self.spd) * dt; self.src = d["src"] + cum - cum[np.searchsorted(self.tl, 0)]
        self.gain, self.sat = d.get("gain", 1.0), d.get("sat", 1.0); self.wb = np.array(d.get("wb", (1, 1, 1)), np.float32)
        self.loaded = False
    def ensure(self):
        if not self.loaded: self.clip.load(self.src.min() - .3, self.src.max() + .3); self.loaded = True
    def release(self): self.clip.frames = None; self.loaded = False
    def frame(self, t, size=(W, H), zmul=1.0):
        self.ensure(); tl = t - self.t0
        i = int(clamp(round((tl + 1.0) * 600), 0, len(self.tl) - 1)); ts, sp = self.src[i], self.spd[i]
        img = self.clip.get(ts, blend=sp < .93)
        z = max(kf(self.d["zoom"], clamp(tl / self.dur, 0, 1)) * zmul, 1.0)
        ow, oh = size; a = max(ow / self.clip.w, oh / self.clip.h) * z; fx, fy = self.d["focus"]
        if self.d.get("flip"): img = np.ascontiguousarray(img[:, ::-1]); fx = 1 - fx
        msx, msy = max(0, (self.clip.w - ow / a) / 2), max(0, (self.clip.h - oh / a) / 2)
        cx = self.clip.w / 2 + clamp((fx - .5) * self.clip.w, -msx, msx); cy = self.clip.h / 2 + clamp((fy - .5) * self.clip.h, -msy, msy)
        M = np.float32([[a, 0, ow / 2 - cx * a], [0, a, oh / 2 - cy * a]])
        out = cv2.warpAffine(img, M, (ow, oh), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        out *= self.gain * self.wb
        if self.sat != 1.0: l = out.mean(2, keepdims=True); out = l + (out - l) * self.sat
        return out
    def free(self): self.release()


BG_MAROON = np.zeros((H, W, 3), np.float32) + np.array([38, 9, 21], np.float32)
class Tiles:
    """Opening: three horizontal strips cascade in on beats 0/1/2, alternating sides, with motion blur."""
    def __init__(self, d, raw, t0, t1):
        self.t0, self.t1 = t0, t1; self.subs = [Shot(t, raw, t0, t1) for t in d["tiles"]]
    def frame(self, t, zmul=1.0):
        out = BG_MAROON.copy(); th = H // 3
        for i, sub in enumerate(self.subs):
            ti = tb(i); p = ease_out((t - ti) / .34)
            if t < ti - 1e-6: continue
            tile = sub.frame(t, (W, th), zmul)
            if p < 1: tile = hblur(tile, int(260 * (1 - p)) | 1, 1)
            off = int((1 - p) * W) * (1 if i % 2 == 0 else -1); y0 = i * th
            if off >= 0: out[y0:y0 + th, off:] = tile[:, :W - off] if off < W else out[y0:y0 + th, off:]
            else: out[y0:y0 + th, :W + off] = tile[:, -off:]
            line = int(5 * smooth((p - .7) / .3))
            if line and i > 0: out[y0 - line:y0 + line] = np.array(GOLD, np.float32)
        return out
    def release(self): [s.release() for s in self.subs]; self.loaded = False
    loaded = True
    def free(self): self.release()
class Split:
    """Three vertical panels whose widths pump on every beat (accordion)."""
    STATES = [[1 / 3, 1 / 3, 1 / 3], [.54, .23, .23], [.23, .54, .23], [.23, .23, .54]]
    def __init__(self, d, raw, t0, t1):
        self.t0, self.t1 = t0, t1; self.subs = [Shot(p, raw, t0, t1) for p in d["panels"]]
    def widths(self, t):
        k = int(clamp((t - self.t0) / BEAT, 0, 3)); tk = self.t0 + k * BEAT
        prev = self.STATES[max(k - 1, 0)]; cur = self.STATES[k]; p = ease_io((t - tk) / .2)
        return np.array(prev) * (1 - p) + np.array(cur) * p
    def frame(self, t, zmul=1.0):
        wd = self.widths(t); edges = np.round(np.concatenate([[0], np.cumsum(wd)]) * W).astype(int); edges[-1] = W
        out = np.zeros((H, W, 3), np.float32)
        for i, sub in enumerate(self.subs):
            x0, x1 = edges[i], edges[i + 1]
            if x1 - x0 < 4: continue
            panel = sub.frame(t, (x1 - x0, H), zmul); out[:, x0:x1] = panel * (1.0 + .10 * (wd[i] - 1 / 3) * 3)
        for e in edges[1:-1]: out[:, e - 3:e + 3] = np.array(GOLD, np.float32)
        return out
    def release(self): [s.release() for s in self.subs]
    loaded = True
    def free(self): self.release()


# ------------------------------------------------------------------ end screen (the supplied artwork, animated)
class EndScreen:
    """Animates the supplied end-screen artwork: clean background + staggered reveal of logo, tagline and button,
    a slow push-in, a gold glint over the logo/tagline and a shine sweep across the button."""
    BOXES = {"logo": (195, 285, 385, 495), "tag": (125, 500, 455, 585), "btn": (160, 585, 420, 660)}   # source-pixel boxes
    def __init__(self, path):
        src = np.asarray(Image.open(path).convert("RGB")); h, w = src.shape[:2]
        lum = src.mean(2); dark = (lum < 150).astype(np.uint8)
        fg = np.zeros((h, w), np.uint8); self.fg = {}
        for k, (x0, y0, x1, y1) in self.BOXES.items():
            m = np.zeros((h, w), np.uint8); m[y0:y1, x0:x1] = dark[y0:y1, x0:x1]
            if k == "btn": m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((41, 41), np.uint8))
            m = cv2.dilate(m, np.ones((5, 5), np.uint8)); self.fg[k] = m; fg |= m
        clean = cv2.inpaint(src, cv2.dilate(fg, np.ones((7, 7), np.uint8)), 7, cv2.INPAINT_TELEA)
        sc = H / h; nw = int(round(w * sc)); self.x0 = int(round(((w * .5017) * sc) - W / 2))      # centre the content, crop the sides
        def up(im, interp=cv2.INTER_LANCZOS4):
            big = cv2.resize(im, (nw, H), interpolation=interp)[:, self.x0:self.x0 + W]
            return big
        def sharpen(im): bl = cv2.GaussianBlur(im, (0, 0), 1.6); return np.clip(im * 1.55 - bl * .55, 0, 255)
        self.orig = sharpen(up(src).astype(np.float32)); self.clean = sharpen(up(clean).astype(np.float32))
        self.box = {}; self.alpha = {}; self.fgm = {}
        for k, (x0, y0, x1, y1) in self.BOXES.items():
            X0, Y0, X1, Y1 = int(x0 * sc - self.x0), int(y0 * sc), int(x1 * sc - self.x0), int(y1 * sc); self.box[k] = (X0, Y0, X1, Y1)
            fe = 28; yy_, xx_ = np.mgrid[0:Y1 - Y0, 0:X1 - X0].astype(np.float32)
            al = np.clip(np.minimum.reduce([xx_ / fe, (X1 - X0 - 1 - xx_) / fe, yy_ / fe, (Y1 - Y0 - 1 - yy_) / fe]), 0, 1); self.alpha[k] = al[..., None]
            self.fgm[k] = cv2.GaussianBlur(cv2.resize(self.fg[k], (nw, H), interpolation=cv2.INTER_LINEAR)[:, self.x0:self.x0 + W].astype(np.float32), (0, 0), 1.2)[Y0:Y1, X0:X1, None]
    def frame(self, u):
        img = self.clean.copy()
        sched = {"logo": (.10, .45), "tag": (.45, .45), "btn": (.80, .40)}
        for k, (st, dur) in sched.items():
            x = clamp((u - st) / dur, 0, 1)
            if x <= 0: continue
            X0, Y0, X1, Y1 = self.box[k]; crop = self.orig[Y0:Y1, X0:X1]; al = self.alpha[k]
            e = ease_out(x); rise = 34 * (1 - e)
            sc = (.86 + .14 * back_out(x)) if k == "btn" else (.95 + .05 * e)
            cx, cy = (X1 - X0) / 2, (Y1 - Y0) / 2
            M = np.float32([[sc, 0, cx - cx * sc], [0, sc, cy - cy * sc + rise]])
            wc = cv2.warpAffine(crop, M, (X1 - X0, Y1 - Y0), borderMode=cv2.BORDER_REFLECT); wa = cv2.warpAffine(al, M, (X1 - X0, Y1 - Y0))[..., None] if al.ndim == 3 else cv2.warpAffine(al, M, (X1 - X0, Y1 - Y0))
            a = (wa if wa.ndim == 3 else wa[..., None]) * clamp(x * 2.2, 0, 1)
            img[Y0:Y1, X0:X1] = img[Y0:Y1, X0:X1] * (1 - a) + wc * a
        # gold glint across logo+tagline, shine sweep across the button
        for k, st, dur, col in (("logo", 1.05, .55, (255, 222, 150)), ("tag", 1.2, .55, (255, 222, 150)), ("btn", 1.45, .55, (255, 245, 225))):
            x = (u - st) / dur
            if not 0 <= x <= 1: continue
            X0, Y0, X1, Y1 = self.box[k]; g = np.exp(-(((np.arange(X1 - X0)[None, :] + (np.arange(Y1 - Y0)[:, None]) * .35) - (x * 1.5 - .25) * (X1 - X0)) / ((X1 - X0) * .09)) ** 2)[..., None]
            m = self.fgm[k] if k != "btn" else np.clip(self.fgm[k] * 1.0, 0, 1)
            img[Y0:Y1, X0:X1] = screen(img[Y0:Y1, X0:X1], np.array(col, np.float32) * g * m * (.55 if k != "btn" else .45))
        # slow push-in about the logo
        z = 1.0 + .055 * smooth(u / 2.6); cx, cy = W / 2, 930
        return cv2.warpAffine(img, np.float32([[z, 0, cx - cx * z], [0, z, cy - cy * z]]), (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def light_leak(img, t, t0, dur, seed=0):
    p = (t - t0) / dur
    if not 0 <= p <= 1: return img
    st = math.sin(math.pi * p); cx = W * (1.3 - 1.7 * p) if seed % 2 == 0 else W * (-.3 + 1.7 * p)
    leak = np.exp(-(((xx - cx) + (yy - H * .3) * .35) / (W * .34)) ** 2)
    col = np.stack([leak * 255, leak * 140, leak * 60], -1)
    return screen(img, col * .8 * st)


# ------------------------------------------------------------------ extra transitions
_ink = None
def ink_field():
    global _ink
    if _ink is None:
        r = np.random.default_rng(21); n = np.zeros((H, W), np.float32)
        for (h, w), wt in (((14, 8), .55), ((40, 22), .3), ((110, 62), .15)):
            n += cv2.resize(r.random((h, w)).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC) * wt
        n = (n - n.min()) / (n.max() - n.min()); d = np.hypot(xx / W, (yy - H) / H); d = d / d.max()
        n = n * .55 + d * .45; _ink = (n - n.min()) / (n.max() - n.min())
    return _ink
def tr_ink(A, B, p):
    N = ink_field(); w = .2; tq = p * (1 + w * 1.6); m = np.clip((tq - N) / w, 0, 1); m = m * m * (3 - 2 * m)
    rim = np.exp(-((tq - N - w * .25) / (w * .38)) ** 2)[..., None] * .95
    out = mix(zoom_img(A, 1 + .05 * p), zoom_img(B, 1 + .06 * (1 - p)), m[..., None])
    return out * (1 - rim) + 255 * rim
def tr_glitch(A, B, p, seed):
    base = A if p < .5 else B; st = math.sin(math.pi * p); rs = np.random.default_rng(seed); out = base.copy()
    edges = np.sort(rs.integers(0, H, 16))
    for i in range(0, 16, 2): out[edges[i]:edges[i + 1]] = np.roll(out[edges[i]:edges[i + 1]], int(rs.integers(-110, 110) * st), axis=1)
    c = int(26 * st) + 1; out[..., 0] = np.roll(out[..., 0], c, 1); out[..., 2] = np.roll(out[..., 2], -c, 1)
    out *= 1 - .22 * (np.arange(H) % 6 < 2)[:, None, None] * st
    return flash_overlay(out, .30 * st ** 2)
def tr_blinds(A, B, p):
    ns = 9; sw = W // ns + 1; out = zoom_img(B, 1 + .06 * (1 - p)).copy()
    for i in range(ns):
        q = ease_io(clamp((p - i * .045) / .55, 0, 1)); dy = int(q * H); x0, x1 = i * sw, min(W, (i + 1) * sw)
        if dy >= H: continue
        if i % 2 == 0: out[:H - dy, x0:x1] = A[dy:, x0:x1]
        else: out[dy:, x0:x1] = A[:H - dy, x0:x1]
        if 0 < dy < H: out[(H - dy - 3 if i % 2 == 0 else dy - 3):(H - dy + 3 if i % 2 == 0 else dy + 3), x0:x1] = np.array(GOLD, np.float32) * .85
    return out
def heart_mask(S, hh=H // 2, ww=W // 2, cy=.45):
    X = (np.arange(ww, dtype=np.float32)[None, :] * 2 - W / 2) / max(S, 1e-3); Y = -(np.arange(hh, dtype=np.float32)[:, None] * 2 - H * cy) / max(S, 1e-3)
    f = (X * X + Y * Y - 1) ** 3 - X * X * Y ** 3; return (f <= 0).astype(np.float32)
def tr_heart(A, B, p):
    S = ease_io(p) * 2300 + 1; m1 = heart_mask(S); m2 = heart_mask(S * 1.05)
    up = lambda m: cv2.resize(cv2.GaussianBlur(m, (0, 0), 1.6), (W, H))[..., None]
    M1, ring = up(m1), np.clip(up(m2) - up(m1), 0, 1)
    out = mix(zoom_img(A, 1 + .06 * p), zoom_img(B, 1 + .18 * (1 - p)), M1)
    return out * (1 - ring) + np.array(GOLD, np.float32) * ring


# ------------------------------------------------------------------ beat-driven camera/effects
def beat_amp(kk):
    if kk == DROP_BEAT: return .10, .18
    if kk >= 56: return .008, .1
    if kk > DROP_BEAT: return (.05, .10) if kk % 4 == 0 else (.024, .10)
    return (.02, .12) if kk % 4 == 0 else (0, .1)
def punch(t):
    z = 1.0; k = int(t / BEAT)
    for kk in (k - 1, k, k + 1):
        if kk < 0: continue
        dt = t - tb(kk)
        if dt < 0: continue
        a, dec = beat_amp(kk); z *= 1 + a * math.exp(-dt / dec)
    return z
def shake(t):
    dx = dy = 0.0; k = int(t / BEAT)
    for kk in (k - 1, k):
        if kk < DROP_BEAT or kk >= 56: continue
        dt = t - tb(kk)
        if dt < 0: continue
        A, dec = (24, .22) if kk == DROP_BEAT else ((7, .12) if kk % 4 == 0 else (0, .1)); e = A * math.exp(-dt / dec)
        dx += e * math.cos(kk * 2.399 + 60 * dt); dy += e * math.sin(kk * 2.399 + 47 * dt)
    return dx, dy
def ca_amount(t):
    c = 0.0; k = int(t / BEAT)
    for kk in (k - 1, k):
        if kk < DROP_BEAT or kk >= 56: continue
        dt = t - tb(kk)
        if dt < 0: continue
        c += (16, .3)[0] * math.exp(-dt / .3) if kk == DROP_BEAT else (4 * math.exp(-dt / .12) if kk % 4 == 0 else 1.2 * math.exp(-dt / .1))
    return c
def chroma(img, px):
    if px < .7: return img
    M1 = np.float32([[1, 0, px], [0, 1, 0]]); M2 = np.float32([[1, 0, -px], [0, 1, 0]]); out = img.copy()
    out[..., 0] = cv2.warpAffine(img[..., 0], M1, (W, H), borderMode=cv2.BORDER_REFLECT); out[..., 2] = cv2.warpAffine(img[..., 2], M2, (W, H), borderMode=cv2.BORDER_REFLECT)
    return out
def translate(img, dx, dy):
    if abs(dx) + abs(dy) < .5: return img
    return cv2.warpAffine(img, np.float32([[1, 0, dx], [0, 1, dy]]), (W, H), borderMode=cv2.BORDER_REFLECT)


# ------------------------------------------------------------------ text layers
class Text:
    def __init__(self):
        self.bm = {}
        for (txt, fk, size, cy, ab, vb) in WORDS:
            f = font(F_REG if fk == "reg" else F_ITAL, size); l, t, r, b = f.getbbox(txt); pad = 12
            while r - l > 980: size -= 6; f = font(F_REG if fk == "reg" else F_ITAL, size); l, t, r, b = f.getbbox(txt)
            im = Image.new("L", (r - l + 2 * pad, b - t + 2 * pad), 0); ImageDraw.Draw(im).text((pad - l, pad - t), txt, font=f, fill=255)
            self.bm[txt] = np.asarray(im, np.float32) / 255
        ys = np.linspace(0, 1, H)[:, None, None]
        self.grad = (np.array([255, 233, 160], np.float32) * (1 - np.clip((ys * H - 880) / 700, 0, 1)) + np.array([228, 166, 66], np.float32) * np.clip((ys * H - 880) / 700, 0, 1))
        self.hdr = self.make_header()
    def make_header(self):
        im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im); cx, y = W / 2, 238
        tw = tracked(d, "SHAADI MANGALAM", font(F_REG, 42), cx, y - 8, 12, GOLD + (255,))
        for sgn in (-1, 1):
            x0 = cx + sgn * (tw / 2 + 30); x1 = cx + sgn * (tw / 2 + 150); d.line([(x0, y + 22), (x1, y + 22)], fill=GOLD + (200,), width=2)
        d.polygon(heart_pts(cx, y - 34, .95), fill=GOLD + (255,))
        a = np.asarray(im, np.float32); sh = cv2.GaussianBlur(a[..., 3], (0, 0), 6)
        return a, sh
    def apply(self, img, t):
        # brand header
        h0, h1 = tb(HEADER[0]), tb(HEADER[1]); ha = smooth((t - h0) / .35) * (1 - smooth((t - (h1 - .25)) / .25))
        if ha > 0:
            a, sh = self.hdr; img = img * (1 - .75 * ha * sh[..., None] / 255); al = a[..., 3:4] / 255 * ha; img = img * (1 - al) + a[..., :3] * al
        mask = np.zeros((H, W), np.float32)
        for (txt, fk, size, cy, ab, vb) in WORDS:
            ta, tv = tb(ab), tb(vb)
            if not ta <= t < tv: continue
            x = clamp((t - ta) / .30, 0, 1); sc = 1.5 - .5 * back_out(x); al = clamp(x * 3, 0, 1)
            out = clamp((t - (tv - .17)) / .17, 0, 1); sc *= 1 + .18 * smooth(out); al *= 1 - smooth(out)
            bm = self.bm[txt]; hh, ww = bm.shape; nh, nw = max(2, int(hh * sc)), max(2, int(ww * sc)); r = cv2.resize(bm, (nw, nh), interpolation=cv2.INTER_LINEAR) * al
            yc = cy + 38 * (1 - back_out(x)) * (1 if True else 0); x0, y0 = int(W / 2 - nw / 2), int(yc - nh / 2)
            xs, ys_ = max(0, x0), max(0, y0); xe, ye = min(W, x0 + nw), min(H, y0 + nh)
            if xe > xs and ye > ys_: mask[ys_:ye, xs:xe] = np.maximum(mask[ys_:ye, xs:xe], r[ys_ - y0:ye - y0, xs - x0:xe - x0])
        if mask.max() > 0:
            sh = cv2.GaussianBlur(mask, (0, 0), 16); sh = np.roll(sh, 10, 0)
            img = img * (1 - .55 * sh[..., None]); m = mask[..., None]; img = img * (1 - m) + self.grad * m
        return img


# ------------------------------------------------------------------ the reel
class Reel2:
    def __init__(self, raw):
        self.items = []
        for s in SHOTS:
            if s["kind"] == "single": o = Shot(s, raw, s["t0"], s["t1"])
            elif s["kind"] == "tiles3h": o = Tiles(s, raw, s["t0"], s["t1"])
            elif s["kind"] == "split3v": o = Split(s, raw, s["t0"], s["t1"])
            else: o = None
            self.items.append(o)
        self.text = Text(); self.end = None
    def card(self, t):
        if self.end is None: self.end = EndScreen(os.path.join(HERE, "assets", "end_screen.png"))
        return self.end.frame(max(t - SHOTS[-1]["t0"], 0.0))
    def shot_frame(self, i, t, zmul):
        s = SHOTS[i]
        if s["kind"] == "endcard": return self.card(t)
        return self.items[i].frame(t, zmul=zmul) if s["kind"] != "single" else self.items[i].frame(t, (W, H), zmul)
    def frame(self, n):
        t = n / FPS; zmul = punch(t)
        idx = max(i for i, s in enumerate(SHOTS) if t >= s["t0"] - 1e-6); img = None; tkind = None; tp = 0
        for j in range(1, len(SHOTS)):
            tr = SHOTS[j]["trans"]; tc = SHOTS[j]["t0"]
            if tr and tc - tr[1] / 2 <= t < tc + tr[1] / 2:
                p = (t - (tc - tr[1] / 2)) / tr[1]; A = self.shot_frame(j - 1, t, zmul); B = self.shot_frame(j, t, zmul); kind = tr[0]; tkind, tp = kind, p
                if kind.startswith("whip"): img = whip(A, B, p, kind[-1])
                elif kind == "zoomin": img = tr_zoomin(A, B, p)
                elif kind == "zoomflash": img = tr_zoomin(A, B, p, flash=.5)
                elif kind.startswith("spin"): img = tr_spin(A, B, p, 1 if kind.endswith("+") else -1)
                elif kind == "flash": img = tr_flash(A, B, p)
                elif kind == "glowdip": img = tr_flash(A, B, p, peak=.8, zoom=.05)
                elif kind == "iris": img = tr_iris(A, B, p)
                elif kind == "diag": img = tr_diag(A, B, p)
                elif kind == "lightleak": img = tr_lightleak(A, B, p)
                elif kind == "softzoom": img = tr_softzoom(A, B, p)
                elif kind == "ink": img = tr_ink(A, B, p)
                elif kind == "glitch": img = tr_glitch(A, B, p, n)
                elif kind == "blinds": img = tr_blinds(A, B, p)
                elif kind == "heart": img = tr_heart(A, B, p)
                else: raise ValueError(kind)
                idx = j - 1 if p < .5 else j; break
        if img is None: img = self.shot_frame(idx, t, zmul)
        for j, o in enumerate(self.items):
            if o is not None and j < idx - 1: o.free()
        # beat shake + chroma split
        dx, dy = shake(t); img = translate(img, dx, dy)
        ca = ca_amount(t) + (10 * math.sin(math.pi * tp) if tkind and tkind.startswith(("whip", "spin", "zoom")) else 0)
        img = chroma(img, ca)
        # overlays (only over footage)
        if SHOTS[idx]["kind"] != "endcard":
            for i, (b, d) in enumerate(LEAKS): img = light_leak(img, t, tb(b), d, i)
            for k in range(DROP_BEAT, 56, 4):          # bar-line flash pulses
                dt = t - tb(k)
                if 0 <= dt < .2: img = flash_overlay(img, (.32 if k == DROP_BEAT else .08) * math.exp(-dt / .06))
        if SHOTS[idx]["kind"] != "endcard": img = rr.grade(img)
        if t < .12: img = img * (t / .12)
        img = self.text.apply(img, t)
        if t > DUR - .3: img = img * (1 - smooth((t - (DUR - .3)) / .3))
        return np.clip(img, 0, 255).astype(np.uint8)


def main():
    raw, out = sys.argv[1], sys.argv[2]; args = sys.argv[3:]; reel = Reel2(raw)
    if "--stills" in args:
        k = args.index("--stills"); ts = [float(x) for x in args[k + 1].split(",")]; d = args[k + 2]; os.makedirs(d, exist_ok=True)
        for t in ts: Image.fromarray(reel.frame(int(round(t * FPS)))).save(os.path.join(d, f"t{t:06.2f}.jpg"), quality=88)
        return
    a, b = int(args[0]), int(args[1])
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264",
                           "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high", "-g", "30", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", out], stdin=subprocess.PIPE)
    for n in range(a, b):
        ff.stdin.write(reel.frame(n).tobytes())
        if n % 30 == 0: print("frame", n, flush=True)
    ff.stdin.close(); ff.wait()
if __name__ == "__main__": main()
