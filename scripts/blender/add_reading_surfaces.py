"""Replace obsolete placeholder lettering with editable, UV-mapped room copy.

Run build-scene-prints.mjs first. This migration is safe to repeat on the
finished room; it leaves the shell, furniture, cloth and camera anchors alone.
"""
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
TEXTURES = ROOT / 'context/models/room/textures'


def clear_children(parent_name, keep):
    parent = bpy.data.objects[parent_name]
    for child in list(parent.children):
        if not child.name.startswith(keep):
            bpy.data.objects.remove(child, do_unlink=True)
    return parent


def material(name):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    return mat


def box(name, center, dimensions, mat, parent):
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    matrix = obj.matrix_world.copy()
    obj.parent = parent
    obj.matrix_world = matrix
    return obj


def surface(name, center, right, up, width, height, parent):
    center, right, up = map(Vector, (center, right, up))
    vertices = [center + right * x * width / 2 + up * y * height / 2
                for x, y in [(-1, -1), (1, -1), (1, 1), (-1, 1)]]
    mesh = bpy.data.meshes.new(f'Content_{name}')
    mesh.from_pydata(vertices, [], [(0, 1, 2, 3)])
    uv = mesh.uv_layers.new(name='UVMap')
    for loop, coordinate in zip(uv.data, [(0, 0), (1, 0), (1, 1), (0, 1)]):
        loop.uv = coordinate
    obj = bpy.data.objects.new(f'Content_{name}', mesh)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    obj.matrix_parent_inverse = parent.matrix_world.inverted()
    obj['contentSurface'] = name
    obj['keep_separate'] = True
    mat = material(f'Printed copy — {name}')
    mat.node_tree.nodes.clear()
    nodes = mat.node_tree.nodes
    output = nodes.new('ShaderNodeOutputMaterial')
    shader = nodes.new('ShaderNodeBsdfPrincipled')
    shader.inputs['Roughness'].default_value = .9
    texture = nodes.new('ShaderNodeTexImage')
    path = str(TEXTURES / f'content-{name.lower()}.png')
    image = bpy.data.images.load(path, check_existing=True)
    image.reload()
    image.pack()
    texture.image = image
    mat.node_tree.links.new(texture.outputs['Color'], shader.inputs['Base Color'])
    mat.node_tree.links.new(shader.outputs['BSDF'], output.inputs['Surface'])
    mesh.materials.append(mat)
    return obj


about = clear_children('About_Whiteboard', ('Whiteboard frame', 'Whiteboard surface', 'Marker tray', 'Dry erase marker'))
projects = clear_children('Project_Notebook', ('Notebook cover', 'Notebook page', 'Notebook spiral'))
experience = clear_children('Experience_Board', ('Cork surface', 'Corkboard frame'))
records = bpy.data.objects['Record_Player']
for child in list(records.children):
    if child.name.startswith(('Content_', 'Reading sleeve')):
        bpy.data.objects.remove(child, do_unlink=True)

surface('About', (-2.3115, 3.65, 1.97), (0, 1, 0), (0, 0, 1), 2.39, 1.28, about)
surface('Projects', (-1.8, 2.5, .8725), (0, 1, 0), (-1, 0, 0), .425, .335, projects)
paper = material('Reading paper edge')
paper.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value = (.77, .70, .55, 1)
box('Reading pinned sheet', (2.299, 1.95, 1.65), (.004, 1.04, .72), paper, experience)
surface('Experience', (2.296, 1.95, 1.65), (0, -1, 0), (0, 0, 1), 1.02, .70, experience)
pin = material('Reading brass pins')
pin.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value = (.6, .24, .05, 1)
pin.node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value = .6
for y in [1.46, 2.44]:
    box('Reading pin', (2.286, y, 1.985), (.018, .012, .012), pin, experience)
box('Reading sleeve cardboard', (-2.323, 1.05, 1.18), (.012, .53, .55), paper, records)
surface('Records', (-2.316, 1.05, 1.18), (0, 1, 0), (0, 0, 1), .52, .54, records)

bpy.context.scene['reading_surfaces_version'] = 1
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'context/models/room/room-draft.blend'))
print('Saved four physical reading surfaces; entry and inspection anchors preserved.')
