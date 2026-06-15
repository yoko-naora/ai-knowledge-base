#!/usr/bin/env python3
"""
视频封面自动提取工具
用法：
  手动单条：
    python extract_video_cover.py --video videos/xxx.mp4 --time 00:00:01

  批量自动修复（仅处理 2026-06-11 及之后）：
    python extract_video_cover.py --auto-fix
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.parent  # prompts/
DATA_JSON = ROOT / "data.json"
VIDEOS_DIR = ROOT / "videos"
IMAGES_DIR = ROOT / "images"


def extract_cover(video_path: Path, output_path: Path, time: str = "00:00:01"):
    """使用 FFmpeg 截取视频第1秒作为封面"""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg",
        "-y",
        "-ss", time,
        "-i", str(video_path),
        "-frames:v", "1",
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
    """根据 video 文件名里的状态ID查找对应条目"""
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

    # 生成 cover 路径
    cover_name = video_path.stem + "_cover.jpg"
    cover_path = IMAGES_DIR / cover_name

    print(f"[INFO] Extracting cover from {video_path.name} at {time}...")
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
            print(f"[OK] Updated data.json index {idx} with images[0] = {rel_path}")
        else:
            print(f"[WARN] Could not find matching entry in data.json for {video_path.name}")

    return True


def auto_fix_all(time: str = "00:00:01"):
    """扫描所有有 video 但 images 无效或缺失的条目（仅处理 2026-06-11 及之后的条目）"""
    with open(DATA_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    fixed = 0
    for idx, entry in enumerate(data):
        video = entry.get("video")
        images = entry.get("images", [])
        date_str = entry.get("date", "")

        # 日期过滤：只处理 2026-06-11 及之后
        if date_str:
            try:
                entry_date = date_str.split()[0]  # 取 "2026-06-12"
                if entry_date < "2026-06-11":
                    continue
            except Exception:
                pass

        if not video:
            continue

        # 判断是否需要修复
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

        print(f"[AUTO] Fixing index {idx}: {video_path.name} (date: {date_str})")
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
    parser.add_argument("--time", default="00:00:01", help="截取时间点 (默认 00:00:01)")
    parser.add_argument("--auto-fix", action="store_true", help="批量自动修复所有有视频但缺封面的条目（仅 6/11 之后）")
    args = parser.parse_args()

    if args.auto_fix:
        auto_fix_all(args.time)
    elif args.video:
        process_single(args.video, args.time)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()