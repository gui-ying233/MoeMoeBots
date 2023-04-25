import os
import UnityPy


def unpack_all_assets(source_folder: str, destination_folder: str):
    # iterate over all files in source folder
    for root, dirs, files in os.walk(source_folder):
        for file_name in files:
            # generate file_path
            file_path = os.path.join(root, file_name)
            # load that file via UnityPy.load
            env = UnityPy.load(file_path)

            # iterate over internal objects
            for obj in env.objects:
                # process specific object types
                if obj.type.name in ["Texture2D", "Sprite"]:
                    try:
                        # parse the object data
                        data = obj.read()

                        # create destination path
                        dest = os.path.join(destination_folder, data.name)

                        # make sure that the extension is correct
                        # you probably only want to do so with images/textures
                        dest, ext = os.path.splitext(dest)
                        dest = dest + ".png"

                        img = data.image
                        img.save(dest)
                    except:
                        pass

            # alternative way which keeps the original path
            for path, obj in env.container.items():
                if obj.type.name in ["Texture2D", "Sprite"]:
                    try:
                        data = obj.read()
                        # create dest based on original path
                        dest = os.path.join(
                            destination_folder, *path.split("/"))
                        # make sure that the dir of that path exists
                        os.makedirs(os.path.dirname(dest), exist_ok=True)
                        # correct extension
                        dest, ext = os.path.splitext(dest)
                        dest = dest + ".png"
                        data.image.save(dest)
                    except:
                        pass


unpack_all_assets("", "")
