// MemeHub front-end - 静态 SPA, 切换 memes / characters 视图

let allMemes = [];
let allCharacters = null;
let currentDomain = "全部";
let currentView = "memes";
let currentSearch = "";

async function load() {
  try {
    const [memesRes, charsRes] = await Promise.all([
      fetch("data.json").then((r) => r.json()),
      fetch("characters.json").then((r) => r.json()).catch(() => null),
    ]);
    allMemes = memesRes.memes || [];
    allCharacters = charsRes;
    document.getElementById("updated").textContent = memesRes.updated_at || "--";
    render();
  } catch (e) {
    document.getElementById("cards").innerHTML =
      '<p style="color:#f85149">数据加载失败,稍后重试</p>';
  }
}

function render() {
  if (currentView === "characters") {
    renderCharacters();
  } else {
    renderMemes();
  }
}

function renderMemes() {
  const filtered = allMemes.filter((m) => {
    if (currentDomain !== "全部" && m.domain !== currentDomain) return false;
    if (currentSearch && !JSON.stringify(m).toLowerCase().includes(currentSearch.toLowerCase()))
      return false;
    return true;
  });

  document.getElementById("count").textContent = `共 ${filtered.length} 条热梗 · ${currentDomain}`;

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
        ${m.characters ? renderChars(m.characters) : ""}
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

function renderCharacters() {
  if (!allCharacters) {
    document.getElementById("cards").innerHTML = '<p style="color:#8b949e">角色数据未加载</p>';
    return;
  }
  const games = allCharacters.games || [];
  const filteredGames = games
    .map((g) => ({
      ...g,
      characters: g.characters.filter((c) => {
        if (!currentSearch) return true;
        const blob = (c.name + " " + (c.vibe || "") + " " + g.name).toLowerCase();
        return blob.includes(currentSearch.toLowerCase());
      }),
    }))
    .filter((g) => g.characters.length > 0);

  const total = filteredGames.reduce((s, g) => s + g.characters.length, 0);
  document.getElementById("count").textContent = `共 ${total} 个角色 · ${filteredGames.length} 款游戏/IP`;

  const html = filteredGames
    .map(
      (g) => `
    <div class="game-section">
      <h2>${escapeHtml(g.name)} <span class="game-tag">${escapeHtml(g.tag || "")}</span></h2>
      <div class="char-grid">
        ${g.characters
          .map(
            (c) => `
          <div class="char-card">
            <h4>${escapeHtml(c.name)}</h4>
            <div class="char-type">${escapeHtml(c.type || "")}</div>
            <div class="char-vibe">${escapeHtml(c.vibe || "")}</div>
            <div class="char-fit">
              <strong>适合梗:</strong>
              ${(c.fit_memes || [])
                .map((m) => `<span class="meme-tag">${escapeHtml(m)}</span>`)
                .join("")}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `
    )
    .join("");

  document.getElementById("cards").innerHTML = html || '<p style="color:#8b949e">无匹配角色</p>';
}

function renderChars(c) {
  const game = (c.game || []).map((g) => `<li>${escapeHtml(g)}</li>`).join("");
  const blogger = (c.blogger || []).map((g) => `<li>${escapeHtml(g)}</li>`).join("");
  return `
    <div class="chars">
      <div class="chars-group">
        <strong>🎮 可二创角色 (游戏):</strong>
        <ul>${game}</ul>
      </div>
      <div class="chars-group">
        <strong>👤 可参考博主:</strong>
        <ul>${blogger}</ul>
      </div>
    </div>
  `;
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

// nav switch
document.querySelectorAll("nav#domains button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("nav#domains button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentView = btn.dataset.view || "memes";
    currentDomain = btn.dataset.domain || "全部";
    render();
  });
});

document.getElementById("search").addEventListener("input", (e) => {
  currentSearch = e.target.value;
  render();
});

load();
