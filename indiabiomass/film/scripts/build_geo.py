"""Build India outline + interior sample points for the film from the DataMeet
India composite boundary (Survey of India compliant outline, CC BY 4.0).
Output: src/data/india.json in a 1000-unit wide projected space."""
import json, math, random, os
from shapely.geometry import shape, Point
from shapely.ops import unary_union
from shapely.prepared import prep

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'public', 'geo', 'india-composite.geojson')
OUT = os.path.join(HERE, '..', 'src', 'data', 'india.json')

g = unary_union([shape(f['geometry']) for f in json.load(open(SRC))['features']])
LAT0 = 22.0
K = math.cos(math.radians(LAT0))
minx, miny, maxx, maxy = g.bounds
W = 1000.0
S = W / ((maxx - minx) * K)
H = (maxy - miny) * S

def proj(lon, lat):
    return ((lon - minx) * K * S, (maxy - lat) * S)

polys = sorted(g.geoms, key=lambda p: -p.area)
paths = []
for p in polys:
    if p.area < 0.002:
        continue
    tol = 0.025 if p.area > 1 else 0.01
    q = p.simplify(tol, preserve_topology=True)
    pts = [proj(x, y) for x, y in q.exterior.coords]
    d = 'M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + 'Z'
    paths.append({'d': d, 'main': p is polys[0], 'area': p.area,
                  'pts': [[round(x, 1), round(y, 1)] for x, y in pts]})

# Interior points for particle formations (mainland + all)
rnd = random.Random(7)
pg = prep(g)
interior = []
while len(interior) < 2600:
    lon = rnd.uniform(minx, maxx); lat = rnd.uniform(miny, maxy)
    if pg.contains(Point(lon, lat)):
        interior.append([round(v, 1) for v in proj(lon, lat)])

# Outline sample points (evenly spaced along the main boundary)
main = polys[0].simplify(0.01)
ring = main.exterior
outline = []
N = 900
for i in range(N):
    pt = ring.interpolate(i / N, normalized=True)
    outline.append([round(v, 1) for v in proj(pt.x, pt.y)])

# Real places used as network nodes (no claims attached, just geography).
cities = {
    'Ludhiana': (75.85, 30.90), 'Amritsar': (74.87, 31.63), 'Bathinda': (74.95, 30.21),
    'Karnal': (76.99, 29.69), 'Panipat': (76.97, 29.39), 'Delhi': (77.21, 28.61),
    'Noida': (77.33, 28.54), 'Jaipur': (75.79, 26.91), 'Kota': (75.86, 25.18),
    'Lucknow': (80.95, 26.85), 'Kanpur': (80.33, 26.45), 'Gorakhpur': (83.37, 26.76),
    'Patna': (85.14, 25.59), 'Ranchi': (85.33, 23.34), 'Kolkata': (88.36, 22.57),
    'Guwahati': (91.74, 26.14), 'Bhubaneswar': (85.82, 20.30), 'Raipur': (81.63, 21.25),
    'Singrauli': (82.67, 24.20), 'Bhopal': (77.41, 23.26), 'Indore': (75.86, 22.72),
    'Ahmedabad': (72.57, 23.02), 'Rajkot': (70.80, 22.30), 'Surat': (72.83, 21.17),
    'Mumbai': (72.88, 19.08), 'Pune': (73.86, 18.52), 'Nagpur': (79.09, 21.15),
    'Aurangabad': (75.34, 19.88), 'Hyderabad': (78.49, 17.39), 'Vijayawada': (80.65, 16.51),
    'Bengaluru': (77.59, 12.97), 'Chennai': (80.27, 13.08), 'Coimbatore': (76.96, 11.02),
    'Kochi': (76.27, 9.93), 'Madurai': (78.12, 9.93), 'Visakhapatnam': (83.22, 17.69),
    'Dehradun': (78.03, 30.32), 'Srinagar': (74.80, 34.08), 'Jammu': (74.86, 32.73),
    'Varanasi': (82.97, 25.32), 'Jodhpur': (73.02, 26.24), 'Belagavi': (74.50, 15.85),
    'Mangaluru': (74.86, 12.91), 'Siliguri': (88.40, 26.73), 'Jabalpur': (79.93, 23.18),
}
nodes = {k: [round(v, 1) for v in proj(*ll)] for k, ll in cities.items()}
# approximate state anchor points for the supply-board markers
states = {'Punjab': (75.4, 30.85), 'Haryana': (76.2, 29.15), 'Uttar Pradesh': (80.6, 27.0),
          'Gujarat': (71.8, 22.6), 'Maharashtra': (75.9, 19.5), 'Tamil Nadu': (78.5, 11.0)}
states = {k: [round(v, 1) for v in proj(*ll)] for k, ll in states.items()}

json.dump({'width': W, 'height': round(H, 1), 'paths': paths, 'interior': interior,
           'outline': outline, 'nodes': nodes, 'states': states}, open(OUT, 'w'))
print('ok', W, H, len(paths), sum(len(p['d']) for p in paths))
