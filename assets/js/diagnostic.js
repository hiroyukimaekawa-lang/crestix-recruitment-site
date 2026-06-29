/**
 * Crestix — Job Diagnosis Engine  v4.0
 * 3ステップ診断（事業部 → 職種タイプ → 結果）
 */

'use strict';

/* ─── DATA ──────────────────────────────────────── */
const diagDivisions = [
  { value: 'division1', title: '第一営業部',           description: 'クリニック・医療機関の集患・運営を支援する事業部' },
  { value: 'hd',        title: 'HD事業部',             description: '飲食店・美容室などの地域店舗の集客・グロースを支援する事業部' },
  { value: 'ai_sales',  title: 'AI Sales Enablement', description: '営業代行・AI活用で企業の売上成長を支援する横断的事業部' }
];

const diagRoles = {
  division1: [
    { value: 'is', title: 'ISリーダー候補', description: 'インサイドセールス組織のリーダー候補として、アポ獲得から育成まで担当' },
    { value: 'fs', title: 'FSリーダー候補', description: 'フィールドセールス組織のリーダー候補として、商談提案から受注まで担当' }
  ],
  hd: [
    { value: 'is',        title: 'ISリーダー候補',           description: 'インサイドセールス組織のリーダー候補として、アポ獲得から育成まで担当' },
    { value: 'fs_member', title: 'FSメンバー',               description: 'フィールドセールスメンバーとして、店舗への課題解決提案を担当' },
    { value: 'fs_leader', title: 'FSリーダー候補',           description: 'フィールドセールス組織のリーダー候補として、商談管理と育成を担当' },
    { value: 'cs',        title: 'CS（メンバー/リーダー候補）', description: 'カスタマーサクセスとして、導入から継続利用まで顧客に伴走' }
  ]
};

const diagResults = {
  'division1+is':      { title: '第一 ISリーダー候補',            division: '第一営業部',                page: 'job-division1-is-leader.html', employment: '正社員',            location: '東京（リモート可）' },
  'division1+fs':      { title: '第一 FSリーダー候補',            division: '第一営業部',                page: 'job-division1-fs-leader.html', employment: '正社員',            location: '東京' },
  'hd+is':             { title: 'HD ISリーダー候補',              division: 'HD事業部',                  page: 'job-hd-is-leader.html',        employment: '正社員',            location: '東京' },
  'hd+fs_member':      { title: 'HD FSメンバー',                  division: 'HD事業部',                  page: 'job-hd-fs-member.html',        employment: '正社員・業務委託も可', location: '東京' },
  'hd+fs_leader':      { title: 'HD FSリーダー候補',              division: 'HD事業部',                  page: 'job-hd-fs-leader.html',        employment: '正社員',            location: '東京' },
  'hd+cs':             { title: 'HD CSメンバー / CSリーダー候補', division: 'HD事業部',                  page: 'job-hd-cs-member.html',        employment: '正社員・業務委託も可', location: '東京' },
  'ai_sales+':         { title: 'AI Sales Enablement MG候補',    division: 'AI Sales Enablement事業部', page: 'job-ai-sales-mg.html',         employment: '正社員',            location: '東京' }
};

/* ─── STATE ─────────────────────────────────────── */
const diagState = { current: 1, division: null, role: null };
let diagAutoAdvanceTimer = null;

/* ─── PROGRESS BAR ──────────────────────────────── */
function updateProgress(step) {
  const footer = document.getElementById('diag-footer');
  if (footer) footer.classList.toggle('diag-footer--result', step === 3);

  const line = document.getElementById('diag-progress-line');
  if (line) {
    if (step === 1) line.style.width = '0%';
    else if (step === 2) line.style.width = '50%';
    else line.style.width = '100%';
  }

  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById('pbar-dot-' + i);
    if (!dot) continue;
    const container = dot.parentElement;
    const spans = container.getElementsByTagName('span');
    if (i <= step) {
      dot.style.borderColor = '#FF5C00';
      dot.style.backgroundColor = '#FF5C00';
      for (const s of spans) s.style.color = '#FF5C00';
    } else {
      dot.style.borderColor = '#D1D5DB';
      dot.style.backgroundColor = 'white';
      for (const s of spans) s.style.color = '#9CA3AF';
    }
  }
}

/* ─── BACK BUTTON ───────────────────────────────── */
function setBackButton(visible) {
  const btn = document.getElementById('diag-back');
  if (!btn) return;
  if (visible) {
    btn.style.display = 'flex';
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.style.cursor = 'pointer';
  } else {
    btn.style.display = 'none';
  }
}

/* ─── CARD BUILDER ──────────────────────────────── */
function buildCard(stepNum, opt) {
  return `
    <div class="diag-option-card relative bg-white rounded-2xl p-9 lg:p-10 min-h-[190px] flex flex-col items-center justify-center text-center border-2 border-slate-200 cursor-pointer transition-all duration-300 hover:shadow-[0_16px_38px_rgba(15,23,42,0.08)]"
        onclick="diagSelect(${stepNum},'${opt.value}')"
        onkeydown="diagCardKeyDown(event,${stepNum},'${opt.value}')"
        data-option="${opt.value}"
        role="button" tabindex="0" aria-pressed="false">
      <div class="diag-check-tab absolute top-0 right-0 w-10 h-10 bg-[#FF5C00] rounded-bl-xl rounded-tr-xl flex items-center justify-center transition-opacity duration-300" style="opacity:0;">
        <i class="fa-solid fa-check text-white text-xs"></i>
      </div>
      <span class="diag-title">${opt.title}</span>
      <div class="diag-underline transition-colors duration-300"></div>
      <p class="diag-desc">${opt.description}</p>
    </div>
  `;
}

function diagCardKeyDown(event, step, value) {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); diagSelect(step, value); }
}
window.diagCardKeyDown = diagCardKeyDown;

/* ─── STEP RENDERING ────────────────────────────── */
function renderStep(stepNum) {
  const el = document.getElementById('diag-step-' + stepNum);
  if (!el) return;

  let title = '', options = [], gridCols = 'md:grid-cols-3';
  if (stepNum === 1) {
    title = '希望する事業部を選んでください';
    options = diagDivisions;
    gridCols = 'md:grid-cols-3';
  } else if (stepNum === 2) {
    title = '希望する職種タイプを選んでください';
    options = diagRoles[diagState.division] || [];
    gridCols = options.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4';
  }

  el.innerHTML = `
    <div class="diag-step-header text-center mb-12">
      <span class="diag-step-subtitle">あなたに合う募集職種</span>
      <span class="diag-step-number">STEP ${stepNum} / 3</span>
      <h3 class="diag-step-title">${title}</h3>
    </div>
    <div class="grid grid-cols-1 ${gridCols} gap-6 lg:gap-8">
      ${options.map(opt => buildCard(stepNum, opt)).join('')}
    </div>
  `;
}

/* ─── CARD HIGHLIGHT ────────────────────────────── */
function highlightCard(stepNum, value) {
  const el = document.getElementById('diag-step-' + stepNum);
  if (!el) return;
  el.querySelectorAll('.diag-option-card').forEach(card => {
    const sel = card.dataset.option === value;
    card.classList.toggle('border-[#FF5C00]', sel);
    card.classList.toggle('shadow-[0_0_0_3px_rgba(255,92,0,0.15)]', sel);
    card.classList.toggle('border-slate-200', !sel);
    card.setAttribute('aria-pressed', sel ? 'true' : 'false');
    const check = card.querySelector('.diag-check-tab');
    if (check) check.style.opacity = sel ? '1' : '0';
    const title = card.querySelector('.diag-title');
    if (title) title.style.color = sel ? '#FF5C00' : '#1A2B4C';
    const ul = card.querySelector('.diag-underline');
    if (ul) ul.style.backgroundColor = sel ? '#FF5C00' : '#D1D5DB';
  });
}

/* ─── STEP TRANSITION ───────────────────────────── */
function transitionTo(fromNum, toNum, renderFn) {
  const fromEl = document.getElementById('diag-step-' + fromNum);
  const toEl = document.getElementById('diag-step-' + toNum);
  if (!fromEl || !toEl) return;
  fromEl.classList.add('opacity-0');
  setTimeout(() => {
    fromEl.classList.add('hidden');
    if (renderFn) renderFn();
    toEl.classList.remove('hidden');
    setTimeout(() => toEl.classList.remove('opacity-0'), 50);
    diagState.current = toNum;
    updateProgress(toNum);
  }, 300);
}

/* ─── SELECT ─────────────────────────────────────── */
function diagSelect(stepNum, value, advance) {
  if (advance === undefined) advance = true;

  if (stepNum === 1) {
    diagState.division = value;
    diagState.role = null;
  } else if (stepNum === 2) {
    diagState.role = value;
  }
  highlightCard(stepNum, value);

  if (!advance) return;
  clearTimeout(diagAutoAdvanceTimer);
  diagAutoAdvanceTimer = setTimeout(() => {
    if (stepNum === 1) {
      if (value === 'ai_sales') {
        transitionTo(1, 3, () => {
          const toEl = document.getElementById('diag-step-3');
          if (toEl) toEl.innerHTML = buildResult();
        });
        setBackButton(true);
      } else {
        transitionTo(1, 2, () => renderStep(2));
        setBackButton(true);
      }
    } else if (stepNum === 2) {
      transitionTo(2, 3, () => {
        const toEl = document.getElementById('diag-step-3');
        if (toEl) toEl.innerHTML = buildResult();
      });
      setBackButton(true);
    }
  }, 220);
}
window.diagSelect = diagSelect;

/* backward-compat for HTML inline onclick in step-1 static cards */
function selectDiagnosticOption(step, value) { diagSelect(step, value); }
window.selectDiagnosticOption = selectDiagnosticOption;
function handleCardKeyDown(event, step, value) { diagCardKeyDown(event, step, value); }
window.handleCardKeyDown = handleCardKeyDown;

/* ─── RESULT BUILDER ─────────────────────────────── */
function buildResult() {
  const key = diagState.division + '+' + (diagState.role || '');
  const r = diagResults[key];
  if (!r) return '<p style="padding:2rem;color:#666;">結果が見つかりませんでした。もう一度お試しください。</p>';

  const entryUrl = 'entry.html?job=' + encodeURIComponent(r.title);

  return `
    <div class="diag-result-shell" style="display:flex;flex-direction:column;gap:2rem;animation:diagFadeUp 0.5s ease both;">
      <style>@keyframes diagFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}</style>

      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <span style="display:inline-flex;align-items:center;background:#FF5C00;color:#fff;font-family:'Noto Sans JP',sans-serif;font-size:11px;font-weight:800;letter-spacing:0.12em;padding:5px 18px;border-radius:99px;">診断結果</span>
        <span style="display:inline-flex;background:rgba(255,92,0,0.1);border:1px solid rgba(255,92,0,0.25);color:#E65200;font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.12em;padding:4px 12px;border-radius:99px;">${r.division}</span>
      </div>

      <div>
        <h3 class="diag-result-title" style="font-family:'Noto Sans JP',sans-serif;font-size:clamp(1.6rem,4vw,2.5rem);font-weight:900;color:#1A2B4C;letter-spacing:-0.02em;line-height:1.3;margin-bottom:1.25rem;">
          あなたに合うポジションは<span style="color:#FF5C00;">${r.title}</span>です。
        </h3>
        <div style="display:flex;flex-wrap:wrap;gap:16px;">
          <div style="display:flex;align-items:center;gap:8px;font-family:'Noto Sans JP',sans-serif;font-size:13px;color:#555;">
            <i class="fa-solid fa-building" style="color:#FF5C00;font-size:12px;"></i>${r.division}
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-family:'Noto Sans JP',sans-serif;font-size:13px;color:#555;">
            <i class="fa-solid fa-briefcase" style="color:#FF5C00;font-size:12px;"></i>${r.employment}
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-family:'Noto Sans JP',sans-serif;font-size:13px;color:#555;">
            <i class="fa-solid fa-location-dot" style="color:#FF5C00;font-size:12px;"></i>${r.location}
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-family:'Noto Sans JP',sans-serif;font-size:13px;color:#555;">
            <i class="fa-solid fa-yen-sign" style="color:#FF5C00;font-size:12px;"></i>月給25万円＋インセンティブ
          </div>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding-top:0.5rem;">
        <a href="${r.page}"
           style="display:inline-flex;align-items:center;gap:12px;background:linear-gradient(135deg,#FF5C00,#E65200);color:#fff;font-family:'Poppins',sans-serif;font-weight:900;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;padding:1.1rem 2.5rem;border-radius:9999px;text-decoration:none;box-shadow:0 16px 40px rgba(255,92,0,0.35);transition:all 0.25s ease;"
           onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 24px 50px rgba(255,92,0,0.5)'"
           onmouseout="this.style.transform='';this.style.boxShadow='0 16px 40px rgba(255,92,0,0.35)'">
          詳細ページを見る <i class="fa-solid fa-arrow-right-long"></i>
        </a>
        <a href="${entryUrl}"
           style="display:inline-flex;align-items:center;gap:8px;background:#1A2B4C;color:#fff;font-family:'Poppins',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;padding:1rem 2rem;border-radius:9999px;text-decoration:none;transition:background 0.2s;"
           onmouseover="this.style.background='#233660'"
           onmouseout="this.style.background='#1A2B4C'">
          この職種に応募する
        </a>
        <button onclick="resetDiagnostic()"
           style="background:none;border:1.5px solid rgba(0,0,0,0.12);color:#888;font-family:'Poppins',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;padding:1rem 2rem;border-radius:9999px;cursor:pointer;transition:all 0.2s;"
           onmouseover="this.style.borderColor='#FF5C00';this.style.color='#FF5C00'"
           onmouseout="this.style.borderColor='rgba(0,0,0,0.12)';this.style.color='#888'">
          <i class="fa-solid fa-rotate-right" style="margin-right:6px;"></i>もう一度診断する
        </button>
      </div>
    </div>
  `;
}

/* ─── GO BACK ───────────────────────────────────── */
function diagGoBack() {
  if (diagState.current === 2) {
    transitionTo(2, 1, () => renderStep(1));
    diagState.division = null;
    setBackButton(false);
  } else if (diagState.current === 3) {
    const toStep = (diagState.division === 'ai_sales') ? 1 : 2;
    const fromEl = document.getElementById('diag-step-3');
    const toEl = document.getElementById('diag-step-' + toStep);
    if (!fromEl || !toEl) return;
    fromEl.classList.add('opacity-0');
    setTimeout(() => {
      fromEl.innerHTML = '';
      fromEl.classList.add('hidden');
      if (toStep === 1) renderStep(1);
      else renderStep(2);
      toEl.classList.remove('hidden');
      setTimeout(() => toEl.classList.remove('opacity-0'), 50);
      diagState.current = toStep;
      updateProgress(toStep);
      setBackButton(toStep > 1);
    }, 300);
  }
}
window.diagGoBack = diagGoBack;

/* ─── RESET ─────────────────────────────────────── */
function resetDiagnostic() {
  clearTimeout(diagAutoAdvanceTimer);
  diagState.current = 1;
  diagState.division = null;
  diagState.role = null;

  ['diag-step-2', 'diag-step-3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.innerHTML = ''; el.classList.add('hidden', 'opacity-0'); }
  });

  const step1 = document.getElementById('diag-step-1');
  if (step1) {
    step1.classList.add('opacity-0');
    setTimeout(() => {
      renderStep(1);
      step1.classList.remove('hidden');
      setTimeout(() => step1.classList.remove('opacity-0'), 50);
    }, 300);
  }

  updateProgress(1);
  setBackButton(false);
}
window.resetDiagnostic = resetDiagnostic;

/* ─── INIT ──────────────────────────────────────── */
function initDiagnostic() {
  diagState.current = 1;
  diagState.division = null;
  diagState.role = null;
  renderStep(1);
  updateProgress(1);
  setBackButton(false);
  const nextBtn = document.getElementById('diag-next');
  if (nextBtn) nextBtn.style.display = 'none';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDiagnostic);
} else {
  initDiagnostic();
}
