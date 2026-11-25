"""Editable room geometry, separated from build/export orchestration."""

def build_furnishings(api):
    globals().update(api)
    category('04 Workstations and chairs')
    def chair(name,x,y,angle):
        group=empty(name)
        cube('Chair upholstered seat',(x,y,.49),(.48,.48,.11),M['chair'],.07,group)
        cube('Chair rounded back',(x,y+.23,.87),(.47,.095,.55),M['chair'],.08,group)
        cylinder('Chair column',(x,y,.1),(x,y,.47),.035,M['chrome'],group)
        for i in range(5):
            a=i*math.tau/5;end=(x+.32*math.cos(a),y+.32*math.sin(a),.075)
            cylinder('Chair spoke',(x,y,.12),end,.018,M['black'],group)
            uv('Caster',end,(.045,.045,.04),M['black'],group)
        # Group pivot is intentionally centered for editing/animation.
        for child in group.children:child.location-=Vector((x,y,0))
        group.location=(x,y,0);group.rotation_euler.z=angle
    chair('Chair_Left',-1.14,3.5,-.45)
    chair('Chair_Right',1.02,1.8,2.9)
    # Left monitors face the central aisle (+X).
    for y,z in [(3.4,1.25),(4.12,1.37)]:
        cube('Monitor housing',(-2.03,y,z),(.055,.69,.43),M['black'],.018,left)
        cube('Monitor display',(-1.997,y,z),(.006,.63,.37),M['screen'],.002,left)
        cube('Monitor stem',(-2.06,y,.96),(.035,.04,.26),M['black'],.008,left)
        cube('Monitor foot',(-2.04,y,.837),(.3,.31,.025),M['black'],.01,left)
        for j in range(7):cube('Screen code line',(-1.99,y-.23+(j%3)*.035,z+.12-j*.037),(.003,.3-(j%3)*.06,.008),M['cream'],0,left)
    cube('Keyboard',(-1.7,3.65,.84),(.24,.62,.025),M['gray'],.012,left)
    for a in range(4):
        for b in range(12):cube('Keyboard key',(-1.78+a*.047,3.39+b*.045,.858),(.034,.035,.012),M['cream'],.003,left)
    uv('Mouse',(-1.7,4.12,.86),(.055,.09,.025),M['black'],left)
    # Laptop on the right, facing inward (-X).
    cube('Laptop base',(1.87,1.95,.84),(.4,.6,.025),M['gray'],.008,right)
    cube('Laptop screen',(2.04,1.95,1.06),(.025,.6,.42),M['black'],.012,right,rot=(0,-.15,0))
    cube('Laptop display',(2.014,1.95,1.06),(.006,.54,.35),M['screen'],.003,right,rot=(0,-.15,0))
    for j in range(8):cube('Laptop text line',(2.006,1.75+j*.045,1.06),(.004,.025,.21),M['cream'],0,right)
    # Notebook project pages, deliberately separate from the desktop.
    notebook=empty('Project_Notebook',kind='projects')
    cube('Notebook cover',(-1.8,2.5,.85),(.36,.45,.025),M['red'],.006,notebook)
    cube('Notebook page',(-1.8,2.5,.867),(.34,.43,.008),M['paper'],.001,notebook)
    for y in [2.35+i*.035 for i in range(9)]:cube('Notebook handwriting',(-1.8,y,.873),(.24,.002,.001),M['blue'],0,notebook)

    category('05 Whiteboard and wall details')
    board=empty('About_Whiteboard',kind='about')
    cube('Whiteboard frame',(-2.36,3.65,1.97),(.055,2.5,1.38),M['metal'],.008,board)
    cube('Whiteboard surface',(-2.322,3.65,1.97),(.018,2.42,1.3),M['whiteboard'],.004,board)
    # Text local XY is mapped onto the left wall, facing +X.
    wallrot=(math.pi/2,0,math.pi/2)
    text('Board title','HELLO, I’M YASH',(-2.306,3.3,2.45),.12,M['red'],wallrot,board)
    for i,line in enumerate(['BUILD / BREAK / LEARN','01  IDEAS INTO CODE','02  KEEP EXPLORING','03  MAKE SOMETHING','THAT FEELS LIKE YOU.']):
        text('Board writing',line,(-2.303,3.3,2.2-i*.16),.068,M['blue'] if i%2 else M['red'],wallrot,board)
    cube('Marker tray',(-2.28,3.65,1.26),(.14,2.45,.035),M['metal'],.005,board)
    for i in range(3):cylinder('Dry erase marker',(-2.25,2.9+i*.25,1.3),(-2.25,3.03+i*.25,1.3),.008,M['red'] if i%2 else M['blue'],board)
    # Rear art: original geometric city poster with text, separate from source photos.
    cube('Rear graphic poster',(1.12,6.16,2.65),(.86,.025,.72),M['ink'],.005)
    text('Poster headline','AFTER HOURS',(1.12,6.135,2.83),.095,M['pink'])
    for i in range(9):
        x=.77+i*.085;h=random.uniform(.12,.33)
        cube('Poster skyline',(x,6.13,2.39+h/2),(.058,.005,h),M['blue'] if i%2 else M['purple'],0)
    # Corkboard with individually pinned notes and photo cards on right wall.
    board2=empty('Experience_Board',kind='experience')
    cube('Corkboard frame',(2.36,1.95,1.65),(.055,1.2,.87),M['wood'],.01,board2)
    cube('Cork surface',(2.32,1.95,1.65),(.025,1.12,.8),M['cork'],.005,board2)
    for i in range(14):
        y=1.48+(i%4)*.25+random.uniform(-.04,.04);z=1.36+(i//4)*.18
        cube('Pinned note',(2.297-i*.0004,y,z),(.008,.19,.15),random.choice([M['paper'],M['yellow'],M['pink'],M['blue']]),.001,board2)
        uv('Pushpin',(2.28-i*.0004,y,z+.055),(.008,.015,.015),M['red'],board2)
        for k in range(3):cube('Note mark',(2.29-i*.0004,y,z-.035+k*.025),(.002,.12,.003),M['ink'],0,board2)
    # Clock above the rear window.
    cylinder('Clock case',(-.42,6.13,2.91),(-.42,6.07,2.91),.18,M['black'],vertices=48)
    cylinder('Clock face',(-.42,6.065,2.91),(-.42,6.059,2.91),.165,M['cream'],vertices=48)
    for i in range(12):
        a=i*math.tau/12
        tube('Clock tick',[(-.42+.14*math.sin(a),6.05,2.91+.14*math.cos(a)),(-.42+.153*math.sin(a),6.05,2.91+.153*math.cos(a))],.003,M['ink'])
    tube('Clock hands',[(-.51,6.04,2.96),(-.42,6.04,2.91),(-.37,6.04,3.025)],.004,M['ink'])

    category('06 Lived-in props')
    def cup(name,x,y,z,mat):
        bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=.04,radius2=.055,depth=.13,location=(x,y,z+.065))
        o=register(bpy.context.object,name,mat)
        cylinder('Cup dark opening',(x,y,z+.128),(x,y,z+.13),.047,M['ink'])
        return o
    for xyz in [(-1.7,3.02,.835),(1.8,1.35,.835),(.35,5.8,.62)]:cup('Paper cup',*xyz,M['red'])
    # Bedside cabinet, lamp and books.
    nightstand=drawers('Bedside cabinet',.5,5.72,.6,.57,.58,-1)
    for i in range(3):cube('Bedside stacked book',(.5,5.75,.61+i*.035),(.38,.3,.03),bookmats[i],.003)
    def desk_lamp(x,y,z):
        cylinder('Lamp base',(x,y,z),(x,y,z+.025),.11,M['black'])
        tube('Lamp articulated arm',[(x,y,z+.025),(x,y,z+.35),(x-.13,y,z+.55)],.012,M['black'])
        bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=.11,radius2=.05,depth=.14,location=(x-.13,y,z+.51))
        register(bpy.context.object,'Lamp shade',M['black'])
        uv('Lamp bulb',(x-.13,y,z+.44),(.04,.04,.025),M['lamp'])
        return (x-.13,y,z+.43)
    lamp_position=desk_lamp(1.96,2.57,.835)
    # Window fan with guard and dimensional blades.
    cube('Box fan housing',(-.42,6.02,1.07),(.66,.16,.61),M['cream'],.04)
    cylinder('Fan dark recess',(-.42,5.92,1.07),(-.42,5.91,1.07),.26,M['gray'],vertices=48)
    for i in range(5):
        a=i*math.tau/5
        blade=uv('Fan blade',(-.42+math.sin(a)*.115,5.89,1.07+math.cos(a)*.115),(.085,.015,.15),M['cream'])
        blade.rotation_euler.y=-a
    for r in [.08,.15,.21,.265]:tube('Fan guard ring',[(-.42+r*math.cos(a*math.tau/48),5.865,1.07+r*math.sin(a*math.tau/48)) for a in range(48)],.0035,M['chrome'],cyclic=True)
    for i in range(12):
        a=i*math.tau/12;tube('Fan guard spoke',[(-.42,5.86,1.07),(-.42+.265*math.cos(a),5.86,1.07+.265*math.sin(a))],.003,M['chrome'])
    uv('Fan hub',(-.42,5.84,1.07),(.06,.02,.06),M['cream'])
    # Turntable, tonearm, vinyl sleeve and speaker.
    records=empty('Record_Player',kind='records')
    cube('Turntable plinth',(-1.98,1.05,.94),(.62,.48,.08),M['wood'],.02,records)
    cylinder('Vinyl record',(-1.98,1.05,.984),(-1.98,1.05,.995),.19,M['ink'],records,48)
    cylinder('Vinyl center label',(-1.98,1.05,.997),(-1.98,1.05,1),.055,M['red'],records)
    tube('Record tonearm',[(-1.73,1.18,1.01),(-1.76,1.03,1.02),(-1.87,.96,1.02)],.008,M['chrome'],records)
    for y in [.3,1.5]:
        cube('Speaker',(-1.99,y,1.05),(.23,.21,.3),M['black'],.01)
        cylinder('Speaker cone',(-1.87,y,1.06),(-1.866,y,1.06),.07,M['gray'])
    # A few geometric comic covers, papers and tape keep visual density editable.
    for i in range(13):
        x=random.uniform(-1,1);y=random.uniform(.9,4.7);a=random.uniform(-1.2,1.2)
        ob=cube('Loose sketch paper',(x,y,.064+i*.0003),(.21,.29,.003),M['paper'],.001,rot=(0,0,a))
        for j in range(4):
            dx=-.07+j*.04
            tube('Sketch line',[(x+dx*math.cos(a),y+dx*math.sin(a),.069+i*.0003),(x+dx*math.cos(a)-.09*math.sin(a),y+dx*math.sin(a)+.09*math.cos(a),.069+i*.0003)],.0018,M['blue'])
    for i in range(7):
        x=-1.96+random.uniform(-.2,.2);y=.2+random.random()*1.2
        cube('Comic on dresser',(x,y,.92+i*.004),(.24,.32,.008),bookmats[i],.002,rot=(0,0,random.uniform(-.25,.25)))
    # Clothing is shaped folded fabric, not spherical placeholder piles.
    for n,(x,y) in enumerate([(.65,3.25),(.45,4.0),(-.65,2.2),(.5,4.7),(-.3,1.25)]):
        clothmat=[M['bluecloth'],M['purple'],M['gray'],M['greencloth'],M['red']][n]
        vs=[];fs=[];nx=16;ny=18;angle=random.uniform(-1.3,1.3)
        for j in range(ny+1):
            for i in range(nx+1):
                u=i/nx;v=j/ny
                # T-shirt silhouette: narrow torso, short sleeves and a cut-out neck.
                width = .38 if v < .62 else (.66 if v < .89 else .45)
                dx=(u-.5)*width;dy=(v-.5)*.64
                vs.append((x+dx*math.cos(angle)-dy*math.sin(angle),y+dx*math.sin(angle)+dy*math.cos(angle),.085+.014*math.sin(u*17+v*4)**2+.05*math.exp(-((u-.45)**2+(v-.6)**2)*12)))
        for j in range(ny):
            for i in range(nx):
                if j >= ny-2 and 6 <= i < 10: continue
                a=j*(nx+1)+i;fs.append((a,a+1,a+nx+2,a+nx+1))
        mesh=bpy.data.meshes.new('Clothing folds');mesh.from_pydata(vs,[],fs);mesh.update()
        o=bpy.data.objects.new('Floor clothing '+str(n),mesh);api['COLLECTION'].objects.link(o);o.data.materials.append(clothmat)
        for poly in mesh.polygons:poly.use_smooth=True
        o.modifiers.new('Cloth thickness','SOLIDIFY').thickness=.006
    # Sneakers as multiple shaped parts.
    for x,y,a in [(.7,2.8,.2),(.85,2.5,-.3)]:
        shoe=cube('Sneaker sole',(x,y,.09),(.12,.27,.035),M['cream'],.04,rot=(0,0,a))
        uv('Sneaker upper',(x,y+.025,.14),(.055,.115,.05),M['bluecloth'])
        for j in range(4):tube('Sneaker lace',[(x-.035,y-.015+j*.018,.182),(x+.035,y-.005+j*.018,.182)],.003,M['cream'])
    # Coiled power and device cables, wall sockets and strip.
    for x,y in [(-1.55,3.4),(1.55,2.3)]:
        tube('Desk power cable',[(x,y,.8),(x+.08,y+.1,.45),(x+.09,y+.12,.12),(x*.75,y-.4,.065),(x*.7,y-.6,.065)],.008,M['black'])
        cube('Power strip',(x*.7,y-.6,.075),(.11,.36,.035),M['cream'],.01)
        for j in range(4):cube('Power socket',(x*.7,y-.72+j*.07,.096),(.05,.035,.003),M['ink'],.003)

    api.update({key: value for key, value in locals().items() if key != "api"})
