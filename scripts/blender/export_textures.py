"""Size only the web copies of printed artwork; retain packed source art intact."""
from pathlib import Path
import bpy


def prepare_prints(directory):
    directory=Path(directory)
    copies={}
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        for node in mat.node_tree.nodes:
            if node.type!='TEX_IMAGE' or not node.image or '-illustration' not in node.image.name:
                continue
            original=node.image
            if original.name not in copies:
                export=original.copy()
                factor=min(1,1024/max(export.size))
                export.scale(round(export.size[0]*factor),round(export.size[1]*factor))
                export.filepath_raw=str(directory/(Path(original.name).stem+'.jpg'))
                export.file_format='JPEG'
                export.save(quality=90)
                copies[original.name]=export
            node.image=copies[original.name]
