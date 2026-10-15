#!/usr/bin/env python3
"""
晴雨小岛 · 真实高表现力神经语音音源与声文同步时间戳生成脚本
Generates studio-quality Neural TTS MP3 files + millisecond-accurate WordBoundary metadata
into `public/audio/tts/` and `src/data/ttsManifest.ts`.
"""

import asyncio
import hashlib
import json
import re
from pathlib import Path
import edge_tts

ROOT_DIR = Path(__file__).resolve().parent.parent
AUDIO_OUT_DIR = ROOT_DIR / "public" / "audio" / "tts"
MANIFEST_JSON_PATH = AUDIO_OUT_DIR / "manifest.json"
MANIFEST_TS_PATH = ROOT_DIR / "src" / "data" / "ttsManifest.ts"

# 四位动物伙伴 / 四套声学人设对应的微软高表现力神经语音配置
VOICE_CONFIGS = {
    "warm-sister": {
        "voice": "zh-CN-XiaoxiaoNeural",
        "rate": "-6%",
        "pitch": "+2Hz",
    },
    "gentle-guide": {
        "voice": "zh-CN-YunxiNeural",
        "rate": "-6%",
        "pitch": "+0Hz",
    },
    "playful-buddy": {
        "voice": "zh-CN-XiaoyiNeural",
        "rate": "-3%",
        "pitch": "+3Hz",
    },
    "starlight-companion": {
        "voice": "zh-CN-YunxiaNeural",
        "rate": "-4%",
        "pitch": "+2Hz",
    },
}


def normalize_text_for_key(text: str) -> str:
    """Strips designer notes/brackets and normalizes whitespace while keeping natural punctuation."""
    if not text:
        return ""
    cleaned = re.sub(r"（[^）]*）", "", text)
    cleaned = re.sub(r"\([^)]*\)", "", cleaned)
    cleaned = re.sub(r"【[^】]*】", "", cleaned)
    cleaned = re.sub(r"\[[^\]]*\]", "", cleaned)
    cleaned = re.sub(r"\{[^}]*\}", "", cleaned)
    cleaned = re.sub(r"<[^>]*>", "", cleaned)
    cleaned = re.sub(r"[*_#`~>]", "", cleaned)
    cleaned = re.sub(r'[“”"\']', "", cleaned)
    cleaned = re.sub(r"\s+", "", cleaned).strip()
    return cleaned


CORE_SPEECH_ITEMS = [
    # 1. 四位动物伙伴首页问候与设置问候（固定绑定各伙伴专属音色）
    ("playful-buddy", "你好呀！我是果果。我是小松鼠果果，我喜欢收捡森林里的每一片小树叶和秘密线索！"),
    ("playful-buddy", "你好呀！我是你的小岛伙伴果果。我是小松鼠果果，我喜欢收捡森林里的每一片小树叶和秘密线索！"),
    ("playful-buddy", "我是小松鼠果果，我喜欢收捡森林里的每一片小树叶和秘密线索！"),
    ("warm-sister", "你好呀！我是贝贝。我是小海獭贝贝，如果觉得累了，我们可以一起躺在水面上慢慢呼吸。"),
    ("warm-sister", "你好呀！我是你的小岛伙伴贝贝。我是小海獭贝贝，如果觉得累了，我们可以一起躺在水面上慢慢呼吸。"),
    ("warm-sister", "我是小海獭贝贝，如果觉得累了，我们可以一起躺在水面上慢慢呼吸。"),
    ("gentle-guide", "你好呀！我是天天。我是小浣熊天天，遇到解不开的谜题，我们拆成一小步一小步来看看！"),
    ("gentle-guide", "你好呀！我是你的小岛伙伴天天。我是小浣熊天天，遇到解不开的谜题，我们拆成一小步一小步来看看！"),
    ("gentle-guide", "我是小浣熊天天，遇到解不开的谜题，我们拆成一小步一小步来看看！"),
    ("starlight-companion", "你好呀！我是奇奇。我是小鹿奇奇，森林里起风时，我会停下来听一听自己的心跳声。"),
    ("starlight-companion", "你好呀！我是你的小岛伙伴奇奇。我是小鹿奇奇，森林里起风时，我会停下来听一听自己的心跳声。"),
    ("starlight-companion", "我是小鹿奇奇，森林里起风时，我会停下来听一听自己的心跳声。"),

    # 2. 首屏核心常驻区：绿草呼吸平静角、现实抱抱求助、2.5D 小岛全景导览
    ("warm-sister", "绿草呼吸平静角。跟着圆圈慢慢吸气和呼气，放松身体；如果遇到大困难，也可以去拆解台把它拆成三小步。"),
    ("warm-sister", "身边有大人在，你可以随时停下来去找大人抱一抱。点一点可以打开本机抱抱求助卡。"),
    ("warm-sister", "已为你记在本机抱抱提醒里。这不会自动发到远端手机。现在请直接去找身边的大人抱一抱，或者把这张卡片拿给身边的大人看。"),
    ("warm-sister", "这里不会向手机发送远程消息。请直接走到身边你信任的大人那里，或者把求助卡拿给身边的大人看。"),
    ("warm-sister", "小提醒已关闭。有大人在身边，慢慢来。"),
    ("warm-sister", "走到大人身边拉拉衣角，告诉大人“我需要你陪我一会儿”。"),
    ("warm-sister", "如果熟悉的大人暂时不在，可以直接找老师、护士或其他信任的大人。"),
    ("warm-sister", "不想说也没关系。把心里的小门轻轻关好，自己待一会儿也是完全可以的。"),
    ("playful-buddy", "欢迎来到晴雨小岛！海面上飘着小木船，山巅有情绪天气站，树林深处是故事森林，小桥两边是温暖的家，还有放大镜木屋与星光树屋。你想先去哪里探险呢？"),

    # 3. 清晰地点卡片与大石头拆解台语音
    ("playful-buddy", "情绪天气站。看今天头顶的天气与身体感觉"),
    ("warm-sister", "故事林。走一圈、想一想，探索生活小故事"),
    ("playful-buddy", "想法侦探社。用放大镜找线索，区分事实与猜测"),
    ("gentle-guide", "勇气说话屋。学会把心里话好好告诉可信大人"),
    ("gentle-guide", "照顾小桥。看交接日历、收拾小书包与安心想念"),
    ("starlight-companion", "星光小屋。点亮你的独特爱好与强项拼图"),
    ("warm-sister", "绿草呼吸平静角。跟随圆圈呼吸练习，放松身体平复情绪"),
    ("gentle-guide", "大石头变小魔法拆解台。把大困难拆成容易迈出的三小步"),

    # 4. 关键地标弹窗与平静角、天气站、拆解台核心语音
    ("warm-sister", "请跟随圆圈，慢慢吸气，肚子像气球一样鼓起来。"),
    ("warm-sister", "请跟随圆圈，缓缓呼气，把心里的烦恼轻轻吹出去。"),
    ("warm-sister", "没关系，不想选是完全可以的。你想在小岛上玩什么都可以。"),
    ("warm-sister", "好呀，不去平静角也可以。我们一起安安静静呆着，或者换个轻巧的故事玩。"),
    ("warm-sister", "你真勇敢，愿意和大人在一起。去找身边的爸爸、妈妈或老师抱一抱吧。"),
    ("warm-sister", "欢迎来到故事林。这里有很多有趣的故事叶，动手玩一玩，发现你的思考方法！"),
    ("gentle-guide", "大石头被你完全拆解成小动作啦！走好脚下的这一小步，你已经拥有化解大困难的思考超能力了！"),

    # 5. 三大触觉化互动游戏核心引导语
    ("playful-buddy", "画室桌角有一支断成两截的红色蜡笔，旁边有一幅画了一半的太阳。拿起放大镜找找现场有哪些真实线索吧！"),
    ("playful-buddy", "绿茵场边有一只滚出白线的足球，草地上留着一道滑痕。拿起放大镜找找现场有哪些真实线索吧！"),
    ("playful-buddy", "大橡树下掉了几颗饱满的橡果，树枝还在轻轻晃动。拿起放大镜找找现场有哪些真实线索吧！"),
    ("playful-buddy", "拼图桌角少了一块蓝天碎片，地毯边露出了一个小角。拿起放大镜找找现场有哪些真实线索吧！"),
    ("playful-buddy", "有些事情我们暂时还不知道，这是很正常的！不用急着猜。"),
    ("playful-buddy", "太棒了小侦探！我们把拍到的照片和心里的猜想分得清清楚楚。"),
    ("playful-buddy", "已重新整理场景，拿起放大镜重新找找吧！"),
    ("gentle-guide", "校门口放学时，同学好奇地问：“为什么你爸爸妈妈不一起接你呀？”别着急，怎么说、跟谁说，完全由你决定。"),
    ("gentle-guide", "注意：遇到起哄和嘲笑时，我们绝对不需要忍受。请立刻使用安全保护行动！"),
    ("gentle-guide", "我们重新想一想，换一种你觉得最舒服的方式回答。"),
    ("warm-sister", "池塘边有一只漂亮的小木船，小兔和小熊都想玩。我们试试把不同的道具放进池塘，看看能商量出什么好办法！"),

    # 6. 四套声学模板通用试听样音（每套模板均可试听）
    ("warm-sister", "你好呀，今天我们一起做深呼吸，慢慢退后一步看一看。"),
    ("gentle-guide", "你好呀，今天我们一起做深呼吸，慢慢退后一步看一看。"),
    ("playful-buddy", "你好呀，今天我们一起做深呼吸，慢慢退后一步看一看。"),
    ("starlight-companion", "你好呀，今天我们一起做深呼吸，慢慢退后一步看一看。"),
    ("warm-sister", "我看到你的积木倒了，心里有点难过对吗？这很正常，大人也会这样。"),
    ("gentle-guide", "大人不住在一个房子里，是大人的决定。这件事百分之百不是因为你。"),
    ("warm-sister", "身边有老师或者家人时，可以直接走到他们面前拉拉衣角。"),
]


async def synthesize_item(sem: asyncio.Semaphore, profile_id: str, raw_text: str) -> dict:
    norm_key = normalize_text_for_key(raw_text)
    digest = hashlib.sha256(f"{profile_id}:{norm_key}".encode("utf-8")).hexdigest()[:16]
    filename = f"{profile_id}-{digest}.mp3"
    filepath = AUDIO_OUT_DIR / filename
    meta_cache = AUDIO_OUT_DIR / f".{profile_id}-{digest}.json"

    if filepath.exists() and filepath.stat().st_size > 1000 and meta_cache.exists():
        try:
            return json.loads(meta_cache.read_text(encoding="utf-8"))
        except Exception:
            pass

    cfg = VOICE_CONFIGS[profile_id]
    spoken_clean = re.sub(r"（[^）]*）|\([^)]*\)|【[^】]*】|\[[^\]]*\]", "", raw_text).strip()

    async with sem:
        for attempt in range(5):
            try:
                await asyncio.sleep(0.15)
                comm = edge_tts.Communicate(
                    spoken_clean,
                    cfg["voice"],
                    rate=cfg["rate"],
                    pitch=cfg["pitch"],
                    boundary="WordBoundary",
                )
                boundaries = []
                audio_bytes = bytearray()
                async for chunk in comm.stream():
                    if chunk["type"] == "audio":
                        audio_bytes.extend(chunk["data"])
                    elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                        boundaries.append(
                            {
                                "offsetMs": round(chunk["offset"] / 10000),
                                "durationMs": round(chunk["duration"] / 10000),
                                "text": chunk["text"],
                            }
                        )

                if len(audio_bytes) < 500:
                    raise RuntimeError("Empty audio response")

                filepath.write_bytes(bytes(audio_bytes))
                total_duration_ms = 0
                if boundaries:
                    last = boundaries[-1]
                    total_duration_ms = last["offsetMs"] + last["durationMs"] + 180

                result = {
                    "id": f"{profile_id}:{norm_key}",
                    "normKey": norm_key,
                    "profileId": profile_id,
                    "voiceName": cfg["voice"],
                    "audioUrl": f"/audio/tts/{filename}",
                    "durationMs": total_duration_ms,
                    "boundaries": boundaries,
                }
                meta_cache.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
                return result
            except Exception as e:
                if attempt == 4:
                    raise
                await asyncio.sleep(0.8 * (attempt + 1))


async def main():
    AUDIO_OUT_DIR.mkdir(parents=True, exist_ok=True)
    sem = asyncio.Semaphore(2)
    results = []
    for idx, (profile_id, text) in enumerate(CORE_SPEECH_ITEMS):
        res = await synthesize_item(sem, profile_id, text)
        results.append(res)
        if (idx + 1) % 10 == 0 or idx + 1 == len(CORE_SPEECH_ITEMS):
            print(f"[{idx + 1}/{len(CORE_SPEECH_ITEMS)}] Generated {res['audioUrl']} ({len(res['boundaries'])} words)")

    # Remove temporary .json cache files after manifest is built
    for f in AUDIO_OUT_DIR.glob(".*.json"):
        f.unlink(missing_ok=True)

    by_profile_and_key = {}
    by_key_default = {}
    for item in results:
        by_profile_and_key[item["id"]] = item
        if item["normKey"] not in by_key_default:
            by_key_default[item["normKey"]] = item

    manifest_data = {
        "generatedAt": "2026-10-15T07:42:00Z",
        "engine": "Microsoft Edge Neural TTS (Xiaoxiao / Xiaoyi / Yunxi / Yunxia)",
        "totalClips": len(results),
        "items": by_profile_and_key,
        "defaultByKey": by_key_default,
    }

    MANIFEST_JSON_PATH.write_text(
        json.dumps(manifest_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    ts_content = (
        "// Auto-generated by scripts/generate-tts-assets.py\n"
        "// Real Neural Voice Audio Manifest with Millisecond Word-Boundary Timestamps\n\n"
        "export interface WordBoundaryTiming {\n"
        "  offsetMs: number;\n"
        "  durationMs: number;\n"
        "  text: string;\n"
        "}\n\n"
        "export interface PrebakedTtsEntry {\n"
        "  id: string;\n"
        "  normKey: string;\n"
        "  profileId: string;\n"
        "  voiceName: string;\n"
        "  audioUrl: string;\n"
        "  durationMs: number;\n"
        "  boundaries: WordBoundaryTiming[];\n"
        "}\n\n"
        f"export const PREBAKED_TTS_BY_PROFILE_KEY: Record<string, PrebakedTtsEntry> = {json.dumps(by_profile_and_key, ensure_ascii=False, indent=2)};\n\n"
        f"export const PREBAKED_TTS_BY_DEFAULT_KEY: Record<string, PrebakedTtsEntry> = {json.dumps(by_key_default, ensure_ascii=False, indent=2)};\n"
    )
    MANIFEST_TS_PATH.write_text(ts_content, encoding="utf-8")
    print(f"Successfully generated {len(results)} neural voice clips and src/data/ttsManifest.ts!")


if __name__ == "__main__":
    asyncio.run(main())
