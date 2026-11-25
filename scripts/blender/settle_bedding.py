"""Settle quilt cloth against the actual mattresses, then keep editable meshes.

Run on the polished .blend. Only bedding is replaced; interaction anchors and
furniture stay untouched. The finite simulation is applied before saving/export.
"""
import math
import sys
from pathlib import Path
import bpy

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(Path(__file__).resolve().parent))
from polish_helpers import mesh,curve,remove_prefixes
from room_materials import assign_uvs

COLLIDER_PREFIXES=('Mattress','Bed base','Bed platform','Bed upright','Side safety rail')


def settle_bedding():
    scene=bpy.context.scene
    scene.frame_set(1)
    bed=bpy.data.objects['Bunk_Bed']
    mats=bpy.data.materials
    remove_prefixes('Tailored quilt','Settled quilt','Quilt running stitch','Quilt woven seam','Bound quilt hem')
    colliders=[obj for obj in scene.objects if obj.name.startswith(COLLIDER_PREFIXES) and obj.type=='MESH']
    for obj in colliders:
        obj.modifiers.new('Temporary fabric collider','COLLISION')
        obj.collision.thickness_outer=.007
        obj.collision.cloth_friction=15
    sheets=[];nx,ny=40,48
    for level,(z,mat) in enumerate([(.77,mats['bluecloth']),(2.36,mats['greencloth'])]):
        vertices=[];faces=[]
        for j in range(ny+1):
            v=j/ny
            for i in range(nx+1):
                u=i/nx
                height=z+.017*math.sin(u*17+v*11+level)
                if i>=nx-1:
                    height=z-.032
                vertices.append((.80+u*1.41,3.60+v*1.72,height))
        for j in range(ny):
            for i in range(nx):
                a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
        obj=mesh('Settled quilt '+str(level),vertices,faces,mat,bed)
        cloth=obj.modifiers.new('Settling cotton quilt','CLOTH')
        cloth.settings.quality=6
        cloth.settings.mass=.3
        cloth.settings.tension_stiffness=18
        cloth.settings.compression_stiffness=18
        cloth.settings.shear_stiffness=8
        cloth.settings.bending_stiffness=.7
        cloth.settings.air_damping=3
        pins=obj.vertex_groups.new(name='Tucked far edge')
        pins.add([j*(nx+1)+nx for j in range(ny+1)],1,'REPLACE')
        pins.add([j*(nx+1)+nx-1 for j in range(ny+1)],.7,'REPLACE')
        cloth.settings.vertex_group_mass=pins.name
        cloth.collision_settings.collision_quality=4
        cloth.collision_settings.distance_min=.008
        cloth.collision_settings.use_self_collision=True
        cloth.collision_settings.self_distance_min=.009
        cloth.point_cache.frame_start=1;cloth.point_cache.frame_end=65
        sheets.append(obj)
    for frame in range(1,66):
        scene.frame_set(frame)
        # Force evaluation for each step, even in background mode.
        graph=bpy.context.evaluated_depsgraph_get()
        for obj in sheets:
            obj.evaluated_get(graph).data.vertices[0].co.copy()
        if frame%10==0:print(f'Quilt settling: frame {frame}/65',flush=True)
    for obj in sheets:
        bpy.context.view_layer.objects.active=obj
        bpy.ops.object.modifier_apply(modifier='Settling cotton quilt')
        # Add a small amount of quilt loft above the collision-settled surface.
        # Raising the ridges retains mattress clearance; hanging sections stay put.
        mattress_top=.715 if obj.name.endswith('0') else 2.305
        for vertex in obj.data.vertices:
            x,y,z=vertex.co
            if x>1.16 and z>mattress_top:
                fade=min(1,(x-1.16)/.12)*min(1,max(0,(2.20-x)/.1))
                ridge=.028*math.exp(-((y-4.5-.16*math.sin(x*5))/.09)**2)
                vertex.co.z+=fade*(ridge+.009*math.sin(x*14+y*19)**2)
        points=[v.co.copy() for v in obj.data.vertices]
        for j in [0,ny]:
            curve('Bound quilt hem',[points[j*(nx+1)+i] for i in range(nx+1)],.003,mats['gray'],bed)
        for i in range(6,nx,7):
            curve('Quilt woven seam',[(points[j*(nx+1)+i].x,points[j*(nx+1)+i].y,
                                      points[j*(nx+1)+i].z+.002) for j in range(ny+1)],.0009,mats['gray'],bed)
        for j in range(5,ny,7):
            for i in range(0,nx,2):
                curve('Quilt running stitch',[(points[j*(nx+1)+k].x,points[j*(nx+1)+k].y,
                                              points[j*(nx+1)+k].z+.002) for k in [i,i+1]],.0008,mats['gray'],bed)
        sub=obj.modifiers.new('Soft quilt surface','SUBSURF');sub.levels=1
        obj.modifiers.new('Quilt thickness','SOLIDIFY').thickness=.008
    for obj in colliders:
        obj.modifiers.remove(obj.modifiers['Temporary fabric collider'])
    scene.frame_set(1)
    assign_uvs(scene)
    scene['settled_bedding']=True
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'context/models/room/room-draft.blend'))


if __name__=='__main__':
    settle_bedding()
    if '--render' in sys.argv:
        from review_room import render_reviews
        render_reviews(['bed-detail','wide-cool'],quick=True)
