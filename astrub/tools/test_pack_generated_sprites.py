"""Technical export regression checks; no generated art or game assets are edited.

Run with python3 tools/test_pack_generated_sprites.py.
"""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

from PIL import Image, ImageDraw

SPEC = importlib.util.spec_from_file_location("sprite_packer", Path(__file__).with_name("pack_generated_sprites.py"))
packer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(packer)


class ExportChecks(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        atlas = Image.new("RGBA", (256, 256))
        for index, (dx, dy) in enumerate([(0, 0), (7, -8), (-5, 3), (4, -3)]):
            cell = Image.new("RGBA", (128, 128))
            draw = ImageDraw.Draw(cell)
            draw.rectangle((43 + dx, 32 + dy, 84 + dx, 108 + dy), fill=(170, 90, 40, 255))
            draw.rectangle((47 + dx, 98 + dy, 59 + dx, 111 + dy), fill=(40, 50, 70, 255))
            draw.rectangle((69 + dx, 98 + dy, 82 + dx, 111 + dy), fill=(40, 50, 70, 255))
            # A moving translucent effect belongs to the sprite but not its body.
            draw.ellipse((53 + index, 8, 66 + index, 20), fill=(200, 210, 220, 120))
            # A real pose difference, rather than only a translated duplicate.
            draw.rectangle((84 + dx, 46 + dy + index * 2, 94 + dx, 54 + dy + index * 2), fill=(230, 180, 90, 255))
            atlas.alpha_composite(cell, ((index % 2) * 128, (index // 2) * 128))
        atlas.save(self.root / "source.png")
        self.recipe = {
            "sources": {"input": {"path": "source.png", "columns": 2, "rows": 2}},
            "outputRoot": "export",
            "manifest": {"path": "buildings.json", "root": "buildings"},
            "sprites": [{"name": "house", "source": "input", "frameSize": [128, 128],
                         "columns": 2, "pivot": [64, 120],
                         "anchor": {"mode": "ground", "threshold": 160},
                         "bodyRect": [0, 25, 128, 103],
                         "output": {"portrait": "house.png", "croppedPortrait": "portraits/house.png"}, "metadata": {"fps": 3}}],
        }

    def tearDown(self):
        self.temp.cleanup()

    def run_recipe(self, check_only=False):
        path = self.root / "recipe.json"
        path.write_text(json.dumps(self.recipe), encoding="utf-8")
        return packer.run(path, check_only)

    def test_common_scale_ground_and_body_bound_preserve_real_frames(self):
        manifest = self.run_recipe()
        result = manifest["buildings"]["house"]
        self.assertEqual(result["frameWidth"], 128)
        self.assertEqual(result["frameCount"], 4)
        self.assertEqual(result["fps"], 3)
        self.assertEqual(result["framePivots"], [[64.0, 120.0]] * 4)
        self.assertEqual(result["validation"]["distinctFrames"], 4)
        with Image.open(self.root / "export/house-atlas.png") as atlas:
            self.assertEqual(atlas.size, (256, 256))
            for index in range(4):
                cell = atlas.crop(((index % 2) * 128, (index // 2) * 128,
                                   (index % 2 + 1) * 128, (index // 2 + 1) * 128))
                opaque = packer.alpha_bounds(cell, 160)
                self.assertLessEqual(abs(opaque[3] - 120), 1)
                self.assertLess(result["frameBounds"][index][1], result["bodyBounds"][1])
                self.assertEqual(cell.getpixel((0, 0))[3], 0)
            with Image.open(self.root / "export/house.png") as portrait:
                self.assertEqual(portrait.tobytes(), atlas.crop((0, 0, 128, 128)).tobytes())
            with Image.open(self.root / "export/portraits/house.png") as portrait:
                x, y, width, height = result["portraitCrop"]
                self.assertEqual(portrait.tobytes(), atlas.crop((x, y, x + width, y + height)).tobytes())
                self.assertLess(portrait.width, 128)

    def test_check_only_does_not_write(self):
        self.run_recipe(check_only=True)
        self.assertFalse((self.root / "export").exists())

    def test_opaque_input_is_rejected(self):
        Image.new("RGBA", (256, 256), (40, 50, 60, 255)).save(self.root / "source.png")
        with self.assertRaisesRegex(packer.PackingError, "transparent"):
            self.run_recipe()
        self.assertFalse((self.root / "export").exists())

    def test_art_crossing_separator_is_rejected_before_any_output(self):
        with Image.open(self.root / "source.png") as image:
            image = image.copy()
        ImageDraw.Draw(image).rectangle((124, 30, 132, 70), fill=(255, 100, 30, 255))
        image.save(self.root / "source.png")
        with self.assertRaisesRegex(packer.PackingError, "grid separator"):
            self.run_recipe()
        self.assertFalse((self.root / "export").exists())

    def test_static_cell_export_and_repeated_idle_mapping(self):
        job = self.recipe["sprites"][0]
        job["frames"] = [[1, 1]]
        job["columns"] = 1
        result = self.run_recipe()["buildings"]["house"]
        self.assertEqual(result["frameCount"], 1)
        self.assertEqual(result["frameSources"][0]["cell"], [1, 1])
        job["frames"] = [[0, 0]] * 4 + [[0, 0], [1, 0], [0, 1], [1, 1]] * 2
        job["columns"] = 12
        result = self.run_recipe()["buildings"]["house"]
        self.assertEqual(result["columns"], 12)
        self.assertEqual(result["frameHashes"][:4], [result["frameHashes"][0]] * 4)
        self.assertEqual(result["validation"]["distinctFrames"], 4)

    def test_flip_x_preserves_alpha_and_updates_anchor_body_and_provenance(self):
        sources = packer.load_sources(self.recipe, self.root)
        job = self.recipe["sprites"][0]
        original = packer.source_frame({"cell": [0, 0], "anchor": [63, 112]}, job, sources, [])
        flipped = packer.source_frame({"cell": [0, 0], "anchor": [63, 112], "flipX": True}, job, sources, [])
        self.assertEqual(flipped["anchor"], (65, 112))
        self.assertEqual(flipped["bounds"], (128 - original["bounds"][2], original["bounds"][1],
                                             128 - original["bounds"][0], original["bounds"][3]))
        self.assertEqual(flipped["body"], (128 - original["body"][2], original["body"][1],
                                           128 - original["body"][0], original["body"][3]))
        self.assertEqual(flipped["image"].tobytes(), original["image"].transpose(Image.Transpose.FLIP_LEFT_RIGHT).tobytes())
        self.assertEqual(flipped["image"].getchannel("A").histogram(), original["image"].getchannel("A").histogram())
        job["frames"] = [{"cell": [0, 0], "anchor": [64, 112]},
                         {"cell": [0, 0], "anchor": [64, 112], "flipX": True}]
        result = self.run_recipe()["buildings"]["house"]
        self.assertEqual([frame["flipX"] for frame in result["frameSources"]], [False, True])
        self.assertEqual(result["framePivots"], [[64.0, 120.0]] * 2)
        with Image.open(self.root / "export/house-atlas.png") as atlas:
            for index in range(2):
                frame = atlas.crop((index * 128, 0, (index + 1) * 128, 128))
                self.assertEqual(frame.getpixel((0, 0))[3], 0)
                self.assertLessEqual(abs(packer.alpha_bounds(frame, 160)[3] - 120), 1)

    def test_uniform_density_correction_keeps_two_source_resolutions_same_height(self):
        with Image.open(self.root / "source.png") as atlas:
            smaller = atlas.crop((0, 0, 128, 128)).resize((64, 64), Image.Resampling.NEAREST)
        smaller.save(self.root / "smaller.png")
        self.recipe["sources"]["smaller"] = {"path": "smaller.png", "columns": 1, "rows": 1}
        job = self.recipe["sprites"][0]
        job.pop("bodyRect")
        job["frames"] = [{"source": "input", "cell": [0, 0]},
                         {"source": "smaller", "cell": [0, 0], "sourceScale": 2}]
        result = self.run_recipe()["buildings"]["house"]
        self.assertEqual([frame["sourceScale"] for frame in result["frameSources"]], [1, 2])
        with Image.open(self.root / "export/house-atlas.png") as atlas:
            bounds = [packer.alpha_bounds(atlas.crop((i * 128, 0, (i + 1) * 128, 128)), 160) for i in range(2)]
            self.assertLessEqual(abs((bounds[0][3] - bounds[0][1]) - (bounds[1][3] - bounds[1][1])), 2)
            self.assertLessEqual(abs((bounds[0][2] - bounds[0][0]) - (bounds[1][2] - bounds[1][0])), 2)
            self.assertTrue(all(abs(b[3] - 120) <= 1 for b in bounds))


if __name__ == "__main__":
    unittest.main()
