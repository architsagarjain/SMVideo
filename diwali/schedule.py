"""One timeline shared by the video renderer and the music/sfx synth, so picture and sound stay locked."""
import numpy as np

FPS = 30
DURATION = 15.0
BPM = 128
BEAT = 60.0 / BPM          # 0.46875 s
BAR = 4 * BEAT             # 1.875 s -> 8 bars = 15 s

# text beats (seconds)
T_LOGO, T_ESTD, T_ORN = 0.50, 1.30, 1.70
T_HAPPY = 2.30             # + 0.13 s per letter
T_DIWALI = 2 * BAR         # 3.75 s, lands on the downbeat where the groove drops in
T_TAG1, T_TAG2 = 3 * BAR, 3 * BAR + 2 * BEAT      # 5.625, 6.5625
GROOVE_IN = T_DIWALI

COLORS = {
    'gold': ((1.00, 0.78, 0.30), (1.00, 0.50, 0.15)),
    'magenta': ((1.00, 0.30, 0.65), (0.70, 0.15, 0.55)),
    'cyan': ((0.35, 0.88, 1.00), (0.20, 0.45, 1.00)),
    'orange': ((1.00, 0.55, 0.15), (1.00, 0.25, 0.10)),
    'green': ((0.45, 1.00, 0.55), (0.15, 0.75, 0.50)),
    'white': ((1.00, 0.97, 0.90), (1.00, 0.80, 0.50)),
    'violet': ((0.70, 0.45, 1.00), (0.40, 0.25, 0.95)),
    'red': ((1.00, 0.28, 0.22), (1.00, 0.55, 0.20)),
}

def build_fireworks():
    """(t, x, y, size_px, kind, colour) in frame px. Sky is roughly y < 780; keep bursts out of the lower-centre."""
    fw = [
        (1.00, 170, 430, 220, 'peony', 'gold'),
        (1.90, 925, 340, 240, 'ring', 'magenta'),
        (2.80, 140, 230, 210, 'peony', 'cyan'),
        (3.30, 930, 600, 200, 'peony', 'orange'),
        (T_DIWALI, 540, 250, 400, 'willow', 'gold'),
        (T_DIWALI + 0.47, 900, 500, 240, 'peony', 'orange'),
        (T_DIWALI + 0.94, 170, 560, 240, 'ring', 'green'),
        (T_DIWALI + 1.40, 930, 170, 230, 'peony', 'white'),
        (T_TAG1, 120, 330, 260, 'peony', 'magenta'),
    ]
    rng = np.random.RandomState(7)
    zones = [(90, 330, 150, 660), (770, 1000, 130, 620), (380, 700, 80, 230), (60, 260, 380, 700), (820, 1020, 300, 720)]
    kinds = ['peony', 'peony', 'ring', 'peony', 'willow', 'peony']
    cols = ['gold', 'magenta', 'cyan', 'orange', 'green', 'white', 'violet', 'red', 'gold']
    t, i = T_TAG1 + BEAT, 0
    while t < 13.0:
        bar_i = (t - T_TAG1) / BAR
        n = 1 if bar_i < 1.6 else 2
        for k in range(n):
            z = zones[(i * 2 + k * 3 + int(rng.randint(0, 2))) % len(zones)]
            x = rng.uniform(z[0], z[1]); y = rng.uniform(z[2], z[3])
            kind = kinds[rng.randint(len(kinds))]
            size = rng.uniform(190, 290) * (1.2 if kind == 'willow' else 1.0)
            fw.append((t + k * BEAT / 2, x, y, size, kind, cols[rng.randint(len(cols))]))
        t += BEAT if bar_i < 1.6 else BEAT * 1.0
        i += 1
    # grand finale on the last bar
    F = 7 * BAR
    fw += [
        (F, 540, 300, 430, 'willow', 'gold'),
        (F + 0.25, 150, 330, 280, 'peony', 'magenta'),
        (F + 0.25, 930, 330, 280, 'peony', 'cyan'),
        (F + 0.55, 330, 180, 260, 'ring', 'white'),
        (F + 0.55, 750, 180, 260, 'ring', 'orange'),
        (F + 0.90, 110, 560, 250, 'peony', 'green'),
        (F + 0.90, 960, 560, 250, 'peony', 'violet'),
        (F + 1.15, 540, 160, 360, 'peony', 'gold'),
    ]
    fw.sort(key=lambda r: r[0])
    return fw

FIREWORKS = build_fireworks()
