"""离线模板引擎: schemas/meme_schemas.json → 自动生成 Sora/Kling/Pika 三家提示词, 注入 data.json."""

import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")


def to_sora(s):
    """Sora 风格: 英文 + 电影叙事结构 + cinematic 描述."""
    return (
        f"{s['setting_en']}: {s['subject_en']} {s['action_en']}. "
        f"{s['camera_en']}, {s['lighting_en']}. "
        f"{s['style_en']}, {s['aspect']} vertical, {s['duration']} seconds."
    )


def to_kling(s):
    """可灵风格: 中文 + 细节多 + 完整描述."""
    return (
        f"{s['setting_zh']}: {s['subject_zh']}{s['action_zh']}. "
        f"{s['camera_zh']}, {s['lighting_zh']}. "
        f"{s['style_zh']}, {s['aspect']}竖屏, {s['duration']}秒."
    )


def to_pika(s):
    """Pika 风格: 短英文 + 关键词堆 + 简洁."""
    parts = [
        s["setting_en"],
        s["subject_en"],
        s["action_en"],
        s["camera_en"],
        s["lighting_en"],
        s["style_en"],
    ]
    return ", ".join(parts) + f", {s['aspect']}, {s['duration']}s"


def main():
    schemas_path = "D:/github/memehub/schemas/meme_schemas.json"
    data_path = "D:/github/memehub/data.json"

    schemas_doc = json.load(open(schemas_path, encoding="utf-8"))
    schemas = schemas_doc.get("schemas", {})
    data = json.load(open(data_path, encoding="utf-8"))

    updated = 0
    missing = []
    for meme in data["memes"]:
        title = meme["title"]
        spec = schemas.get(title)
        if not spec:
            missing.append(title)
            continue
        meme["prompts"] = {
            "Sora": to_sora(spec),
            "Kling": to_kling(spec),
            "Pika": to_pika(spec),
        }
        updated += 1

    data["updated_at"] = "2026-05-26 17:40 (schema-generated)"
    data["_generated_by"] = "build_prompts.py from schemas/meme_schemas.json"

    json.dump(data, open(data_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"updated {updated} memes via schema template")
    if missing:
        print(f"missing schema (kept old prompts): {missing}")


if __name__ == "__main__":
    main()
