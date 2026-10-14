#!/usr/bin/env python3
"""Pack already transparent illustrated frames; never draw or remove backgrounds.

Usage: python3 tools/pack_generated_sprites.py recipe.json [--check-only]
Requires Pillow. Paths in the JSON recipe are relative to that recipe.
See tools/sprite-recipe.example.json for the input contract.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import sys

from PIL import Image


class PackingError(ValueError):
    """An input cannot be safely packed without modifying its artwork."""


def pair(value, label, positive=False):
    if not isinstance(value, (list, tuple)) or len(value) != 2:
        raise PackingError(f"{label} must contain two numbers")
    result = tuple(float(v) for v in value)
    if not all(math.isfinite(v) and (not positive or v > 0) for v in result):
        raise PackingError(f"Invalid {label}: {value}")
    return result


def alpha_bounds(image, threshold=1):
    alpha = image.getchannel("A")
    return alpha.point(lambda v: 255 if v >= threshold else 0).getbbox()


def bounds_record(bounds):
    x0, y0, x1, y1 = bounds
    return [x0, y0, x1 - x0, y1 - y0]


def bounds_union(bounds):
    return (min(b[0] for b in bounds), min(b[1] for b in bounds),
            max(b[2] for b in bounds), max(b[3] for b in bounds))


def weighted_median(values):
    total = sum(weight for _, weight in values)
    if total <= 0:
        raise PackingError("Ground band has no visible pixels")
    count = 0
    for coordinate, weight in values:
        count += weight
        if count >= total / 2:
            return coordinate
    return values[-1][0]


def ground_anchor(image, spec):
    """Detect contact using opaque feet, not the overall weapon/smoke silhouette."""
    threshold = int(spec.get("threshold", 96))
    bounds = alpha_bounds(image, threshold)
    if bounds is None:
        raise PackingError(f"No pixels reach ground alpha threshold {threshold}")
    x0, y0, x1, y1 = bounds
    band_height = max(1, round((y1 - y0) * float(spec.get("bandFraction", .10))))
    alpha = image.getchannel("A")
    pixels = alpha.load()
    masses = [(x + .5, sum(pixels[x, y] if pixels[x, y] >= threshold else 0
                           for y in range(max(y0, y1 - band_height), y1)))
              for x in range(x0, x1)]
    mode = spec.get("x", "ground-median")
    if mode == "ground-median":
        x = weighted_median(masses)
    elif mode == "cell-center":
        x = image.width / 2
    elif mode == "body-center":
        x = (x0 + x1) / 2
    else:
        raise PackingError(f"Unknown anchor x mode: {mode}")
    return x, float(y1)


def load_sources(recipe, root):
    result = {}
    images = {}
    for name, spec in recipe.get("sources", {}).items():
        path = (root / spec["path"]).resolve()
        if path not in images:
            with Image.open(path) as raw:
                if "A" not in raw.getbands():
                    raise PackingError(f"{path}: source needs a real alpha channel")
                image = raw.convert("RGBA")
            if image.getchannel("A").getextrema()[0] != 0:
                raise PackingError(f"{path}: source has no fully transparent pixels")
            images[path] = image
        image = images[path]
        columns, rows = int(spec["columns"]), int(spec["rows"])
        if columns < 1 or rows < 1:
            raise PackingError(f"{name}: rows and columns must be positive")
        rect = tuple(spec.get("rect", [0, 0, image.width, image.height]))
        if len(rect) != 4 or any(int(v) != v for v in rect):
            raise PackingError(f"{name}: rect is [x,y,width,height] in integer pixels")
        x, y, width, height = map(int, rect)
        if x < 0 or y < 0 or width <= 0 or height <= 0 or x + width > image.width or y + height > image.height:
            raise PackingError(f"{name}: grid is outside the source image")
        if width % columns or height % rows:
            raise PackingError(f"{name}: grid dimensions must divide exactly; specify rect explicitly")
        result[name] = dict(image=image, path=path, spec=spec, columns=columns,
                            rows=rows, cell=(width // columns, height // rows), offset=(x, y))
    if not result:
        raise PackingError("Recipe has no sources")
    return result


def source_frame(frame_spec, job, sources, warnings):
    if isinstance(frame_spec, (list, tuple)):
        frame_spec = {"cell": frame_spec}
    name = frame_spec.get("source", job.get("source"))
    if name not in sources:
        raise PackingError(f"Unknown frame source: {name}")
    source = sources[name]
    col, row = pair(frame_spec["cell"], "cell")
    if int(col) != col or int(row) != row or not 0 <= col < source["columns"] or not 0 <= row < source["rows"]:
        raise PackingError(f"{name}: cell {col,row} is outside the grid")
    width, height = source["cell"]
    x = source["offset"][0] + int(col) * width
    y = source["offset"][1] + int(row) * height
    image = source["image"].crop((x, y, x + width, y + height))
    flip_x = frame_spec.get("flipX", job.get("flipX", False))
    if not isinstance(flip_x, bool):
        raise PackingError("flipX must be true or false")
    if flip_x:
        # Lossless orientation only: no painting, alpha masking or recoloring.
        image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    source_scale = float(frame_spec.get("sourceScale", job.get("sourceScale", 1)))
    if not math.isfinite(source_scale) or source_scale <= 0:
        raise PackingError("sourceScale must be a positive uniform density factor")
    bounds = alpha_bounds(image)
    if bounds is None:
        raise PackingError(f"{name}[{int(col)},{int(row)}]: empty frame")
    if image.getchannel("A").getextrema()[0] != 0:
        raise PackingError(f"{name}[{int(col)},{int(row)}]: cell has no transparent space")
    guard = int(job.get("edgeGuard", 2))
    visible = alpha_bounds(image, int(job.get("edgeAlphaThreshold", 12)))
    if guard < 0 or guard * 2 >= min(width, height):
        raise PackingError("edgeGuard must leave a nonempty cell interior")
    if visible and (visible[0] < guard or visible[1] < guard or visible[2] > width - guard or visible[3] > height - guard):
        message = f"{name}[{int(col)},{int(row)}]: visible alpha touches a grid separator; bounds={visible}"
        if not job.get("allowEdgeTouch", False):
            raise PackingError(message)
        warnings.append(message)
    anchor_spec = frame_spec.get("anchor", job.get("anchor", {"mode": "ground"}))
    if isinstance(anchor_spec, (list, tuple)):
        anchor = pair(anchor_spec, "source anchor")
        if flip_x:
            # Anchors use pixel-edge coordinates, as do alpha bounding boxes.
            anchor = (width - anchor[0], anchor[1])
    elif anchor_spec.get("mode", "ground") == "ground":
        anchor = ground_anchor(image, anchor_spec)
    else:
        raise PackingError("Anchor must be [x,y] or {mode:'ground',...}")
    if not 0 <= anchor[0] <= width or not 0 <= anchor[1] <= height:
        raise PackingError(f"{name}: source anchor lies outside the cell")
    body_rect = frame_spec.get("bodyRect", job.get("bodyRect", [0, 0, width, height]))
    if len(body_rect) != 4:
        raise PackingError("bodyRect is [x,y,width,height] in source-cell pixels")
    bx, by, bw, bh = map(int, body_rect)
    if bx < 0 or by < 0 or bw <= 0 or bh <= 0 or bx + bw > width or by + bh > height:
        raise PackingError(f"{name}: bodyRect lies outside the cell")
    if flip_x:
        bx = width - bx - bw
    body = alpha_bounds(image.crop((bx, by, bx + bw, by + bh)), int(job.get("bodyAlphaThreshold", 32)))
    if body is None:
        raise PackingError(f"{name}: bodyRect contains no visible sprite")
    body = (body[0] + bx, body[1] + by, body[2] + bx, body[3] + by)
    return dict(image=image, bounds=bounds, body=body, anchor=anchor,
                source=name, cell=[int(col), int(row)], sourceRect=[x, y, width, height],
                flipX=flip_x, sourceScale=source_scale)


def safe_scale(frames, size, pivot, margin):
    limits = []
    for frame in frames:
        x0, y0, x1, y1 = frame["bounds"]
        ax, ay = frame["anchor"]
        for extent, room in ((ax - x0, pivot[0] - margin), (x1 - ax, size[0] - pivot[0] - margin),
                             (ay - y0, pivot[1] - margin), (y1 - ay, size[1] - pivot[1] - margin)):
            if extent > 0:
                if room <= 0:
                    raise PackingError("Target pivot leaves no room for this sprite")
                limits.append(room / (extent * frame["sourceScale"]))
    # A small guard protects interpolation alpha edges from output clipping.
    return min(limits) * .998


def pack_job(job, sources, output_root, check_only, warnings):
    name = job["name"]
    size = tuple(int(v) for v in pair(job["frameSize"], "frameSize", positive=True))
    pivot = pair(job.get("pivot", [size[0] / 2, size[1] - 20]), "target pivot")
    if not 0 < pivot[0] < size[0] or not 0 < pivot[1] < size[1]:
        raise PackingError(f"{name}: target pivot must lie inside the output cell")
    frame_specs = job.get("frames")
    if frame_specs is None:
        source = sources[job["source"]]
        frame_specs = [[col, row] for row in range(source["rows"]) for col in range(source["columns"])]
    if not frame_specs:
        raise PackingError(f"{name}: no frames")
    frames = [source_frame(spec, job, sources, warnings) for spec in frame_specs]
    columns = int(job.get("columns", len(frames)))
    if columns <= 0 or len(frames) % columns:
        raise PackingError(f"{name}: frame count must divide by output columns")
    margin = int(job.get("margin", 3))
    max_scale = safe_scale(frames, size, pivot, margin)
    scale = float(job.get("scale", max_scale))
    if not math.isfinite(scale) or scale <= 0 or scale > max_scale + .001:
        raise PackingError(f"{name}: common scale {scale:g} exceeds safe fit {max_scale:g}")
    atlas = Image.new("RGBA", (size[0] * columns, size[1] * (len(frames) // columns)))
    rendered, records, body_bounds = [], [], []
    for index, frame in enumerate(frames):
        # One common scale in normalized art space; an explicit uniform density
        # correction can reconcile a compatible pose from a lower-resolution
        # source. Never stretch width and height independently.
        ax, ay = frame["anchor"]
        effective_scale = scale * frame["sourceScale"]
        cell = frame["image"].transform(size, Image.Transform.AFFINE,
                                       (1 / effective_scale, 0, ax - pivot[0] / effective_scale,
                                        0, 1 / effective_scale, ay - pivot[1] / effective_scale),
                                       resample=Image.Resampling.BICUBIC,
                                       fillcolor=(0, 0, 0, 0))
        output_bounds = alpha_bounds(cell)
        if output_bounds is None:
            raise PackingError(f"{name}: frame {index} vanished at output resolution")
        if output_bounds[0] == 0 or output_bounds[1] == 0 or output_bounds[2] == size[0] or output_bounds[3] == size[1]:
            raise PackingError(f"{name}: frame {index} touches the output border")
        # Cells never overlap. A direct paste preserves every RGBA value, so the
        # exported portrait and its atlas frame are byte-identical, even at A=0.
        atlas.paste(cell, ((index % columns) * size[0], (index // columns) * size[1]))
        rendered.append(cell)
        b = frame["body"]
        body_bounds.append((math.floor(pivot[0] + (b[0] - ax) * effective_scale), math.floor(pivot[1] + (b[1] - ay) * effective_scale),
                            math.ceil(pivot[0] + (b[2] - ax) * effective_scale), math.ceil(pivot[1] + (b[3] - ay) * effective_scale)))
        actual_pivot = pivot
        records.append(dict(index=index, source=frame["source"], cell=frame["cell"], sourceRect=frame["sourceRect"],
                            flipX=frame["flipX"], sourceScale=frame["sourceScale"],
                            sourceBounds=bounds_record(frame["bounds"]), sourcePivot=list(frame["anchor"]),
                            bounds=bounds_record(alpha_bounds(cell)), pivot=[round(v, 4) for v in actual_pivot],
                            sha256=hashlib.sha256(cell.tobytes()).hexdigest()))
    output = job.get("output", {})
    atlas_path = output_root / output.get("atlas", f"{name}-atlas.png")
    portrait = output.get("portrait")
    portrait_frame = int(output.get("portraitFrame", 0))
    if not 0 <= portrait_frame < len(rendered):
        raise PackingError(f"{name}: portraitFrame outside animation")
    cropped_portrait = output.get("croppedPortrait")
    portrait_crop = None
    if cropped_portrait:
        portrait_threshold = int(output.get("portraitAlphaThreshold", 12))
        padding = int(output.get("portraitPadding", 3))
        if not 1 <= portrait_threshold <= 255 or padding < 0:
            raise PackingError(f"{name}: invalid portrait alpha threshold or padding")
        portrait_bounds = alpha_bounds(rendered[portrait_frame], portrait_threshold)
        if portrait_bounds is None:
            raise PackingError(f"{name}: selected portrait frame has no visible pixels")
        portrait_crop = (max(0, portrait_bounds[0] - padding), max(0, portrait_bounds[1] - padding),
                         min(size[0], portrait_bounds[2] + padding), min(size[1], portrait_bounds[3] + padding))
    metadata = dict(job.get("metadata", {}))
    metadata.update(frameWidth=size[0], frameHeight=size[1], frameCount=len(frames), columns=columns,
                    rows=len(frames) // columns, originX=pivot[0] / size[0], originY=pivot[1] / size[1],
                    pivot=list(pivot), commonScale=round(scale, 8), bodyBounds=bounds_record(bounds_union(body_bounds)),
                    frameBounds=[r["bounds"] for r in records], framePivots=[r["pivot"] for r in records],
                    frameHashes=[r["sha256"] for r in records], frameSources=records)
    metadata.setdefault("path", output.get("publicPath", atlas_path.name))
    metadata["validation"] = dict(alpha=True, noClipping=True, edgeGuard=job.get("edgeGuard", 2),
                                   distinctFrames=len(set(metadata["frameHashes"])),
                                   maxPivotError=round(max(max(abs(r["pivot"][i] - pivot[i]) for i in (0, 1)) for r in records), 4))
    if portrait_crop:
        metadata["portraitFrame"] = portrait_frame
        metadata["portraitCrop"] = bounds_record(portrait_crop)
    if not check_only:
        atlas_path.parent.mkdir(parents=True, exist_ok=True)
        atlas.save(atlas_path, optimize=True)
        if portrait:
            portrait_path = output_root / portrait
            portrait_path.parent.mkdir(parents=True, exist_ok=True)
            rendered[portrait_frame].save(portrait_path, optimize=True)
        if cropped_portrait:
            cropped_path = output_root / cropped_portrait
            cropped_path.parent.mkdir(parents=True, exist_ok=True)
            rendered[portrait_frame].crop(portrait_crop).save(cropped_path, optimize=True)
    return metadata


def run(recipe_path, check_only=False):
    recipe_path = Path(recipe_path).resolve()
    recipe = json.loads(recipe_path.read_text(encoding="utf-8"))
    root = recipe_path.parent
    sources = load_sources(recipe, root)
    output_root = (root / recipe.get("outputRoot", ".")).resolve()
    warnings = []
    jobs = recipe.get("sprites", [])
    if not jobs:
        raise PackingError("Recipe has no sprites")
    names = [job["name"] for job in jobs]
    if len(set(names)) != len(names):
        raise PackingError("Sprite names must be unique")
    # Validate every job before writing any production output.
    entries = {job["name"]: pack_job(job, sources, output_root, True, warnings) for job in jobs}
    if not check_only:
        for job in jobs:
            pack_job(job, sources, output_root, False, [])
    manifest_spec = recipe.get("manifest", {})
    manifest = {"version": int(manifest_spec.get("version", 1)), manifest_spec.get("root", "sprites"): entries}
    source_hashes = {path: hashlib.sha256(path.read_bytes()).hexdigest() for path in {source["path"] for source in sources.values()}}
    manifest["export"] = {"tool": "pack_generated_sprites.py", "recipe": recipe_path.name,
                          "sources": {name: {"file": str(source["spec"]["path"]),
                                             "sha256": source_hashes[source["path"]],
                                             "size": list(source["image"].size)} for name, source in sources.items()},
                          "warnings": warnings}
    if not check_only:
        path = output_root / manifest_spec.get("path", "manifest.json")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("recipe", type=Path)
    parser.add_argument("--check-only", action="store_true", help="validate frames and common fit without writing assets")
    args = parser.parse_args()
    try:
        manifest = run(args.recipe, args.check_only)
    except (PackingError, KeyError, OSError, json.JSONDecodeError) as error:
        print(f"Sprite export rejected: {error}", file=sys.stderr)
        return 1
    root_key = next(key for key in manifest if key not in ("version", "export"))
    for name, entry in manifest[root_key].items():
        print(f"{name}: {entry['frameCount']} frames {entry['frameWidth']}×{entry['frameHeight']}, "
              f"scale={entry['commonScale']:g}, pivot={entry['pivot']}, distinct={entry['validation']['distinctFrames']}")
    for warning in manifest["export"]["warnings"]:
        print(f"Warning: {warning}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
