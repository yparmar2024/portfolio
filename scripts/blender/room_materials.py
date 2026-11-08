"""Small, original tileable PBR maps, shared by Blender and the glTF export."""
import bpy
import numpy as np
import struct
import zlib


def png(path, pixels):
    pixels = np.uint8(np.clip(pixels, 0, 1) * 255)
    height, width, _ = pixels.shape
    def chunk(kind, data):
        return struct.pack('!I', len(data)) + kind + data + struct.pack('!I', zlib.crc32(kind + data))
    raw = b''.join(b'\0' + row.tobytes() for row in pixels)
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('!2I5B', width, height, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))


def surface_maps(materials, directory):
    directory.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(914)
    size = 256
    y, x = np.mgrid[0:size, 0:size] / size
    noise = rng.random((size, size)) - .5
    cloud = (np.sin(x*6.283 + np.cos(y*12.566)) + np.sin(y*18.85 + np.sin(x*12.566))) * .5
    weave = np.sin(x*np.pi*size/2) * np.sin(y*np.pi*size/2)
    grain = np.sin(x*6.283*27 + 1.6*np.sin(y*6.283*2) + .6*np.sin(y*6.283*7))
    patterns = {
        'wood': (.075*grain + .07*cloud + .06*noise, .06*grain + .04*noise, .56, 1.2),
        'paint': (.045*cloud + .045*noise + .018*grain, .12*noise + .04*grain, .47, 1.3),
        'plaster': (.025*cloud + .045*noise, .4*noise + .05*cloud, .93, 1.5),
        'fabric': (.11*weave + .1*noise + .045*cloud, .4*weave + .18*noise, .96, 3),
        'rug': (.24*weave + .28*noise + .09*cloud, .5*weave + .3*noise, 1, 2),
        'cork': (.26*noise + .13*cloud, .45*noise, .98, 4),
    }
    def load(path, noncolor=False):
        image = bpy.data.images.load(str(path), check_existing=True)
        if noncolor: image.colorspace_settings.name = 'Non-Color'
        image.pack()
        return image
    shared = {}
    for kind, (_, height, roughness, _) in patterns.items():
        dx = (np.roll(height, -1, 1) - np.roll(height, 1, 1)) * .5
        dy = (np.roll(height, -1, 0) - np.roll(height, 1, 0)) * .5
        normal = np.stack([-dx, dy, np.ones_like(dx)], axis=-1)
        normal /= np.linalg.norm(normal, axis=-1, keepdims=True)
        normal_path = directory / (kind + '-normal.png')
        png(normal_path, normal * .5 + .5)
        orm = np.ones((size, size, 3))
        orm[:, :, 1] = np.clip(roughness + noise*.12 + cloud*.03, .2, 1)
        orm[:, :, 2] = 0
        rough_path = directory / (kind + '-roughness.png')
        png(rough_path, orm)
        shared[kind] = (load(normal_path, True), load(rough_path, True))
    kinds = {'wood':'wood', 'edge':'wood', 'cabinet':'paint', 'teal':'paint', 'plaster':'plaster',
             'chair':'fabric', 'bluecloth':'fabric', 'greencloth':'fabric', 'purple':'fabric',
             'rug':'rug', 'cork':'cork', 'linen':'fabric'}
    materials['linen'] = materials['cream'].copy()
    materials['linen'].name = 'Woven unbleached linen'
    for key, kind in kinds.items():
        mat = materials[key]
        nodes, links = mat.node_tree.nodes, mat.node_tree.links
        shader = nodes.get('Principled BSDF')
        base = np.array(shader.inputs['Base Color'].default_value[:3])
        variation, _, _, density = patterns[kind]
        rgb = np.clip(base[None, None, :] * (1 + variation[:, :, None]), 0, 1)
        # PNG base color is encoded in sRGB; normal/roughness data stays linear.
        rgb = np.where(rgb <= .0031308, rgb*12.92, 1.055*np.power(rgb, 1/2.4)-.055)
        path = directory / (key + '-color.png')
        png(path, rgb)
        color = nodes.new('ShaderNodeTexImage'); color.image = load(path)
        links.new(color.outputs['Color'], shader.inputs['Base Color'])
        normal_tex = nodes.new('ShaderNodeTexImage'); normal_tex.image = shared[kind][0]
        normal = nodes.new('ShaderNodeNormalMap'); normal.inputs['Strength'].default_value = .6
        links.new(normal_tex.outputs['Color'], normal.inputs['Color'])
        links.new(normal.outputs['Normal'], shader.inputs['Normal'])
        rough_tex = nodes.new('ShaderNodeTexImage'); rough_tex.image = shared[kind][1]
        channels = nodes.new('ShaderNodeSeparateColor')
        links.new(rough_tex.outputs['Color'], channels.inputs['Color'])
        links.new(channels.outputs['Green'], shader.inputs['Roughness'])
        mat['uv_density'] = density


def assign_uvs(scene):
    """Meter-scaled planar UVs; the deformed quilts use one continuous projection."""
    for obj in scene.objects:
        if obj.type != 'MESH' or not any(m and 'uv_density' in m for m in obj.data.materials):
            continue
        mesh = obj.data
        layer = mesh.uv_layers.active or mesh.uv_layers.new(name='SurfaceUV')
        quilt = 'quilt' in obj.name.lower() or 'Floor clothing' in obj.name
        for face in mesh.polygons:
            mat = mesh.materials[face.material_index]
            scale = mat.get('uv_density', 1)
            axis = 2 if quilt else max(range(3), key=lambda i: abs(face.normal[i]))
            axes = [(1, 2), (0, 2), (0, 1)][axis]
            for loop in face.loop_indices:
                p = obj.matrix_world @ mesh.vertices[mesh.loops[loop].vertex_index].co
                layer.data[loop].uv = (p[axes[0]]*scale, p[axes[1]]*scale)
