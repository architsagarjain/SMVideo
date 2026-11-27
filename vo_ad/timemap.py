"""Piecewise speed map for the ad (source seconds -> output seconds). speed < 1 slows down."""
SEGS = [(0.00, 9.52, .88), (9.52, 11.28, .62), (11.28, 26.48, .88), (26.48, 30.16, .70)]
def new_t(t):
    out = 0.0
    for a, b, sp in SEGS:
        if t <= a: break
        out += (min(t, b) - a) / sp
    return out
