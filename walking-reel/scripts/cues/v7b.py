"""Sound cues for the phone-style snack reel (source seconds, src/v7b/config.ts). Phone-ish sounds
from the user's SFX pack: notifications, key taps, clicks, soft whooshes on app switches."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []

ITEMS = [(7.72, 9), (9.3, 5), (12.0, 18), (14.18, 11), (17.18, 14)]  # (typing starts, characters)


def cues(cue, rng):
    # hook: a notification banner on frame one
    cue(0.92, "pack:notif", -16)
    cue(1.4, "pack:whoosh_soft", -24)  # pull back to reveal the phone
    # chat bubbles
    cue(4.88, "pack:tick", -20)
    cue(5.98, "pack:chime2", -24)
    # Notes: she shrinks into a window, the list gets typed
    cue(7.2, "pack:whoosh_soft", -24)
    for at, n in ITEMS:
        for j in range(0, n, 2):
            cue(at + j * 0.035, "pack:key", -24)
    # Calculator: every key press, then the result
    cue(19.84, "pack:whoosh_fast", -25)
    for j in range(14):
        cue(19.98 + j * 0.09, "pack:tick", -25)
    cue(22.3, "pack:hit", -21)
    cue(22.86, "pack:chime2", -26)
    # zoom through the screen to full-frame, then back out
    cue(23.86, "pack:whoosh_cine", -21)
    cue(25.66, "pack:hit", -21)
    cue(27.36, "pack:chime2", -25)
    # Notes again: the foods aren't the problem, green ticks
    cue(28.6, "pack:whoosh_deep", -22)
    for j in range(0, 27, 3):
        cue(29.28 + j * 0.04, "pack:key", -25)
    for i in range(5):
        cue(31.98 + i * 0.12, "pack:tick", -22)
    cue(32.28, "pack:chime", -26)
    # the alert
    cue(33.3, "pack:whoosh_soft", -26)
    cue(34.36, "pack:notif", -20)
    cue(36.62, "pack:hit", -26)
    cue(37.85, "pack:tick", -20)
    # Instagram story
    cue(38.5, "pack:whoosh_fast2", -23)
    cue(39.08, "pack:hit", -23)
    cue(40.14, "pack:tick", -22)
    # Calendar: snacks fill the day, then three meals
    cue(40.85, "pack:whoosh_soft", -24)
    for i in range(13):
        cue(41.74 + i * 0.09, "pack:tick", -31)
    cue(43.1, "pack:chime", -24)
    # Instagram reel: comment sheet, typing, send, the guide arrives
    cue(44.9, "pack:whoosh_deep", -23)
    cue(45.14, "pack:whoosh_soft", -26)
    for i in range(5):
        cue(45.5 + i * 0.08, "pack:key", -19)
    cue(46.1, "pack:tick", -19)
    cue(47.18, "pack:notif", -18)
