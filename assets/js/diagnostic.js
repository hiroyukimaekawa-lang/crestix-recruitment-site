/**
 * Crestix — Job Diagnosis Engine
 * 現在募集中の職種だけを診断結果に表示する
 */

'use strict';

// STEP 1: Hope Business (希望する事業部)
const diagCategories = [
  {
    value: 'ai',
    title: 'AI Sales Enablement事業部',
    description: 'AIと営業支援の仕組みを活用し、営業組織の成果最大化を支援する事業部です。'
  },
  {
    value: 'division1',
    title: '第一営業部',
    description: '医療機関向けに、マーケティング・集客支援を提供する事業部です。'
  },
  {
    value: 'hd',
    title: 'HD事業部',
    description: '飲食店・地域店舗向けに、DX・集客・運用支援を提供する事業部です。'
  }
];

// STEP 2: Hope Role (希望する役割)
const diagRoles = [
  {
    value: 'is',
    title: 'インサイドセールス（IS）',
    description: '新規顧客へのアプローチや商談機会の創出に関わる役割です。'
  },
  {
    value: 'fs',
    title: 'フィールドセールス（FS）',
    description: '顧客への提案・商談・受注創出に関わる役割です。'
  },
  {
    value: 'cs',
    title: 'カスタマーサクセス（CS）',
    description: '受注後の顧客に伴走し、導入・運用・成果創出を支援する役割です。'
  },
  {
    value: 'marketing',
    title: 'マーケティング / 事業推進',
    description: '集客施策、営業戦略、事業成長の仕組みづくりに関わる役割です。'
  }
];

// STEP 3: Hope Position (希望するポジション)
const diagPositions = [
  {
    value: 'member',
    title: 'メンバーとして成果を出したい',
    description: 'まずはプレイヤーとして現場で成果を出していきたい方に向いています。'
  },
  {
    value: 'leader',
    title: 'リーダー・MG候補として組織づくりに関わりたい',
    description: '成果創出だけでなく、チームづくりやKPI管理にも関わりたい方に向いています。'
  }
];

// Active Job openings matching the user request mapping format
const activeJobs = {
  "ai-sales-mg": {
    title: "【AI Sales Enablement事業部 MG候補】",
    entryUrl: "entry.html?job=ai-sales-mg",
    detailUrl: "job-ai-sales-mg.html",
    division: "AI Sales Enablement事業部",
    description: "営業代行・営業支援事業を推進し、AIを活用した営業組織づくり・マネジメントを担うポジションです。"
  },
  "division1-is": {
    title: "医療向け インサイドセールス（IS）",
    entryUrl: "entry.html?job=division1-is",
    detailUrl: "job-division1-inside-sales.html",
    division: "第一営業部",
    description: "医療機関（クリニック等）向けに、マーケティング・集客支援サービスの新規提案機会を創出するインサイドセールス職です。"
  },
  "division1-fs": {
    title: "医療向け フィールドセールス（FS）",
    entryUrl: "entry.html?job=division1-fs",
    detailUrl: "job-division1-field-sales.html",
    division: "第一営業部",
    description: "医療機関（クリニック等）に対して、マーケティング・集客支援の提案から導入・成果創出までを担う営業職です。"
  },
  "hd-is-leader": {
    title: "HD ISリーダー候補",
    entryUrl: "entry.html?job=hd-is-leader",
    detailUrl: "job-hd-is-leader.html",
    division: "HD事業部",
    description: "飲食店や地域店舗に向けて、DX・集客支援サービスの提案を行うインサイドセールスチームのマネジメント候補ポジションです。"
  },
  "hd-fs-member": {
    title: "HD FSメンバー",
    entryUrl: "entry.html?job=hd-fs-member",
    detailUrl: "job-hd-fs-member.html",
    division: "HD事業部",
    description: "飲食店や地域店舗に対して、集客・ホームページ制作・運用支援などの提案および受注を担う営業職です。"
  },
  "hd-fs-leader": {
    title: "HD FSリーダー候補",
    entryUrl: "entry.html?job=hd-fs-leader",
    detailUrl: "job-hd-fs-leader.html",
    division: "HD事業部",
    description: "飲食店・地域店舗向け営業チームにおいて、プレイヤーとしての成果創出およびチームの数値管理・育成を担うリーダー候補です。"
  },
  "hd-cs-member": {
    title: "HD CSメンバー",
    entryUrl: "entry.html?job=hd-cs-member",
    detailUrl: "job-hd-cs-member.html",
    division: "HD事業部",
    description: "ご契約いただいた飲食店・店舗に伴走し、ホームページ制作や集客サービスの導入・運用支援、成果最大化を担うカスタマーサクセス職です。"
  },
  "hd-cs-leader": {
    title: "HD CSリーダー候補",
    entryUrl: "entry.html?job=hd-cs-leader",
    detailUrl: "job-hd-cs-leader.html",
    division: "HD事業部",
    description: "店舗向けカスタマーサクセスチームにおいて、解約防止やアップセル施策の立案、メンバーの育成およびKPI管理を担うリーダー候補です。"
  }
};

// Diagnosis logic mapping
const diagnosisMap = {
  ai: {
    is: {
      member: { title: "【AI Sales Enablement事業部 MG候補】", job: "ai-sales-mg" },
      leader: { title: "【AI Sales Enablement事業部 MG候補】", job: "ai-sales-mg" }
    },
    fs: {
      member: { title: "【AI Sales Enablement事業部 MG候補】", job: "ai-sales-mg" },
      leader: { title: "【AI Sales Enablement事業部 MG候補】", job: "ai-sales-mg" }
    },
    cs: {
      member: { title: "【AI Sales Enablement事業部 MG候補】", job: "ai-sales-mg" },
      leader: { title: "【AI Sales Enablement事業部 MG候補】", job: "ai-sales-mg" }
    },
    marketing: {
      member: { title: "【AI Sales Enablement事業部 MG候補】", job: "ai-sales-mg" },
      leader: { title: "【AI Sales Enablement事業部 MG候補】", job: "ai-sales-mg" }
    }
  },

  division1: {
    is: {
      member: { title: "医療向け インサイドセールス（IS）", job: "division1-is" },
      leader: { title: "医療向け インサイドセールス（IS）", job: "division1-is" }
    },
    fs: {
      member: { title: "医療向け フィールドセールス（FS）", job: "division1-fs" },
      leader: { title: "医療向け フィールドセールス（FS）", job: "division1-fs" }
    },
    cs: {
      member: { title: "医療向け フィールドセールス（FS）", job: "division1-fs" },
      leader: { title: "医療向け フィールドセールス（FS）", job: "division1-fs" }
    },
    marketing: {
      member: { title: "医療向け フィールドセールス（FS）", job: "division1-fs" },
      leader: { title: "医療向け フィールドセールス（FS）", job: "division1-fs" }
    }
  },

  hd: {
    is: {
      member: { title: "HD FSメンバー", job: "hd-fs-member" },
      leader: { title: "HD ISリーダー候補", job: "hd-is-leader" }
    },
    fs: {
      member: { title: "HD FSメンバー", job: "hd-fs-member" },
      leader: { title: "HD FSリーダー候補", job: "hd-fs-leader" }
    },
    cs: {
      member: { title: "HD CSメンバー", job: "hd-cs-member" },
      leader: { title: "HD CSリーダー候補", job: "hd-cs-leader" }
    },
    marketing: {
      member: { title: "HD FSメンバー", job: "hd-fs-member" },
      leader: { title: "HD FSリーダー候補", job: "hd-fs-leader" }
    }
  }
};

function getDiagnosisResult(business, role, position) {
  const result = diagnosisMap?.[business]?.[role]?.[position];
  if (!result) {
    return {
      title: "【AI Sales Enablement事業部 MG候補】",
      job: "ai-sales-mg"
    };
  }
  return result;
}

const diagState = {
  current: 1,
  business: null,
  role: null,
  position: null
};

let diagAutoAdvanceTimer = null;

function updateProgress(step) {
  const footer = document.getElementById('diag-footer');
  if (footer) footer.classList.toggle('diag-footer--result', step === 4);

  const line = document.getElementById('diag-progress-line');
  if (line) {
    if (step === 1) line.style.width = '0%';
    else if (step === 2) line.style.width = '50%';
    else if (step === 3) line.style.width = '100%';
    else line.style.width = '100%';
  }

  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById('pbar-dot-' + i);
    if (!dot) continue;
    const container = dot.parentElement;
    const spans = container.getElementsByTagName('span');
    const active = i <= step;
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

function buildCard(stepNum, opt, currentValue) {
  const isSelected = currentValue === opt.value;
  const borderClass = isSelected ? 'border-[#FF5C00] shadow-[0_0_0_3px_rgba(255,92,0,0.15)]' : 'border-slate-200';
  const checkOpacity = isSelected ? '1' : '0';
  const titleColor = isSelected ? '#FF5C00' : '#1A2B4C';
  const underlineBg = isSelected ? '#FF5C00' : '#D1D5DB';

  return `
    <div class="diag-option-card relative bg-white rounded-2xl p-9 lg:p-10 min-h-[190px] flex flex-col items-center justify-center text-center border-2 ${borderClass} cursor-pointer transition-all duration-300 hover:shadow-[0_16px_38px_rgba(15,23,42,0.08)]"
        onclick="diagSelect(${stepNum},'${opt.value}')"
        onkeydown="diagCardKeyDown(event,${stepNum},'${opt.value}')"
        data-option="${opt.value}"
        role="button" tabindex="0" aria-pressed="${isSelected ? 'true' : 'false'}">
      <div class="diag-check-tab absolute top-0 right-0 w-10 h-10 bg-[#FF5C00] rounded-bl-xl rounded-tr-xl flex items-center justify-center transition-opacity duration-300" style="opacity:${checkOpacity};">
        <i class="fa-solid fa-check text-white text-xs"></i>
      </div>
      <span class="diag-title" style="color:${titleColor};">${opt.title}</span>
      <div class="diag-underline transition-colors duration-300" style="background-color:${underlineBg};"></div>
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
  if (!el) return;

  let stepTitle = '';
  let stepHelpText = '';
  let options = [];
  let currentValue = null;
  let gridColsClass = 'grid-cols-1 md:grid-cols-3';

  if (stepNum === 1) {
    stepTitle = '希望する事業部';
    stepHelpText = '興味のある事業領域を選択してください。';
    options = diagCategories;
    currentValue = diagState.business;
  } else if (stepNum === 2) {
    stepTitle = '希望する役割';
    stepHelpText = '興味のある業務領域を選択してください。';
    options = diagRoles;
    currentValue = diagState.role;
    gridColsClass = 'grid-cols-1 md:grid-cols-2';
  } else if (stepNum === 3) {
    stepTitle = '希望するポジション';
    stepHelpText = '希望する役割の関わり方を選択してください。';
    options = diagPositions;
    currentValue = diagState.position;
    gridColsClass = 'grid-cols-1 md:grid-cols-2';
  } else {
    return;
  }

  el.innerHTML = `
    <div class="diag-step-header text-center mb-12">
      <span class="diag-step-subtitle">あなたに合う募集職種</span>
      <span class="diag-step-number">STEP ${stepNum} / 3</span>
      <h3 class="diag-step-title">${stepTitle}</h3>
      <p class="diag-step-desc text-gray-500 text-sm mt-3" style="font-family:'Noto Sans JP',sans-serif;font-weight:700;">${stepHelpText}</p>
    </div>
    <div class="grid ${gridColsClass} gap-6 lg:gap-8">
      ${options.map(opt => buildCard(stepNum, opt, currentValue)).join('')}
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

function buildResult() {
  const result = getDiagnosisResult(diagState.business, diagState.role, diagState.position);
  const job = activeJobs[result.job] || activeJobs["ai-sales-mg"];

  return `
    <div class="diag-result-shell" style="display:flex;flex-direction:column;gap:2rem;animation:diagFadeUp 0.5s ease both;">
      <style>@keyframes diagFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}</style>
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;">
        <span style="display:inline-flex;align-items:center;background:#FF5C00;color:#fff;font-family:'Noto Sans JP',sans-serif;font-size:11px;font-weight:800;letter-spacing:0.12em;padding:5px 18px;border-radius:99px;">診断結果</span>
      </div>
      <div style="text-align:center;">
        <h3 class="diag-result-title">あなたにおすすめの職種</h3>
      </div>
      
      <div class="diag-result-division-card">
        <p class="diag-result-division-name">${job.division}</p>
        <p class="diag-result-division-sub">${job.title}</p>
        <p class="diag-result-division-label">${job.description}</p>
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:1.5rem;">
          <a href="${job.entryUrl}" class="diag-result-division-link">この職種に応募する</a>
          <a href="${job.detailUrl}" class="diag-result-division-link" style="background:white;color:#FF5C00;border:2px solid #FF5C00 !important;box-shadow:none;">募集要項を見る</a>
        </div>
      </div>

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

  if (stepNum === 1) {
    diagState.business = value;
    diagState.role = null;
    diagState.position = null;
    highlightCard(stepNum, value);

    if (!advance) return;
    clearTimeout(diagAutoAdvanceTimer);
    diagAutoAdvanceTimer = setTimeout(() => {
      transitionTo(1, 2, () => {
        renderStep(2);
      });
      setBackButton(true);
    }, 220);
  } else if (stepNum === 2) {
    diagState.role = value;
    diagState.position = null;
    highlightCard(stepNum, value);

    if (!advance) return;
    clearTimeout(diagAutoAdvanceTimer);
    diagAutoAdvanceTimer = setTimeout(() => {
      transitionTo(2, 3, () => {
        renderStep(3);
      });
      setBackButton(true);
    }, 220);
  } else if (stepNum === 3) {
    diagState.position = value;
    highlightCard(stepNum, value);

    if (!advance) return;
    clearTimeout(diagAutoAdvanceTimer);
    diagAutoAdvanceTimer = setTimeout(() => {
      transitionTo(3, 4, () => {
        const toEl = document.getElementById('diag-step-4');
        if (toEl) toEl.innerHTML = buildResult();
      });
      setBackButton(true);
    }, 220);
  }
}
window.diagSelect = diagSelect;

function selectDiagnosticOption(step, value) { diagSelect(step, value); }
window.selectDiagnosticOption = selectDiagnosticOption;
function handleCardKeyDown(event, step, value) { diagCardKeyDown(event, step, value); }
window.handleCardKeyDown = handleCardKeyDown;

function diagGoBack() {
  if (diagState.current <= 1) return;

  const fromNum = diagState.current;
  const toNum = diagState.current - 1;

  const fromEl = document.getElementById('diag-step-' + fromNum);
  const toEl = document.getElementById('diag-step-' + toNum);
  if (!fromEl || !toEl) return;

  fromEl.classList.add('opacity-0');
  setTimeout(() => {
    fromEl.classList.add('hidden');
    if (fromNum === 4) {
      const resultEl = document.getElementById('diag-step-4');
      if (resultEl) resultEl.innerHTML = '';
    }
    
    renderStep(toNum);
    toEl.classList.remove('hidden');
    setTimeout(() => toEl.classList.remove('opacity-0'), 50);

    diagState.current = toNum;
    updateProgress(toNum);
    setBackButton(toNum > 1);
  }, 300);
}
window.diagGoBack = diagGoBack;

function resetDiagnostic() {
  clearTimeout(diagAutoAdvanceTimer);
  diagState.current = 1;
  diagState.business = null;
  diagState.role = null;
  diagState.position = null;

  ['diag-step-2', 'diag-step-3', 'diag-step-4'].forEach(id => {
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
  diagState.business = null;
  diagState.role = null;
  diagState.position = null;
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
