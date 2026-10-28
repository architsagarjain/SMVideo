import cv2, numpy as np
from PIL import Image
im = np.array(Image.open('src.webp').convert('RGB')).astype(np.float32)
H,W,_ = im.shape
bgr = cv2.cvtColor(im.astype(np.uint8), cv2.COLOR_RGB2BGR)

# ---- text layers ----
regions = {'logo':(320,55,880,170),'happy':(390,185,810,235),'diwali':(385,240,820,352),'tag':(370,358,830,398)}
text_mask = np.zeros((H,W),np.uint8)
P=70
imp = np.pad(im,((P,P),(P,P),(0,0)),mode='edge')
tm_pad = np.zeros((H+2*P,W+2*P),np.uint8)
alphas = {}
for k,(x0,y0,x1,y1) in regions.items():
    P=70
    crop = imp[y0:y1+2*P,x0:x1+2*P]
    # background estimate: strong blur of crop after removing dark/saturated pixels
    lum = crop.mean(2)
    sat = crop.max(2)-crop.min(2)
    # text is darker than sky, or orange
    bgm = cv2.GaussianBlur(cv2.medianBlur(crop.astype(np.uint8), 101),(0,0),12).astype(np.float32)
    diff = np.abs(crop-bgm).max(2)
    m = (diff>34).astype(np.uint8)*255
    m = cv2.dilate(m,np.ones((7,7),np.uint8))
    m[:P//2]=0; m[-P//2:]=0; m[:,:P//2]=0; m[:,-P//2:]=0
    text_mask |= np.pad(m,((y0,0),(x0,0)))[P:P+H,P:P+W] if False else 0
    tm_pad[y0:y1+2*P,x0:x1+2*P] |= m
text_mask = tm_pad[P:P+H,P:P+W].copy()
cv2.imwrite('text_mask.png',text_mask)
bg = cv2.inpaint(bgr,text_mask,6,cv2.INPAINT_TELEA)
cv2.imwrite('bg_notext.png',bg)

# ---- firework removal ----
fw = np.zeros((H,W),np.uint8)
for (x0,y0,x1,y1) in [(0,60,300,480),(940,40,1200,440)]:
    crop = bgr[y0:y1,x0:x1].astype(np.float32)
    lum = crop.mean(2)
    smooth = cv2.GaussianBlur(lum,(0,0),25)
    sat = crop.max(2)-crop.min(2)
    m = ((lum-smooth>12)|(lum>200)).astype(np.uint8)*255
    m = cv2.dilate(m,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
    fw[y0:y1,x0:x1]|=m
cv2.imwrite('fw_mask.png',fw)
bg2 = cv2.inpaint(bg,fw,12,cv2.INPAINT_TELEA)
# soften inpainted area
soft = cv2.GaussianBlur(fw,(0,0),9).astype(np.float32)/255
blur = cv2.GaussianBlur(bg2,(0,0),6)
bg2 = (bg2*(1-soft[...,None]*0.6)+blur*soft[...,None]*0.6).astype(np.uint8)
cv2.imwrite('bg_clean.png',bg2)

# ---- text alpha (used by render.py) ----
bgc = cv2.cvtColor(cv2.imread('bg_clean.png'),cv2.COLOR_BGR2RGB).astype(np.float32)
d = np.abs(im-bgc).max(2)
alpha = np.clip((d-8)/40,0,1)*(text_mask>0)
np.save('alpha.npy',alpha.astype(np.float32))
