#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw

WORKTREE = "/home/voga/A-LAND-visual-v2-batch01r-art-remediation"
REF_DIR = "/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/batch01r_handoff/unpacked/01_APPROVED_VISUAL_REFERENCES"
OLD_DIR = os.path.join(WORKTREE, "docs/v2-3-batch01-weather-calm/screenshots")
NEW_DIR = os.path.join(WORKTREE, "docs/v2-3-batch01r-art-remediation/evidence/screenshots")
OUT_DIR = os.path.join(WORKTREE, "docs/v2-3-batch01r-art-remediation/evidence/comparisons")
ARTIFACT_DIR = "/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73"


def fit_box(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    canvas = Image.new("RGB", (target_w, target_h), (15, 23, 42))
    src_w, src_h = img.size
    scale = min(target_w / src_w, target_h / src_h)
    nw = max(1, int(src_w * scale))
    nh = max(1, int(src_h * scale))
    resized = img.convert("RGB").resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(resized, ((target_w - nw) // 2, (target_h - nh) // 2))
    return canvas


def build_3way_board(left_path: str, mid_path: str, right_path: str, out_name: str):
    panel_w, panel_h = 640, 400
    gap = 16
    pad = 20
    header_h = 44
    total_w = pad * 2 + panel_w * 3 + gap * 2
    total_h = pad * 2 + header_h + panel_h
    board = Image.new("RGB", (total_w, total_h), (15, 23, 42))
    draw = ImageDraw.Draw(board)

    labels = [
        ("1. APPROVED 3D VISUAL REFERENCE", (245, 158, 11)),
        ("2. PREVIOUS BATCH01 (REJECTED FLAT SVG)", (239, 68, 68)),
        ("3. BATCH01R 3D FAIRYTALE RESKIN (CURRENT)", (16, 185, 129)),
    ]
    paths = [left_path, mid_path, right_path]

    for idx, (p, (title, color)) in enumerate(zip(paths, labels)):
        x = pad + idx * (panel_w + gap)
        y = pad + header_h
        draw.rectangle([x, pad, x + panel_w, pad + header_h - 6], fill=color)
        draw.text((x + 14, pad + 12), title, fill=(255, 255, 255))
        im = Image.open(p)
        fitted = fit_box(im, panel_w, panel_h)
        board.paste(fitted, (x, y))
        draw.rectangle([x, y, x + panel_w, y + panel_h], outline=color, width=3)

    out_path = os.path.join(OUT_DIR, out_name)
    board.save(out_path, "PNG", optimize=True)
    if os.path.isdir(ARTIFACT_DIR):
        board.save(os.path.join(ARTIFACT_DIR, out_name), "PNG", optimize=True)
    print(f"Saved {out_path} ({board.size[0]}x{board.size[1]})")


def build_2way_mobile_board(left_path: str, right_path: str, out_name: str):
    panel_w, panel_h = 390, 844
    gap = 24
    pad = 24
    header_h = 44
    total_w = pad * 2 + panel_w * 2 + gap
    total_h = pad * 2 + header_h + panel_h
    board = Image.new("RGB", (total_w, total_h), (15, 23, 42))
    draw = ImageDraw.Draw(board)

    labels = [
        ("1. BATCH01 MOBILE 390x844 (FLAT SVG + QA DRAWER)", (239, 68, 68)),
        ("2. BATCH01R MOBILE 390x844 (3D RESKIN + CLEAN UI)", (16, 185, 129)),
    ]
    paths = [left_path, right_path]

    for idx, (p, (title, color)) in enumerate(zip(paths, labels)):
        x = pad + idx * (panel_w + gap)
        y = pad + header_h
        draw.rectangle([x, pad, x + panel_w, pad + header_h - 6], fill=color)
        draw.text((x + 12, pad + 12), title, fill=(255, 255, 255))
        im = Image.open(p)
        fitted = fit_box(im, panel_w, panel_h)
        board.paste(fitted, (x, y))
        draw.rectangle([x, y, x + panel_w, y + panel_h], outline=color, width=3)

    out_path = os.path.join(OUT_DIR, out_name)
    board.save(out_path, "PNG", optimize=True)
    if os.path.isdir(ARTIFACT_DIR):
        board.save(os.path.join(ARTIFACT_DIR, out_name), "PNG", optimize=True)
    print(f"Saved {out_path} ({board.size[0]}x{board.size[1]})")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    build_3way_board(
        os.path.join(REF_DIR, "V12_weather_station.png"),
        os.path.join(OLD_DIR, "v2_3_batch01_1440x900_v2_weather_station.png"),
        os.path.join(NEW_DIR, "v2_3_batch01r_1440x900_v2_weather_station.png"),
        "comparison_weather_station_1440x900_3way.png",
    )
    build_2way_mobile_board(
        os.path.join(OLD_DIR, "v2_3_batch01_390x844_v2_weather_station.png"),
        os.path.join(NEW_DIR, "v2_3_batch01r_390x844_v2_weather_station.png"),
        "comparison_weather_station_390x844_mobile.png",
    )
    build_3way_board(
        os.path.join(REF_DIR, "V04_ui_component_styleguide.png"),
        os.path.join(OLD_DIR, "v2_3_batch01_1440x900_v2_calm_corner.png"),
        os.path.join(NEW_DIR, "v2_3_batch01r_1440x900_v2_calm_corner.png"),
        "comparison_calm_corner_1440x900_3way.png",
    )
    build_2way_mobile_board(
        os.path.join(OLD_DIR, "v2_3_batch01_390x844_v2_calm_corner.png"),
        os.path.join(NEW_DIR, "v2_3_batch01r_390x844_v2_calm_corner.png"),
        "comparison_calm_corner_390x844_mobile.png",
    )


if __name__ == "__main__":
    main()
