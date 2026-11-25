"""Editable room geometry, separated from build/export orchestration."""

def build_structure(api):
    globals().update(api)
    category('01 Architecture')
    cube('Floor slab',(0,3.1,-.08),(4.8,6.2,.16),M['wood'])
    # Distinct floor boards and end seams.
    for row in range(17):
        for col in range(4):
            x=-2.25+row*.28;y=.75+col*1.55
            cube('Floor plank', (x,y,.008),(.272,1.535,.016),M['wood'] if (row+col)%3 else M['edge'],.003)
    cube('Left plaster wall',(-2.47,3.1,1.55),(.14,6.2,3.1),M['plaster'])
    cube('Right plaster wall',(2.47,3.1,1.55),(.14,6.2,3.1),M['plaster'])
    # Rear wall around a real window aperture.
    for x,w in [(-1.8,1.2),(1.38,2.04)]:cube('Rear teal wall',(x,6.25,1.55),(w,.12,3.1),M['teal'])
    cube('Rear window below',(-.42,6.25,.36),(1.56,.12,.72),M['teal'])
    cube('Rear window above',(-.42,6.25,2.9),(1.56,.12,.4),M['teal'])
    for x in [-2.38,2.38]:
        cube('Skirting',(x,3.1,.09),(.05,6.2,.18),M['cream'])
        cube('Ceiling cornice',(x,3.1,3.03),(.08,6.2,.1),M['cream'])
    cube('Rear skirting',(0,6.15,.09),(4.8,.06,.18),M['cream'])
    ceiling=cube('Ceiling removable for overhead review',(0,3.1,3.17),(4.9,6.3,.12),M['cream'])
    for x in [-1.22,.38]:cube('Window jamb',(x,6.16,1.71),(.09,.15,2.05),M['edge'])
    for z in [.7,2.72]:cube('Window sill',(-.42,6.13,z),(1.78,.28,.09),M['cream'])
    # The website supplies the moving sash. Keep this aperture physically clear.
    cube('Entrance opposite wall',(0,-.08,1.55),(4.8,.16,3.1),M['plaster'])
    cube('Closed room door',(0,.012,1.09),(.95,.06,2.18),M['wood'],.008)
    for x in [-.515,.515]:cube('Door casing',(x,.05,1.12),(.075,.08,2.24),M['cream'])
    cube('Door lintel',(0,.05,2.26),(1.1,.08,.08),M['cream'])
    for z in [.57,1.6]:cube('Door inset panel',(0,.047,z),(.72,.018,.82),M['edge'],.006)
    cylinder('Door handle spindle',(.34,.05,1.05),(.34,.11,1.05),.018,M['chrome'])
    cylinder('Door lever',(.34,.11,1.05),(.19,.11,1.05),.013,M['chrome'])
    # Carpet runner is wide enough to show clutter but preserves a center passage.
    cube('Woven center rug',(0,3.05,.035),(2.5,4.7,.025),M['rug'],.02)
    for x in [-1.17,1.17]:cube('Rug border',(x,3.05,.051),(.025,4.6,.006),M['gray'],0)
    for y in [.8,5.3]:cube('Rug border',(0,y,.051),(2.35,.025,.006),M['gray'],0)

    category('02 Cabinetry and work surfaces')
    def drawers(name,x,y,width,depth,height,side):
        group=empty(name)
        cube(name+' carcase',(x,y,height/2),(width,depth,height),M['wood'],.015,group)
        for i in range(3):
            z=(i+.5)*height/3
            face_x=x+side*(width/2+.014)
            cube('Drawer face',(face_x,y,z),(.035,depth-.04,height/3-.025),M['cabinet'],.009,group)
            cylinder('Drawer handle',(face_x+side*.035,y-.15,z),(face_x+side*.035,y+.15,z),.012,M['chrome'],group)
        return group
    # Left desk runs along the wall, plus a low foreground dresser.
    left=empty('Desk_Left',kind='projects')
    cube('Left desk top',(-1.96,3.55,.79),(.83,3.55,.065),M['edge'],.018,left)
    for y in [2.1,4.95]:drawers('Left desk pedestal',-1.98,y,.71,.56,.74,1)
    drawers('Foreground dresser',-1.97,.78,.83,1.38,.82,1)
    cube('Dresser cap',(-1.96,.78,.87),(.9,1.44,.07),M['edge'])
    # Right writing desk and storage.
    right=empty('Desk_Right',kind='experience')
    cube('Right desk top',(1.98,1.95,.79),(.83,1.65,.065),M['edge'],.018,right)
    drawers('Right pedestal',1.99,2.5,.7,.5,.74,-1)
    for y in [1.2,2.7]:cube('Desk leg',(1.62,y,.37),(.055,.055,.74),M['black'],.005,right)
    # Tall wardrobes at the front, matching the framing cabinets in the refs.
    for side in [-1,1]:
        x=side*2.02
        cube('Tall wardrobe',(x,.37,1.45),(.73,.66,2.9),M['cabinet'],.02)
        for z,h in [(.55,.86),(1.58,1.05),(2.55,.76)]:
            cube('Wardrobe door',(x-side*.38,.37,z),(.04,.62,h),M['cabinet'],.01)
            cylinder('Wardrobe handle',(x-side*.415,.2,z-.12),(x-side*.415,.2,z+.12),.012,M['chrome'])
        shelf_y, shelf_length, shelf_base = (1.48,1.5,1.95) if side == -1 else (1.95,1.65,2.25)
        for z in [shelf_base,2.72]:cube('Wall shelf',(side*2.11,shelf_y,z),(.55,shelf_length,.055),M['wood'],.008)
        cube('Overhead cupboard',(side*2.12,2.8,2.96),(.5,2.4,.36),M['cabinet'],.015)
        for y in [shelf_y-shelf_length/2,shelf_y+shelf_length/2]:
            cube('Shelf end',(side*2.12,y,(shelf_base+2.72)/2),(.53,.055,2.72-shelf_base),M['wood'],.006)
    # Book spines are varied geometrically; a few readable labels carry the scale.
    bookmats=[M[k] for k in ['red','cream','teal','blue','gray','purple','yellow']]
    for side in [-1,1]:
        base = 1.98 if side == -1 else 2.28
        for i in range(16 if side == -1 else 18):
            y=(.85 if side == -1 else 1.2)+i*.084;h=random.uniform(.23,.40)
            o=cube('Shelf book',(side*2.09,y,base+h/2),(.34,.06,h),random.choice(bookmats),.003)
            o.rotation_euler.x=random.uniform(-.04,.04)
            for z in [base+h*.16,base+h*.85]:cube('Book spine band',(side*1.915,y,z),(.006,.057,.009),M['cream'],0)

    category('03 Bunk bed and textiles')
    bed=empty('Bunk_Bed')
    for x in [1.12,2.24]:
        for y in [3.5,5.92]:cylinder('Bed upright',(x,y,.08),(x,y,2.56),.035,M['metal'],bed)
    for z in [.45,2.04]:
        cube('Bed base',(1.68,4.7,z),(1.2,2.5,.12),M['wood'],.025,bed)
        cube('Mattress',(1.68,4.7,z+.15),(1.12,2.4,.23),M['cream'],.09,bed)
        for y in [3.5,5.92]:
            tube('Rounded bed end',[(1.12,y,z+.1),(1.12,y,z+.52),(1.18,y,z+.61),(2.18,y,z+.61),(2.24,y,z+.52),(2.24,y,z+.1)],.025,M['metal'],bed)
        for x in [1.12,2.24]:cylinder('Side safety rail',(x,3.5,z+.48),(x,5.92,z+.48),.025,M['metal'],bed)
        for j in range(2):
            pillow=cube('Soft pillow',(1.68+(j-.5)*.48,5.55,z+.33),(.48,.46,.17),M['cream'],.085,bed)
            pillow.rotation_euler.z=(j-.5)*.12
    # Actual draped cloth surfaces, with hems following their wavy shape.
    def blanket(name,cx,cy,base,mat,width=1.18,length=1.6,drape=.32):
        verts=[];faces=[];nx=28;ny=32
        for j in range(ny+1):
            v=j/ny
            for i in range(nx+1):
                u=i/nx;x=cx+(u-.5)*width;y=cy+(v-.5)*length
                z=base+.018*math.sin(u*35+v*8)+.024*math.sin(v*25-u*10)
                # Overhang drops beyond the left mattress edge.
                edge=max(0,(.18-u)/.18);z-=edge*edge*drape
                verts.append((x,y,z))
        for j in range(ny):
            for i in range(nx):a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
        mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
        obj=bpy.data.objects.new(name,mesh);api['COLLECTION'].objects.link(obj);obj.data.materials.append(mat);obj.parent=bed
        for p in mesh.polygons:p.use_smooth=True
        solid=obj.modifiers.new('Fabric thickness','SOLIDIFY');solid.thickness=.009
        for j in [0,ny]:tube('Stitched blanket hem',[verts[j*(nx+1)+i] for i in range(nx+1)],.004,M['cream'],bed)
        for j in range(4,ny,6):tube('Quilt stitch',[tuple(Vector(verts[j*(nx+1)+i])+Vector((0,0,.005))) for i in range(nx+1)],.0018,M['gray'],bed)
        for i in range(6,nx,6):tube('Quilt lengthwise stitch',[tuple(Vector(verts[j*(nx+1)+i])+Vector((0,0,.006))) for j in range(ny+1)],.0018,M['gray'],bed)
    blanket('Lower blue quilt',1.55,4.45,.78,M['bluecloth'],1.45,1.7,.38)
    blanket('Upper green quilt',1.55,4.45,2.37,M['greencloth'],1.45,1.7,.4)
    # Hanging scarf/blanket across the rail.
    verts=[];faces=[]
    for j in range(23):
        for i in range(13):
            u=i/12;v=j/22
            if v < .16:
                angle=v/.16*math.pi
                x=1.12+.06*math.cos(angle);z=2.52+.06*math.sin(angle)
            else:
                x=1.06+.01*math.cos(u*23+v*2);z=2.52-(v-.16)/.84*1.12
            verts.append((x,5.57+(u-.5)*.42,z+.006*math.sin(u*24)))
    for j in range(22):
        for i in range(12):a=j*13+i;faces.append((a,a+1,a+14,a+13))
    mesh=bpy.data.meshes.new('Draped purple throw');mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new('Draped purple throw',mesh);api['COLLECTION'].objects.link(o);o.data.materials.append(M['purple']);o.parent=bed
    for p in mesh.polygons:p.use_smooth=True
    for x in [1.3,1.8]:cylinder('Ladder side',(x,3.34,.1),(x,3.34,2.5),.025,M['metal'],bed)
    for z in [.3,.65,1,1.35,1.7,2.05]:cylinder('Ladder rung',(1.3,3.34,z),(1.8,3.34,z),.021,M['metal'],bed)

    api.update({key: value for key, value in locals().items() if key != "api"})
