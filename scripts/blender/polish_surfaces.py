"""Painterly, glTF-compatible surface maps; no runtime procedural shaders."""
import bpy
import numpy as np
from room_materials import png
from polish_helpers import material


def noise_field(rng, size, grid):
    """Periodic smooth value noise, with no regular sine-wave wood corrugations."""
    samples = rng.random((grid, grid))
    coords = np.arange(size)*grid/size
    indices = coords.astype(int)
    fraction = coords-indices
    fraction = fraction*fraction*(3-2*fraction)
    row = samples[indices[:,None] % grid, indices[None,:] % grid]
    right = samples[indices[:,None] % grid, (indices[None,:]+1) % grid]
    down = samples[(indices[:,None]+1) % grid, indices[None,:] % grid]
    diagonal = samples[(indices[:,None]+1) % grid, (indices[None,:]+1) % grid]
    return ((row*(1-fraction)+right*fraction)*(1-fraction[:,None]) +
            (down*(1-fraction)+diagonal*fraction)*fraction[:,None])-.5


def image(path, noncolor=False):
    result = bpy.data.images.load(str(path), check_existing=True)
    if noncolor:
        result.colorspace_settings.name = 'Non-Color'
    result.reload()
    result.pack()
    return result


def update_surfaces(directory):
    rng = np.random.default_rng(20261117)
    size = 512
    y, x = np.mgrid[0:size,0:size]/size
    fine = rng.random((size,size))-.5
    cloud = noise_field(rng,size,5)
    brush = noise_field(rng,size,36)
    grain = np.zeros((size,size))
    # Vary stroke widths/paths instead of mechanically repeating wide ridges.
    for i in range(85):
        center = rng.random()+.012*np.sin(y*6.283*rng.integers(1,4)+rng.random()*6)
        distance = np.abs((x-center+.5)%1-.5)
        grain -= np.exp(-(distance/rng.uniform(.0008,.003))**2)*rng.uniform(.08,.3)
    weave = np.sin(x*size*np.pi/2)*np.sin(y*size*np.pi/2+np.pi/2)
    hatch = (np.mod(x+y*.44, .037)<.0018)*.045
    patterns = {
        'wood': (.21*cloud+grain+.05*fine, .065*grain+.025*fine, .72),
        'paint': (.16*cloud+.1*brush+.05*fine-hatch, .025*brush+.025*fine, .48),
        'plaster': (.12*cloud+.08*brush+.07*fine, .08*brush+.1*fine, .94),
        'fabric': (.12*cloud+.14*fine+.08*weave, .18*weave+.1*fine, .98),
        'rug': (.16*cloud+.35*fine+.16*weave, .3*weave+.15*fine, 1),
        'cork': (.25*cloud+.42*fine, .15*cloud+.3*fine, .98),
    }
    settings = {
        'wood': ('wood',(.19,.09,.043),1.1), 'edge': ('wood',(.038,.026,.028),1.2),
        'cabinet': ('paint',(.025,.105,.13),1.1), 'teal': ('paint',(.033,.13,.16),1),
        'plaster': ('plaster',(.39,.33,.32),.7), 'chair': ('fabric',(.045,.12,.17),3),
        'bluecloth': ('fabric',(.022,.05,.12),3.5), 'greencloth': ('fabric',(.048,.085,.036),3.5),
        'purple': ('fabric',(.24,.027,.13),3.5), 'rug': ('rug',(.033,.041,.055),4),
        'cork': ('cork',(.27,.13,.052),3), 'Woven unbleached linen': ('fabric',(.61,.55,.42),4),
    }
    generated=set()
    for name,(kind,base,density) in settings.items():
        mat = bpy.data.materials.get(name)
        if not mat:
            continue
        variation,height,roughness = patterns[kind]
        # Warm/cool pigment variation is in the color texture, not view-dependent.
        rgb = np.clip(np.array(base)[None,None,:]*(1+variation[:,:,None]),0,1)
        rgb[:,:,2] *= 1+cloud*.12
        rgb = np.where(rgb<=.0031308,rgb*12.92,1.055*rgb**(1/2.4)-.055)
        stem = 'finish-'+name.replace(' ','-').lower()
        path = directory/(stem+'-color.png')
        png(path,rgb)
        nodes, links = mat.node_tree.nodes, mat.node_tree.links
        nodes.clear()
        shader = nodes.new('ShaderNodeBsdfPrincipled')
        output = nodes.new('ShaderNodeOutputMaterial')
        links.new(shader.outputs['BSDF'], output.inputs['Surface'])
        tex = nodes.new('ShaderNodeTexImage'); tex.image = image(path)
        links.new(tex.outputs['Color'],shader.inputs['Base Color'])
        normal_path = directory/('finish-'+kind+'-normal.png')
        rough_path = directory/('finish-'+kind+'-roughness.png')
        if kind not in generated:
            dx=(np.roll(height,-1,1)-np.roll(height,1,1))*.5
            dy=(np.roll(height,-1,0)-np.roll(height,1,0))*.5
            normals=np.stack([-dx,dy,np.ones_like(dx)],axis=-1)
            normals/=np.linalg.norm(normals,axis=-1)[:,:,None]
            png(normal_path,normals*.5+.5)
            orm=np.ones((size,size,3));orm[:,:,1]=np.clip(roughness+.12*cloud+.05*fine,.2,1);orm[:,:,2]=0
            png(rough_path,orm)
            generated.add(kind)
        normal_tex=nodes.new('ShaderNodeTexImage');normal_tex.image=image(normal_path,True)
        normal=nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.5
        links.new(normal_tex.outputs['Color'],normal.inputs['Color'])
        links.new(normal.outputs['Normal'],shader.inputs['Normal'])
        rough_tex=nodes.new('ShaderNodeTexImage');rough_tex.image=image(rough_path,True)
        split=nodes.new('ShaderNodeSeparateColor');links.new(rough_tex.outputs['Color'],split.inputs['Color'])
        links.new(split.outputs['Green'],shader.inputs['Roughness'])
        mat['uv_density']=density
        if kind in {'fabric','rug'}:
            shader.inputs['Sheen Weight'].default_value=.18
    # Low specular black and colored steel replace the plastic-looking rail finish.
    for name,rough,metal in [('metal',.38,.82),('chrome',.3,.85),('black',.6,.05)]:
        shader=bpy.data.materials[name].node_tree.nodes.get('Principled BSDF')
        shader.inputs['Roughness'].default_value=rough
        shader.inputs['Metallic'].default_value=metal
    bpy.data.materials['metal'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.10,.13,.16,1)
    # Floor boards share a coherent oak color instead of a dark checkerboard.
    for obj in bpy.context.scene.objects:
        if obj.name.startswith('Floor plank'):
            obj.data.materials.clear();obj.data.materials.append(bpy.data.materials['wood'])
        if obj.name.startswith(('Left desk top','Right desk top','Dresser cap')):
            obj.data.materials.clear();obj.data.materials.append(bpy.data.materials['black'])
    art=bpy.data.materials.get('Original rooftop illustration')
    if art:
        return art
    art=material('Original rooftop illustration',(.8,.8,.8),.88)
    tex=art.node_tree.nodes.new('ShaderNodeTexImage')
    tex.image=image(directory/'rooftops-illustration.png')
    art.node_tree.links.new(tex.outputs['Color'],art.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
    return art
