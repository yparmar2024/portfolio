"""Bake static, short-range contact shading into glTF vertex colors at export.

This uses the evaluated geometry and requires no runtime screen-space AO pass or
extra draw calls. Source materials remain editable and Cycles provides its own GI.
"""
import math
import time
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree


def bake_contact_shading(samples=20, distance=.55):
    start=time.monotonic()
    objects=[obj for obj in bpy.context.scene.objects if obj.type=='MESH']
    vertices,polygons=[],[]
    for obj in objects:
        offset=len(vertices)
        vertices.extend(obj.matrix_world@vertex.co for vertex in obj.data.vertices)
        polygons.extend(tuple(offset+i for i in polygon.vertices) for polygon in obj.data.polygons)
    tree=BVHTree.FromPolygons(vertices,polygons,all_triangles=False,epsilon=0)
    rays=[]
    for i in range(samples):
        radius=math.sqrt((i+.5)/samples)
        angle=i*2.39996323
        rays.append((radius*math.cos(angle),radius*math.sin(angle),math.sqrt(1-radius*radius)))
    cache={}
    for index,obj in enumerate(objects):
        data=obj.data
        colors=np.ones((len(data.loops),4),dtype=np.float32)
        attribute=data.color_attributes.get('RoomContact') or data.color_attributes.new(
            name='RoomContact',type='BYTE_COLOR',domain='CORNER')
        normal_matrix=obj.matrix_world.to_3x3().inverted().transposed()
        positions=[obj.matrix_world@vertex.co for vertex in data.vertices]
        for loop in data.loops:
            point=positions[loop.vertex_index]
            normal=(normal_matrix@data.corner_normals[loop.index].vector).normalized()
            key=tuple(round(v*400) for v in point)+tuple(round(v*16) for v in normal)
            shade=cache.get(key)
            if shade is None:
                axis=Vector((0,0,1)) if abs(normal.z)<.95 else Vector((0,1,0))
                tangent=normal.cross(axis).normalized();bitangent=normal.cross(tangent)
                origin=point+normal*.003
                occlusion=0
                for x,y,z in rays:
                    direction=tangent*x+bitangent*y+normal*z
                    hit,_,_,length=tree.ray_cast(origin,direction,distance)
                    if hit is not None:
                        occlusion+=(1-length/distance)**1.4
                occlusion/=samples
                # A slightly blue shadow pigment supports the illustrated palette.
                shade=(1-.69*occlusion,1-.65*occlusion,1-.57*occlusion)
                cache[key]=shade
            colors[loop.index,:3]=shade
        attribute.data.foreach_set('color',colors.reshape(-1))
        if index%100==0:
            print(f'Contact shading: {index}/{len(objects)} meshes',flush=True)
    print(f'Contact shading finished: {len(cache)} samples in {time.monotonic()-start:.1f}s',flush=True)
