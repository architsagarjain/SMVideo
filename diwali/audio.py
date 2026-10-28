import numpy as np, wave
from scipy.signal import butter, lfilter
from schedule import BURSTS, DUR
SR=44100; N=int(SR*DUR)
L=np.zeros(N); R=np.zeros(N)
rng=np.random.default_rng(3)
def add(sig,t,pan=0.0,gain=1.0):
    i=int(t*SR)
    if i>=N: return
    if i<0: sig=sig[-i:]; i=0
    pan=max(-0.99,min(0.99,pan))
    s=sig[:N-i]*gain
    L[i:i+len(s)]+=s*(1-pan)**0.5; R[i:i+len(s)]+=s*(1+pan)**0.5
def lp(x,fc,order=2):
    b,a=butter(order,fc/(SR/2),'low'); return lfilter(b,a,x)
def hp(x,fc):
    b,a=butter(2,fc/(SR/2),'high'); return lfilter(b,a,x)
def env(n,a=0.003,d=0.3):
    t=np.arange(n)/SR; e=np.minimum(t/a,1)*np.exp(-t/d); return e
def ks(freq,dur=1.6,bright=0.5,decay=0.996):
    n=int(SR*dur); p=int(SR/freq); buf=rng.uniform(-1,1,p)*np.hanning(p)**0.2
    buf=lp(buf,freq*6) if False else buf
    out=np.zeros(n)
    for i in range(n):
        out[i]=buf[i%p]; buf[i%p]=decay*(bright*buf[i%p]+(1-bright)*buf[(i+1)%p])
    return out
def sitar(freq,dur=1.5):
    s=ks(freq,dur,0.5,0.9965)
    # buzzy jawari: soft clip + harmonic
    s=np.tanh(2.2*s)*0.6
    return s*env(len(s),0.002,dur*0.5)
def bell(freq,dur=1.6):
    t=np.arange(int(SR*dur))/SR
    s=sum(a*np.sin(2*np.pi*freq*r*t)*np.exp(-t/d) for r,a,d in [(1,1,.9),(2.76,.5,.5),(5.4,.25,.3),(8.93,.12,.2)])
    return s*0.35
def tabla_dha(): # bayan + dayan
    n=int(SR*0.5); t=np.arange(n)/SR
    f=110*(1+1.2*np.exp(-t/0.06)); ph=2*np.pi*np.cumsum(f)/SR
    bayan=np.sin(ph)*np.exp(-t/0.16)
    dayan=np.sin(2*np.pi*392*t)*np.exp(-t/0.12)*0.5+hp(rng.normal(0,1,n),2000)*np.exp(-t/0.012)*0.4
    return (bayan*0.9+dayan)*0.8
def tabla_na():
    n=int(SR*0.3); t=np.arange(n)/SR
    return (np.sin(2*np.pi*392*t)*np.exp(-t/0.09)*0.6+hp(rng.normal(0,1,n),3000)*np.exp(-t/0.01)*0.35)*0.7
def tabla_ge():
    n=int(SR*0.4); t=np.arange(n)/SR
    f=95*(1+0.8*np.exp(-t/0.08)); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/0.12)*0.9
def dholak_clap():
    n=int(SR*0.18); return hp(rng.normal(0,1,n),1500)*np.exp(-np.arange(n)/SR/0.04)*0.5
def drone(freqs,dur):
    t=np.arange(int(SR*dur))/SR
    s=sum(np.sin(2*np.pi*f*t)+0.4*np.sin(2*np.pi*2*f*t)+0.2*np.sin(2*np.pi*3*f*t) for f in freqs)
    return s*0.06*np.minimum(t/1.0,1)*np.minimum((dur-t)/0.8,1)

# --- tempo: 120 BPM => beat 0.5s. 8 th = .25
BEAT=0.5
# Tanpura-ish drone (Sa=C3, Pa=G3)
d=drone([130.81,196.0,261.63],DUR); L+=d; R+=d
# Tabla pattern (teental-ish 8 steps per 2 beats feel): bars of 4 beats
pat=['dha','','na','na','ge','na','','na','dha','','na','na','dha','na','dha','na']  # 16 x 8th = 4 beats*... 
step=BEAT/2
for i in range(int(DUR/step)):
    s=pat[i%len(pat)]
    t=i*step+0.0
    if t<0.5: continue
    if s=='dha': add(tabla_dha(),t,0.1,0.7)
    elif s=='na': add(tabla_na(),t,-0.1,0.45)
    elif s=='ge': add(tabla_ge(),t,0.1,0.6)
# clap on 2&4 beats from 2.5s
for k in range(int(DUR/BEAT)):
    t=k*BEAT
    if t>=2.5 and k%2==1: add(dholak_clap(),t,0,0.5)
# Bhoopali raga: C D E G A (C5=523.25)
sa=261.63*2
sc={'S':1,'R':9/8,'G':5/4,'P':3/2,'D':5/3,"S'":2,"R'":9/4,"G'":5/2}
# phrase: (note, start beat, len)
mel=[('G',0,1),('R',1,.5),('R',1.5,.5),('S',2,1),('R',3,.5),('G',3.5,.5),
     ('P',4,1),('D',5,.5),('P',5.5,.5),("G",6,1),('R',7,.5),('R',7.5,.5),
     ("D",8,1),("P",9,.5),("G",9.5,.5),('P',10,1),('D',11,.5),("S'",11.5,.5),
     ("R'",12,1),("S'",13,.5),('D',13.5,.5),('P',14,1),('G',15,.5),('R',15.5,.5),
     ('S',16,1),('G',17,.5),('P',17.5,.5),("D",18,.5),("S'",18.5,.5),("G'",19,1)]
for note,b,ln in mel:
    t=0.5+b*BEAT*1.0  # starts after 0.5 s
    if t>=DUR-0.3: continue
    f=sa*sc[note]*0.5
    add(sitar(f,1.4),t,-0.15,0.55)
    add(sitar(f*2,1.0),t,0.2,0.18)  # octave shimmer
# Bell sparkles on every beat (diya chime)
chimes=[1,5/4,3/2,2,3/2,5/4]
for i,k in enumerate(range(int(DUR/BEAT))):
    if k*BEAT<1.0: continue
    add(bell(sa*2*chimes[i%len(chimes)],1.2),k*BEAT+0.25,rng.uniform(-.6,.6),0.25)
# Opening shimmer + closing gong
add(bell(523.25*2,3.0),0.0,0,0.5); add(bell(523.25*3,3.0),0.02,0.2,0.3)
add(bell(130.81,3.0),9.0,0,0.5)
# --- firework SFX
def whistle(dur=0.38):
    n=int(SR*dur); t=np.arange(n)/SR
    f=500+2200*(t/dur)**1.5; ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.minimum(t/0.05,1)*np.minimum((dur-t)/0.05,1)*0.10
def boom():
    n=int(SR*1.4); t=np.arange(n)/SR
    nz=lp(rng.normal(0,1,n),400)*np.exp(-t/0.35)*2.2
    f=70*np.exp(-t/0.25)+35; ph=2*np.pi*np.cumsum(f)/SR
    return nz*0.9+np.sin(ph)*np.exp(-t/0.3)*0.9
def crackle(dur=1.4):
    n=int(SR*dur); x=np.zeros(n)
    for _ in range(int(55)):
        i=int(rng.uniform(0.05,1)**2*(n-300))
        x[i:i+120]+=hp(rng.normal(0,1,120),2500)*np.hanning(120)*rng.uniform(.1,.5)
    return x
for (t,x,y,pal,size) in BURSTS:
    pan=(x-600)/700
    add(whistle(),t-0.38,pan*0.7,0.8)
    add(boom(),t,pan*0.6,0.55*size)
    add(crackle(),t+0.1,pan,0.55)
# master: soft limiter, fades
m=np.maximum(np.abs(L).max(),np.abs(R).max())
fade=np.minimum(np.arange(N)/SR/0.3,1)*np.minimum((DUR-np.arange(N)/SR)/0.8,1)
L=np.tanh(L/m*1.6)*fade*0.9; R=np.tanh(R/m*1.6)*fade*0.9
pcm=(np.stack([L,R],1)*32767).astype(np.int16)
with wave.open('audio.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
print('audio ok')
