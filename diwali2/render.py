import cv2, numpy as np, subprocess, sys, math
from PIL import Image
from schedule import *
rng=np.random.default_rng(7)
bg=cv2.cvtColor(cv2.imread('bg_clean.png'),cv2.COLOR_BGR2RGB).astype(np.float32)/255
orig=np.array(Image.open('src.webp').convert('RGB')).astype(np.float32)/255
alpha=np.load('alpha.npy')
OUT=1080

def ease_out(t): t=np.clip(t,0,1); return 1-(1-t)**3
def ease_back(t):
    t=np.clip(t,0,1); c1=1.70158; c3=c1+1
    return 1+c3*(t-1)**3+c1*(t-1)**2

# ---------- text layer extraction ----------
def split_letters(box, thr=0.3):
    x0,y0,x1,y1=box
    sub=(alpha[y0:y1,x0:x1]>thr).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(sub)
    keep=[i for i in range(1,n) if st[i,4]>30]
    lab2=np.zeros_like(lab)
    for j,i in enumerate(keep): lab2[lab==i]=j+1
    # nearest-component assignment for all alpha>0.02 pixels
    seeds=(lab2==0).astype(np.uint8)
    dist,lbl=cv2.distanceTransformWithLabels(seeds,cv2.DIST_L2,5,labelType=cv2.DIST_LABEL_PIXEL)
    # map dist labels back to component ids
    idmap={}
    ys,xs=np.where(lab2==0)
    # distance label -> pixel of zero-seed; seed pixels are the non-component pixels... invert: use components as zero
    seeds=(lab2==0).astype(np.uint8)  # zero where component
    dist,lbl=cv2.distanceTransformWithLabels(seeds,cv2.DIST_L2,5,labelType=cv2.DIST_LABEL_PIXEL)
    comp_at_label={}
    zy,zx=np.where(seeds==0)
    for y,x in zip(zy,zx): comp_at_label[lbl[y,x]]=lab2[y,x]
    near=np.vectorize(lambda l: comp_at_label.get(l,0))(lbl)
    out=[]
    full_a=alpha[y0:y1,x0:x1]
    order=sorted(range(1,len(keep)+1),key=lambda k:np.where(lab2==k)[1].mean())
    for k in order:
        m=(near==k)&(full_a>0.02)
        A=np.zeros((H,W),np.float32); A[y0:y1,x0:x1]=full_a*m
        out.append(A)
    return out

def layer(A):
    ys,xs=np.where(A>0.01)
    return dict(a=A,cx=float(xs.mean()),cy=float(ys.mean()),x0=xs.min(),x1=xs.max(),y0=ys.min(),y1=ys.max())

happy_all=split_letters((385,180,815,236))
# lines are components too: first and last are the orange lines
happy=[layer(a) for a in happy_all]
diwali=[layer(a) for a in split_letters((365,238,840,358))]
logoA=np.zeros((H,W),np.float32); logoA[55:175,330:880]=alpha[55:175,330:880]
logo=layer(logoA)
tagA=np.zeros((H,W),np.float32); tagA[365:415,355:850]=alpha[365:415,355:850]
tag=layer(tagA)
print(len(happy),len(diwali))

def place(L, canvas, scale=1.0, dx=0, dy=0, opacity=1.0, anchor=None, sx=None):
    cx,cy=anchor if anchor else (L['cx'],L['cy'])
    pad=70
    X0=max(int(L['x0'])-pad,0); X1=min(int(L['x1'])+pad,W); Y0=max(int(L['y0'])-pad,0); Y1=min(int(L['y1'])+pad,H)
    a=L['a'][Y0:Y1,X0:X1]; c=orig[Y0:Y1,X0:X1]
    src=np.dstack([c*a[...,None],a]).astype(np.float32)
    lx,ly=cx-X0,cy-Y0
    sxx=scale if sx is None else sx
    M=np.float32([[sxx,0,lx+dx-sxx*lx],[0,scale,ly+dy-scale*ly]])
    w=cv2.warpAffine(src,M,(X1-X0,Y1-Y0),flags=cv2.INTER_LINEAR)
    al=(w[...,3]*opacity)[...,None]
    canvas[Y0:Y1,X0:X1]=canvas[Y0:Y1,X0:X1]*(1-al)+w[...,:3]*opacity

# ---------- fireworks ----------
PAL={'gold':[(1,.82,.35),(1,.65,.2),(1,.95,.7)],'pink':[(1,.4,.65),(1,.7,.85),(1,.5,.5)],
     'white':[(1,1,1),(.8,.9,1),(1,.95,.85)],'orange':[(1,.5,.15),(1,.7,.3),(1,.35,.1)],
     'violet':[(.7,.5,1),(1,.5,.9),(.6,.7,1)]}
class Burst:
    def __init__(s,t,x,y,pal,size):
        s.t=t;s.x=x;s.y=y;s.pal=PAL[pal];s.size=size
        n=int(170*size)
        ang=rng.uniform(0,2*np.pi,n)
        ring=rng.random()<0.45
        spd=(np.full(n,270.)+rng.normal(0,6,n) if ring else rng.uniform(60,300,n))*size
        s.p=np.stack([np.full(n,x,float),np.full(n,y,float)],1)
        s.v=np.stack([np.cos(ang)*spd,np.sin(ang)*spd],1)
        s.col=np.array([s.pal[i] for i in rng.integers(0,len(s.pal),n)])
        s.life=rng.uniform(1.3,2.2,n)
        s.sparkle=rng.random(n)<0.35
        s.rocket_t=0.38
        s.done=False
bursts=[Burst(*b) for b in BURSTS]

def draw_fireworks(canvas, t, dt):
    canvas*=0.84   # trail fade
    flash=np.zeros((H,W,3),np.float32)
    for b in bursts:
        age=t-b.t
        # rocket ascent
        if -b.rocket_t<=age<0:
            k=(age+b.rocket_t)/b.rocket_t
            sy=H*0.62+(b.y-H*0.62)*ease_out(k)
            sx=b.x+(b.x-600)*0.0
            cv2.circle(canvas,(int(sx),int(sy)),3,(1,.85,.5),-1,cv2.LINE_AA)
            cv2.circle(canvas,(int(sx),int(sy)),7,(.5,.35,.1),-1,cv2.LINE_AA)
        if age<0: continue
        if age<0.18:
            r=int((30+age*500)*b.size)
            cv2.circle(flash,(int(b.x),int(b.y)),r,tuple(float(c)*0.9*(1-age/0.18) for c in b.pal[0]),-1,cv2.LINE_AA)
        if age>2.4: continue
        alive=(age<b.life)
        # integrate
        dt_=dt
        prev=b.p.copy()
        drag=0.965**(age*0 +1)
        b.v*=0.972
        b.v[:,1]+=70*dt_
        b.p+=b.v*dt_
        fade=np.clip(1-(age/b.life),0,1)**1.3
        tw=np.where(b.sparkle,0.5+0.5*rng.random(len(fade)),1.0)
        for i in np.where(alive)[0]:
            c=b.col[i]*fade[i]*tw[i]*1.5
            if age<0.12: c=c+0.4
            cv2.line(canvas,(int(prev[i,0]),int(prev[i,1])),(int(b.p[i,0]),int(b.p[i,1])),tuple(float(x) for x in c),3 if age<1.0 else 2,cv2.LINE_AA)
        # crackle glitter
        if age>0.5:
            for i in np.where(alive&b.sparkle)[0][:12]:
                if rng.random()<0.15:
                    cv2.circle(canvas,(int(b.p[i,0]),int(b.p[i,1])),2,(1,1,.9),-1,cv2.LINE_AA)
    flash[:620]=cv2.GaussianBlur(flash[:620],(0,0),40)
    return flash

# ---------- background life ----------
diyas=[(140,1050),(194,1078),(103,1092),(372,1100),(396,1090),(178,1030)]
lights=[]  # twinkling city lights
_lum=bg.mean(2); _loc=cv2.blur(_lum,(25,25))
_pk=(_lum-_loc>0.22)&(bg[...,0]>0.8)
_pk[:500]=0; _pk[650:]=0; _pk[:,:150]=_pk[:,:150]&False
yy,xx=np.where(_pk)
print('lights',len(yy))
for _ in range(70):
    i=rng.integers(0,len(yy)); lights.append((xx[i],yy[i],rng.uniform(0,6.28),rng.uniform(2,5)))
Y,X=np.mgrid[0:H,0:W].astype(np.float32)

def background(t):
    f=bg.copy()
    # soft sky breathing
    glow=np.exp(-(((X-600)/380)**2+((Y-330)/260)**2))*(0.05+0.03*math.sin(t*1.7))
    f+=glow[...,None]*np.array([1,.8,.6],np.float32)
    # diya flicker
    g=np.zeros((H,W,3),np.float32)
    for k,(x,y) in enumerate(diyas):
        fl=0.6+0.4*math.sin(t*9+k*1.9)*math.sin(t*5.3+k)+0.15*rng.random()
        cv2.circle(g,(x,y-12),int(26+6*fl),(0.9*fl,0.5*fl,0.12*fl),-1,cv2.LINE_AA)
    g[900:]=cv2.GaussianBlur(g[900:],(0,0),16)
    f+=g*0.9
    # city light twinkle
    for (x,y,p,s) in lights:
        v=0.5+0.5*math.sin(t*s+p)
        cv2.circle(f,(int(x),int(y)),2,(1*v,.85*v,.5*v),-1,cv2.LINE_AA)
    return f

# warm sweep across cranes
def crane_sweep(f,t):
    # slow moving highlight band across the crane row
    x=-200+ (t/DUR)*1600
    band=np.exp(-((X-x)/120)**2)*((Y>540)&(Y<790))*0.10
    f+=band[...,None]*np.array([1,.85,.6],np.float32)

# ---------- text animation ----------
def text_pass(frame,t):
    # logo: slide down + fade, 0.2..1.0
    k=ease_out((t-0.15)/0.8)
    place(logo,frame,scale=1.0,dy=-30*(1-k),opacity=float(k))
    # sheen across logo
    # HAPPY letters: orange lines grow, letters drop in
    for i,L in enumerate(happy):
        if i in (0,len(happy)-1):
            k=ease_out((t-0.9)/0.7)
            # grow from centre outwards (scale in x about inner end) -> scale about anchor
            anchor=(L['x1'] if i==0 else L['x0'], L['cy'])
            place(L,frame,scale=1.0,opacity=float(k),anchor=anchor) if False else None
            w=place_scaled_x(L,frame,k,anchor)
        else:
            s=1.0+0 ;st=1.05+0.1*(i-1)
            k=ease_back((t-st)/0.5)
            kk=ease_out((t-st)/0.35)
            place(L,frame,scale=float(0.4+0.6*k),dy=float(-26*(1-k)),opacity=float(kk))
    # DIWALI letters: pop with overshoot, staggered, starting 1.35
    for i,L in enumerate(diwali):
        st=1.35+0.09*i
        k=ease_back((t-st)/0.55); kk=ease_out((t-st)/0.25)
        place(L,frame,scale=float(max(k,0.001)),dy=float(40*(1-ease_out((t-st)/0.5))),opacity=float(kk))
    # tagline
    k=ease_out((t-2.4)/0.9)
    place(tag,frame,dy=float(18*(1-k)),opacity=float(k))
    return

def place_scaled_x(L,canvas,k,anchor):
    place(L,canvas,scale=1.0,sx=max(k,0.001),opacity=k,anchor=anchor)
DM=np.zeros((H,W),np.float32)
for L in diwali: DM=np.maximum(DM,L['a'])
DGL=cv2.GaussianBlur(DM,(0,0),14)
def glow_text(frame,t):
    # pulsing golden glow on DIWALI after landing + shimmer
    x0,y0,x1,y1=375,242,830,350
    m=DM
    pulse=0.5+0.5*math.sin(t*3.2)
    amt=ease_out((t-2.0)/1.0)*(0.25+0.20*pulse)
    gl=DGL
    frame+=gl[...,None]*np.array([1,.75,.3],np.float32)*amt
    # shimmer sweep passes
    for ts in (3.2,6.2,9.0):
        u=(t-ts)/0.9
        if 0<=u<=1:
            x=x0-120+u*(x1-x0+240)
            band=np.exp(-((X-x-0.45*(Y-300))/22)**2)*m
            frame+=band[...,None]*0.75

def render_frame(n):
    t=n/FPS; dt=1/FPS
    f=background(t); crane_sweep(f,t)
    fw=fwcanvas
    flash=draw_fireworks(fw,t,dt)
    bl=np.zeros_like(fw); bl[:620]=cv2.GaussianBlur(fw[:620],(0,0),9)
    sky_mask=np.clip((560-Y)/160,0,1)[...,None]   # keep fireworks mostly in sky
    f=f+flash*sky_mask
    f=1-(1-np.clip(f,0,1))*(1-np.clip((fw+bl*1.3)*sky_mask,0,1))   # screen
    text_pass(f,t); glow_text(f,t)
    # gentle slow zoom
    z=1.0+0.045*(t/DUR)
    M=cv2.getRotationMatrix2D((600,640),0,z)
    f=cv2.warpAffine(f,M,(W,H),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
    # vignette & fades
    fade=min(1,t/0.4)
    f=f*fade
    out=cv2.resize(np.clip(f,0,1),(OUT,OUT),interpolation=cv2.INTER_AREA)
    return (out*255).astype(np.uint8)

fwcanvas=np.zeros((H,W,3),np.float32)
if __name__=='__main__':
    n_frames=int(FPS*DUR)
    only=int(sys.argv[1]) if len(sys.argv)>1 else None
    if only is not None:
        for n in range(only+1): fr=render_frame(n)
        cv2.imwrite(f'frame_{only}.png',cv2.cvtColor(fr,cv2.COLOR_RGB2BGR)); sys.exit()
    p=subprocess.Popen(['ffmpeg','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{OUT}x{OUT}','-r',str(FPS),'-i','-',
        '-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','video_silent.mp4'],stdin=subprocess.PIPE)
    fz=int(FREEZE*FPS); frozen=None
    for n in range(n_frames):
        if n<=fz:
            frozen=render_frame(n); out=frozen
        else:
            fade=min(1,(DUR-n/FPS)/0.6)
            out=(frozen.astype(np.float32)*fade).astype(np.uint8)
        p.stdin.write(out.tobytes())
        if n%30==0: print(n,flush=True)
    p.stdin.close(); p.wait()
