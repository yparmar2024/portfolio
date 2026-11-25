"""Refine a saved layout once, retaining its editable objects and interaction anchors.

Run Blender with an unpolished .blend, then --python polish_room.py -- --render.
Already-polished files are left intact; edit those directly and use export_room.py.
"""
import sys
import json
from pathlib import Path
import bpy

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(Path(__file__).resolve().parent))
from polish_surfaces import update_surfaces
from polish_textiles import refine_textiles
from polish_geometry import refine_geometry
from polish_props import refine_props
from polish_closeups import refine_closeups
from polish_helpers import aim
from room_materials import assign_uvs
from review_room import configure_cameras,render_reviews

OUT=ROOT/'context/models/room'


def configure_lighting():
    scene=bpy.context.scene
    scene.render.engine='CYCLES'
    scene.cycles.samples=64
    scene.cycles.use_denoising=True
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.045
    scene.view_settings.view_transform='AgX'
    scene.view_settings.look='AgX - Medium High Contrast'
    scene.view_settings.exposure=.2
    key=bpy.data.objects['Cool window key']
    key.location=(-.6,6.45,2.5);aim(key,(.6,1.8,.6))
    key.data.color=(.49,.72,1);key.data.energy=380;key.data.size=1.1
    fill=bpy.data.objects['Soft front fill']
    fill.data.color=(.66,.78,1);fill.data.energy=22;fill.data.size=3
    ceiling=bpy.data.objects['Warm ceiling bounce']
    ceiling.data.color=(1,.51,.23);ceiling.data.energy=38;ceiling.data.size=2.4
    lamp=bpy.data.objects['Desk lamp pool']
    lamp.data.color=(1,.48,.18);lamp.data.energy=22;lamp.data.size=.18
    bpy.data.objects['Monitor bounce'].data.energy=7


def polish():
    scene=bpy.context.scene
    if scene.get('illustrated_finish_version'):
        raise RuntimeError('This room already has the finish pass. Edit it directly; do not reapply the destructive layout migration.')
    art=update_surfaces(OUT/'textures')
    refine_textiles()
    refine_geometry(art)
    refine_props(OUT/'textures')
    refine_closeups()
    bpy.context.view_layer.update()
    assign_uvs(scene)
    configure_lighting()
    configure_cameras()
    scene['illustrated_finish_version']=1
    scene['finish_notes']='Illustrated materials, shaped textiles, construction fixes; unchanged entry and interaction anchors.'
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'room-draft.blend'))
    report=json.loads((OUT/'manifest.json').read_text())
    report.update(objects=len(scene.objects),meshes=sum(obj.type=='MESH' for obj in scene.objects),
                  finish_version=1,review_cameras=['entry','reverse','left','right','bunk','overhead'])
    (OUT/'manifest.json').write_text(json.dumps(report,indent=2)+'\n')


if __name__=='__main__':
    polish()
    if '--settle' in sys.argv:
        from settle_bedding import settle_bedding
        settle_bedding()
    if '--render' in sys.argv:
        render_reviews(['wide-cool','reverse','bed-detail'],'--quick' in sys.argv)
