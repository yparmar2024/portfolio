"""Finish the actual interactive surfaces so their zoomed views hold up."""
import math
import random
import sys
from pathlib import Path
import bpy
import bmesh
from mathutils import Matrix,Vector

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(Path(__file__).resolve().parent))
from polish_helpers import collection,box,curve,picture,remove_prefixes


def lettering(name,body,position,size,mat,rotation,parent=None):
    data=bpy.data.curves.new(name,'FONT')
    data.body=body;data.size=size;data.align_x='CENTER';data.extrude=.00004;data.resolution_u=3
    obj=bpy.data.objects.new(name,data);collection('10 Illustrated finish').objects.link(obj)
    obj.location=position;obj.rotation_euler=rotation;obj.parent=parent;data.materials.append(mat)
    return obj


def refine_closeups():
    finish_surface_contacts()
    if bpy.context.scene.get('closeup_finish'):
        return
    mats=bpy.data.materials;rng=random.Random(37)
    # Keep every stroke within the screen bezel, including the raised display.
    for obj in bpy.context.scene.objects:
        if obj.name.startswith('Screen code line'):
            obj.location.y+=.12
        if obj.name.startswith('Monitor stem') and obj.location.y>4:
            obj.location.z=1.03;obj.dimensions.z=.38
        if obj.name.startswith('Laptop code stroke'):
            obj.location.y+=.07
    # A small illustrated project sketch, with legible headings and finer strokes.
    remove_prefixes('Notebook handwriting')
    parent=bpy.data.objects['Project_Notebook']
    rot=(0,0,math.pi/2)
    lettering('Notebook sketch heading','AFTER HOURS',(-1.91,2.5,.874),.022,mats['ink'],rot,parent)
    lettering('Notebook sketch subtitle','01 / A WINDOW INTO MY WORLD',(-1.88,2.5,.874),.008,mats['blue'],rot,parent)
    for x in [-1.85,-1.825]:
        for j in range(5):
            y=2.34+j*.055
            curve('Notebook pencil writing',[(x+.001*math.sin(k*2),y+k*.007,.874) for k in range(6)],.0005,mats['gray'],parent)
    for y,label in [(2.37,'IDEA'),(2.5,'BUILD'),(2.63,'PLAY')]:
        curve('Notebook flow sketch',[(-1.80,y-.042,.874),(-1.73,y-.042,.874),(-1.73,y+.042,.874),(-1.80,y+.042,.874)],.0007,mats['blue'],parent,True)
        lettering('Notebook diagram label',label,(-1.77,y,.875),.009,mats['ink'],rot,parent)
    for y in [2.43,2.56]:
        curve('Notebook pencil arrow',[(-1.765,y,.875),(-1.765,y+.025,.875),(-1.774,y+.018,.875)],.0006,mats['red'],parent)
    lettering('Notebook margin note','make something worth exploring.',(-1.68,2.49,.875),.008,mats['blue'],rot,parent)
    # Use the illustration as small pinned art studies, with actual UV crops.
    remove_prefixes('Original instant photo graphic','Photo skyline')
    cork=bpy.data.objects['Experience_Board']
    for i,(y,z) in enumerate([(1.65,1.55),(2.25,1.79),(1.9,1.93)]):
        print_obj=picture('Pinned art study',(2.255,y,z+.02),.18,.17,mats['Original rooftop illustration'],'right',cork)
        for uv in print_obj.data.uv_layers.active.data:
            uv.uv=(uv.uv.x*.43+i*.23,uv.uv.y*.68+.12)
        pivot=Vector((2.262,y,z))
        print_obj.matrix_world=Matrix.Translation(pivot)@Matrix.Rotation(.08,4,'X')@Matrix.Translation(-pivot)
    remove_prefixes('Note mark')
    notes=sorted([obj for obj in bpy.context.scene.objects if obj.name.startswith('Pinned note')],key=lambda obj:obj.name)
    pins=[obj for obj in bpy.context.scene.objects if obj.name.startswith('Pushpin')]
    for i,note in enumerate(notes):
        x,y,z=note.location
        parts=[note]
        parts.extend(pin for pin in pins if abs(pin.location.y-y)<.015 and abs(pin.location.z-z-.055)<.01)
        word=['IDEA / 01','SKETCH','BUILD','WHAT IF?','TEST','EXPLORE','MAKE','AGAIN'][i%8]
        parts.append(lettering('Pinned handwritten heading',word,(x-.006,y,z+.014),.015,mats['ink'],(math.pi/2,0,-math.pi/2),cork))
        for row in range(2):
            points=[]
            for j in range(21-i%3):
                points.append((x-.006,y-.065+j*.006,z-.015-row*.017+.0015*math.sin(j*2+i)))
            parts.append(curve('Pinned pencil note',points,.00065,mats['blue'],cork))
        angle=rng.uniform(-.11,.11)
        bpy.context.view_layer.update()
        transform=Matrix.Translation((x,y,z+.055))@Matrix.Rotation(angle,4,'X')@Matrix.Translation((-x,-y,-z-.055))
        for obj in parts:
            obj.matrix_world=transform@obj.matrix_world
    # Labels, rolled rims and appliance construction reward a closer camera.
    for i,(x,y,z) in enumerate([(-1.71,2.9,.835),(-1.78,2.16,.835),(1.8,2.53,.835)]):
        side=1 if x<0 else -1
        lettering('Snack printed label','LATE\nNIGHT',(x+side*.056,y,z+.068),.015,mats['paper'],(math.pi/2,0,side*math.pi/2))
    for y in [2.82,2.855,2.89,2.925,2.96,2.995]:
        box('Cooker ventilation slot',(-2.205,y,.97),(.002,.012,.05),mats['ink'],.001)
    for y in [2.86,2.94]:
        lettering('Cooker control label','I' if y<2.9 else 'O',(-1.864,y,.96),.012,mats['paper'],(math.pi/2,0,math.pi/2))
    bpy.context.scene['closeup_finish']=True


def finish_surface_contacts():
    """Correct tiny offsets found in the oblique inspection renders."""
    scene=bpy.context.scene
    if not scene.get('desk_contact_finish'):
        for obj in scene.objects:
            if obj.name.startswith('Desk power cable') and obj.data.splines[0].points[0].co.x>0:
                points=[(1.57,1.65,.80),(1.52,1.7,.5),(1.45,1.8,.15),
                        (1.2,1.75,.075),(1.085,1.7,.075)]
                for point,position in zip(obj.data.splines[0].points,points):
                    point.co=(*position,1)
        scene.objects['Desk_Controller'].location=(0,-.16,.025)
        scene['desk_contact_finish']=True
    if scene.get('surface_contact_finish'):
        return
    for obj in scene.objects:
        if obj.name.startswith(('Board title','Board writing','Marker flowchart label')):
            obj.location.x=-2.3127
            obj.data.extrude=0
        if obj.name.startswith(('Marker flowchart box','Marker connecting arrow','Marker sunburst')):
            obj.data.bevel_depth=.0008
            for spline in obj.data.splines:
                for point in spline.points:
                    point.co.x=-2.3121
        if obj.name.startswith('Chair stitched edge'):
            for spline in obj.data.splines:
                for point in spline.points:
                    point.co.x=math.copysign(.205,point.co.x)
                    point.co.z=.528
        if obj.name.startswith('Hoodie folded sleeve'):
            for vertex in obj.data.vertices:
                v=(vertex.index//16)/21
                side=1 if vertex.co.x>1.1 else -1
                vertex.co.x-=side*.035*(1-v)
                vertex.co.z+=.08*(1-v)
            bm=bmesh.new();bm.from_mesh(obj.data);bm.verts.ensure_lookup_table()
            bm.faces.new([bm.verts[i] for i in reversed(range(16))])
            bm.normal_update();bm.to_mesh(obj.data);bm.free()
    scene.objects['Leaning_Skateboard'].location.z=.392
    scene['surface_contact_finish']=True


if __name__=='__main__':
    refine_closeups()
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'context/models/room/room-draft.blend'))
