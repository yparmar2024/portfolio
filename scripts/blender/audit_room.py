"""Check entry clearance, camera anchors and evaluated quilt/mattress contacts."""
import json
import sys
from pathlib import Path
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(Path(__file__).resolve().parent))
from settle_bedding import COLLIDER_PREFIXES
scene=bpy.context.scene
graph=bpy.context.evaluated_depsgraph_get()
expected={
    'Entry_Anchor':(-.42,6.25,1.65),'Room_Overview':(-.42,5.2,1.65),
    'Overview_Target':(0,1.9,1.35),
    'View_About':(-.75,3.65,1.9),'Target_About':(-2.30,3.65,2),
    'View_Projects':(-.9,2.5,1.6),'Target_Projects':(-1.8,2.5,.88),
    'View_Experience':(.9,1.95,1.7),'Target_Experience':(2.28,1.95,1.65),
    'View_Records':(-.8,1.05,1.55),'Target_Records':(-1.98,1.05,1),
}
for name,position in expected.items():
    assert (scene.objects[name].matrix_world.translation-Vector(position)).length<.0001,name
vertices,faces=[],[]
for obj in scene.objects:
    if obj.type not in {'MESH','CURVE','FONT'}:
        continue
    evaluated=obj.evaluated_get(graph)
    data=evaluated.to_mesh()
    offset=len(vertices)
    vertices.extend(obj.matrix_world@vertex.co for vertex in data.vertices)
    faces.extend(tuple(offset+index for index in polygon.vertices) for polygon in data.polygons)
    evaluated.to_mesh_clear()
tree=BVHTree.FromPolygons(vertices,faces)
for x in [-.57,-.42,-.27]:
    for z in [1.5,1.65,1.8]:
        assert tree.ray_cast(Vector((x,6.35,z)),Vector((0,-1,0)),1.1)[0] is None,'Blocked entrance'
colliders=[obj for obj in scene.objects if obj.type=='MESH' and obj.name.startswith(COLLIDER_PREFIXES)]
for prefix in COLLIDER_PREFIXES:
    assert any(obj.name.startswith(prefix) for obj in colliders),f'Missing bed collider: {prefix}'
trees={obj.name:BVHTree.FromObject(obj,graph) for obj in colliders}
contacts={}
for obj in scene.objects:
    if not obj.name.startswith('Settled quilt'):
        continue
    evaluated=obj.evaluated_get(graph)
    data=evaluated.to_mesh()
    penetration=0
    for solid in colliders:
        collider=trees[solid.name]
        to_local=solid.matrix_world.inverted()@obj.matrix_world
        for vertex in data.vertices:
            point=to_local@vertex.co
            nearest,normal,_,_=collider.find_nearest(point)
            depth=-(point-nearest).dot(normal)
            penetration=max(penetration,depth)
    contacts[obj.name]=round(penetration,6)
    evaluated.to_mesh_clear()
    assert penetration<.002,f'{obj.name}: mattress/frame penetration {penetration:.4f}m'
assert len(contacts)==2,'Both quilts must be present for the contact check'
report={
    'anchorsUnchanged':True,'entryClearanceRays':9,
    'quiltBedMaxPenetrationMeters':contacts,'bedCollisionObjects':len(colliders),
    'scope':'Evaluated quilt contact against mattresses, platforms, posts and safety rails; window camera corridor. Other decorative contacts are reviewed visually.',
}
(ROOT/'context/models/room/geometry-validation.json').write_text(json.dumps(report,indent=2)+'\n')
manifest_path=ROOT/'context/models/room/manifest.json'
manifest=json.loads(manifest_path.read_text())
manifest.update(objects=len(scene.objects),meshes=sum(obj.type=='MESH' for obj in scene.objects),
                settled_bedding=bool(scene.get('settled_bedding')),
                review_cameras=['entry','reverse','left','right','bunk','overhead','warm lighting'])
manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(report,indent=2))
