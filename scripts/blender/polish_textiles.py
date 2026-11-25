"""Shaped bedding with supported drapes, closed pillows and stitched construction."""
import math
import bpy
from polish_helpers import mesh, curve, remove_prefixes


def refine_textiles():
    mats = bpy.data.materials
    bed = bpy.data.objects['Bunk_Bed']
    remove_prefixes('Lower blue quilt','Upper green quilt','Stitched blanket hem',
                    'Quilt stitch','Quilt lengthwise stitch','Soft pillow')
    seam = mats['gray']
    for level,(base,mat) in enumerate([(.735,mats['bluecloth']),(2.325,mats['greencloth'])]):
        nx,ny = 48,52
        vertices, faces = [],[]
        for j in range(ny+1):
            v=j/ny
            for i in range(nx+1):
                u=i/nx
                fall=max(0,(.23-u)/.23)
                x=1.145+(max(u,.23)-.23)/.77*1.06-.10*math.sin(fall*math.pi/2)
                y=3.61+v*1.67+.025*math.sin(u*11)*math.sin(v*math.pi)
                # Tension folds radiate from the tucked corner, not a sine-wave sheet.
                fold=.014*math.sin(u*29+v*11)+.018*math.sin(v*22-u*12)
                fold+=.035*math.exp(-((v-.78-u*.12)/.08)**2)
                fold+=.023*math.exp(-((v-.18+u*.1)/.06)**2)
                z=base+.04+fold-.38*fall+.022*math.sin(u*18+v*21)*fall
                vertices.append((x,y,z))
        for j in range(ny):
            for i in range(nx):
                a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
        obj=mesh('Tailored quilt '+str(level),vertices,faces,mat,bed)
        obj.modifiers.new('Quilt fill thickness','SOLIDIFY').thickness=.012
        for j in [0,ny]:
            curve('Bound quilt hem',[vertices[j*(nx+1)+i] for i in range(nx+1)],.0035,seam,bed)
        # Broken, fine stitching catches light without a thick white wire grid.
        for j in range(5,ny,7):
            for i in range(0,nx,2):
                points=[(vertices[j*(nx+1)+k][0],vertices[j*(nx+1)+k][1],
                         vertices[j*(nx+1)+k][2]+.003) for k in [i,i+1]]
                curve('Quilt running stitch',points,.00085,seam,bed)
        for i in [11,20,29,38,47]:
            points=[(vertices[j*(nx+1)+i][0],vertices[j*(nx+1)+i][1],
                     vertices[j*(nx+1)+i][2]+.003) for j in range(ny+1)]
            curve('Quilt woven seam',points,.0011,seam,bed)
        # One full, softly compressed pillow per bunk, with a continuous side seam.
        vs,fs=[],[]
        count,rings=48,24
        for j in range(rings+1):
            phi=-math.pi/2+j*math.pi/rings
            for i in range(count):
                theta=i*math.tau/count
                sign=lambda n: math.copysign(abs(n)**.4,n)
                radius=math.cos(phi)**.45
                x=1.68+.42*sign(math.cos(theta))*radius
                y=5.56+.245*sign(math.sin(theta))*radius
                z=base+.09+.105*math.sin(phi)
                z+=.006*math.sin(theta*13)*math.cos(phi)**3
                vs.append((x,y,z))
        for j in range(rings):
            for i in range(count):
                a=j*count+i;b=j*count+(i+1)%count
                fs.append((a,b,b+count,a+count))
        pillow=mesh('Tailored pillow '+str(level),vs,fs,mats['Woven unbleached linen'],bed)
        curve('Pillow sewn welt',[vs[(rings//2)*count+i] for i in range(count)],.0022,mats['cream'],bed,True)
    throw=bpy.data.objects['Draped purple throw']
    throw.modifiers.new('Visible cloth reverse','SOLIDIFY').thickness=.006
    smooth=throw.modifiers.new('Soft draped folds','SUBSURF');smooth.levels=1
    # Shoulder folds and compressed hems break up the repeated floor-shirt silhouette.
    for obj in bpy.context.scene.objects:
        if obj.name.startswith('Floor clothing'):
            for vertex in obj.data.vertices:
                x,y,z=vertex.co
                vertex.co.z=max(.064,z+.025*math.sin(y*31+x*9))
            mod=obj.modifiers.new('Rounded fabric folds','SUBSURF');mod.levels=1
            obj.modifiers.move(len(obj.modifiers)-1,0)
