"""Cut, crop (9:16) and conform the licensed stock footage into the clips the
film uses (film/public/clips/<role>.mp4, 1080x1920, 30 fps, no audio).

ROLES: role -> (source file in footage/raw, start s, duration s, horizontal
crop centre 0..1, speed[, zoom, vertical centre 0..1]). zoom > 1 punches in
(e.g. to crop out a laptop dock). Stills (jpg/png) become a 1080x1920 clip.
"""
import os, subprocess, json

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, '..', '..', 'footage', 'raw')
OUT = os.path.join(HERE, '..', 'public', 'clips')

ROLES = {
    # S1 hook
    's1_aerial':   ('01_aerial_golden_fields_backlit_a.mp4', 2.0, 2.0, 0.45, 1.0),
    's1_straw':    ('02_golden_reeds_wind_closeup_a.mp4', 3.0, 1.3, 0.50, 1.0),
    's1_hand':     ('03_hands_soil_backlit_sun_b.mp4', 5.4, 1.1, 0.42, 1.0),
    's1_overhead': ('04_aerial_wheat_field_topdown_b.mp4', 0.5, 1.2, 0.50, 1.0),
    # S2 problem (left = suppliers, right = buyers)
    's2_bales':    ('05_photo_round_hay_bales_field_c.jpg', 0, 2.5, 0.42, 1.0),
    's2_pellets':  ('06_sawdust_falling_into_machine_a.mp4', 1.0, 2.5, 0.50, 1.0),
    's2_tractor':  ('10_aerial_truck_road_harvested_fields_a.mp4', 4.0, 3.8, 0.50, 1.0),  # trailer logo legible before 3 s
    's2_boiler':   ('07_roaring_fire_furnace_d.mp4', 2.0, 3.0, 0.50, 1.0),
    's2_buyer':    ('07_power_plant_smoke_stacks_a.mp4', 3.0, 2.5, 0.40, 1.0),
    's2_plant':    ('07_power_plant_chimneys_b.mp4', 1.0, 3.3, 0.55, 1.0),
    # S4 offer
    's4_left':     ('03_paddy_field_harvesters_golden_d.mp4', 2.0, 3.8, 0.50, 1.0),
    's4_right':    ('10_woodpiles_warehouse_storage_d.mp4', 1.0, 3.8, 0.55, 1.0),
    's4_pellets':  ('06_photo_wood_pellets_closeup_vertical_a.jpg', 0, 4.5, 0.50, 1.0),
    's4_briq':     ('06_photo_sawdust_briquettes_b.jpg', 0, 3.0, 0.50, 1.0),
    's4_bales':    ('05_photo_round_straw_bale_bavaria_d.jpg', 0, 4.0, 0.42, 1.0),
    's4_machine':  ('07_wood_processing_factory_c.mp4', 3.0, 4.0, 0.50, 1.0),
    # S6 purpose
    's6_field':    ('03_rice_harvest_workers_field_c.mp4', 2.0, 2.4, 0.50, 1.0),
    's6_supplier': ('03_hands_harvesting_rice_sickle_a.mp4', 4.5, 2.4, 0.38, 1.0),
    's6_industry': ('07_power_plant_chimneys_b.mp4', 5.5, 2.4, 0.62, 1.0),
    # S7 finale
    's7_aerial':   ('01_aerial_barley_field_sunset_b.mp4', 0.5, 2.6, 0.50, 1.0),
}


def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
                        '-of', 'json', path], capture_output=True, text=True, check=True)
    s = json.loads(r.stdout)['streams'][0]
    return s['width'], s['height']


def prep(role, src, start, dur, cx, speed, zoom=1.0, cy=0.5):
    path = os.path.join(RAW, src)
    out = os.path.join(OUT, f'{role}.mp4')
    w, h = probe(path)
    still = src.lower().endswith(('.jpg', '.jpeg', '.png'))
    # largest 9:16 window inside the source, centred at cx
    if w / h > 9 / 16:
        cw, ch = int(h * 9 / 16) // 2 * 2, h
    else:
        cw, ch = w, int(w * 16 / 9) // 2 * 2
    cw, ch = int(cw / zoom) // 2 * 2, int(ch / zoom) // 2 * 2
    x = int(max(0, min(w - cw, cx * w - cw / 2)))
    y = int(max(0, min(h - ch, cy * h - ch / 2)))
    vf = [f'crop={cw}:{ch}:{x}:{y}', 'scale=1080:1920:flags=lanczos']
    if cw < 1000:  # upscaled from HD: a light sharpen keeps it crisp
        vf.append('unsharp=5:5:0.45:5:5:0.0')
    if speed != 1.0:
        vf.append(f'setpts=PTS/{speed}')
    vf += ['fps=30', 'format=yuv420p']
    inp = ['-loop', '1', '-t', str(dur), '-i', path] if still else ['-ss', str(start), '-t', str(dur * speed), '-i', path]
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', *inp, '-an', '-vf', ','.join(vf),
           '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-g', '15', '-t', str(dur), out]
    subprocess.run(cmd, check=True)
    print(f'{role:12s} <- {src} [{start}s +{dur}s] crop {cw}x{ch}@{x}')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for role, spec in ROLES.items():
        prep(role, *spec)
