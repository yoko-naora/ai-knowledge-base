#!/usr/bin/env python3
"""
视频封面自动提取工具（16:9 版本）
用法：
  手动单条：
    python extract_video_cover.py --video videos/xxx.mp4 --time 00:00:01

  批量自动修复（仅处理 2026-06-11 及之后）：
    python extract_video_cover.py --auto-fix
"""

import argparse
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_JSON = ROOT / "data.json"
IMAGES_DIR = ROOT / "images"


def extract_cover(video_path: Path, output_path: Path, time: str = "00:00:01"):
    """使用 FFmpeg 截取视频第1秒作为封面（强制16:9，加黑边）"""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # 强制输出 1920x1080，内容保持比例，左右加黑边
    vf = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"

    cmd = [
        "ffmpeg",
        "-y",
        "-ss", time,
        "-i", str(video_path),
        "-frames:v", "1",
        "-vf", vf,
        "-q:v", "2",
        str(output_path)
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] FFmpeg failed: {e}")
        return False


def find_entry_by_video(data, video_filename: str):
    base = video_filename.replace(".mp4", "")
    parts = base.split("_")
    if len(parts) < 2:
        return None, None
    status_id = parts[-1]

    for idx, entry in enumerate(data):
        video_field = entry.get("video", "")
        if status_id in video_field:
            return idx, entry
    return None, None


def process_single(video_path: Path | str, time: str = "00:00:01", update_json: bool = True):
    video_path = Path(video_path)
    if not video_path.exists():
        print(f"[ERROR] Video not found: {video_path}")
        return False

    cover_name = video_path.stem + "_cover.jpg"
    cover_path = IMAGES_DIR / cover_name

    print(f"[INFO] Extracting 16:9 cover from {video_path.name} at {time}...")
    success = extract_cover(video_path, cover_path, time)
    if not success:
        return False

    print(f"[OK] Cover saved: {cover_path}")

    if update_json:
        with open(DATA_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)

        idx, entry = find_entry_by_video(data, video_path.name)
        if idx is not None:
            rel_path = f"images/{cover_name}"
            if not entry.get("images"):
                entry["images"] = []
            entry["images"] = [rel_path] + [p for p in entry.get("images", []) if p != rel_path]
            with open(DATA_JSON, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"[OK] Updated data.json index {idx}")
        else:
            print(f"[WARN] Could not find matching entry in data.json")

    return True


def auto_fix_all(time: str = "00:00:01"):
    with open(DATA_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    fixed = 0
    for idx, entry in enumerate(data):
        video = entry.get("video")
        images = entry.get("images", [])
        date_str = entry.get("date", "")

        if date_str:
            try:
                entry_date = date_str.split()[0]
                if entry_date < "2026-06-11":
                    continue
            except Exception:
                pass

        if not video:
            continue

        need_fix = False
        if not images:
            need_fix = True
        else:
            first_img = IMAGES_DIR / Path(images[0]).name
            if not first_img.exists() or first_img.stat().st_size < 50 * 1024:
                need_fix = True

        if not need_fix:
            continue

        video_path = ROOT / video
        if not video_path.exists():
            print(f"[SKIP] Video missing: {video}")
            continue

        cover_name = Path(video).stem + "_cover.jpg"
        cover_path = IMAGES_DIR / cover_name

        print(f"[AUTO] Fixing index {idx}: {video_path.name}")
        if extract_cover(video_path, cover_path, time):
            rel_path = f"images/{cover_name}"
            entry["images"] = [rel_path] + [p for p in images if p != rel_path]
            fixed += 1

    if fixed > 0:
        with open(DATA_JSON, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n[COMPLETE] Fixed {fixed} entries.")
    else:
        print("[INFO] No entries needed fixing.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", help="单个视频文件路径")
    parser.add_argument("--time", default="00:00:01", help="截取时间点")
    parser.add_argument("--auto-fix", action="store_true", help="批量自动修复（仅6/11之后）")
    args = parser.parse_args()

    if args.auto_fix:
        auto_fix_all(args.time)
    elif args.video:
        process_single(args.video, args.time)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()