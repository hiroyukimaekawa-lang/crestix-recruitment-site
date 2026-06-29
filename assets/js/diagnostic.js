/**
 * Crestix — Job Diagnosis Engine
 * 現在募集中の職種だけを診断結果に表示する
 */

'use strict';

const diagCategories = [
  {
    value: 'sales',
    label: 'business',
    title: '営業・事業職',
    description: '顧客と向き合い、事業成長を前線から支える職種です。'
  },
  {
    value: 'product',
    label: 'product',
    title: 'プロダクト開発職',
    description: 'サービスや仕組みをつくり、価値を形にする職種です。'
  },
  {
    value: 'corporate',
    label: 'corporate',
    title: 'コーポレート職',
    description: '組織運営を支え、会社の成長基盤をつくる職種です。'
  }
];

const activeJobOpenings = [
  {
    id: 'ai-sales-mg',
    category: 'business',
    title: 'AI Sales Enablement事業部 MG候補',
    division: 'AI Sales Enablement',
    description: '営業代行・営業支援事業を推進し、AIを活用した営業組織づくりを担うポジションです。',
    url: 'jobs.html#ai-sales-mg'
  },
  {
    id: 'hd-is',
    category: 'business',
    division: 'HD事業部',
    title: 'HD ISメンバー',
    description: '地域店舗に向けて、HP制作や集客支援などの提案機会を創出するインサイドセールス職です。',
    url: 'job-hd-inside-sales.html'
  }
];

const diagState = {
  current: 1,
  category: null
};

let diagAutoAdvanceTimer = null;

function updateProgress(step) {
  const footer = document.getElementById('diag-footer');
  if (footer) footer.classList.toggle('diag-footer--result', step === 3);

  const line = document.getElementById('diag-progress-line');
  if (line) {
    line.style.width = step === 1 ? '0%' : '100%';
  }

  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById('pbar-dot-' + i);
    if (!dot) continue;
    const container = dot.parentElement;
    const spans = container.getElementsByTagName('span');
    const active = i === 1 || step === 3;
    dot.style.borderColor = active ? '#FF5C00' : '#D1D5DB';
    dot.style.backgroundColor = active ? '#FF5C00' : 'white';
    for (const span of spans) span.style.color = active ? '#FF5C00' : '#9CA3AF';
  }
}

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
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    diagSelect(step, value);
  }
}
window.diagCardKeyDown = diagCardKeyDown;

function renderStep(stepNum) {
  const el = document.getElementById('diag-step-' + stepNum);
  if (!el || stepNum !== 1) return;

  el.innerHTML = `
    <div class="diag-step-header text-center mb-12">
      <span class="diag-step-subtitle">あなたに合う募集職種</span>
      <span class="diag-step-number">STEP 1 / 3</span>
      <h3 class="diag-step-title">希望する職種カテゴリ</h3>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      ${diagCategories.map(opt => buildCard(1, opt)).join('')}
    </div>
  `;
}

function highlightCard(stepNum, value) {
  const el = document.getElementById('diag-step-' + stepNum);
  if (!el) return;
  el.querySelectorAll('.diag-option-card').forEach(card => {
    const selected = card.dataset.option === value;
    card.classList.toggle('border-[#FF5C00]', selected);
    card.classList.toggle('shadow-[0_0_0_3px_rgba(255,92,0,0.15)]', selected);
    card.classList.toggle('border-slate-200', !selected);
    card.setAttribute('aria-pressed', selected ? 'true' : 'false');
    const check = card.querySelector('.diag-check-tab');
    if (check) check.style.opacity = selected ? '1' : '0';
    const title = card.querySelector('.diag-title');
    if (title) title.style.color = selected ? '#FF5C00' : '#1A2B4C';
    const underline = card.querySelector('.diag-underline');
    if (underline) underline.style.backgroundColor = selected ? '#FF5C00' : '#D1D5DB';
  });
}

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

function selectedCategoryLabel() {
  const category = diagCategories.find(item => item.value === diagState.category);
  return category ? category.label : '';
}

function buildResultCard(job) {
  return `
    <div class="diag-result-division-card">
      <p class="diag-result-division-name">${job.division}</p>
      <p class="diag-result-division-sub">${job.title}</p>
      <p class="diag-result-division-label">${job.description}</p>
      <a href="${job.url}" class="diag-result-division-link">募集要項を見る</a>
    </div>
  `;
}

function buildEmptyResult() {
  return `
    <div class="diag-result-empty" style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1rem 0 0;">
      <h3 class="diag-result-title">現在、この条件に該当する募集職種はありません。</h3>
      <p class="diag-result-lead">募集再開時には、こちらのページでお知らせいたします。</p>
      <a href="jobs.html" class="diag-result-division-link">募集職種一覧を見る</a>
    </div>
  `;
}

function buildResult() {
  const matchedJobs = activeJobOpenings.filter(job => job.category === selectedCategoryLabel());

  return `
    <div class="diag-result-shell" style="display:flex;flex-direction:column;gap:2rem;animation:diagFadeUp 0.5s ease both;">
      <style>@keyframes diagFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}</style>
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;">
        <span style="display:inline-flex;align-items:center;background:#FF5C00;color:#fff;font-family:'Noto Sans JP',sans-serif;font-size:11px;font-weight:800;letter-spacing:0.12em;padding:5px 18px;border-radius:99px;">診断結果</span>
      </div>
      ${matchedJobs.length ? `
        <div style="text-align:center;">
          <h3 class="diag-result-title">あなたにおすすめの職種</h3>
        </div>
        ${matchedJobs.map(buildResultCard).join('')}
      ` : buildEmptyResult()}
      <div style="display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;padding-top:0.5rem;">
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

function diagSelect(stepNum, value, advance) {
  if (advance === undefined) advance = true;
  if (stepNum !== 1) return;

  diagState.category = value;
  highlightCard(stepNum, value);

  if (!advance) return;
  clearTimeout(diagAutoAdvanceTimer);
  diagAutoAdvanceTimer = setTimeout(() => {
    transitionTo(1, 3, () => {
      const toEl = document.getElementById('diag-step-3');
      if (toEl) toEl.innerHTML = buildResult();
    });
    setBackButton(true);
  }, 220);
}
window.diagSelect = diagSelect;

function selectDiagnosticOption(step, value) { diagSelect(step, value); }
window.selectDiagnosticOption = selectDiagnosticOption;
function handleCardKeyDown(event, step, value) { diagCardKeyDown(event, step, value); }
window.handleCardKeyDown = handleCardKeyDown;

function diagGoBack() {
  if (diagState.current !== 3) return;
  const fromEl = document.getElementById('diag-step-3');
  const toEl = document.getElementById('diag-step-1');
  if (!fromEl || !toEl) return;
  fromEl.classList.add('opacity-0');
  setTimeout(() => {
    fromEl.innerHTML = '';
    fromEl.classList.add('hidden');
    renderStep(1);
    toEl.classList.remove('hidden');
    setTimeout(() => toEl.classList.remove('opacity-0'), 50);
    diagState.current = 1;
    diagState.category = null;
    updateProgress(1);
    setBackButton(false);
  }, 300);
}
window.diagGoBack = diagGoBack;

function resetDiagnostic() {
  clearTimeout(diagAutoAdvanceTimer);
  diagState.current = 1;
  diagState.category = null;

  ['diag-step-2', 'diag-step-3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = '';
      el.classList.add('hidden', 'opacity-0');
    }
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

function initDiagnostic() {
  diagState.current = 1;
  diagState.category = null;
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
