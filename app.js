// MemeHub front-end - 静态 SPA, 从 data.json 拉热梗数据渲染

let allMemes = [];
let currentDomain = "热梗";
let currentSearch = "";

async function load() {
  try {
    const res = await fetch("data.json");
    const data = await res.json();
    allMemes = data.memes || [];
    document.getElementById("updated").textContent = data.updated_at || "--";
    render();
  } catch (e) {
    document.getElementById("cards").innerHTML =
      '<p style="color:#f85149">数据加载失败,稍后重试</p>';
  }
}

function render() {
  const filtered = allMemes.filter((m) => {
    if (m.domain !== currentDomain) return false;
    if (currentSearch && !JSON.stringify(m).toLowerCase().includes(currentSearch.toLowerCase()))
      return false;
    return true;
  });

  document.getElementById("count").textContent = `共 ${filtered.length} 条热梗 · 领域: ${currentDomain}`;

  const cardsHtml = filtered
    .map((m, idx) => {
      const promptKeys = Object.keys(m.prompts || {});
      const firstKey = promptKeys[0] || "";
      return `
      <div class="card" data-idx="${idx}">
        <h3>${escapeHtml(m.title)}</h3>
        <div class="source">
          ${escapeHtml(m.source)} · ${escapeHtml(m.date || "")}
          ${m.heat ? `<span class="heat">🔥 ${m.heat}</span>` : ""}
        </div>
        <div class="analysis">
          <strong>梗点分析:</strong> ${escapeHtml(m.analysis || "")}
        </div>
        <div class="prompt-tabs">
          ${promptKeys
            .map(
              (k, i) =>
                `<button class="${i === 0 ? "active" : ""}" data-key="${k}">${k}</button>`
            )
            .join("")}
        </div>
        <div class="prompt-body" data-prompt>
          ${escapeHtml(m.prompts[firstKey] || "")}
          <button class="copy-btn">复制</button>
        </div>
      </div>
    `;
    })
    .join("");

  document.getElementById("cards").innerHTML = cardsHtml || '<p style="color:#8b949e">暂无数据</p>';

  // wire prompt tab switch
  document.querySelectorAll(".card").forEach((card) => {
    const idx = parseInt(card.dataset.idx);
    const meme = filtered[idx];
    card.querySelectorAll(".prompt-tabs button").forEach((btn) => {
      btn.addEventListener("click", () => {
        card.querySelectorAll(".prompt-tabs button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const body = card.querySelector(".prompt-body");
        const key = btn.dataset.key;
        body.textContent = meme.prompts[key] || "";
        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.textContent = "复制";
        body.appendChild(copyBtn);
        wireCopy(copyBtn, meme.prompts[key]);
      });
    });
    const initCopyBtn = card.querySelector(".copy-btn");
    if (initCopyBtn) wireCopy(initCopyBtn, meme.prompts[Object.keys(meme.prompts)[0]] || "");
  });
}

function wireCopy(btn, text) {
  btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "✓ 已复制";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = "复制";
        btn.classList.remove("copied");
      }, 1500);
    } catch (err) {
      btn.textContent = "复制失败";
    }
  });
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// domain switch
document.querySelectorAll("nav#domains button").forEach((btn) => {
  if (btn.disabled) return;
  btn.addEventListener("click", () => {
    document.querySelectorAll("nav#domains button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentDomain = btn.dataset.domain;
    render();
  });
});

// search
document.getElementById("search").addEventListener("input", (e) => {
  currentSearch = e.target.value;
  render();
});

load();
