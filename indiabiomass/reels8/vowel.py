"""Measure the 'a' vowel in each spoken 'biomass' (F1/F2 formants) to tell /æ/ (mass) from /ɑː/ (maas)."""
import subprocess, sys, numpy as np, parselmouth
from faster_whisper import WhisperModel
M = WhisperModel('small.en', compute_type='int8')

def load(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)

def biomass_vowels(f):
    a = load(f)
    segs, _ = M.transcribe(a, word_timestamps=True)
    snd = parselmouth.Sound(a.astype(np.float64), 16000)
    fm = snd.to_formant_burg(max_number_of_formants=5, maximum_formant=5000)
    pitch = snd.to_pitch()
    out = []
    for s in segs:
        for w in s.words:
            if 'bio' in w.word.lower() or 'mass' in w.word.lower():
                # 'mass' is the last ~45% of the word; take voiced frames in its middle part
                t0 = w.start + (w.end - w.start) * 0.55; t1 = w.start + (w.end - w.start) * 0.85
                ts = np.linspace(t0, t1, 12)
                vals = [(fm.get_value_at_time(1, t), fm.get_value_at_time(2, t)) for t in ts if pitch.get_value_at_time(t) == pitch.get_value_at_time(t)]
                vals = [v for v in vals if v[0] == v[0] and v[1] == v[1]]
                if vals:
                    f1, f2 = np.median([v[0] for v in vals]), np.median([v[1] for v in vals])
                    out.append((w.word.strip(), round(w.start, 2), round(w.end, 2), int(f1), int(f2), round(w.end - w.start, 2)))
    return out

if __name__ == '__main__':
    for f in sys.argv[1:]:
        print(f)
        for r in biomass_vowels(f): print('  %-16s %5.2f-%5.2f  F1=%4d F2=%4d dur=%.2f' % r)
