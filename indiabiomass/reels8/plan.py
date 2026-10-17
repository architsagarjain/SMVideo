"""Beat plan for the 8 reels (visual timeline). Times are estimates from word counts until the VO exists."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
WPS, GAP, END = 2.55, 0.35, 3.0   # words/sec, pause between lines, end-card hold

# Each beat: (first line, last line (inclusive), kind, visual, broll need index or None)
# kind: open | footage | graphic | split | map | quiz | brand
V = {
 1: dict(title='One bale’s journey', fmt='Story', look='Route map: warm documentary footage full-bleed, a gold route bar along the top fills station by station (5 stations).', beats=[
   (0, 0, 'open', 'Push-in on a single paddy-straw bale. Hook text: WHERE DOES THIS BALE GO?', 1),
   (1, 1, 'footage', 'Baler packing straw in the field. Route bar appears; station 1 BALER lights.', 2),
   (2, 2, 'footage', 'Bales stacked under cover at a depot. Station 2 AGGREGATOR.', 3),
   (3, 3, 'footage', 'Loaded truck on a rural highway, then pellets pouring from the mill. Station 3 PELLET PLANT.', 4),
   (4, 4, 'graphic', 'Pellets close-up; three spec chips tick in: HEAT VALUE · MOISTURE · ASH. Cut to plant at dusk. Station 4-5.', 6),
   (5, 6, 'graphic', 'Five role cards (farmer, baler, aggregator, pellet maker, buyer) snap into a chain; links glow one by one.', None),
   (7, 7, 'brand', 'Chain resolves into the IndiaBiomass mark, end card.', None)]),
 2: dict(title='Four myths', fmt='Myth vs fact', look='Flip cards: each myth is a card with a red MYTH stamp that flips to a green FACT side; darkened footage behind; counter 1/4 to 4/4.', beats=[
   (0, 0, 'open', 'Hook text: 4 THINGS PEOPLE GET WRONG ABOUT BIOMASS over quick 3-shot montage.', 1),
   (1, 2, 'footage', 'MYTH 1 card over a residue heap; flips to FACT over bagged fuel, with a mini spec-sheet + price-tag icon.', 2),
   (3, 4, 'footage', 'MYTH 2 card over a small workshop; FACT side shows a tender notice with an M-S-E badge.', 3),
   (5, 6, 'graphic', 'MYTH 3 over three different residue textures; FACT side: three gauges (moisture, ash, heat) at different levels.', 4),
   (7, 8, 'map', 'MYTH 4 over a busy market; FACT side: India map with region dots pulsing at different sizes and a season dial (no numbers).', 5),
   (9, 9, 'brand', 'Cards stack into the IndiaBiomass card; end card.', None)]),
 3: dict(title='Pellet or briquette?', fmt='This or that', look='Split screen: the frame is cut vertically, PELLET left and BRIQUETTE right with a VS chip; a scoreboard fills row by row.', beats=[
   (0, 0, 'split', 'Hook: PELLET or BRIQUETTE? Both halves slide in, VS chip lands.', 1),
   (1, 1, 'split', 'Left half grows to 70%: pellets pouring; pencil-stub size comparison; row SIZE / FEEDING ticks; power-plant icon.', 1),
   (2, 2, 'split', 'Right half grows: briquette logs; icons for boiler, brick kiln, factory.', 2),
   (3, 4, 'split', 'Scoreboard rows: RAW MATERIAL (fine & dry vs coarser), PLANT COST (higher vs simpler), with machinery footage in each half.', 5),
   (5, 6, 'graphic', 'Question card: WHICH ONE SHOULD YOU MAKE? Two answer chips: YOUR RAW MATERIAL + BUYERS NEAR YOU.', None),
   (7, 7, 'brand', 'Both halves merge into the logo; end card.', None)]),
 4: dict(title='Biomass map of India', fmt='Map tour', look='Map flight: the India map fills the screen; the camera flies to each region, a photo chip pops out of the state with the residue name.', beats=[
   (0, 0, 'map', 'Full India map, all regions glow in different colours. Hook: WHAT DOES YOUR STATE GROW?', None),
   (1, 1, 'map', 'Fly to Punjab & Haryana; chip: PADDY STRAW.', None),
   (2, 2, 'map', 'Fly to Rajasthan; chip: MUSTARD HUSK (mustard field footage in chip).', 1),
   (3, 3, 'map', 'Gujarat & Maharashtra; chips: COTTON STALKS, GROUNDNUT SHELLS.', 2),
   (4, 4, 'map', 'Uttar Pradesh & Maharashtra; chip: BAGASSE (sugarcane footage).', 3),
   (5, 5, 'map', 'South; chips: COCONUT SHELLS, RICE HUSK.', 4),
   (6, 7, 'footage', 'Long highway footage; a dashed line stretches between two far-apart pins: SUPPLY ↔ DEMAND.', 7),
   (8, 9, 'brand', 'Pins connect across the map, logo; prompt WHICH ONE GROWS NEAR YOU? (comments).', None)]),
 5: dict(title='What buyers check', fmt='Checklist', look='Inspection sheet: light paper background with forest-green ink (the only light reel); footage sits in rounded frames; five checkboxes tick down a clipboard.', beats=[
   (0, 0, 'open', 'Clipboard slides up: 5 CHECKS BEFORE A BUYER PAYS YOU.', 6),
   (1, 1, 'footage', '☐ MOISTURE ticks; frame: water on grain / wet material.', 1),
   (2, 2, 'footage', '☐ G-C-V ticks; frame: clean flame; mini gauge with MIN mark.', 2),
   (3, 3, 'footage', '☐ ASH ticks; frame: ash falling.', 3),
   (4, 4, 'footage', '☐ SIZE ticks; frame: measuring / uniform pellets; caliper icon.', 4),
   (5, 5, 'footage', '☐ CONSISTENCY ticks; frame: row of identical trucks / conveyor.', 5),
   (6, 7, 'graphic', 'Full clipboard, all five ticked; SCREENSHOT THIS stamp.', None),
   (8, 8, 'brand', 'Logo on paper; end card.', None)]),
 6: dict(title='The harvest window', fmt='Countdown', look='Two endings: a countdown ring runs the whole reel; the first half is grey and hazy, then the film rewinds and replays in warm gold.', beats=[
   (0, 0, 'open', 'Combine harvester cutting paddy; countdown ring starts. Text: THE CLOCK STARTS.', 1),
   (1, 2, 'footage', 'Ring shows A FEW WEEKS; loose straw over the field; colours drain to grey.', 4),
   (3, 4, 'footage', 'Match strike close-up, then haze over farmland at dusk (grey grade).', 3),
   (5, 5, 'graphic', 'Rewind effect (scan lines run backwards); colour returns gold. Text: WITH A PLAN.', None),
   (6, 7, 'footage', 'Tractor/baler at golden hour; bales; sowing / green shoots. Ring ticks with icons: BALER · AGGREGATOR · CLEAR FIELD.', 5),
   (8, 9, 'graphic', 'Split: grey ending vs gold ending side by side. Text: SAME FIELD. DIFFERENT ENDING.', 6),
   (10, 10, 'brand', 'Logo; end card.', None)]),
 7: dict(title='Guess the biomass', fmt='Quiz', look='Quiz show: a big number, a blurred extreme close-up with a 3-2-1 timer ring, then a pull-back reveal with the name and a score dot.', beats=[
   (0, 0, 'quiz', 'Hook: GUESS THE BIOMASS · 4 CLOSE-UPS; four blurred tiles.', None),
   (1, 2, 'quiz', '#1 blurred rice husk → reveal RICE HUSK; context shot of a rice mill.', 1),
   (3, 4, 'quiz', '#2 blurred bagasse → reveal BAGASSE; sugarcane crushing context.', 2),
   (5, 6, 'quiz', '#3 blurred mustard husk → reveal MUSTARD HUSK.', 3),
   (7, 8, 'quiz', '#4 blurred coconut shell → reveal COCONUT SHELL.', 4),
   (9, 9, 'graphic', 'Four revealed tiles in a grid; HOW MANY DID YOU GET? comment prompt.', None),
   (10, 10, 'brand', 'Logo; end card.', None)]),
 8: dict(title='Why we’re building IndiaBiomass', fmt='Manifesto', look='Noise to signal: starts loud and cluttered (generic chat bubbles, missed calls, ringing phone), then everything clears into quiet type on forest green and real IndiaBiomass screens.', beats=[
   (0, 1, 'open', 'Person on phone; generic chat bubbles and missed-call chips pile up (no WhatsApp branding).', 1),
   (2, 3, 'graphic', 'Price tag with a question mark; text: THEY FIND OUT AFTER THE DEAL.', 2),
   (4, 4, 'footage', 'Three quick shots: power plant, factory boiler, farmer with straw.', 3),
   (5, 6, 'graphic', 'Noise clears; two dots (SUPPLY, DEMAND) and a missing link that draws itself. SO WE ARE BUILDING IT.', None),
   (7, 10, 'graphic', 'Four feature cards from the real site captures: verified listings, tenders, prices, supply & policy.', None),
   (11, 11, 'brand', 'Logo with descriptor; end card.', None)]),
}

def timeline(n):
    lines = [l.strip() for l in open(f'{HERE}/scripts/v{n}.txt') if l.strip()]
    t, starts = 0.4, []
    for l in lines:
        d = len(l.split()) / WPS
        starts.append((t, t + d)); t += d + GAP
    total = t - GAP + END
    beats = []
    for a, b, kind, vis, need in V[n]['beats']:
        beats.append(dict(t0=round(starts[a][0] if a else 0, 1), t1=round(starts[b][1] + (END if b == len(lines) - 1 else GAP), 1),
                          vo=' '.join(lines[a:b + 1]), kind=kind, visual=vis, need=need))
    return dict(n=n, **{k: V[n][k] for k in ('title', 'fmt', 'look')}, total=round(total, 1), beats=beats)

if __name__ == '__main__':
    out = [timeline(n) for n in V]
    json.dump(out, open(f'{HERE}/plan.json', 'w'), indent=1, ensure_ascii=False)
    for v in out: print(v['n'], v['title'], v['total'], 's', len(v['beats']), 'beats')
