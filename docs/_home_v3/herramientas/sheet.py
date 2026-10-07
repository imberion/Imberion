import sys,glob
from PIL import Image
pat,out=sys.argv[1],sys.argv[2]
fs=sorted(glob.glob(pat))
cols=2; W=720; 
for k in range(0,len(fs),4):
  ims=[Image.open(f) for f in fs[k:k+4]]
  w0,h0=ims[0].size; Hh=int(W*h0/w0)
  s=Image.new('RGB',(W*cols,Hh*2),'white')
  for j,im in enumerate(ims): s.paste(im.resize((W,Hh)),((j%2)*W,(j//2)*Hh))
  s.save(f'{out}_{k//4}.png')
print(len(fs))
