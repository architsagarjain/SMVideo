"""9:16 clips used only by the reels (fresh shots, not repeated from the brand film)."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'film', 'scripts'))
from prep_footage import prep

ROLES = {
    'r_plant_sunset': ('07_power_plant_smoke_stacks_a.mp4', 12.0, 4.0, 0.30, 1.0),
    'r_sparks':       ('12_bonfire_sparks_a.mp4', 1.5, 3.0, 0.50, 1.0),
    'r_furnace':      ('07_roaring_fire_furnace_d.mp4', 6.0, 5.0, 0.50, 1.0),
    'r_trucks':       ('10_aerial_truck_road_harvested_fields_a.mp4', 8.5, 4.0, 0.50, 1.0),
    'r_bales_field':  ('05_photo_round_hay_bales_field_c.jpg', 0, 3.0, 0.30, 1.0),
    'r_lathe':        ('08_lathe_cutting_cylinder_b.mp4', 2.0, 3.0, 0.55, 1.0),
    'r_embers':       ('12_fire_particles_embers_b.mp4', 2.0, 6.0, 0.50, 1.0),
    'r_shavings':     ('06_factory_machine_wood_shavings_b.mp4', 4.0, 3.0, 0.28, 1.0),
    'r_pellets_hands': ('06_photo_pellets_in_hands_c.jpg', 0, 3.0, 0.5, 1.0),
    'r_road_sunset':  ('11_aerial_road_sunset_symmetrical_a.mp4', 1.0, 5.0, 0.50, 1.0),
}
if __name__ == '__main__':
    for role, spec in ROLES.items():
        prep(role, *spec)
