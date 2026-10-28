import numpy as np, wave
from scipy.signal import butter, lfilter, fftconvolve
SR=44100; DUR=10.0; N=int(SR*DUR)
rng=np.random.default_rng(11)
L=np.zeros(N); R=np.zeros(N)
def mk(): return np.zeros(N)
def bus_add(bus,sig,t,gain=1.0):
    i=int(t*SR)
    if i>=N or i<0: return
    s=sig[:N-i]*gain; bus[i:i+len(s)]+=s
def lp(x,fc,o=2): b,a=butter(o,min(fc,20000)/(SR/2),'low'); return lfilter(b,a,x)
def hp(x,fc,o=2): b,a=butter(o,fc/(SR/2),'high'); return lfilter(b,a,x)
def bp(x,lo,hi): b,a=butter(2,[lo/(SR/2),hi/(SR/2)],'band'); return lfilter(b,a,x)
mf=lambda m:440*2**((m-69)/12)
BPM=124; BEAT=60/BPM; S16=BEAT/4

# ---------------- instruments ----------------
def dhol_bass():   # deep stick hit
    n=int(SR*0.45); t=np.arange(n)/SR
    f=60+90*np.exp(-t/0.035); ph=2*np.pi*np.cumsum(f)/SR
    body=np.sin(ph)*np.exp(-t/0.17)
    click=lp(rng.normal(0,1,n),3500)*np.exp(-t/0.006)*0.5
    return np.tanh(1.6*(body+click))*0.9
def dhol_tilli():  # thin stick side
    n=int(SR*0.12); t=np.arange(n)/SR
    return (bp(rng.normal(0,1,n),1800,6000)*np.exp(-t/0.022)*0.6+np.sin(2*np.pi*330*t)*np.exp(-t/0.05)*0.25)
def dholak_ge():
    n=int(SR*0.3); t=np.arange(n)/SR
    f=85+40*np.exp(-t/0.05); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/0.12)*0.8
def dholak_na():
    n=int(SR*0.18); t=np.arange(n)/SR
    return np.sin(2*np.pi*420*t)*np.exp(-t/0.06)*0.5+hp(rng.normal(0,1,n),3000)*np.exp(-t/0.008)*0.3
def shaker():
    n=int(SR*0.09); t=np.arange(n)/SR
    return bp(rng.normal(0,1,n),5000,12000)*np.minimum(t/0.008,1)*np.exp(-t/0.03)
def ghungroo():
    n=int(SR*0.25); t=np.arange(n)/SR
    x=np.zeros(n)
    for k in range(7):
        i=int(rng.uniform(0,0.03)*SR)+k*int(0.012*SR)
        if i<n-300:
            m=np.arange(300)/SR
            x[i:i+300]+=np.sin(2*np.pi*rng.uniform(5200,7600)*m)*np.exp(-m/0.012)
    return x*0.25
def flute(freq,dur,vib=0.0,amp=1.0,glide_from=None):
    n=int(SR*(dur+0.15)); t=np.arange(n)/SR
    f=np.full(n,freq)
    if glide_from: f=freq+(glide_from-freq)*np.exp(-t/0.05)
    f=f*(1+0.006*np.sin(2*np.pi*5.4*t)*np.minimum(t/0.35,1)*vib)
    ph=2*np.pi*np.cumsum(f)/SR
    s=np.sin(ph)+0.25*np.sin(2*ph)+0.08*np.sin(3*ph)
    breath=bp(rng.normal(0,1,n),freq*1.5,freq*5)*0.12
    e=np.minimum(t/0.045,1)*np.where(t<dur,1.0,np.exp(-(t-dur)/0.06))
    return (s+breath)*e*amp*0.5
def pad(freq,dur):
    n=int(SR*dur); t=np.arange(n)/SR
    s=0
    for d in (-0.07,0,0.07):   # slight detune saws, soft
        f=freq*2**(d/12)
        s=s+sum(np.sin(2*np.pi*f*k*t+rng.uniform(0,6))/k for k in range(1,9))
    s=lp(s,1800)
    return s*np.minimum(t/0.5,1)*np.minimum((dur-t)/0.4,1)*0.05
def bell(freq,dur=1.4):
    n=int(SR*dur); t=np.arange(n)/SR
    s=sum(a*np.sin(2*np.pi*freq*r*t)*np.exp(-t/d) for r,a,d in [(1,1,.7),(2.0,.45,.45),(3.0,.25,.3),(4.2,.12,.2)])
    return s*np.minimum(t/0.002,1)*0.3
def drone(freq,dur):
    t=np.arange(int(SR*dur))/SR
    s=np.sin(2*np.pi*freq*t)+0.5*np.sin(2*np.pi*2*freq*t)+0.25*np.sin(2*np.pi*3*freq*t)
    return s*0.05*np.minimum(t/1,1)*np.minimum((dur-t)/0.8,1)
def bassnote(freq,dur):
    n=int(SR*dur); t=np.arange(n)/SR
    return np.tanh(2*np.sin(2*np.pi*freq*t))*np.exp(-t/0.5)*np.minimum(t/0.01,1)*0.3

# ---------------- arrangement (C major / Bilawal, festive) ----------------
rhythm=mk(); lead=mk(); harm=mk(); sparkle=mk()
C=60
# chords per bar (bar = 4 beats). 124bpm => bar 1.935 s
chords=[(0,[0,4,7]),(1,[5,9,12]),(2,[7,11,14]),(3,[9,12,16]),(4,[0,4,7])]
roots=[0,5,7,9,0]
for bar,(ci,notes) in enumerate(chords):
    t0=bar*4*BEAT
    for nt in notes: bus_add(harm,pad(mf(C+nt-12),4*BEAT+0.5),t0,1.0)
    bus_add(harm,bassnote(mf(C+roots[bar]-24),4*BEAT*0.9),t0,0.9)
    if t0>=BEAT*4*0.75: bus_add(harm,bassnote(mf(C+roots[bar]-24),BEAT*0.9),t0+2*BEAT,0.7)
bus_add(harm,drone(mf(C-24),DUR),0,1.0); bus_add(harm,drone(mf(C-17),DUR),0,0.7)

# dhol groove (16ths): enters at 1.5s (DIWALI pop), fills near the end
dhol_pat  =['B','','','t','B','','t','', 'B','','','t','B','t','B','t']
dholak_pat=['g','','n','','g','n','','n','g','','n','','g','n','g','n']
start=1.45
for k in range(int((7.9-start)/S16)):
    t=start+k*S16; p=k%16
    if dhol_pat[p]=='B': bus_add(rhythm,dhol_bass(),t,0.55)
    elif dhol_pat[p]=='t': bus_add(rhythm,dhol_tilli(),t,0.12)
    if dholak_pat[p]=='g': bus_add(rhythm,dholak_ge(),t,0.3)
    elif dholak_pat[p]=='n': bus_add(rhythm,dholak_na(),t,0.12)
    bus_add(rhythm,shaker(),t,0.06 if p%2==0 else 0.03)
    if p%4==2: bus_add(rhythm,ghungroo(),t,0.25)
# bansuri lead — catchy rising pentatonic phrase (beats, midi offset from C5=72, len beats)
mel=[(0.0,4,.75),(0.75,7,.75),(1.5,9,.5),(2.0,7,1),(3.0,4,.5),(3.5,2,.5),
     (4.0,5,.75),(4.75,9,.75),(5.5,12,.5),(6.0,9,1),(7.0,7,.5),(7.5,5,.5),
     (8.0,7,.75),(8.75,11,.75),(9.5,14,.5),(10.0,12,1),(11.0,11,.5),(11.5,9,.5),
     (12.0,12,1),(13.0,9,.5),(13.5,7,.5),(14.0,9,.5),(14.5,12,.5),(15.0,14,.5),(15.5,16,.5),
     (16.0,12,3.0)]
off=1.2   # lead enters just before DIWALI lands
for b,m,ln in mel:
    t=off+b*BEAT
    if t>=DUR-0.5: continue
    d=min(ln*BEAT*0.95, DUR-0.4-t)
    bus_add(lead,flute(mf(72+m-12+12),d,vib=1.0,amp=0.9,glide_from=mf(72+m)*0.97),t,1.0)
# octave-doubled softer bell/glock on melody for sparkle
for b,m,ln in mel[::2]:
    t=off+b*BEAT
    if t<DUR-1.2: bus_add(sparkle,bell(mf(72+m),1.2),t,0.8)
# opening shimmer
for i,m in enumerate([0,4,7,12,16,19]): bus_add(sparkle,bell(mf(84+m),1.8),0.05+i*0.11,0.7)
bus_add(sparkle,bell(mf(96),3.0),9.45,0.7); bus_add(sparkle,bell(mf(84),3.0),9.45,0.7)

# ---------------- reverb & mix ----------------
def reverb_ir(sec=1.6):
    n=int(SR*sec); t=np.arange(n)/SR
    ir=rng.normal(0,1,n)*np.exp(-t/0.45); ir=lp(ir,6000); ir[0]=0
    return ir/np.abs(ir).sum()*8
IR=reverb_ir()
def wet(x): return fftconvolve(x,IR)[:N]
lead_s=lead+0.8*wet(lead)
spk_s =sparkle+0.9*wet(sparkle)
harm_s=harm+0.4*wet(harm)
rh_s  =rhythm+0.15*wet(rhythm)
# simple stereo: spread via short delay
def stereo(x,pan,delay_ms=0):
    d=int(delay_ms*SR/1000); y=np.roll(x,d); y[:d]=0
    return x*np.sqrt((1-pan)/2)*1.4, y*np.sqrt((1+pan)/2)*1.4
for sig,pan,dl in [(lead_s*2.2,0.15,6),(spk_s*1.1,-0.25,9),(harm_s*2.0,0,0),(rh_s*0.8,0,0)]:
    a,b=stereo(sig,pan,dl); L+=a; R+=b
# gentle sidechain-ish duck of pad/lead is skipped; master
t=np.arange(N)/SR
fade=np.minimum(t/0.25,1)*np.minimum((DUR-t)/0.7,1)
m=max(np.abs(L).max(),np.abs(R).max())
L=np.tanh(L/m*1.2)*fade*0.9; R=np.tanh(R/m*1.2)*fade*0.9
pcm=(np.stack([L,R],1)*32767).astype(np.int16)
with wave.open('audio.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
print('ok')
