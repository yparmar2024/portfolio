"""Offline multi-angle inspection; no preview route is shipped to the website."""
import sys
from pathlib import Path
import bpy
sys.path.insert(0,str(Path(__file__).resolve().parent))
from polish_helpers import collection, aim

ROOT=Path(__file__).resolve().parents[2]
VIEWS={
    'wide-cool': ('Review_Wide',(-.42,5.75,1.65),(0,1.8,1.35),20),
    'left-detail': ('Review_Left',(.35,4.9,1.85),(-1.7,3.1,1.5),24),
    'reverse': ('Review_Reverse',(-.2,.65,1.65),(.1,4.5,1.55),22),
    'bed-detail': ('Review_Bed',(-1.3,3.1,1.75),(1.45,4.7,1.45),27),
    'right-detail': ('Review_Right',(-.6,3.65,1.85),(1.7,1.85,1.4),28),
    'overhead': ('Review_Overhead',(0,3.1,8),(0,3.1,0),22),
    'wide-warm': ('Review_Wide',(-.42,5.75,1.65),(0,1.8,1.35),20),
}


def configure_cameras():
    for _,(name,position,target,lens) in VIEWS.items():
        obj=bpy.data.objects.get(name)
        if obj is None:
            data=bpy.data.cameras.new(name)
            obj=bpy.data.objects.new(name,data)
            collection('09 Review cameras').objects.link(obj)
        obj.location=position;obj.data.lens=lens;obj.data.clip_start=.04
        aim(obj,target)
    bpy.context.scene.camera=bpy.data.objects['Review_Wide']


def render_reviews(names=None, quick=False):
    scene=bpy.context.scene
    if '--metal' in sys.argv:
        preferences=bpy.context.preferences.addons['cycles'].preferences
        preferences.compute_device_type='METAL'
        preferences.get_devices()
        if not any(device.type=='METAL' for device in preferences.devices):
            raise RuntimeError('No Metal rendering device is available; omit --metal for CPU rendering.')
        for device in preferences.devices:
            device.use=device.type=='METAL'
        scene.cycles.device='GPU'
    scene.render.resolution_x=1100 if quick else 1440
    scene.render.resolution_y=720 if quick else 960
    scene.render.resolution_percentage=100
    scene.cycles.samples=24 if quick else 64
    scene.cycles.use_denoising=True
    ceiling=bpy.data.objects['Ceiling removable for overhead review']
    output=ROOT/'context/models/room/previews'
    for name in names or VIEWS:
        scene.camera=bpy.data.objects[VIEWS[name][0]]
        ceiling.hide_render=name=='overhead'
        scene.render.filepath=str(output/(name+'.png'))
        key=bpy.data.objects['Cool window key'].data
        color=tuple(key.color)
        if name=='wide-warm':
            key.color=(1,.64,.35)
        bpy.ops.render.render(write_still=True)
        key.color=color
    ceiling.hide_render=False
    scene.camera=bpy.data.objects['Review_Wide']


if __name__=='__main__':
    # An export earlier in the same Blender process may have converted/batched
    # meshes and substituted temporary web textures. Review the saved source.
    if bpy.data.filepath:
        bpy.ops.wm.open_mainfile(filepath=bpy.data.filepath)
    configure_cameras()
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    render_reviews([arg for arg in args if arg in VIEWS] or None,'--quick' in args)
