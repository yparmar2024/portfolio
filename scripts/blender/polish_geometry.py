"""Contact fixes and construction detail for close and reverse room views."""
import math
import random
import bpy
import bmesh
from mathutils import Vector, Matrix
from polish_helpers import box, curve, mesh, picture, ring, remove_prefixes, material


def refine_geometry(art):
    mats=bpy.data.materials
    ink=mats['ink'];metal=mats['chrome'];paper=mats['paper']
    # A back support and seat shell make the chairs read as constructed furniture.
    for name in ['Chair_Left','Chair_Right']:
        group=bpy.data.objects[name]
        curve('Chair steel back support',[(0,.02,.43),(0,.19,.44),(0,.265,.65),(0,.265,.94)],.018,ink,group)
        box('Chair underside mechanism',(0,0,.405),(.23,.25,.055),ink,.016,group)
        curve('Chair adjustment lever',[(.08,.03,.4),(.23,.03,.38),(.26,-.03,.38)],.008,metal,group)
        for z in [.14,.33]:
            ring('Chair column collar',(0,0,z),.039,ink,group,.004)
        # Fabric seams sit on the cushion, not floating around it.
        for side in [-1,1]:
            curve('Chair stitched edge',[(side*.21,-.18,.52),(side*.22,0,.54),(side*.21,.18,.52)],.0015,mats['gray'],group)
    # Screen text was in front of the tilted laptop and intersected its top edge.
    remove_prefixes('Laptop text line')
    laptop=bpy.data.objects['Laptop display']
    rotation=laptop.rotation_euler.to_matrix()
    for j in range(10):
        center=laptop.location+rotation@Vector((-.005,-.19+(j%3)*.018,.13-j*.027))
        line=box('Laptop code stroke',center,(.001,.22-(j%4)*.035,.003),mats['blue'],0,bpy.data.objects['Desk_Right'])
        line.rotation_euler=laptop.rotation_euler
    # Dark screens and fine blue/cream code replace the luminous solid cyan blocks.
    shader=mats['Monitor cyan glow'].node_tree.nodes['Principled BSDF']
    shader.inputs['Base Color'].default_value=(.014,.035,.05,1)
    shader.inputs['Emission Color'].default_value=(.018,.055,.085,1)
    shader.inputs['Emission Strength'].default_value=.45
    for obj in bpy.context.scene.objects:
        if obj.name.startswith('Screen code line'):
            obj.dimensions.z=.0035
    # Replace clipped comics/speaker/headphones with a supported arrangement.
    remove_prefixes('Comic on dresser','Comic cover','Comic issue','Speaker','Headphone')
    records=bpy.data.objects['Record_Player']
    dresser=bpy.data.objects['Foreground dresser']
    dresser.matrix_world=Matrix.Translation((0,1.12,0))@Matrix.Diagonal((1,.58,1,1))@Matrix.Translation((0,-.78,0))
    cap=bpy.data.objects['Dresser cap'];cap.location.y=1.12;cap.dimensions.y=.84
    for i,(x,y,z,angle) in enumerate([(-1.97,1.4,.913,.12),(-1.95,1.41,.923,-.05)]):
        book=box('Illustrated comic binding',(x,y,z),(.32,.2,.008),paper,.001)
        print_obj=picture('Illustrated comic cover',(x,y,z+.005),.32,.2,art,'floor')
        # Rotate all pieces around the same pivot, so artwork stays on the cover.
        rotation=Matrix.Translation((x,y,z))@Matrix.Rotation(angle,4,'Z')@Matrix.Translation((-x,-y,-z))
        print_obj.matrix_world=rotation@print_obj.matrix_world
        book.rotation_euler.z=angle
    # Dresser starts beyond the wardrobe, so the turntable remains unobstructed.
    for y in [1.92,2.2]:
        box('Compact speaker',(-2.18,y,.965),(.20,.18,.28),ink,.008)
        for radius,z in [(.055,.945),(.021,1.04)]:
            points=[(-2.072,y+radius*math.cos(a*math.tau/32),z+radius*math.sin(a*math.tau/32)) for a in range(32)]
            curve('Speaker rubber surround',points,.006,mats['black'],closed=True)
            mesh('Speaker cone cloth',[(-2.077,y,z)]+points,[(0,a+1,(a+1)%32+1) for a in range(32)],mats['gray'])
    for radius in [.07,.09,.12,.15,.18]:
        ring('Vinyl etched groove',(-1.98,1.05,.996),radius,mats['black'],records,.00065)
    # The closed entry door has recessed panels and hardware on its visible face.
    remove_prefixes('Door inset panel')
    for z,h in [(.57,.72),(1.6,.82)]:
        box('Door recessed panel',(0,.045,z),(.72,.01,h),mats['wood'],.003)
        for x in [-.38,.38]:box('Door panel molding',(x,.058,z),(.022,.024,h+.05),mats['edge'],.003)
        for zz in [z-h/2-.02,z+h/2+.02]:box('Door panel molding',(0,.058,zz),(.78,.024,.022),mats['edge'],.003)
    for z in [.27,1.12,1.98]:
        box('Door hinge',(-.47,.071,z),(.023,.02,.11),metal,.004)
    box('Door latch escutcheon',(.34,.061,1.05),(.055,.012,.12),metal,.012)
    # Baseboards and reveals close the previously bare wall junctions.
    for x,width in [(-1.47,1.83),(1.47,1.83)]:
        box('Front baseboard',(x,.025,.09),(width,.05,.18),mats['cream'])
    # Electrical fittings add scale. All plates sit on the interior wall surface.
    for x,y in [(-2.391,2.2),(2.391,1.35),(-2.391,4.8)]:
        side=1 if x<0 else -1
        box('Wall outlet plate',(x,y,.33),(.013,.075,.12),mats['cream'],.008)
        for z in [.305,.355]:
            for yy in [y-.012,y+.012]:box('Outlet slot',(x+side*.008,yy,z),(.002,.004,.016),ink,0)
    box('Door light switch',(.72,.014,1.25),(.075,.016,.12),mats['cream'],.006)
    box('Door switch rocker',(.72,.027,1.25),(.03,.012,.057),paper,.003)
    # Rebuild print art on physically backed surfaces, preserving the actual room.
    remove_prefixes('Rear graphic poster','Poster headline','Poster skyline','Print color field',
                    'Print headline','Graphic skyline stroke','Print corner tape','Framed illustrated print')
    box('Rear art frame',(1.2,6.16,2.77),(.82,.027,.56),ink,.005)
    picture('Rear rooftop print',(1.2,6.142,2.77),.78,.52,art)
    box('Left art frame',(-2.365,1.45,1.42),(.028,.72,.50),ink,.004)
    picture('Left rooftop print',(-2.347,1.45,1.42),.68,.453,art,'left')
    box('Bed art frame',(2.365,4.56,2.78),(.028,.82,.55),ink,.004)
    picture('Bed rooftop print',(2.347,4.56,2.78),.78,.52,art,'right')
    # Solid backs, bevels, fasteners and thin ink-colored creases survive all views.
    for x in [1.12,2.24]:
        for y in [3.5,5.92]:
            for z in [.45,2.04]:
                ring('Bed rail weld collar',(x,y,z+.08),.037,mats['black'],bpy.data.objects['Bunk_Bed'],.003)
    rng=random.Random(117)
    wear=material('Exposed paint undercoat',(.20,.25,.23),.88)
    for obj in list(bpy.context.scene.objects):
        if obj.name.startswith(('Wardrobe door','Upper cabinet inset door','Drawer face')):
            side=1 if obj.location.x<0 else -1
            face_x=obj.location.x+side*(obj.dimensions.x/2+.0008)
            y0=obj.location.y-obj.dimensions.y/2
            z0=obj.location.z-obj.dimensions.z/2
            for i in range(8):
                y=y0+rng.random()*obj.dimensions.y
                length=rng.uniform(.008,.034)
                curve('Paint edge scuff',[(face_x,y,z0+.004),(face_x,y+length,z0+.005)],.0008,wear,obj.parent)
    # Give broad surfaces enough vertices for export-time contact shading.
    for obj in bpy.context.scene.objects:
        if obj.type=='MESH' and obj.name.startswith(('Left plaster wall','Right plaster wall','Rear teal',
                'Rear window','Entrance opposite','Floor plank','Left desk top','Right desk top','Woven center rug')):
            bm=bmesh.new();bm.from_mesh(obj.data)
            cuts=2 if obj.name.startswith('Floor plank') else 8
            bmesh.ops.subdivide_edges(bm,edges=list(bm.edges),cuts=cuts,use_grid_fill=True)
            bm.to_mesh(obj.data);bm.free()
