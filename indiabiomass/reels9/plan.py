"""Beat plan for Videos 9-16 (visual timeline). Times are estimates from word counts until the VO exists."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
WPS, GAP, END = 2.6, 0.35, 5.5   # words/sec, pause between lines, shared finale end cut
V = {
 9: dict(title='Straw to pellet in six steps', fmt='How it’s made', look='Factory line: full-bleed machine footage; a steel conveyor strip along the bottom carries the material from station 1 to 6; a giant step number slams in for each stage.', beats=[
   (0, 0, 'open', 'Loose straw pile, then hard pellets: before/after wipe. Hook: FROM LOOSE STRAW TO A PELLET.', 1),
   (1, 1, 'footage', 'STEP 1 CLEANING: sorting conveyor; stones and metal icons drop out.', 2),
   (2, 2, 'footage', 'STEP 2 DRYING: dryer / sun-drying; a moisture bar falls.', 3),
   (3, 3, 'footage', 'STEP 3 GRINDING: hammer mill, powder pouring.', 4),
   (4, 4, 'footage', 'STEP 4 PRESSING: pellets extruding from the die (hero shot).', 5),
   (5, 5, 'footage', 'STEP 5 COOLING: steam rising off fresh pellets.', 6),
   (6, 6, 'footage', 'STEP 6 BAGGING: sacks filled and stacked.', 7),
   (7, 7, 'graphic', 'All six stations light up in a row: WASTE → FUEL.', 8),
   (8, 8, 'brand', 'Brand line, then the shared finale end cut.', None)]),
 10: dict(title='A day in the life of an aggregator', fmt='Day in the life', look='Clock day: a huge timestamp (5:00 AM → 9:00 PM) leads each scene; the sky colour behind the type shifts from dawn blue to night; a thin progress arc fills like a clock.', beats=[
   (0, 0, 'open', '5:00 AM over village sunrise; person on phone at dawn.', [1, 2]),
   (1, 1, 'footage', '8:00 AM: hands checking straw in the field; chip WET BALES LOSE VALUE.', 3),
   (2, 2, 'footage', '11:00 AM: two people agreeing terms in a field.', 4),
   (3, 3, 'footage', '2:00 PM: truck / trolley being loaded; split icons TOO FEW / TOO MANY.', 5),
   (4, 4, 'footage', '5:00 PM: evening phone call.', 6),
   (5, 5, 'footage', '9:00 PM: notebook under a lamp.', 7),
   (6, 6, 'graphic', 'Clock completes a full circle; ONE CALL AT A TIME.', None),
   (7, 7, 'brand', 'Brand line, then the shared finale end cut.', None)]),
 11: dict(title='Four red flags in a biomass deal', fmt='Warning list', look='Red alert: near-black and signal red; a red flag plants into the frame for each warning, a 1/4–4/4 counter; ends on a big green VERIFY stamp.', beats=[
   (0, 0, 'open', 'Dark smoke texture; four red flags drop in a row. Hook: 4 RED FLAGS.', 6),
   (1, 1, 'footage', 'FLAG 1 NO SPECS IN WRITING: contract close-up with blank spec lines.', 1),
   (2, 2, 'footage', 'FLAG 2 TOO-CHEAP PRICE: market haggling; price tag slashes down.', 2),
   (3, 3, 'footage', 'FLAG 3 FULL PAYMENT UPFRONT: cash counting; ? over the receiver.', 3),
   (4, 4, 'footage', 'FLAG 4 NO DELIVERY SCHEDULE: empty warehouse / blank calendar.', 4),
   (5, 5, 'graphic', '1 flag = ASK MORE · 2 flags = WALK AWAY (meter).', None),
   (6, 6, 'footage', 'Handshake; green VERIFY stamp.', 5),
   (7, 7, 'brand', 'Brand line, then the shared finale end cut.', None)]),
 12: dict(title='The biomass calendar', fmt='Seasonal wheel', look='Year wheel: a 12-month ring sits centre screen and rotates to each season; the active slice glows and its residue photo fills the wheel’s centre.', beats=[
   (0, 0, 'open', 'Seasons timelapse; the wheel draws on. Hook: WHAT’S IN SEASON?', 6),
   (1, 1, 'footage', 'OCT–NOV slice: paddy harvest (north).', 1),
   (2, 2, 'footage', 'NOV–APR slice: sugar mill crushing, bagasse.', 2),
   (3, 3, 'footage', 'WINTER slice: cotton picking / stalks.', 3),
   (4, 4, 'footage', 'FEB–APR slice: mustard threshing, wheat harvest.', 4),
   (5, 5, 'footage', 'ALL YEAR ring: rice mill, rice husk.', 5),
   (6, 7, 'graphic', 'IN SEASON = EASY · OUT OF SEASON = COMPETE; wheel spins once.', None),
   (8, 8, 'brand', 'Brand line, then the shared finale end cut.', None)]),
 13: dict(title='One new word: torrefaction', fmt='Science explainer', look='Word of the day: a dictionary entry (TOR·RE·FAC·TION, pronunciation, noun) on deep forest, then a before/after roast comparison and three benefit icons that light up.', beats=[
   (0, 0, 'open', 'Dictionary card types out the word as a furnace door opens.', '1b'),
   (1, 1, 'footage', 'Fire inside a kiln; labels HIGH HEAT · LITTLE OXYGEN · NOT BURNING.', '1a'),
   (2, 2, 'split', 'Before / after: raw pellet vs dark roasted pellet; ALMOST LIKE COAL.', 2),
   (3, 3, 'graphic', 'WHY IT MATTERS → three icon slots appear over a lab sample shot.', 6),
   (4, 4, 'graphic', 'Icon 1 lights: MORE HEAT PER KILO (flame) over a coal power plant.', 5),
   (5, 5, 'footage', 'Icon 2: water beads off; rain / droplets on material.', 3),
   (6, 6, 'footage', 'Icon 3: grinds easily; coal mill / conveyor at a plant.', 4),
   (7, 7, 'brand', 'Brand line, then the shared finale end cut.', None)]),
 14: dict(title='Same morning, two phones', fmt='Parallel stories', look='Two-screen: the frame is split top/bottom (not left/right), each half with its own clock and person; a gold line joins the halves at the end.', beats=[
   (0, 0, 'split', '7:00 AM in both halves; PUNJAB (top) / HARYANA (bottom).', None),
   (1, 1, 'split', 'Top: warehouse full of stock; chip NO BUYER.', 1),
   (2, 2, 'split', 'Bottom: factory boiler room; chip NO SUPPLIER.', 2),
   (3, 4, 'split', 'Top: woman on phone; bottom: man on phone; price chips scatter / NO REPLY.', [3, 4]),
   (5, 5, 'split', 'Evening: boiler running short / stock waiting in the rain.', [6, 5]),
   (6, 7, 'graphic', 'Halves slide apart: NOT SUPPLY. NOT DEMAND. THE CONNECTION.', None),
   (8, 8, 'brand', 'Gold line joins both halves; then the shared finale end cut.', None)]),
 15: dict(title='You asked', fmt='FAQ', look='Inbox: question cards arrive like messages from the audience; the answer types out under each; Q1/Q2/Q3 tabs at the top.', beats=[
   (0, 0, 'open', 'Three question cards stack in. Hook: 3 QUESTIONS WE GET ASKED.', 6),
   (1, 2, 'footage', 'Q1 card; answer YES over bales being collected and stored.', [1, 2]),
   (3, 4, 'footage', 'Q2 card; four factor chips (SEASON · REGION · QUALITY · DISTANCE) over a mandi.', 3),
   (5, 6, 'footage', 'Q3 card; answer over a highway; chip THE GAP WE ARE WORKING ON.', [5, 4]),
   (7, 7, 'graphic', 'Comment box: DROP YOUR QUESTION BELOW.', None),
   (8, 8, 'brand', 'Brand line, then the shared finale end cut.', None)]),
 16: dict(title='Five things you didn’t know', fmt='Rapid-fire facts', look='Countdown: a huge number (5→1) slams in with a fast punch-zoom on a new shot for every fact; quick cuts and the fastest pacing of the series.', beats=[
   (0, 0, 'open', 'Number wall flickers 1–5. Hook: 5 THINGS YOU DIDN’T KNOW.', None),
   (1, 1, 'footage', '#5 Sugar mills burn their own bagasse.', 1),
   (2, 2, 'footage', '#4 Rice husk ash in cement and steel.', 2),
   (3, 3, 'footage', '#3 Coconut shells become activated carbon.', [6, 3]),
   (4, 4, 'footage', '#2 Paddy straw becomes compressed biogas (CBG).', 4),
   (5, 5, 'footage', '#1 Pine needles pressed into briquettes.', 5),
   (6, 7, 'graphic', 'Five tiles shrink into a grid: A DOZEN WAYS. WHO NEEDS IT, AND WHERE?', None),
   (8, 8, 'brand', 'Brand line, then the shared finale end cut.', None)]),
}
def timeline(n):
    lines = [l.strip() for l in open(f'{HERE}/scripts/v{n}.txt') if l.strip()]
    t, st = 0.4, []
    for l in lines:
        d = len(l.split()) / WPS; st.append((t, t + d)); t += d + GAP
    total = t - GAP + END
    beats = [dict(t0=round(st[a][0] if a else 0, 1), t1=round(st[b][1] + (END if b == len(lines) - 1 else GAP), 1), vo=' '.join(lines[a:b + 1]), kind=k, visual=vis, need=need)
             for a, b, k, vis, need in V[n]['beats']]
    return dict(n=n, **{k: V[n][k] for k in ('title', 'fmt', 'look')}, total=round(total, 1), beats=beats)
if __name__ == '__main__':
    out = [timeline(n) for n in V]
    json.dump(out, open(f'{HERE}/plan.json', 'w'), indent=1, ensure_ascii=False)
    for v in out: print(v['n'], v['title'], v['total'], 's')
