"""Generate lightweight 2D animation atlases (idle, walking, attack; four facings).
Source art is procedural placeholder, ready to replace by Blender renders later.
Usage: python tools/make_unit_sheets.py
"""
from pathlib import Path
import math
from PIL import Image,ImageDraw

OUT=Path(__file__).parent.parent/'public/assets/units'
OUT.mkdir(parents=True,exist_ok=True)
W,H,UPSCALE=108,116,3
SHIFT_X,SHIFT_Y=18,27
FRAMES=16

# Coordinate values below are in final pixel units, rasterized at 3x anti-aliasing.
def frame(unit,direction,action,frame):
    sc=UPSCALE
    im=Image.new('RGBA',(W*sc,H*sc),(0,0,0,0))
    d=ImageDraw.Draw(im)
    def scalepts(pts):return [(round((x+SHIFT_X)*sc),round((y+SHIFT_Y)*sc)) for x,y in pts]
    def ell(rect,fill,outline=None,width=1):
        d.ellipse(tuple(round((v+(SHIFT_X if i%2==0 else SHIFT_Y))*sc) for i,v in enumerate(rect)),fill=fill,outline=outline,width=width*sc)
    def rect(rr,fill,outline=None,width=1,radius=0):
        box=tuple(round((v+(SHIFT_X if i%2==0 else SHIFT_Y))*sc) for i,v in enumerate(rr))
        if radius: d.rounded_rectangle(box,radius=int(radius*sc),fill=fill,outline=outline,width=width*sc)
        else:d.rectangle(box,fill=fill,outline=outline,width=width*sc)
    def line(points,fill,width=2):d.line(scalepts(points),fill=fill,width=round(width*sc),joint='curve')
    def poly(points,fill,outline=None):
        d.polygon(scalepts(points),fill=fill)
        if outline: line(points+[points[0]],outline,1.1)
    palette=({'robe':'#d59d52','shade':'#b96b3d','hair':'#d1aa4d','accent':'#ca6548','metal':'#e1e5e4'} if unit=='iop'
      else {'robe':'#4c91a0','shade':'#34626f','hair':'#8f633c','accent':'#77b88a','metal':'#a8cf97'})
    bob=math.sin(frame/3*math.pi)*1.15 if action=='idle' else 0
    if action=='walk':bob=abs(math.sin(frame/6*2*math.pi))*2.3
    atk=frame/6 if action=='attack' else 0
    side=direction in ('e','w');face=1 if direction in ('s','e') else -1
    turn=1 if direction=='e' else -1
    if direction in ('n','s'): turn=1
    cy=round(13+bob)
    # Ground shadow baked per unit frame: stays underneath, fixed-size.
    ell((19,73,53,79),'#34463844')
    # Two separate legs, with walking cadence and a small body bounce.
    swing=math.sin(frame/6*2*math.pi)*5 if action=='walk' else 0
    line([(29,57+cy-13),(28+swing,70)],'#4a5451',5)
    line([(41,57+cy-13),(42-swing,70)],'#4a5451',5)
    ell((23+swing,68,34+swing,74),'#6b5a43')
    ell((36-swing,68,47-swing,74),'#6b5a43')
    bodyShift=-2 if direction=='w' else 2 if direction=='e' else 0
    poly([(24+bodyShift,40+cy-13),(43+bodyShift,40+cy-13),(48+bodyShift,61+cy-13),(20+bodyShift,61+cy-13)],palette['shade'])
    poly([(27+bodyShift,40+cy-13),(42+bodyShift,40+cy-13),(44+bodyShift,57+cy-13),(23+bodyShift,57+cy-13)],palette['robe'])
    poly([(29+bodyShift,46+cy-13),(37+bodyShift,43+cy-13),(43+bodyShift,46+cy-13),(36+bodyShift,52+cy-13)],palette['accent'])
    if direction!='n':
        # Face and hairstyle, silhouette changes with facing direction.
        ell((24+bodyShift,21+cy-13,44+bodyShift,43+cy-13),'#e8b78a', '#9a654f')
        poly([(23+bodyShift,27+cy-13),(25+bodyShift,19+cy-13),(41+bodyShift,19+cy-13),(46+bodyShift,28+cy-13),(36+bodyShift,24+cy-13)],palette['hair'])
        if side:ell((35+bodyShift+turn*4,33+cy-13,37+bodyShift+turn*4,35+cy-13),'#283746')
        else:
            ell((28+bodyShift,32+cy-13,30+bodyShift,35+cy-13),'#273941')
            ell((38+bodyShift,32+cy-13,40+bodyShift,35+cy-13),'#273941')
    else:
        ell((24+bodyShift,21+cy-13,44+bodyShift,43+cy-13),palette['hair'])
        poly([(26+bodyShift,29+cy-13),(32+bodyShift,22+cy-13),(44+bodyShift,26+cy-13),(42+bodyShift,41+cy-13),(26+bodyShift,40+cy-13)],palette['shade'])
    if unit=='iop':
        # Right arm raises a sword in the attack frames.
        arm_y=(29 if action=='attack' else 48)+cy-13
        handX=(48+(8 if atk>0.2 else 0))*1
        line([(44,43+cy-13),(handX,arm_y)],'#e5b286',6)
        tipx=handX+7*turn
        swordEnd=(tipx+22*(1-atk),arm_y-32*atk-20)
        line([(handX,arm_y),(tipx,arm_y-5)],'#745642',4)
        line([(tipx,arm_y-5),swordEnd],palette['metal'],5)
        line([(tipx-5,arm_y-5),(tipx+6,arm_y-5)],'#f0ce65',3)
    else:
        # Bowstring and bow: draw the side that is facing the target.
        delta=11 if action=='attack' else 0
        arcx=50+delta
        d.arc(tuple(round((v+(SHIFT_X if i%2==0 else SHIFT_Y))*sc) for i,v in enumerate((arcx-10,28,arcx+10,66))),start=255,end=105,fill='#9c673f',width=3*sc)
        line([(arcx+2,30),(arcx+2,64)],'#e4d9ab',1)
        if action=='attack':
            line([(37,48),(arcx+15*turn,47)],'#eee6bb',2)
            poly([(arcx+15*turn,47),(arcx+11*turn,44),(arcx+11*turn,50)],'#e8dcb4')
        line([(43,44+cy-13),(49+delta/2,50+cy-13)],'#dcb288',5)
    return im.resize((W,H),Image.Resampling.LANCZOS)

for unit in ['iop','cra']:
    sheet=Image.new('RGBA',(W*FRAMES,H*4))
    for r,direction in enumerate(['s','w','n','e']):
        for i in range(FRAMES):
            action='idle' if i<4 else 'walk' if i<10 else 'attack'
            f=i if i<4 else i-4 if i<10 else i-10
            sheet.alpha_composite(frame(unit,direction,action,f),(i*W,r*H))
    sheet.save(OUT/f'{unit}-atlas.png',optimize=True)
    print(unit,sheet.size,(OUT/f'{unit}-atlas.png').stat().st_size)
