"""Original prop and surface-detail pass informed by the supplied room studies."""
import bpy
import math
import random
from mathutils import Euler, Quaternion


def add_details(api):
    globals().update({key: api[key] for key in ['category', 'cube', 'uv', 'tube', 'cylinder', 'text', 'empty', 'M']})
    rng = random.Random(307)
    category('06b Hardware and illustrated surfaces')
    leftrot = (math.pi/2, 0, math.pi/2)
    rightrot = (math.pi/2, 0, -math.pi/2)
    # Cabinet doors have actual gaps, hardware and small chips at handled edges.
    for side in [-1, 1]:
        front = side*1.855
        for y in [2.2, 3.4]:
            cube('Upper cabinet inset door', (front, y, 2.96), (.028, 1.17, .32), M['cabinet'], .007)
            cylinder('Upper cabinet pull', (front-side*.035, y-.39, 2.88), (front-side*.035, y-.39, 3.04), .009, M['chrome'])
        for y in [1.65, 2.65, 3.55, 3.94]:
            for i in range(4):
                cube('Small cabinet edge wear', (front-side*.018, y+i*.013, 2.805+rng.uniform(0,.007)), (.002, .008, .004), M['cream'], 0)
        # Storage boxes on top of the lower shelves, with label and handle cut-outs.
        if side < 0:
            cube('Archive box support shelf',(-2.11,1.48,2.4375),(.55,1.5,.025),M['wood'],.005)
        for y in ([1.0, 1.65] if side < 0 else []):
            cube('Archive box', (side*2.1, y, 2.56), (.35, .42, .22), M['cream'], .006)
            cube('Archive box lid', (side*2.1, y, 2.68), (.37, .44, .025), M['gray'], .004)
            cube('Archive box handle', (side*1.92, y, 2.6), (.003, .09, .025), M['ink'], .009)
    # Selected book spines gain individual typography, instead of identical bands.
    titles = ['DESIGN', 'CODE', 'PHYSICS', 'SKETCHES', 'CITY', 'SYSTEMS', 'FILM', 'MATH']
    for side in [-1, 1]:
        base = 1.98 if side < 0 else 2.28
        rot = (Euler(leftrot if side < 0 else rightrot).to_quaternion() @ Quaternion((0,0,1), math.pi/2)).to_euler()
        for i in range(0, 16, 2):
            y = (.85 if side < 0 else 1.2) + i*.084
            text('Printed book title', titles[i//2], (side*1.912,y,base+.1), .024, M['paper'], rot)
    # Original wall prints and taped sketches, no downloaded artist images.
    for side, y, z, title in [(-1,1.65,1.38,'NIGHT / SHIFT'), (1,5.25,2.78,'MAKE WAVES')]:
        h,w = (.63,.48) if side < 0 else (.43,.65)
        x = side*2.365
        cube('Framed illustrated print', (x,y,z), (.025,w+.04,h+.04), M['black'], .004)
        cube('Print color field', (x-side*.018,y,z), (.004,w,h), M['ink'], 0)
        face = x-side*.025
        text('Print headline', title, (face,y,z+h*.32), .038, M['paper'], leftrot if side < 0 else rightrot)
        for i in range(12):
            yy = y-w*.42+i*w*.075
            height = rng.uniform(.06,h*.48)
            cube('Graphic skyline stroke', (face-side*.002,yy,z-h*.35+height/2), (.003,w*.055,height), M['pink'] if i%3 else M['blue'], 0)
        for dy in [-w*.3,w*.3]:
            cube('Print corner tape', (face-side*.006,y+dy,z+h*.46), (.003,.09,.04), M['cream'], .001, rot=(.15,0,0))
    board = bpy.data.objects['About_Whiteboard']
    # Drawings occupy the unused right side of the whiteboard.
    for yy,zz,label in [(4.12,2.23,'IDEA'),(4.65,2.23,'BUILD'),(4.4,1.83,'PLAY')]:
        tube('Marker flowchart box', [(-2.298,yy-.17,zz-.09),(-2.298,yy+.17,zz-.09),(-2.298,yy+.17,zz+.09),(-2.298,yy-.17,zz+.09)], .003, M['blue'], board, True)
        text('Marker flowchart label',label,(-2.292,yy,zz-.025),.05,M['red'],leftrot,board)
    for points in [[(4.29,2.23),(4.48,2.23)],[(4.65,2.13),(4.4,1.94)],[(4.24,1.83),(4.1,2.13)]]:
        tube('Marker connecting arrow',[(-2.293,y,z) for y,z in points],.003,M['red'],board)
    for k in range(6):
        angle=k*math.tau/6
        tube('Marker sunburst',[(-2.292,4.45+.1*math.cos(angle),1.5+.1*math.sin(angle)),(-2.292,4.45+.17*math.cos(angle),1.5+.17*math.sin(angle))],.003,M['red'],board)
    for y in [2.55,4.75]:
        cube('Taped reference postcard',(-2.285,y,1.58),(.004,.19,.25),M['paper'],.001,board,rot=(.08,0,0))
        cube('Translucent-style paper tape',(-2.278,y,1.72),(.004,.09,.045),M['cream'],.001,board)
        for i in range(4):cube('Postcard diagram',(-2.278,y-.055+i*.035,1.6),(.003,.018,.11-i*.018),M['blue'],0,board)
    cork = bpy.data.objects['Experience_Board']
    for y,z in [(1.65,1.55),(2.25,1.79),(1.9,1.93)]:
        cube('Layered instant photo border',(2.262,y,z),(.008,.21,.25),M['paper'],.001,cork,rot=(.08,0,0))
        cube('Original instant photo graphic',(2.255,y,z+.02),(.003,.18,.17),M['ink'],0,cork)
        for i in range(5):cube('Photo skyline',(2.25,y-.07+i*.035,z+.005),(.002,.024,.06+rng.random()*.06),M['blue'] if i%2 else M['pink'],0,cork)
        uv('Photo pin',(2.24,y,z+.11),(.009,.013,.013),M['yellow'],cork)
    # Separate dark notebook spirals and diagrams preserve the project target.
    notebook = bpy.data.objects['Project_Notebook']
    for j in range(11):
        y=2.31+j*.037
        tube('Notebook spiral',[(-1.96+.012*math.cos(a*math.tau/16),y,.882+.012*math.sin(a*math.tau/16)) for a in range(16)],.0015,M['black'],notebook,True)
    # Printed strips, panels and page folds make the comic stacks readable as books.
    comics=[o for o in bpy.context.scene.objects if o.name.startswith('Comic on dresser')]
    for i,obj in enumerate(comics):
        x,y,z=obj.location
        text('Comic cover title',['MIDNIGHT','ORBIT','CITY SIGNAL'][i%3],(x,y+.07,z+.006),.025,M['paper'],(0,0,0))
        for j in range(3):
            cube('Comic cover panel',(x-.073+j*.07,y-.03,z+.006),(.06,.14,.002),M['ink'] if j%2 else M['blue'],0)
        text('Comic issue number',f'0{i+1}',(x+.075,y-.12,z+.008),.025,M['yellow'],(0,0,0))

    category('06c Everyday desk objects')
    # Rounded electric cooker, an identifying silhouette in the wide references.
    cooker=empty('Countertop_Cooker')
    cube('Cooker body',(-2.04,2.9,.96),(.32,.34,.23),M['cream'],.085,cooker)
    cube('Cooker lid',(-2.04,2.9,1.08),(.33,.35,.05),M['gray'],.045,cooker)
    tube('Cooker carry handle',[(-2.1,2.9,1.1),(-2.1,2.9,1.15),(-1.98,2.9,1.15),(-1.98,2.9,1.1)],.015,M['black'],cooker)
    cube('Cooker controls',(-1.87,2.9,.97),(.008,.13,.07),M['black'],.015,cooker)
    uv('Cooker status LED',(-1.862,2.87,.975),(.004,.012,.012),M['red'],cooker)
    # A real pencil pot and angled individual pencils beside the monitors.
    cylinder('Pencil pot',(-2.15,4.6,.83),(-2.15,4.6,.98),.06,M['black'])
    for j in range(9):
        a=j*math.tau/9;x=-2.15+.035*math.cos(a);y=4.6+.035*math.sin(a)
        top=(x+.025*math.cos(a),y+.025*math.sin(a),1.09+rng.uniform(0,.05))
        cylinder('Colored pencil',(x,y,.92),top,.004,[M['red'],M['yellow'],M['blue']][j%3])
        uv('Pencil graphite',top,(.003,.003,.006),M['ink'])
    # Snack tubs, drink cans and a water bottle with original generic labels.
    for i,(x,y,z) in enumerate([(-1.71,2.9,.835),(-1.78,2.16,.835),(1.8,2.53,.835)]):
        cylinder('Snack cup',(x,y,z),(x,y,z+.13),.055,M['yellow'] if i%2 else M['red'])
        cylinder('Snack rim',(x,y,z+.13),(x,y,z+.14),.058,M['cream'])
        for k in range(3):
            tube('Snack label stripe',[(x+.056*math.cos(a*math.tau/24),y+.056*math.sin(a*math.tau/24),z+.04+k*.023) for a in range(24)],.002,M['paper'],cyclic=True)
    for x,y,z in [(-1.68,4.48,.835),(1.72,1.36,.835)]:
        cylinder('Drink can',(x,y,z),(x,y,z+.125),.034,M['blue'])
        for zz in [z+.006,z+.125]:cylinder('Can rolled rim',(x,y,zz),(x,y,zz+.003),.035,M['chrome'])
        tube('Can pull tab',[(x+.012*math.cos(a*math.tau/20),y+.006*math.sin(a*math.tau/20),z+.13) for a in range(20)],.002,M['chrome'],cyclic=True)
        text('Can label','FIZZ',(x,y-.035,z+.05),.018,M['paper'])
    cylinder('Reusable water bottle',(2.16,1.37,.835),(2.16,1.37,1.06),.045,M['blue'])
    cylinder('Bottle cap',(2.16,1.37,1.06),(2.16,1.37,1.09),.035,M['black'])
    # Headphones rest on the dresser with a shaped headband and padded cups.
    headphones=empty('Headphones')
    tube('Headphone headband',[(-1.91+.13*math.cos(a*math.pi/24),.6+.14*math.sin(a*math.pi/24),.97) for a in range(25)],.018,M['black'],headphones)
    for x in [-2.04,-1.78]:
        cube('Headphone ear cup',(x,.6,.96),(.065,.1,.07),M['black'],.025,headphones)
        cube('Headphone ear cushion',(x,.6,1),(.055,.085,.02),M['chair'],.02,headphones)
    tube('Headphone cable',[(-1.79,.6,.94),(-1.72,.45,.92),(-1.69,.62,.92),(-1.62,.8,.91),(-1.56,.8,.7)],.003,M['black'],headphones)
    # Game controller on the right desk, with discrete sticks and buttons.
    controller=empty('Desk_Controller')
    cube('Controller bridge',(1.76,2.3,.87),(.21,.11,.045),M['black'],.025,controller)
    for x in [1.68,1.84]:uv('Controller grip',(x,2.27,.87),(.047,.085,.03),M['black'],controller)
    for x in [1.72,1.8]:cylinder('Controller stick',(x,2.29,.89),(x,2.29,.91),.016,M['gray'],controller)
    for a in range(4):uv('Controller face button',(1.84+.015*math.cos(a*math.pi/2),2.33+.015*math.sin(a*math.pi/2),.9),(.006,.006,.004),M['red'] if a%2 else M['blue'],controller)
    # Laptop keys are actual inset pieces, so close views hold up.
    for row in range(4):
        for col in range(10):cube('Laptop key',(1.77+row*.045,1.72+col*.046,.857),(.033,.035,.006),M['black'],.002)
    cube('Laptop trackpad',(1.7,1.95,.857),(.065,.16,.002),M['black'],.004)

    category('06d Floor stories and fabric finishing')
    bag=empty('Floor_Backpack')
    cube('Backpack main body',(-.95,4.83,.29),(.38,.24,.48),M['greencloth'],.11,bag,rot=(0,.14,-.2))
    cube('Backpack front pocket',(-.96,4.685,.23),(.3,.07,.24),M['black'],.045,bag)
    tube('Backpack zipper',[(-1.09,4.64,.35),(-.96,4.63,.38),(-.82,4.64,.35)],.003,M['chrome'],bag)
    tube('Backpack grab loop',[(-1.04,4.84,.53),(-1.03,4.84,.59),(-.87,4.84,.59),(-.86,4.84,.53)],.011,M['black'],bag)
    for x in [-1.1,-.8]:tube('Backpack strap',[(x,4.97,.49),(x-.04,5.07,.25),(x,4.97,.08)],.018,M['black'],bag)
    # Small mesh wastebasket near the rear nightstand.
    x,y=-.25,5.73
    for z in [.055,.12,.2,.28,.36]:
        r=.105+(z-.055)*.12
        tube('Wastebasket ring',[(x+r*math.cos(a*math.tau/32),y+r*math.sin(a*math.tau/32),z) for a in range(32)],.0025,M['chrome'],cyclic=True)
    for a in range(22):
        theta=a*math.tau/22
        tube('Wastebasket diagonal wire',[(x+(.105+t*.036)*math.cos(theta+t*.65),y+(.105+t*.036)*math.sin(theta+t*.65),.055+t*.305) for t in [i/8 for i in range(9)]],.002,M['chrome'])
    for i in range(4):
        ob=uv('Crumpled paper in bin',(x+rng.uniform(-.06,.06),y+rng.uniform(-.06,.06),.12+i*.055),(.055,.05,.045),M['paper'])
        for vertex in ob.data.vertices:vertex.co*=rng.uniform(.86,1.13)
    # Original small hoop above the desk, with a real hanging net.
    cube('Mini hoop backboard',(2.36,3.03,1.73),(.04,.37,.29),M['cream'],.04)
    tube('Hoop backboard target',[(2.333,2.95,1.7),(2.333,3.11,1.7),(2.333,3.11,1.82),(2.333,2.95,1.82)],.004,M['red'],cyclic=True)
    tube('Mini basketball rim',[(2.22+.12*math.cos(a*math.tau/32),3.03+.12*math.sin(a*math.tau/32),1.63) for a in range(32)],.008,M['red'],cyclic=True)
    for i in range(12):
        a=i*math.tau/12
        tube('Mini hoop net',[(2.22+.12*math.cos(a),3.03+.12*math.sin(a),1.63),(2.22+.065*math.cos(a+.22),3.03+.065*math.sin(a+.22),1.45),(2.22+.065*math.cos(a+.5),3.03+.065*math.sin(a+.5),1.43)],.0018,M['cream'])
    # Mattress piping and broad fabric folds give the bunk readable construction.
    for z in [.45,2.04]:
        tube('Mattress bound seam',[(1.14,3.56,z+.19),(2.22,3.56,z+.19),(2.22,5.84,z+.19),(1.14,5.84,z+.19)],.004,M['linen'],cyclic=True)
    for obj in list(bpy.context.scene.objects):
        if obj.name.startswith(('Soft pillow','Mattress')) and obj.type=='MESH':
            obj.data.materials.clear();obj.data.materials.append(M['linen'])
        if obj.name.startswith('Floor clothing'):
            # Disrupt the laid-out T-shirt silhouettes with a folded shoulder and hem.
            for vertex in obj.data.vertices:
                px,py,pz=vertex.co
                vertex.co.z+=.018*math.sin(px*18+py*13)+.016*math.sin(py*26-px*8)
    # Shoe tongues, heel tabs and seams add detail without replacing existing laces.
    for x,y in [(.7,2.8),(.85,2.5)]:
        cube('Sneaker tongue',(x,y+.04,.18),(.05,.065,.013),M['cream'],.015)
        tube('Sneaker side seam',[(x-.05,y-.08,.12),(x-.058,y,.15),(x-.045,y+.1,.15)],.002,M['paper'])
        cube('Sneaker heel tab',(x,y+.12,.16),(.04,.015,.05),M['red'],.005)
