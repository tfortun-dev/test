"""Offline only. Bake KayKit/Kenney 3D assets to transparent, ground-anchored PNGs.

Requires: python -m pip install vtk pillow numpy
Get the free KayKit Medieval Hexagon Pack (CC0) and Kenney Fantasy Town Kit (CC0).
Usage:
  python tools/render_models.py --kaykit /path/to/KayKit_Medieval_Hexagon_Pack_1.0_FREE.zip

The final browser game uses only the exported PNGs, NOT a realtime 3D engine.
"""
from __future__ import annotations
import argparse, tempfile, zipfile
from pathlib import Path
import vtk
import numpy as np
from PIL import Image, ImageEnhance
from vtk.util.numpy_support import vtk_to_numpy

MODELS={
 'b-townhall':'buildings/blue/building_castle_blue.gltf',
 'b-sawmill':'buildings/blue/building_watermill_blue.gltf',
 'b-mine':'buildings/blue/building_mine_blue.gltf',
 'b-warehouse':'buildings/blue/building_tavern_blue.gltf',
 'b-barracks':'buildings/blue/building_barracks_blue.gltf',
 'b-tower':'buildings/blue/building_tower_B_blue.gltf',
 'tree-0':'decoration/nature/tree_single_A.gltf',
 'tree-1':'decoration/nature/tree_single_B.gltf',
}

def bake(path:Path)->Image.Image:
    win=vtk.vtkRenderWindow();win.SetOffScreenRendering(1);win.SetAlphaBitPlanes(1);win.SetSize(1024,1024)
    win.SetMultiSamples(8)
    importer=vtk.vtkGLTFImporter();importer.SetFileName(str(path));importer.SetRenderWindow(win);importer.Update()
    renderer=importer.GetRenderer()
    renderer.SetBackground(1,1,1);renderer.SetBackgroundAlpha(0.0)
    bb=renderer.ComputeVisiblePropBounds()
    center=np.array([(bb[0]+bb[1])/2,(bb[2]+bb[3])/2,(bb[4]+bb[5])/2],dtype=float)
    extent=np.array([bb[1]-bb[0],bb[3]-bb[2],bb[5]-bb[4]],dtype=float)
    radius=max(.1,float(max(extent)))
    cam=renderer.GetActiveCamera();cam.SetFocalPoint(*center)
    cam.SetPosition(*(center+np.array([8.4,8.0,9.4])*radius))
    cam.SetViewUp(0,1,0);cam.ParallelProjectionOn()
    cam.SetParallelScale(radius*.80)

    # Slightly warmer key light + softer fill lights so sprites look less flat/dark in-game.
    renderer.AutomaticLightCreationOff();renderer.RemoveAllLights();renderer.SetAmbient(.22,.22,.22)
    def add_light(offset,intensity,color=(1,1,1)):
        light=vtk.vtkLight();light.SetLightTypeToSceneLight()
        light.SetPosition(*(center+np.array(offset)*radius));light.SetFocalPoint(*center)
        light.SetIntensity(intensity);light.SetColor(*color);renderer.AddLight(light)
    add_light([8,6,10],1.08,(1.0,.99,.96))
    add_light([-6,4,5],.52,(.93,.98,1.0))
    add_light([0,-7,7],.24,(1.0,.97,.93))

    renderer.ResetCameraClippingRange()
    win.Render()
    filt=vtk.vtkWindowToImageFilter();filt.SetInput(win);filt.SetInputBufferTypeToRGBA();filt.ReadFrontBufferOff();filt.Update()
    out=filt.GetOutput();width,height,_=out.GetDimensions()
    arr=vtk_to_numpy(out.GetPointData().GetScalars()).reshape(height,width,4)[::-1].copy()
    img=Image.fromarray(arr,'RGBA')
    bbox=img.getchannel('A').getbbox()
    if not bbox:raise ValueError(f'No geometry rendered: {path}')
    img=img.crop(bbox)
    # Maintain transparent background; no hard-coded ground shadow in the atlas.
    rgb=img.convert('RGB')
    rgb=ImageEnhance.Brightness(rgb).enhance(1.07)
    rgb=ImageEnhance.Color(rgb).enhance(1.08)
    rgb=ImageEnhance.Contrast(rgb).enhance(1.03)
    img=Image.merge('RGBA',(*rgb.split(),img.getchannel('A')))
    img.thumbnail((360,480),Image.Resampling.LANCZOS)
    result=Image.new('RGBA',(img.width+14,img.height+16))
    result.alpha_composite(img,(7,6))
    win.Finalize()
    return result

def main():
    p=argparse.ArgumentParser();p.add_argument('--kaykit',required=True,type=Path)
    p.add_argument('--output',type=Path,default=Path(__file__).parent.parent/'public/assets')
    args=p.parse_args()
    dest=args.output
    with tempfile.TemporaryDirectory(prefix='astrub-bake-') as d:
        root=Path(d)
        with zipfile.ZipFile(args.kaykit) as z:
            for f in z.namelist():
                if '/Assets/gltf/' in f and f.lower().endswith(('.gltf','.bin','.png')) and (
                  '/buildings/blue/' in f or '/decoration/nature/' in f):
                    z.extract(f,root)
        gltf=list(root.glob('*/Assets/gltf'))
        if not gltf:raise FileNotFoundError('KayKit glTF files absent')
        for key,rel in MODELS.items():
            target=dest/('buildings' if key.startswith('b-') else 'decor')/(key+'.png')
            target.parent.mkdir(parents=True,exist_ok=True)
            bake(gltf[0]/rel).save(target,optimize=True)
            print(key,'=>',str(target))

if __name__=='__main__':main()
