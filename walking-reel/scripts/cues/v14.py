"""Sound cues for the desk-day reel (src/v14/config.ts) (source seconds). Only sounds from the user's SFX pack (sfx/pack)."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    cue(1.1, "pack:whoosh_soft", -25)
    cue(2.36, "pack:whoosh_fast2", -22)
    cue(4.2, "pack:whoosh_fast", -24)
    cue(4.64, "pack:whoosh_soft", -27)
    cue(6.18, "pack:tick", -24)
    cue(8.78, "pack:hit", -22)
    cue(10.4, "pack:whoosh_fast2", -24)
    cue(10.94, "pack:tick", -24)
    for j in range(8):
        cue(12.3 + j * 0.09, "pack:tick", -29)
    cue(16.0, "pack:whoosh_soft", -25)
    for j in range(8):
        cue(16.5 + j * 0.12, "pack:tick", -28)
    cue(19.68, "pack:tick", -24)
    cue(21.0, "pack:whoosh_fast", -24)
    cue(23.0, "pack:whoosh_soft", -27)
    cue(24.8, "pack:whoosh_soft", -27)
    cue(28.14, "pack:hit", -19)
    cue(29.9, "pack:whoosh_fast2", -24)
    cue(30.44, "pack:chime2", -25)
    cue(32.84, "pack:tick", -23)
    cue(36.02, "pack:tick", -23)
    cue(37.0, "pack:whoosh_fast", -24)
    for j in range(4):
        cue(38.3 + j * 0.15, "pack:tick", -27)
    cue(43.4, "pack:whoosh_soft", -25)
    cue(45.9, "pack:whoosh_fast2", -24)
    cue(49.58, "pack:notif", -19)
    cue(51.04, "pack:tick", -24)
    cue(53.4, "pack:whoosh_fast2", -22)
    cue(54.06, "pack:tick", -24)
    cue(55.96, "pack:tick", -24)
    cue(56.7, "pack:whoosh_fast", -24)
    cue(57.62, "pack:hit", -22)
    cue(59.24, "pack:whoosh_soft", -25)
    cue(59.9, "pack:chime2", -25)
    cue(60.8, "pack:whoosh_fast", -24)
    for j in range(18):
        cue(61.86 + j * 0.04, "pack:tick", -31)
    cue(64.88, "pack:hit", -22)
    cue(70.6, "pack:whoosh_soft", -25)
    for j in range(5):
        cue(71.28 + j * 0.07, "pack:key", -27)
    cue(71.9, "pack:whoosh_fast", -25)
    cue(72.46, "pack:notif", -21)
