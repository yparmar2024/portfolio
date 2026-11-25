"""Sculptural secondary shapes and story details, with complete backs/undersides."""
import math
import bpy
from mathutils import Matrix, Vector
from polish_helpers import box, curve, mesh, picture, material, remove_prefixes, collection
from polish_surfaces import image


def refine_props(directory):
    mats=bpy.data.materials
    ink=mats['ink'];metal=mats['metal'];cloth=mats['chair']
    # The bed is formed steel, with continuous rounded corners and welded joints.
    bed=bpy.data.objects['Bunk_Bed']
    remove_prefixes('Rounded bed end')
    for z in [.45,2.04]:
        for y in [3.5,5.92]:
            points=[(1.12,y,z+.1),(1.12,y,z+.48)]
            for i in range(13):
                a=math.pi-i*math.pi/24
                points.append((1.25+.13*math.cos(a),y,z+.48+.13*math.sin(a)))
            points.append((2.11,y,z+.61))
            for i in range(13):
                a=math.pi/2-i*math.pi/24
                points.append((2.11+.13*math.cos(a),y,z+.48+.13*math.sin(a)))
            points.append((2.24,y,z+.1))
            curve('Bent steel bed end',points,.026,metal,bed)
        for x in [1.12,2.24]:
            box('Bed platform side binding',(x,4.7,z),(.035,2.45,.13),metal,.008,bed)
        for y in [3.5,5.92]:
            box('Bed platform end binding',(1.68,y,z),(1.12,.035,.13),metal,.008,bed)
    for obj in bpy.context.scene.objects:
        if obj.name.startswith('Bed base'):
            obj.data.materials.clear();obj.data.materials.append(ink)
    # The existing generic seat pads gain an actual cushion over a molded shell.
    for name in ['Chair_Left','Chair_Right']:
        parent=bpy.data.objects[name]
        box('Chair molded seat shell',(0,0,.444),(.47,.47,.032),ink,.015,parent)
        for child in parent.children:
            if child.name.startswith('Chair upholstered seat'):
                child.dimensions.z=.075
    # Portrait print offers a different focal point from the landscape artwork.
    art=material('Original headphones print',(.8,.8,.8),.9)
    tex=art.node_tree.nodes.new('ShaderNodeTexImage')
    tex.image=image(directory/'headphones-illustration.png')
    art.node_tree.links.new(tex.outputs['Color'],art.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
    box('Front portrait frame',(-1.12,.025,1.73),(.61,.028,.91),ink,.005)
    # Front wall faces +Y. A negative width supplies the correct outward winding.
    picture('Front headphones illustration',(-1.12,.044,1.73),-.57,.855,art)
    # Replace the duplicate bed print with a portrait in a taller narrow frame.
    remove_prefixes('Bed art frame','Bed rooftop print')
    box('Bed portrait frame',(2.365,4.56,2.77),(.028,.36,.54),ink,.004)
    picture('Bed headphones illustration',(2.347,4.56,2.77),.32,.48,art,'right')
    # A complete skateboard leans on its tail against the front wall.
    group=bpy.data.objects.new('Leaning_Skateboard',None)
    collection('10 Illustrated finish').objects.link(group)
    vertices=[]
    for i in range(48):
        angle=i*math.tau/48
        vertices.append((.115*math.copysign(abs(math.cos(angle))**.55,math.cos(angle)),
                         .018*abs(math.sin(angle))**8,.39*math.sin(angle)))
    deck=mesh('Skateboard laminated deck',vertices,[tuple(range(48))],mats['wood'],group,False)
    deck.modifiers.new('Maple laminate thickness','SOLIDIFY').thickness=.012
    grip=mesh('Skateboard grip',[(x*.95,y-.008,z*.97) for x,y,z in vertices],[tuple(reversed(range(48)))],ink,group,False)
    for z in [-.25,.25]:
        box('Skateboard truck',(0,.046,z),(.17,.035,.025),mats['chrome'],.008,group)
        for x in [-.105,.105]:
            bpy.ops.mesh.primitive_cylinder_add(vertices=20,radius=.026,depth=.027,location=(x,.05,z),rotation=(0,math.pi/2,0))
            from polish_helpers import register
            register(bpy.context.object,'Skateboard urethane wheel',mats['cream'],group)
    group.matrix_world=Matrix.Translation((-.83,.18,.42))@Matrix.Rotation(-.28,4,'X')
    # Hoodie hanging from a real wall hook: closed torso, folded sleeves, open hood.
    box('Coat hook rail',(1.1,.06,1.86),(.55,.045,.10),mats['wood'],.005)
    curve('Coat hook',[(1.1,.075,1.86),(1.1,.18,1.83),(1.1,.19,1.89)],.009,mats['chrome'])
    torso=[];faces=[];rows=30;around=40
    for j in range(rows+1):
        v=j/rows;z=1.05+v*.68
        width=.19+.035*math.sin(v*math.pi)-.065*max(0,(v-.82)/.18)
        for i in range(around):
            a=i*math.tau/around
            x=1.1+width*math.cos(a)+.012*math.sin(v*13+a*2)
            y=.175+(.06+.018*math.sin(v*12+a*3))*math.sin(a)
            torso.append((x,y,z+.013*math.cos(a*5)))
    for j in range(rows):
        for i in range(around):
            a=j*around+i;b=j*around+(i+1)%around
            faces.append((a,b,b+around,a+around))
    body=mesh('Hanging hoodie body',torso,faces,cloth)
    body.modifiers.new('Cotton reverse','SOLIDIFY').thickness=.004
    curve('Hoodie bottom ribbing',torso[:around],.009,cloth,closed=True)
    for side in [-1,1]:
        vs=[];fs=[]
        for j in range(22):
            v=j/21
            for i in range(16):
                a=i*math.tau/16;r=.064-.022*v
                x=1.1+side*(.175+.09*math.sin(v*2.3))+r*math.cos(a)
                y=.18+.028*math.sin(v*4)+r*.55*math.sin(a)
                z=1.62-v*.62+.014*math.cos(v*32+a*3)
                vs.append((x,y,z))
        for j in range(21):
            for i in range(16):
                a=j*16+i;b=j*16+(i+1)%16;fs.append((a,b,b+16,a+16))
        sleeve=mesh('Hoodie folded sleeve',vs,fs,cloth)
        sleeve.modifiers.new('Sleeve thickness','SOLIDIFY').thickness=.004
        curve('Hoodie cuff',vs[-16:],.008,cloth,closed=True)
    vs=[];fs=[]
    for j in range(17):
        v=j/16;z=1.66+v*.25;r=.10*math.sin((v*.8+.15)*math.pi)
        for i in range(25):
            a=math.pi*.13+i/24*math.pi*1.74
            vs.append((1.1+r*math.cos(a),.17-r*.9*math.sin(a),z))
    for j in range(16):
        for i in range(24):
            a=j*25+i;fs.append((a,a+1,a+26,a+25))
    hood=mesh('Open folded hood',vs,fs,cloth)
    hood.modifiers.new('Hood lining','SOLIDIFY').thickness=.006
    for x in [1.04,1.16]:
        curve('Hoodie drawstring',[(x,.245,1.69),(x+.01,.25,1.56),(x-.006,.254,1.48)],.0025,mats['cream'])
    curve('Hoodie pocket seam',[(.99,.241,1.3),(1.02,.245,1.2),(1.18,.245,1.2),(1.21,.241,1.3)],.0017,ink)
