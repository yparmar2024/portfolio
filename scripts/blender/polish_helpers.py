"""Small modeling helpers for the editable room art pass (Blender Python)."""
import math
import bpy
from mathutils import Vector


def collection(name):
    result = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    if result.name not in bpy.context.scene.collection.children:
        bpy.context.scene.collection.children.link(result)
    return result


def register(obj, name, mat=None, parent=None):
    obj.name = name
    for old in list(obj.users_collection):
        old.objects.unlink(obj)
    collection('10 Illustrated finish').objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    obj.parent = parent
    return obj


def material(name, color, roughness=.7, metallic=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    return mat


def box(name, center, size, mat, bevel=.004, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    obj = register(bpy.context.object, name, mat, parent)
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new('Crafted edge', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        obj.modifiers.new('Face normals', 'WEIGHTED_NORMAL')
    return obj


def curve(name, points, radius, mat, parent=None, closed=False):
    data = bpy.data.curves.new(name, 'CURVE')
    data.dimensions = '3D'
    data.bevel_depth = radius
    data.bevel_resolution = 1
    spline = data.splines.new('POLY')
    spline.points.add(len(points)-1)
    for point, co in zip(spline.points, points):
        point.co = (*co, 1)
    spline.use_cyclic_u = closed
    obj = bpy.data.objects.new(name, data)
    collection('10 Illustrated finish').objects.link(obj)
    obj.data.materials.append(mat)
    obj.parent = parent
    return obj


def mesh(name, vertices, faces, mat, parent=None, smooth=True):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    collection('10 Illustrated finish').objects.link(obj)
    data.materials.append(mat)
    obj.parent = parent
    for face in data.polygons:
        face.use_smooth = smooth
    return obj


def remove_prefixes(*prefixes):
    for obj in list(bpy.context.scene.objects):
        if obj.name.startswith(prefixes):
            bpy.data.objects.remove(obj, do_unlink=True)


def picture(name, center, width, height, mat, facing='rear', parent=None):
    """A UV-mapped print surface; frame/backing remain separate solid geometry."""
    x, y, z = center
    if facing == 'rear':
        points = [(x-width/2,y,z-height/2),(x+width/2,y,z-height/2),
                  (x+width/2,y,z+height/2),(x-width/2,y,z+height/2)]
    elif facing == 'left':
        points = [(x,y-width/2,z-height/2),(x,y+width/2,z-height/2),
                  (x,y+width/2,z+height/2),(x,y-width/2,z+height/2)]
    elif facing == 'right':
        points = [(x,y+width/2,z-height/2),(x,y-width/2,z-height/2),
                  (x,y-width/2,z+height/2),(x,y+width/2,z+height/2)]
    else:
        points = [(x-width/2,y-height/2,z),(x+width/2,y-height/2,z),
                  (x+width/2,y+height/2,z),(x-width/2,y+height/2,z)]
    obj = mesh(name, points, [(0,1,2,3)], mat, parent, False)
    uv = obj.data.uv_layers.new(name='PrintUV')
    for loop, co in zip(uv.data, [(0,0),(1,0),(1,1),(0,1)]):
        loop.uv = co
    obj.modifiers.new('Paper thickness', 'SOLIDIFY').thickness = .001
    return obj


def aim(obj, target):
    obj.rotation_euler = (Vector(target)-obj.location).to_track_quat('-Z', 'Y').to_euler()


def ring(name, center, radius, mat, parent=None, tube_radius=.002):
    x, y, z = center
    return curve(name, [(x+radius*math.cos(i*math.tau/48),
                         y+radius*math.sin(i*math.tau/48),z) for i in range(48)],
                 tube_radius, mat, parent, True)
