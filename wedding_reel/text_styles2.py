"""Out-of-the-box animated caption styles. Captions are (lead, key, t_in, t_out): a small lead-in line plus one big key word.
Each style draws onto a float RGB frame (1080x1920) with .apply(img, t[, matte])."""
import math, os
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
from text_styles import (W, H, FD, IVORY, GOLD, clamp, smooth, ease_out, ease_io, back_out, fnt, line_mask, cap_center, paste)

MAROON = np.array([91, 10, 31], np.float32); VEIL = np.array([44, 8, 22], np.float32); HALDI = np.array([255, 205, 70], np.float32)
def big_font(name, text, max_w, start=420, wght=None):
    size = start
    while True:
        f = ImageFont.truetype(os.path.join(FD, name), size)
        if wght: f.set_variation_by_axes([wght])
        adv = ImageDraw.Draw(Image.new("L", (4, 4))).textlength(text, font=f)
        if adv <= max_w or size < 60: return f, adv
        size -= 10
def tracked_mask(text, font, tr, pad=12): return line_mask(text.upper(), font, tr, pad)


class BehindCouple:
    """Giant words sit behind the couple (a person cut-out is composited back in front); the background dims so the couple glows."""
    name = "Behind the Couple"
    def __init__(self, caps):
        self.caps = caps; self.fl = fnt("Poppins-Medium.ttf", 30); self.items = {}
        for lead, key, _, _ in caps:
            f, adv = big_font("DMSerifDisplay-Italic.ttf", key, 960, 400); m, _ = line_mask(key, f, pad=60); lm, ladv = tracked_mask(lead, self.fl, 12)
            self.items[key] = (m, lm, ladv)
    def apply(self, img, t, matte):
        act = [c for c in self.caps if c[2] - .01 <= t < c[3] + .01]
        if not act: return img
        base = img; cov = max(ease_out((t - c[2]) / .6) * (1 - clamp((t - (c[3] - .5)) / .5)) for c in act)
        lum = float(img[::16, ::16].mean()); out = img * (1 - (.26 + .32 * clamp((lum - 80) / 90)) * cov)       # dim the picture more when it is bright so the letters read
        for lead, key, t0, t1 in act:
            m, lm, ladv = self.items[key]; ein = ease_out((t - t0) / .9); q = clamp((t - (t1 - .5)) / .5); a = ein * (1 - q)
            s = 1 + .14 * (1 - ein) + .06 * q; mm = cv2.resize(m, (int(m.shape[1] * s), int(m.shape[0] * s)), interpolation=cv2.INTER_LINEAR) if abs(s - 1) > .003 else m
            sig = (1 - ein) * 12 + q * 8
            if sig > .5: mm = cv2.GaussianBlur(mm, (0, 0), sig)
            prog = clamp((t - t0) / (t1 - t0)); paste(out, mm, 540 + (prog - .5) * 80 - mm.shape[1] / 2, 840 - mm.shape[0] / 2, IVORY, a, shadow=0)
        out = out * (1 - matte[..., None]) + base * matte[..., None]                  # the couple stays in front of the letters
        for lead, key, t0, t1 in act:
            m, lm, ladv = self.items[key]; q = clamp((t - (t1 - .5)) / .5); a = ease_out((t - t0 - .3) / .6) * (1 - q)
            paste(out, lm, 540 - ladv / 2 - 12, 380 - cap_center(self.fl) - 12 + (1 - ease_out((t - t0 - .3) / .6)) * 16, IVORY, a, shadow=.7)
        return out


class LetterWindow:
    """First caption: an outlined word drifts by. Second caption: the picture is veiled in maroon with a giant word acting as a window onto the footage,
    then the camera zooms through a letter and the footage fills the frame."""
    name = "Letter Window"
    def __init__(self, caps):
        self.caps = caps; self.fl = fnt("Poppins-Medium.ttf", 30)
        (la, ka, ta0, ta1), (lb, kb, tb0, tb1) = caps
        fa, adva = big_font("DMSerifDisplay-Italic.ttf", ka, 960, 380); im = Image.new("L", (int(adva) + 80, int(fa.size * 1.6)), 0)
        ImageDraw.Draw(im).text((40, 20), ka, font=fa, fill=0, stroke_width=4, stroke_fill=255); self.outline = np.asarray(im, np.float32) / 255
        self.lead = {lead: tracked_mask(lead, self.fl, 12) for lead, _, _, _ in caps}
        fb, advb = big_font("DMSerifDisplay-Regular.ttf", kb, 1000, 420); self.fb = fb
        im = Image.new("L", (W, H), 0); d = ImageDraw.Draw(im); x0 = W / 2 - advb / 2; bb = fb.getbbox(kb); y0 = 900 - (bb[1] + bb[3]) / 2; d.text((x0, y0), kb, font=fb, fill=255)
        self.M = np.asarray(im, np.float32) / 255
        i = kb.index("l") if "l" in kb else len(kb) // 2; px = x0 + fb.getlength(kb[:i]) + fb.getlength(kb[i]) / 2; lb_ = fb.getbbox(kb[i]); py = y0 + (lb_[1] + lb_[3]) / 2; self.P = (px, py)
        self.cap_full = fnt("Poppins-Medium.ttf", 36)
    def apply(self, img, t):
        (la, ka, ta0, ta1), (lb, kb, tb0, tb1) = self.caps
        if ta0 - .01 <= t < ta1 + .01:                                                         # caption A: outlined word + lead
            q = clamp((t - (ta1 - .5)) / .5); a = ease_out((t - ta0) / .8) * (1 - q); drift = (t - ta0) * 22
            paste(img, self.outline, 540 - self.outline.shape[1] / 2 + drift - 12, 820 - self.outline.shape[0] / 2, IVORY, a, shadow=.55)
            lm, ladv = self.lead[la]; paste(img, lm, 540 - ladv / 2 - 12, 380 - cap_center(self.fl) - 12, IVORY, ease_out((t - ta0 - .3) / .6) * (1 - q), shadow=.7)
        if tb0 - .01 <= t:                                                                      # caption B: letter window and zoom-through
            tz = tb0 + 1.25; u = clamp((t - tz) / .85); v = smooth((t - tb0) / .35) * (1 - smooth((u - .82) / .18)) * (1 if t < ta1 + 99 else 0)
            if v > 0:
                s = math.exp((u ** 2.2) * math.log(70)) if u > 0 else 1 + .05 * clamp((t - tb0) / 1.25); px, py = self.P
                Ms = cv2.warpAffine(self.M, np.float32([[s, 0, px - s * px], [0, s, py - s * py]]), (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
                veil = (1 - Ms) * v; img = img * (1 - veil[..., None]) + VEIL * veil[..., None]
                if u == 0:
                    lm, ladv = self.lead[lb]; paste(img, lm, 540 - ladv / 2 - 12, 560 - cap_center(self.fl) - 12, IVORY, smooth((t - tb0 - .2) / .5), shadow=.5)
            if u >= 1:                                                                          # small caption once the footage has taken over
                tm, adv = line_mask(lb + " " + kb + ".", self.cap_full, 3); q = clamp((t - (tb1 - .5)) / .5)
                paste(img, tm, 540 - adv / 2 - 12, 300 - cap_center(self.cap_full) - 12, IVORY, ease_out((t - tz - .85) / .5) * (1 - q), shadow=.5)
        return img


def jitter_path(pts, amp, seed):
    r = np.random.default_rng(seed); n = len(pts); j = r.normal(0, amp, (n, 2)); k = np.ones(5) / 5
    j = np.stack([np.convolve(j[:, 0], k, "same"), np.convolve(j[:, 1], k, "same")], 1); return pts + j
def stroke(img, pts, frac, color, thick, a=1.0, shadow=.3):
    """Draw the first `frac` of a polyline path as an antialiased pen stroke."""
    if frac <= 0 or a <= 0: return
    n = max(2, int(len(pts) * frac)); p = pts[:n]; x0, y0 = np.floor(p.min(0)).astype(int) - thick - 6; x1, y1 = np.ceil(p.max(0)).astype(int) + thick + 6
    cv = np.zeros((y1 - y0, x1 - x0), np.uint8); cv2.polylines(cv, [np.round((p - [x0, y0]) * 16).astype(np.int32)], False, 255, thick, cv2.LINE_AA, shift=4)
    paste(img, cv.astype(np.float32) / 255, x0, y0, color, a, shadow=shadow)

class HandDrawn:
    """Handwritten words that write themselves on, with doodles that draw themselves (underline, heart, highlighter, sparkles, arrow)."""
    name = "Hand-Drawn"
    def __init__(self, caps):
        self.caps = caps; self.items = {}
        for ci, (lead, key, _, _) in enumerate(caps):
            fl = ImageFont.truetype(os.path.join(FD, "Caveat-Var.ttf"), 92); fl.set_variation_by_axes([700])
            fk, adv = big_font("Caveat-Var.ttf", key, 700, 230, 700)
            lm, ladv = line_mask(lead, fl, pad=14); km, kadv = line_mask(key, fk, pad=14); self.items[key] = (lm, ladv, km, kadv, fk, fl)
    def apply(self, img, t):
        for ci, (lead, key, t0, t1) in enumerate(self.caps):
            if not (t0 - .01 <= t < t1 + .01): continue
            lm, ladv, km, kadv, fk, fl = self.items[key]; q = clamp((t - (t1 - .5)) / .5); fade = 1 - q; xl, yl, yk = 110, 1330, 1415
            def wipe(m, t_start, dur, soft=70):
                w = m.shape[1]; edge = ease_io((t - t_start) / dur) * (w + soft) - soft; return m * np.clip((edge - np.arange(w)[None, :]) / soft, 0, 1)
            paste(img, wipe(lm, t0 + .05, .7), xl - 14, yl - 14 + (1 - ease_out((t - t0) / .6)) * 10, IVORY, fade)
            kcol = IVORY
            if ci == 1:                                                                                   # highlighter swipe behind the key word
                hp = clamp((t - t0 - .45) / .4); hx0, hx1 = xl - 18, xl + kadv + 22; hy0, hy1 = yk + 60, yk + 190
                if hp > 0:
                    x1 = hx0 + (hx1 - hx0) * ease_out(hp); poly = np.array([[hx0, hy0 + 8], [x1, hy0], [x1 + 6, hy1 - 6], [hx0 - 4, hy1]], np.float32)
                    hm = np.zeros((H, W), np.uint8); cv2.fillPoly(hm, [poly.astype(np.int32)], 255, cv2.LINE_AA); hm = cv2.GaussianBlur(hm, (0, 0), 1.6).astype(np.float32) / 255 * .78 * fade
                    img[:] = img * (1 - hm[..., None]) + HALDI * hm[..., None]
                kcol = MAROON
            paste(img, wipe(km, t0 + .6, .8), xl - 14, yk - 14 + (1 - ease_out((t - t0 - .5) / .6)) * 12, kcol, fade, shadow=.0 if ci == 1 else .45)
            if ci == 0:
                xa, xb = xl, xl + kadv; xs = np.linspace(xa, xb, 90); ys = yk + 215 + 7 * np.sin((xs - xa) / 18.0)
                stroke(img, jitter_path(np.stack([xs, ys], 1), .9, 3), ease_io((t - t0 - 1.1) / .6), GOLD, 6, fade)                        # squiggle underline
                th = np.linspace(-math.pi, math.pi, 120); hx = 16 * np.sin(th) ** 3; hy = -(13 * np.cos(th) - 5 * np.cos(2 * th) - 2 * np.cos(3 * th) - np.cos(4 * th))
                hc = np.stack([xl + kadv + 105 + hx * 2.9, yk + 130 + hy * 2.9], 1); hc = np.roll(hc, 40, 0)
                pulse = 1 + .06 * math.sin((t - t0) * 9) * (1 if t - t0 > 2.2 else 0)
                stroke(img, jitter_path((hc - hc.mean(0)) * pulse + hc.mean(0), 1.0, 5), ease_io((t - t0 - 1.5) / .8), np.array([240, 90, 120], np.float32), 6, fade)   # heart doodle
            else:
                for i, (dx, dy, r) in enumerate(((kadv + 70, 40, 34), (kadv + 150, -20, 22), (kadv + 40, 215, 26))):                      # sparkles
                    e = back_out((t - t0 - 1.2 - i * .16) / .4)
                    if e <= 0: continue
                    cx, cy, rr = xl + dx, yk + dy, r * e; P = lambda ax, ay, bx, by: np.array([[ax, ay], [bx, by]], np.float32)
                    for a_, b_ in ((P(cx - rr, cy, cx + rr, cy)), (P(cx, cy - rr, cx, cy + rr)), (P(cx - rr * .55, cy - rr * .55, cx + rr * .55, cy + rr * .55)), (P(cx - rr * .55, cy + rr * .55, cx + rr * .55, cy - rr * .55))) if False else ():
                        pass
                    for pts in (P(cx - rr, cy, cx + rr, cy), P(cx, cy - rr, cx, cy + rr), P(cx - rr * .55, cy - rr * .55, cx + rr * .55, cy + rr * .55), P(cx - rr * .55, cy + rr * .55, cx + rr * .55, cy - rr * .55)):
                        stroke(img, np.linspace(pts[0], pts[1], 12), 1.0, HALDI, 5, fade, shadow=.35)
                s = np.linspace(0, 1, 60); p0, p1, p2 = np.array([760, 1300]), np.array([860, 1190]), np.array([830, 1090])
                arrow = ((1 - s) ** 2)[:, None] * p0 + (2 * (1 - s) * s)[:, None] * p1 + (s ** 2)[:, None] * p2
                stroke(img, jitter_path(arrow, .8, 8), ease_io((t - t0 - 1.6) / .5), IVORY, 5, fade)
                if t - t0 > 2.0:
                    ah = clamp((t - t0 - 2.0) / .2); head = np.array([[p2[0] - 26, p2[1] + 30], [p2[0], p2[1]], [p2[0] + 26, p2[1] + 28]], np.float32); stroke(img, head, ah, IVORY, 5, fade)
        return img


class MarqueeRibbon:
    """Tilted ribbons of scrolling text slide in along their angle, the next ribbon crosses the first at a different angle as it leaves."""
    name = "Marquee Ribbon"
    def __init__(self, caps):
        self.caps = caps; self.f = fnt("Poppins-SemiBold.ttf", 44); self.items = []
        looks = [dict(band=np.array([250, 244, 232], np.float32), ink=MAROON, ang=-7.0, cy=1470, direction=1, speed=130.0),
                 dict(band=MAROON, ink=HALDI, ang=6.0, cy=1470, direction=-1, speed=170.0)]
        for ci, (lead, key, t0, t1) in enumerate(caps):
            text = (lead + " " + key).upper().replace("...", ""); sep = "   •   "; unit = text + sep
            d0 = ImageDraw.Draw(Image.new("L", (4, 4))); ws = [d0.textlength(c, font=self.f) for c in unit]; period = sum(ws) + 8 * len(unit)
            reps = int(math.ceil((W + 1400) / period)) + 2; sw = int(period * reps); im = Image.new("L", (sw, 140), 0); d = ImageDraw.Draw(im); x = 0.0
            for _ in range(reps):
                for c, w in zip(unit, ws): d.text((x, 34), c, font=self.f, fill=255); x += w + 8
            self.items.append((np.asarray(im, np.float32) / 255, period, looks[ci % 2]))
    def apply(self, img, t):
        for ci, (lead, key, t0, t1) in enumerate(self.caps):
            if not (t0 - .01 <= t < t1 + .01): continue
            tm, period, look = self.items[ci]; ein = ease_out((t - t0) / .8); q = clamp((t - (t1 - .6)) / .6); eq = q ** 2.2
            slide = (1 - ein) * 1500 * look["direction"] * -1 + eq * 1700 * look["direction"]           # enters from one side, leaves out the other
            shift = int((t - t0) * look["speed"] * look["direction"] * -1) % int(period); tmr = np.roll(tm, -shift, axis=1)[:, :W + 1400]
            band = np.zeros((140, tmr.shape[1], 3), np.float32) + look["band"]
            ang = math.radians(look["ang"]); ca, sa = math.cos(ang), math.sin(ang); cx, cy = 540 + slide, look["cy"]
            M = np.float32([[ca, -sa, cx - ca * tmr.shape[1] / 2 + sa * 70], [sa, ca, cy - sa * tmr.shape[1] / 2 - ca * 70]])
            band_w = cv2.warpAffine(np.ones((140, tmr.shape[1]), np.float32), M, (W, H), flags=cv2.INTER_LINEAR)
            txt_w = cv2.warpAffine(tmr, M, (W, H), flags=cv2.INTER_LINEAR)
            sh = cv2.GaussianBlur(band_w, (0, 0), 14); img *= (1 - .3 * np.roll(sh, 10, 0))[..., None]
            ba = band_w[..., None] * (.94 if ci == 0 else .92); img[:] = img * (1 - ba) + look["band"] * ba
            ta = txt_w[..., None] * band_w[..., None]; img[:] = img * (1 - ta) + look["ink"] * ta
        return img


STYLES2 = {"1": BehindCouple, "2": LetterWindow, "3": HandDrawn, "4": MarqueeRibbon}
