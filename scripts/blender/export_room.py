"""Export the currently open room without overwriting its editable .blend source."""
from pathlib import Path
import bpy
from collections import defaultdict


def batch_static_geometry():
    """Batch by material within each parent, preserving editable sources and hit groups."""
    bpy.ops.object.select_all(action='DESELECT')
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    # Evaluate bevels and cloth thickness before joining. All source modifiers
    # remain in the .blend on disk because this export never saves the scene.
    bpy.ops.object.convert(target='MESH')
    buckets = defaultdict(list)
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH':
            continue
        # The overhead viewer must still toggle the ceiling independently.
        if obj.name.startswith('Ceiling removable') or obj.get('keep_separate') or obj.get('interaction'):
            continue
        material_key = tuple(m.name if m else '' for m in obj.data.materials)
        parent_key = obj.parent.name if obj.parent else 'Room_Static'
        buckets[(parent_key, material_key)].append(obj)
    for (parent_key, material_key), objects in buckets.items():
        if len(objects) < 2:
            continue
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects: obj.select_set(True)
        bpy.context.view_layer.objects.active = objects[0]
        bpy.ops.object.join()
        bpy.context.object.name = parent_key + '__' + '_'.join(material_key)


def export_room(destination):
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    # Text and bevelled curves must become geometry for the browser. This only
    # changes the in-memory scene; never save the .blend after this conversion.
    for obj in list(bpy.context.scene.objects):
        if obj.type in {'CURVE', 'FONT'}:
            bpy.ops.object.select_all(action='DESELECT')
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.convert(target='MESH')
    batch_static_geometry()
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.context.scene.objects:
        if obj.type in {'MESH', 'EMPTY'} or (obj.type == 'LIGHT' and obj.data.type == 'POINT'):
            obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=str(destination), export_format='GLB', use_selection=True,
        export_apply=True, export_extras=True, export_lights=True, export_cameras=False,
    )


if __name__ == '__main__':
    export_room(Path(__file__).resolve().parents[2] / 'public/models/room-draft.glb')
