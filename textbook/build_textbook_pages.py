"""把 D:/github/wechat-decrypt/notes/textbook/chapter*.md 转成 memehub/textbook/*.html
让 memehub 网页能在线读高数下册."""

import os, re, sys, io, json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

SRC_DIR = "D:/github/wechat-decrypt/notes/textbook"
OUT_DIR = "D:/github/memehub/textbook"
os.makedirs(OUT_DIR, exist_ok=True)


def md_to_html(md):
    out = []
    lines = md.split("\n")
    in_p = False
    for line in lines:
        line = line.rstrip()
        if not line.strip():
            if in_p:
                out.append("</p>")
                in_p = False
            continue
        m = re.match(r"^(#{1,6})\s+(.+)$", line)
        if m:
            if in_p:
                out.append("</p>")
                in_p = False
            level = len(m.group(1))
            content = escape(m.group(2))
            out.append(f"<h{level}>{content}</h{level}>")
            continue
        if line.startswith("> "):
            if in_p:
                out.append("</p>")
                in_p = False
            out.append(f"<blockquote>{escape(line[2:])}</blockquote>")
            continue
        if re.match(r"^[-*]\s", line):
            if in_p:
                out.append("</p>")
                in_p = False
            # 简化: 单条 li
            out.append(f"<li>{format_inline(line[2:])}</li>")
            continue
        m2 = re.match(r"^(\d+)\.\s+(.+)$", line)
        if m2:
            if in_p:
                out.append("</p>")
                in_p = False
            out.append(f"<li>{format_inline(m2.group(2))}</li>")
            continue
        # 普通段落
        if not in_p:
            out.append("<p>")
            in_p = True
        out.append(format_inline(line))
    if in_p:
        out.append("</p>")
    return "\n".join(out)


def escape(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def format_inline(s):
    s = escape(s)
    # **bold**
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    return s


def main():
    chapters = sorted([f for f in os.listdir(SRC_DIR) if f.startswith("chapter") and f.endswith(".md")])
    toc = []
    for ch in chapters:
        path = os.path.join(SRC_DIR, ch)
        md = open(path, encoding="utf-8").read()
        title = re.search(r"^#\s+(.+)$", md, re.MULTILINE)
        title_text = title.group(1) if title else ch
        slug = ch.replace(".md", "")
        html_body = md_to_html(md)
        html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>{escape(title_text)} · MemeHub 教材</title>
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="./textbook.css">
</head>
<body>
<header>
  <h1>📘 高数下册教材</h1>
  <p class="tagline">{escape(title_text)}</p>
  <nav><a href="../index.html">← 返回 MemeHub</a> · <a href="./index.html">章节列表</a></nav>
</header>
<main class="textbook">
{html_body}
</main>
</body>
</html>
"""
        out_path = os.path.join(OUT_DIR, f"{slug}.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)
        toc.append({"slug": slug, "title": title_text, "chars": len(md)})
        print(f"built {slug}.html ({len(html)} chars)")

    # toc index
    toc_html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>📘 高数下册教材 · MemeHub</title>
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="./textbook.css">
</head>
<body>
<header>
  <h1>📘 高数下册教材 (富贵编)</h1>
  <p class="tagline">同济大学《高等数学》第七版下册 · 5 章完整版 · 零基础类比+例题</p>
  <nav><a href="../index.html">← 返回 MemeHub</a></nav>
</header>
<main class="textbook-toc">
<h2>📖 章节列表</h2>
<ul>
"""
    for t in toc:
        toc_html += f'<li><a href="./{t["slug"]}.html">{escape(t["title"])}</a> <span class="meta">({t["chars"]} 字符)</span></li>\n'
    toc_html += """</ul>
</main>
</body>
</html>
"""
    with open(os.path.join(OUT_DIR, "index.html"), "w", encoding="utf-8") as f:
        f.write(toc_html)
    print(f"built index.html")


if __name__ == "__main__":
    main()
