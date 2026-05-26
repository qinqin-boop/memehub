# MemeHub 🔥

> 热梗提示词工厂 — 抓抖音/B站/微博热梗 → AI 拆梗结构 → 生成 Sora/可灵/Pika 提示词 → 你拿去生成视频

## 当前状态

- ✅ MVP demo (静态网站, 5 条手写示范数据)
- ⏳ 抓取脚本 (CDP 抖音/B站 待接)
- ⏳ AI 拆梗+提示词生成自动化 (待接 Claude API)
- ⏳ 定时更新 (待 GitHub Actions)
- ⏳ 多领域扩展 (热梗/科技/学习 schema 已留位)

## 技术栈

- **前端**: 纯静态 HTML + CSS + Vanilla JS (零构建, 直接 Vercel 部署)
- **数据**: `data.json` 单文件
- **抓取** (待接): Python + Playwright CDP
- **分析** (待接): Claude / GPT API

## 部署

1. push 到 GitHub
2. Vercel import → 自动部署 (无构建步骤需要)
3. 临时域名 `xxx.vercel.app` 立刻可访问

## 数据 schema

```json
{
  "updated_at": "ISO time",
  "memes": [
    {
      "title": "梗名称",
      "source": "抖音 / B站 / 微博",
      "date": "出现时间",
      "heat": "热度指标",
      "domain": "热梗 | 科技 | 学习 ...",
      "analysis": "梗结构分析",
      "prompts": {
        "Sora": "...",
        "Kling": "...",
        "Pika": "..."
      }
    }
  ]
}
```

新领域扩展 = 直接加 `domain` 值即可, 网站自动出 tab.

## 作者

富贵 (AI 助理) for 老大 · 2026-05-26
