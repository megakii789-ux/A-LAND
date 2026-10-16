#!/usr/bin/env python3
"""
Generates high-clarity, natural-prosody studio Neural TTS audio assets (.mp3)
and millisecond-accurate WordBoundary timing manifests for 晴雨小岛 (Qingyu Island).
Sprint 4.2: Full 4-Companion Neural Voice Coverage across all 6 core scenes:
- playful-buddy -> zh-CN-XiaoyiNeural (果果 guoguo_squirrel)
- warm-sister -> zh-CN-XiaoxiaoNeural (贝贝 beibei_otter)
- gentle-guide -> zh-CN-YunxiNeural (天天 tiantian_raccoon)
- starlight-companion -> zh-CN-YunxiaNeural (奇奇 qiqi_deer)
"""

import asyncio
import hashlib
import json
import re
from pathlib import Path
import edge_tts

ROOT_DIR = Path(__file__).resolve().parent.parent
AUDIO_OUT_DIR = ROOT_DIR / "public" / "audio" / "tts"
MANIFEST_TS_PATH = ROOT_DIR / "src" / "data" / "ttsManifest.ts"
MANIFEST_JSON_PATH = AUDIO_OUT_DIR / "manifest.json"

ALL_PROFILES = [
    "playful-buddy",
    "warm-sister",
    "gentle-guide",
    "starlight-companion",
]

VOICE_CONFIGS = {
    "warm-sister": {
        "voice": "zh-CN-XiaoxiaoNeural",
        "rate": "-6%",
        "pitch": "+2Hz",
    },
    "playful-buddy": {
        "voice": "zh-CN-XiaoyiNeural",
        "rate": "-3%",
        "pitch": "+4Hz",
    },
    "gentle-guide": {
        "voice": "zh-CN-YunxiNeural",
        "rate": "-7%",
        "pitch": "-2Hz",
    },
    "starlight-companion": {
        "voice": "zh-CN-YunxiaNeural",
        "rate": "-5%",
        "pitch": "+2Hz",
    },
}

# 1. Companion-specific greetings (bound to each companion's own voice profile, plus cross-audition)
COMPANION_GREETING_ITEMS = [
    ("playful-buddy", "你好呀！我是果果。我是小松鼠果果，我喜欢收捡森林里的每一片小树叶和秘密线索！"),
    ("playful-buddy", "我是小松鼠果果，我喜欢收捡森林里的每一片小树叶和秘密线索！"),
    ("warm-sister", "你好呀！我是贝贝。我是小海獭贝贝，如果觉得累了，我们可以一起躺在水面上慢慢呼吸。"),
    ("warm-sister", "我是小海獭贝贝，如果觉得累了，我们可以一起躺在水面上慢慢呼吸。"),
    ("gentle-guide", "你好呀！我是天天。我是小浣熊天天，遇到解不开的谜题，我们拆成一小步一小步来看看！"),
    ("gentle-guide", "我是小浣熊天天，遇到解不开的谜题，我们拆成一小步一小步来看看！"),
    ("gentle-guide", "你好呀！我是天天。我是小浣熊天天，再乱的小书包和难题，我们一步一步就能理清楚。"),
    ("gentle-guide", "我是小浣熊天天，再乱的小书包和难题，我们一步一步就能理清楚。"),
    ("starlight-companion", "你好呀！我是奇奇。我是小鹿奇奇，森林里起风时，我会停下来听一听自己的心跳声。"),
    ("starlight-companion", "我是小鹿奇奇，森林里起风时，我会停下来听一听自己的心跳声。"),
    ("starlight-companion", "你好呀！我是奇奇。我是小鹿奇奇，每个人心里都有好多颗闪亮的小星星，我们一起去看看吧。"),
    ("starlight-companion", "我是小鹿奇奇，每个人心里都有好多颗闪亮的小星星，我们一起去看看吧。"),
]

# 2. Shared mainline texts spoken across all 6 core scenes (generated for ALL 4 companion voices!)
SHARED_MAINLINE_TEXTS = [
    # --- Scene 1: 首页与全岛地标导览 (Island Home & Map Landmarks) ---
    "欢迎来到晴雨小岛！海面上飘着小木船，山巅有情绪天气站，树林深处是故事森林，小桥两边是温暖的家，还有放大镜木屋与星光树屋。你想先去哪里探险呢？",
    "这里是情绪天气站。站在山顶吹着微风，看看头顶的天空，也抱抱自己身体里正在流动的感觉。",
    "这里是故事森林，也就是故事林。古老的大树下有一本本好看的绘本，跟小动物们一起看看他们是怎样想办法的。",
    "这里是思考侦探所，也就是想法侦探社。在这里当个聪明的小侦探，用放大镜看清楚眼前发生的事情，不凭感觉瞎猜。",
    "这里是勇气小屋，也是勇气说话屋。在这里练习大声说出不，学会把心里的困惑和委屈讲给信任的大人听。",
    "这里是双向桥小驿，也就是照顾小桥。桥的两边都是爱你的家，日程清清楚楚，两边的爸爸妈妈都深深爱着你。",
    "这里是星光树屋，也是星光小屋。在夜空树梢上点亮属于你的爱好、特长与好朋友，家庭只是大拼图里的一片，你本身闪闪发光。",
    "这里是绿草平静角。如果觉得有点累或者心里噗通噗通跳，就来这里跟着圆圈深呼吸，随时可以停下来休息。",
    "这里是大困难拆解台。遇到觉得很难的事情别着急，动动手用小木槌把它敲成三小块，一步一步迈过去。",
    "绿草呼吸平静角。跟着圆圈慢慢吸气和呼气，放松身体；如果遇到大困难，也可以去拆解台把它拆成三小步。",

    # --- Scene 2: 情绪天气站与呼吸平静角 (Weather Station & Calm Corner) ---
    "挑选今天头顶的天气。晴、阴、雨、雷、雾，或者不想选，都可以。",
    "我现在像暖洋洋的太阳，亮堂堂的",
    "我现在像慢慢飘的厚云，有一点点心事",
    "我现在像下雨天，眼眶或心里有点湿湿的",
    "我现在像打雷闪电，肚子里有火或者好急好冲",
    "我现在像在一团雾里，懵懵的看不清",
    "我今天先不挑天气，先自己安安静静呆着",
    "没关系，不想选是完全可以的。你想在小岛上玩什么都可以。",
    "你现在像一团暴风雨。可以生气，可以大喊。我在这儿，我们一起等雷声停下来。",
    "你现在像一场大雨。可以难过，可以哭一哭。我在这儿，我们一起等雨小一点。",
    "好呀，不去平静角也可以。我们一起安安静静呆着，或者换个轻巧的故事玩。",
    "你真勇敢，愿意和大人在一起。去找身边的爸爸、妈妈或老师抱一抱吧。",
    "深深吸气... 肚子鼓起来",
    "轻轻停一停... 感觉好安静",
    "缓缓呼气... 把烦恼吹出去",
    "轻松休息... 身体松松的",

    # --- Scene 3: 蜡笔侦探 (Crayon Detective Game) ---
    "欢迎来到美术角！桌上的绿色小蜡笔不见了，我们拿起小放大镜，看看地上和桌边有些什么。",
    "欢迎来到绿茵场！训练用的小足球不知道滚去哪里了，我们拿起放大镜，仔细看看草坪边缘。",
    "欢迎来到大橡树下！小松鼠放在树洞旁的大橡果找不到了，我们拿起放大镜，去拨开落叶、看看树洞和地面痕迹吧。",
    "欢迎来到拼图小桌！彩虹拼图的最后一片找不到啦，我们拿起放大镜，在桌角和地毯上找一找。",
    "有些事情我们暂时还不知道，这是很正常的！不用急着猜。",
    "已重新整理场景，拿起放大镜重新找找吧！",

    # --- Scene 4: 朋友问起家里事 (Friend Asks Home Game) ---
    "放学校门口的好奇提问。好朋友小明说：“咦，昨天是你爸爸来接你，今天怎么只有你妈妈呀？他们为什么不一起接你呢？” 你想怎么回应呢？怎么说、说多少或者停下对话，都由你决定。",
    "放学校门口的好奇提问。好朋友小明说：“咦，今天是谁来接你放学呀？你们家平时是怎么安排接送的呀？” 你想怎么回应呢？怎么说、说多少或者停下对话，都由你决定。",
    "我们重新开始这个情境，你可以尝试不同的回答、转移话题或者直接划定边界！",

    # --- Scene 5: 轮流玩小船 (Toy Boat Negotiation Game) ---
    "池塘边的唯一红帆船。晴朗水塘里只有一条红帆小木船。小兔提莫想先当船长冲浪，小熊波波也想自己掌舵去芦苇丛，谁都不想在岸边空手干等太久。 请先移动小船位置、设置轮流秒数或合作方案，再点开始执行观察实验结果吧！",
    "浅水溪湾的松果渡船挑战。浅水溪湾需要把岸上的松果运到对岸小岛，但现场只有一条小木船、一支船桨和岸边的挖掘机。如果两个人抢着单干，船容易卡在浅滩石头旁！ 请先移动小船位置、设置轮流秒数或合作方案，再点开始执行观察实验结果吧！",
    "我们停下来重新商量！你可以调整谁先玩、每轮几秒或者换成合作方案。",

    # --- Scene 6: 故事森林与树屋露营夜 (Story Grove & Camp Transfer Challenge) ---
    "点击或移动桌上的蓝水杯，让它先后挨着左边的小积木和右边的大水桶，看看会发生什么！",
    "把蓝水杯移到小积木旁边：杯子比小积木高好多，跳跳开心得蹦起来说“看，是大杯子吧！”",
    "把蓝水杯移到大水桶旁边：杯子在大水桶旁边显得好小，噗噗笑着晃鼻子说“看，跟我的水桶比它真小！”",
    "蓝水杯回到桌子中间：杯身上的两格水位线一点儿没变，杯子自己的大小没有改变。",
    "森林木地板上只有一辆红色小火车头，小熊和小浣熊都想现在玩。先点点地上的物件看看都有什么吧！",
    "夜晚的树屋帐篷外晃动着一个神秘黑影！身旁的小刺猬紧张地追问你的隐私秘密，而地上只有一件照明工具，大家都想拿。先转动光束照一照吧！",
    "暂时不知道也没关系！你可以先转动手电筒照一照，或者先休息一下回小岛。",

    # --- 语音试听台、现实求助与偏好提示 (Audition Presets, Help & Personalization) ---
    "你好呀，今天我们一起做深呼吸，慢慢退后一步看一看。",
    "我看到你的积木倒了，心里有点难过对吗？这很正常，大人也会这样。",
    "大人不住在一个房子里，是大人的决定。这件事百分之百不是因为你。",
    "身边有老师或者家人时，可以直接走到他们面前拉拉衣角。",
    "已记在这个平板的抱抱信箱里啦。这不会发到远方手机上，如果大人就在身边，现在去拉拉他的衣角吧。",
    "选择你喜欢的动物伙伴，它们会陪你一起在小岛上探索。",
    "选择你喜欢的活动，例如画画、足球、小动物或者拼图。",
    "语音提示已开启",
]

# Legacy single-profile items preserved so zero existing clips are orphaned
LEGACY_SINGLE_PROFILE_ITEMS = [
    ("warm-sister", "吸气……一、二、三、四。感觉像闻一朵香香的小花。"),
    ("warm-sister", "轻轻屏住呼吸……一、二。"),
    ("warm-sister", "呼气……一、二、三、四。像把蒲公英的绒毛轻轻吹向天空。"),
    ("warm-sister", "全身松松软软的，你做得很棒，什么时候想停下来都可以。"),
    ("playful-buddy", "情绪天气站。看看今天心里是晴天、阴天还是下小雨，每种天气都被接纳。"),
    ("warm-sister", "故事林。打开三扇思考小门，听听森林里发生的故事。"),
    ("playful-buddy", "想法侦探社。拿起放大镜，找一找哪些是眼睛看到的事实，哪些是心里的猜想。"),
    ("gentle-guide", "勇气说话屋。遇到不舒服或者想不清楚的事，练习温和又清楚地说出来。"),
    ("warm-sister", "照顾小桥。不管今天住在哪一边，桥两头的爱都稳稳地连在一起。"),
    ("starlight-companion", "星光小屋。收集你身上的闪光点，你是独一无二的自己。"),
    ("gentle-guide", "我的小脚印。看看你在小岛上走过的每一步成长足迹。"),
    ("playful-buddy", "桌上的红色水彩笔不见了！小熊觉得一定是小狐狸拿走的。我们先别急着下结论，点一点房间里的线索看看吧！"),
    ("playful-buddy", "地上有一串沾着蓝色颜料的小脚印，通向阳台。这是眼睛看到的事实线索！"),
    ("playful-buddy", "画架旁边的笔筒倒了，有一支红笔滚到了沙发底下！这也是真凭实据的事实线索！"),
    ("playful-buddy", "小熊脑海里想：他昨天借过我的尺子，肯定是他拿的。这只是脑子里的猜测，还不是证据哦。"),
    ("playful-buddy", "太棒啦！你把眼睛看到的事实线索和心里的猜测分得清清楚楚，帮小熊找到了沙发底下的红笔！"),
    ("warm-sister", "小松鼠看中了圆圆的蓝杯子，小刺猬觉得高高的黄杯子才装得多。到底哪个杯子装水更多呢？"),
    ("warm-sister", "如果只用眼睛看高矮和胖瘦，我们很容易被杯子的形状骗到。怎样才能找到真正的事实证据呢？"),
    ("warm-sister", "把两个杯子里的水都倒进有刻度线的量杯里比一比！亲手验证比凭感觉猜更准确。"),
    ("warm-sister", "小兔子和小乌龟都想玩同一辆红色小火车，两个人都拉着绳子不肯放手。"),
    ("warm-sister", "如果一直使劲拉扯，不仅谁都玩不成，小火车还可能被拉坏，大家心里也会难过。"),
    ("warm-sister", "可以定个小沙漏轮流当司机，另一个人当站长摇铃铛！一起想办法，两个人都能玩得开心。"),
    ("gentle-guide", "桌上的拼图洒了一地，足足有二十块，看着好乱呀！"),
    ("gentle-guide", "第一小步：先深呼吸一下，只把四个角的拼图找出来。"),
    ("gentle-guide", "第二小步：把带直边的拼图排成一排，搭好外框。"),
    ("gentle-guide", "第三小步：按颜色一块一块放进去，大困难就变成轻松的小游戏啦！"),
    ("warm-sister", "大人不住在一个房子里，是大人之间做的大人决定。这件事百分之百不是因为你。"),
    ("warm-sister", "想念另一个家是非常自然的事。你可以把想说的话写进思念小信箱，或者画下来。"),
    ("gentle-guide", "不管今天住在妈妈家还是爸爸家，你都可以提前看看小书包清单，心里稳稳当当的。"),
    ("starlight-companion", "家庭只是你生活拼图里的一小块。你喜欢画画、会照顾小动物、还会自己想办法，你本身就闪闪发光！"),
    ("warm-sister", "想要一个真人的大拥抱对吗？快走到身边的大人面前，拉拉他的衣角说：我想抱一抱。"),
    ("gentle-guide", "如果现在想自己静一静，或者去找信任的老师和家人，都是非常好的选择。"),
]


def normalize_text_for_key(text: str) -> str:
    cleaned = re.sub(r"（[^）]*）|\([^)]*\)|【[^】]*】|\[[^\]]*\]", "", text)
    cleaned = re.sub(r"[\s*_#`~>\"'“”‘’、，。！？；：,.!?;:—\-…·]", "", cleaned)
    return cleaned.strip()


def build_target_items():
    seen = set()
    ordered = []

    def add_item(profile_id: str, text: str):
        norm_key = normalize_text_for_key(text)
        key = f"{profile_id}:{norm_key}"
        if key not in seen:
            seen.add(key)
            ordered.append((profile_id, text))

    for pid, txt in COMPANION_GREETING_ITEMS:
        add_item(pid, txt)

    for txt in SHARED_MAINLINE_TEXTS:
        for pid in ALL_PROFILES:
            add_item(pid, txt)

    for pid, txt in LEGACY_SINGLE_PROFILE_ITEMS:
        add_item(pid, txt)

    return ordered


async def synthesize_item(
    sem: asyncio.Semaphore,
    existing_items: dict,
    profile_id: str,
    raw_text: str,
) -> dict:
    norm_key = normalize_text_for_key(raw_text)
    item_id = f"{profile_id}:{norm_key}"
    digest = hashlib.sha256(item_id.encode("utf-8")).hexdigest()[:16]
    filename = f"{profile_id}-{digest}.mp3"
    filepath = AUDIO_OUT_DIR / filename

    # Fast reuse if MP3 file and manifest entry already exist
    if filepath.exists() and filepath.stat().st_size > 1000 and item_id in existing_items:
        cached_entry = existing_items[item_id]
        if cached_entry.get("boundaries") and cached_entry.get("profileId") == profile_id:
            return cached_entry

    cfg = VOICE_CONFIGS[profile_id]
    spoken_clean = re.sub(r"（[^）]*）|\([^)]*\)|【[^】]*】|\[[^\]]*\]", "", raw_text).strip()

    async with sem:
        for attempt in range(5):
            try:
                await asyncio.sleep(0.08)
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
                    "id": item_id,
                    "normKey": norm_key,
                    "profileId": profile_id,
                    "voiceName": cfg["voice"],
                    "audioUrl": f"/audio/tts/{filename}",
                    "durationMs": total_duration_ms,
                    "boundaries": boundaries,
                }
                return result
            except Exception:
                if attempt == 4:
                    raise
                await asyncio.sleep(0.8 * (attempt + 1))


async def main():
    AUDIO_OUT_DIR.mkdir(parents=True, exist_ok=True)
    existing_items = {}
    if MANIFEST_JSON_PATH.exists():
        try:
            loaded = json.loads(MANIFEST_JSON_PATH.read_text(encoding="utf-8"))
            existing_items = loaded.get("items", {})
        except Exception:
            existing_items = {}

    target_items = build_target_items()
    print(f"Total target neural voice items: {len(target_items)} (existing in manifest: {len(existing_items)})")

    sem = asyncio.Semaphore(6)
    completed = 0

    async def worker(idx: int, profile_id: str, text: str):
        nonlocal completed
        res = await synthesize_item(sem, existing_items, profile_id, text)
        completed += 1
        if completed % 20 == 0 or completed == len(target_items):
            print(f"[{completed}/{len(target_items)}] Ready {res['audioUrl']} ({res['voiceName']})")
        return idx, res

    indexed_results = await asyncio.gather(
        *(worker(i, pid, txt) for i, (pid, txt) in enumerate(target_items))
    )
    indexed_results.sort(key=lambda x: x[0])
    results = [r for _, r in indexed_results]

    by_profile_and_key = {}
    by_key_default = {}
    for item in results:
        by_profile_and_key[item["id"]] = item
        if item["normKey"] not in by_key_default:
            by_key_default[item["normKey"]] = item

    manifest_data = {
        "generatedAt": "2026-10-16T07:30:00Z",
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
