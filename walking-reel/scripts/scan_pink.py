import cv2,numpy as np,sys,json
cap=cv2.VideoCapture(sys.argv[1]); res=[]
while True:
    ok,im=cap.read()
    if not ok: break
    b,g,r=[im[:,:,i].astype(int) for i in range(3)]
    pink=(r>190)&(b>140)&(r-g>45)&(b-g>15)
    pink[:800]=False; pink[1000:]=False; ys,xs=np.nonzero(pink)
    if len(xs)>30: res.append([len(xs),int(xs.min()),int(xs.max()),int(ys.min()),int(ys.max())])
    else: res.append([len(xs),0,0,0,0])
json.dump(res,open(sys.argv[2],'w'))
