"""Build an original, editable dorm-room study from the reference brief.
Run with Blender --background --factory-startup --python this_file -- --render.
The .blend is the editable source; rerunning overwrites generated artifacts only.
"""
import bpy, math, random, json, sys
from pathlib import Path
from mathutils import Vector
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from room_materials import surface_maps, assign_uvs
from room_details import add_details
from room_structure import build_structure
from room_furnishings import build_furnishings
OUT = ROOT / 'context/models/room'
PREVIEWS = OUT / 'previews'
OUT.mkdir(parents=True, exist_ok=True)
PREVIEWS.mkdir(exist_ok=True)
random.seed(42)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for c in list(bpy.data.collections):
    if c.name != 'Collection': bpy.data.collections.remove(c)
scene = bpy.context.scene
bpy.context.preferences.filepaths.save_version = 0
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.render.resolution_x = 1440
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (.12,.17,.28,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .24
scene.view_settings.view_transform = 'AgX'
COLLECTION = None

def category(name):
    global COLLECTION
    COLLECTION = bpy.data.collections.new(name)
    scene.collection.children.link(COLLECTION)

def register(obj, name, material=None, parent=None):
    obj.name = name
    for c in list(obj.users_collection): c.objects.unlink(obj)
    COLLECTION.objects.link(obj)
    if material: obj.data.materials.append(material)
    if parent: obj.parent = parent
    return obj

def material(name, color, rough=.6, metal=0, emission=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=rough
    p.inputs['Metallic'].default_value=metal
    if emission:
        p.inputs['Emission Color'].default_value=(*color,1)
        p.inputs['Emission Strength'].default_value=emission
    return m

M={}
for name,col,rough,metal in [
 ('plaster',(.49,.43,.39),.95,0),('teal',(.07,.19,.23),.75,0),('cabinet',(.035,.12,.15),.4,.12),
 ('wood',(.23,.11,.065),.55,0),('edge',(.085,.045,.03),.65,0),('paper',(.82,.78,.65),.95,0),
 ('cream',(.71,.66,.53),.85,0),('ink',(.012,.025,.045),.65,0),('metal',(.32,.30,.24),.3,.75),
 ('chrome',(.48,.53,.54),.25,.8),('black',(.014,.02,.025),.55,.15),('bluecloth',(.065,.15,.3),.98,0),
 ('purple',(.3,.085,.20),.95,0),('greencloth',(.1,.18,.1),.95,0),('chair',(.1,.24,.29),.95,0),
 ('red',(.52,.045,.08),.65,0),('yellow',(.79,.56,.12),.8,0),('pink',(.55,.21,.28),.9,0),
 ('blue',(.12,.35,.47),.8,0),('cork',(.35,.19,.095),1,0),('rug',(.055,.07,.1),1,0),
 ('gray',(.25,.28,.31),.9,0),('whiteboard',(.76,.81,.77),.3,0)]: M[name]=material(name,col,rough,metal)
M['screen']=material('Monitor cyan glow',(.14,.5,.65),.45,0,.65)
M['lamp']=material('Warm lamp filament', (1,.6,.25),.3,0,4)
M['window']=material('Soft sky outside',(.42,.61,.77),.8,0,.55)
surface_maps(M, OUT/'textures')

# Geometry helpers keep objects independently editable in organized collections.
def cube(name,loc,size,mat,bevel=.012,parent=None,rot=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    o=register(bpy.context.object,name,mat,parent);o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if rot:o.rotation_euler=rot
    if bevel:
        mod=o.modifiers.new('Soft manufactured edges','BEVEL');mod.width=bevel;mod.segments=2
        o.modifiers.new('Weighted face normals','WEIGHTED_NORMAL')
    return o

def uv(name,loc,scale,mat,parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=loc)
    o=register(bpy.context.object,name,mat,parent);o.scale=scale
    for p in o.data.polygons:p.use_smooth=True
    return o

def tube(name,points,r,mat,parent=None,cyclic=False):
    data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.bevel_depth=r;data.bevel_resolution=2
    sp=data.splines.new('POLY');sp.points.add(len(points)-1)
    for p,co in zip(sp.points,points):p.co=(*co,1)
    sp.use_cyclic_u=cyclic
    o=bpy.data.objects.new(name,data);COLLECTION.objects.link(o);o.data.materials.append(mat)
    if parent:o.parent=parent
    return o

def cylinder(name,a,b,r,mat,parent=None,vertices=20):
    a,b=Vector(a),Vector(b)
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=(b-a).length,location=(a+b)/2)
    o=register(bpy.context.object,name,mat,parent);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    return o

def text(name,body,loc,size,mat,rotation=(math.pi/2,0,0),parent=None):
    data=bpy.data.curves.new(name,'FONT');data.body=body;data.size=size;data.extrude=.00025;data.align_x='CENTER'
    data.resolution_u=4
    o=bpy.data.objects.new(name,data);COLLECTION.objects.link(o);o.location=loc;o.rotation_euler=rotation;data.materials.append(mat)
    if parent:o.parent=parent
    return o

def empty(name,loc=(0,0,0),kind=None):
    o=bpy.data.objects.new(name,None);COLLECTION.objects.link(o);o.location=loc;o.empty_display_size=.15
    if kind:o['interaction']=kind
    return o

build_structure(globals())

build_furnishings(globals())

add_details(globals())
# Move the fan to the desk so the exterior camera can pass through the window.
from mathutils import Matrix
fan=empty('Desk_Fan')
for obj in list(scene.objects):
    if obj.name.startswith(('Box fan','Fan ')): obj.parent=fan
fan.matrix_world=Matrix.Translation((-1.98,4.94,1.15)) @ Matrix.Rotation(math.pi/2,4,'Z') @ Matrix.Translation((.42,-6.02,-1.07))
bpy.context.view_layer.update()
assign_uvs(scene)

category('07 Interaction anchors')
for name,kind,loc,view in [
 ('About','about',(-2.30,3.65,2),(-.75,3.65,1.9)),
 ('Projects','projects',(-1.8,2.5,.88),(-.9,2.5,1.6)),
 ('Experience','experience',(2.28,1.95,1.65),(.9,1.95,1.7)),
 ('Records','records',(-1.98,1.05,1),(-.8,1.05,1.55))]:
    target=empty('Target_'+name,loc);target['target_for']=kind
    viewpoint=empty('View_'+name,view);viewpoint['view_for']=kind
empty('Entry_Anchor',(-.42,6.25,1.65))
empty('Room_Overview',(-.42,5.2,1.65))
empty('Overview_Target',(0,1.9,1.35))

category('08 Lighting')
def area(name,loc,target,color,power,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size
    ob=bpy.data.objects.new(name,data);COLLECTION.objects.link(ob);ob.location=loc;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler();return ob
lights=[]
lights.append(area('Cool window key',(-.42,5.96,2.15),(0,2.4,.8),(.55,.73,1),220,1.5))
lights.append(area('Soft front fill',(0,.3,2.6),(0,3.5,1),(.65,.73,1),145,4))
lights.append(area('Warm ceiling bounce',(1,3.1,2.98),(0,3,0),(1,.68,.4),90,2))
lights.append(area('Monitor bounce',(-1.85,3.7,1.3),(-.7,3.3,1),(.3,.7,1),9,.5))
lights.append(area('Desk lamp pool',lamp_position,(1.75,2.3,.8),(1,.62,.28),12,.18))
# Exportable accent lights complement the non-exportable area-light render rig.
for name,loc,color,energy in [('Practical_Desk',lamp_position,(1,.63,.3),5),('Practical_Monitor',(-1.8,3.7,1.3),(.3,.65,1),3)]:
    data=bpy.data.lights.new(name,'POINT');data.energy=energy;data.color=color;data.shadow_soft_size=.15
    o=bpy.data.objects.new(name,data);COLLECTION.objects.link(o);o.location=loc

category('09 Review cameras')
def camera(name,loc,target,lens=23):
    data=bpy.data.cameras.new(name);data.lens=lens;data.clip_start=.05;data.clip_end=100
    ob=bpy.data.objects.new(name,data);COLLECTION.objects.link(ob);ob.location=loc;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler();return ob
wide=camera('Review_Wide',(-.42,5.75,1.65),(0,1.8,1.35),20)
leftcam=camera('Review_Left',(.35,4.9,1.85),(-1.7,3.1,1.5),22)
top=camera('Review_Overhead',(0,3.1,8),(0,3.1,0),22)
scene.camera=wide
# A convenient initial editor view when the user opens the .blend.
for screen in bpy.data.screens:
    for area_ in screen.areas:
        if area_.type=='VIEW_3D':
            area_.spaces.active.region_3d.view_perspective='CAMERA'
# Save before rendering so the editable artifact is available even if rendering fails.
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'room-draft.blend'))

# Export in memory; the saved .blend retains text, curves and modifiers.
from export_room import export_room
export_room(ROOT/'public/models/room-draft.glb')
# Reload the editable original for review renders.
bpy.ops.wm.open_mainfile(filepath=str(OUT/'room-draft.blend'))
scene=bpy.context.scene
report={'source':'room-draft.blend','export':'public/models/room-draft.glb','meters':{'width':4.8,'depth':6.2,'height':3.1},'objects':len(scene.objects),'meshes':sum(o.type=='MESH' for o in scene.objects),'interactive':['About_Whiteboard','Project_Notebook','Experience_Board','Record_Player'],'reference_notes':'Original reconstruction from supplied wide room references; images and third-party models are not embedded. Area light rig is for Blender review, not baked into GLB.'}
(OUT/'manifest.json').write_text(json.dumps(report,indent=2)+'\n')
if '--render' in sys.argv:
    for name,cam in [('wide-cool','Review_Wide'),('left-detail','Review_Left'),('overhead','Review_Overhead')]:
        scene.camera=bpy.data.objects[cam]
        bpy.data.objects['Ceiling removable for overhead review'].hide_render=(name=='overhead')
        scene.render.filepath=str(PREVIEWS/(name+'.png'))
        bpy.ops.render.render(write_still=True)
    bpy.data.objects['Ceiling removable for overhead review'].hide_render=False
    bpy.data.objects['Cool window key'].data.color=(1,.64,.34)
    bpy.data.objects['Cool window key'].data.energy=300
    bpy.data.objects['Soft front fill'].data.color=(.8,.72,.68)
    scene.camera=bpy.data.objects['Review_Wide'];scene.render.filepath=str(PREVIEWS/'wide-warm.png')
    bpy.ops.render.render(write_still=True)
print('ROOM_DRAFT_COMPLETE',json.dumps(report))
