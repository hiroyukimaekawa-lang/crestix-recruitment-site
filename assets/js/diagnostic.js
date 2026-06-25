/**
 * Crestix — Job Diagnosis Engine  v3.0
 * ─────────────────────────────────────
 * 4ステップ診断 → 結果表示 (動的生成) → 各事業部ページへ遷移
 */

'use strict';

/* ─────────────────────────────────────────────
   DATA STRUCTURES
   ───────────────────────────────────────────── */
const jobCategories = [
  {
    value: "sales",
    shortLabel: "営業・事業職",
    title: "営業・事業職",
    description: "顧客と向き合い、事業成長を前線から支える職種です。"
  },
  {
    value: "product",
    shortLabel: "プロダクト開発職",
    title: "プロダクト開発職",
    description: "サービスや仕組みをつくり、価値を形にする職種です。",
    labelSize: "small"
  },
  {
    value: "corporate",
    shortLabel: "コーポレート職",
    title: "コーポレート職",
    description: "組織運営を支え、会社の成長基盤をつくる職種です。"
  }
];

const jobRoles = {
  sales: [
    {
      value: "is",
      shortLabel: "インサイドセールス",
      title: "インサイドセールス",
      description: "見込み顧客に価値を届け、商談を創出する"
    },
    {
      value: "fs",
      shortLabel: "フィールドセールス",
      title: "フィールドセールス",
      description: "顧客の課題を深く捉え、最適な提案を実行する"
    },
    {
      value: "marketing",
      shortLabel: "マーケティング",
      title: "マーケティング",
      description: "認知拡大やリード獲得に向けて、施策を企画・実行する"
    },
    {
      value: "bizdev",
      shortLabel: "事業開発",
      title: "事業開発",
      description: "新規事業や提携を推進し、事業成長の機会をつくる",
      labelSize: "small"
    },
    {
      value: "sales_ops",
      shortLabel: "営業企画",
      title: "営業企画",
      description: "営業戦略や数値管理を通じて、組織の成果最大化を支える",
      labelSize: "small"
    }
  ],
  product: [
    {
      value: "engineer",
      shortLabel: "エンジニア",
      title: "エンジニア",
      description: "サービスや社内システムの設計・開発・改善を担う"
    },
    {
      value: "pdm",
      shortLabel: "プロダクトマネージャー",
      title: "プロダクトマネージャー",
      description: "ユーザー課題と事業成長をつなぎ、プロダクトの方向性を設計する"
    },
    {
      value: "designer",
      shortLabel: "デザイナー",
      title: "デザイナー",
      description: "使いやすく、伝わりやすい体験や画面を設計する",
      labelSize: "small"
    },
    {
      value: "data",
      shortLabel: "データ分析",
      title: "データ分析",
      description: "数値や行動データを分析し、意思決定や改善策につなげる"
    }
  ],
  corporate: [
    {
      value: "hr",
      shortLabel: "人事・採用",
      title: "人事・採用",
      description: "採用活動や組織づくりを通じて、会社の成長を支える"
    },
    {
      value: "finance",
      shortLabel: "経理・財務",
      title: "経理・財務",
      description: "会社のお金の流れを管理し、健全な経営基盤を支える",
      labelSize: "small"
    },
    {
      value: "legal",
      shortLabel: "法務",
      title: "法務",
      description: "契約や社内ルールの整備を通じて、事業運営を支える"
    },
    {
      value: "pr",
      shortLabel: "広報",
      title: "広報",
      description: "会社の魅力や取り組みを社外に発信し、ブランド形成を担う"
    },
    {
      value: "planning",
      shortLabel: "経営企画",
      title: "経営企画",
      description: "経営戦略や事業計画の策定を通じて、会社全体の成長を支える",
      labelSize: "small"
    }
  ]
};

const careerStages = [
  {
    value: "new",
    shortLabel: "新卒・第二新卒",
    title: "新卒・第二新卒",
    description: "新しい分野に挑戦し、基礎からスキルを身につけて成長する"
  },
  {
    value: "middle",
    shortLabel: "若手・中堅",
    title: "若手・中堅",
    description: "これまでの経験を活かし、チームの主戦力として活躍の幅を広げる",
    labelSize: "small"
  },
  {
    value: "senior",
    shortLabel: "シニア・リーダー",
    title: "シニア・リーダー",
    description: "培った専門性とリーダーシップで、組織の成長を牽引する",
    labelSize: "small"
  }
];

/* ─────────────────────────────────────────────
   STATE
   ───────────────────────────────────────────── */
const diagState = {
  current: 1,
  answers: {},
};

const diagSelected = {};
let diagAutoAdvanceTimer = null;

/* ─────────────────────────────────────────────
   INIT
   ───────────────────────────────────────────── */
function initDiagnostic() {
  diagState.current = 1;
  diagState.answers = {};
  for (let key in diagSelected) {
    delete diagSelected[key];
  }
  renderStepNew(1);
  updateProgressBarNew(1);

  const backBtn = document.getElementById('diag-back');
  if (backBtn) {
    backBtn.style.display = 'none';
    backBtn.style.opacity = '0.4';
    backBtn.style.pointerEvents = 'none';
    backBtn.style.cursor = 'default';
  }

  const nextBtn = document.getElementById('diag-next');
  if (nextBtn) {
    nextBtn.style.display = 'none';
  }
}

/* ─────────────────────────────────────────────
   CARD OPTIONS HELPERS
   ───────────────────────────────────────────── */
function buildCardHTML(stepNum, opt) {
  const isSelected = diagSelected['step' + stepNum] === opt.value;
  const borderStyle = isSelected ? 'border-[#FF5C00] shadow-[0_0_0_3px_rgba(255,92,0,0.15)]' : 'border-slate-200';
  const checkOpacity = isSelected ? '1' : '0';
  const titleColor = isSelected ? '#FF5C00' : '#1A2B4C';
  const underlineBg = isSelected ? '#FF5C00' : '#D1D5DB';

  return `
    <div class="diag-option-card relative bg-white rounded-2xl p-9 lg:p-10 min-h-[190px] flex flex-col items-center justify-center text-center border-2 ${borderStyle} cursor-pointer transition-all duration-300 hover:shadow-[0_16px_38px_rgba(15,23,42,0.08)]"
        onclick="selectDiagnosticOption(${stepNum},'${opt.value}')"
        onkeydown="handleCardKeyDown(event, ${stepNum},'${opt.value}')"
        data-option="${opt.value}"
        role="button"
        tabindex="0"
        aria-pressed="${isSelected}">
        <!-- 選択時チェックタブ（右上） -->
        <div class="diag-check-tab absolute top-0 right-0 w-10 h-10 bg-[#FF5C00] rounded-bl-xl rounded-tr-xl flex items-center justify-center transition-opacity duration-300" style="opacity:${checkOpacity};">
            <i class="fa-solid fa-check text-white text-xs"></i>
        </div>
        <!-- 日本語タイトル -->
        <span class="diag-title" style="color:${titleColor};">${opt.title}</span>
        <!-- 下線 -->
        <div class="diag-underline transition-colors duration-300" style="background-color:${underlineBg};"></div>
        <!-- 説明テキスト -->
        <p class="diag-desc">
            ${opt.description}
        </p>
    </div>
  `;
}

function handleCardKeyDown(event, step, value) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    selectDiagnosticOption(step, value);
  }
}
window.handleCardKeyDown = handleCardKeyDown;

/* ─────────────────────────────────────────────
   STEP RENDERING
   ───────────────────────────────────────────── */
function renderStepNew(stepNum) {
  const stepEl = document.getElementById('diag-step-' + stepNum);
  if (!stepEl) return;

  let stepMainTitle = '';
  if (stepNum === 1) {
    stepMainTitle = '希望する職種カテゴリ';
  } else if (stepNum === 2) {
    stepMainTitle = '希望職種を選択してください';
  } else if (stepNum === 3) {
    stepMainTitle = '希望するキャリアステージ';
  }

  const selectedCategory = diagSelected['step1'];
  let options = [];
  if (stepNum === 1) {
    options = jobCategories;
  } else if (stepNum === 2) {
    options = jobRoles[selectedCategory] || [];
  } else if (stepNum === 3) {
    options = careerStages;
  }

  stepEl.innerHTML = `
    <!-- ステップヘッダー（中央） -->
    <div class="diag-step-header text-center mb-12">
        <!-- 1. 小見出し -->
        <span class="diag-step-subtitle">
            あなたに合う募集職種
        </span>
        <!-- 2. Step表示 -->
        <span class="diag-step-number">
            STEP ${stepNum} / 4
        </span>
        <!-- 3. メイン見出し -->
        <h3 class="diag-step-title">
            ${stepMainTitle}
        </h3>
    </div>

    <!-- 選択カード -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        ${options.map(opt => buildCardHTML(stepNum, opt)).join('')}
    </div>
  `;
}

/* ─────────────────────────────────────────────
   PROGRESS BAR UPDATING
   ───────────────────────────────────────────── */
function updateProgressBarNew(step) {
  const footer = document.getElementById('diag-footer');
  if (footer) {
    footer.classList.toggle('diag-footer--result', step === 4);
  }

  const progressLine = document.getElementById('diag-progress-line');
  if (progressLine) {
    if (step === 1) progressLine.style.width = '0%';
    else if (step === 2) progressLine.style.width = '33.33%';
    else if (step === 3) progressLine.style.width = '66.66%';
    else if (step === 4) progressLine.style.width = '100%';
  }

  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById('pbar-dot-' + i);
    const container = dot ? dot.parentElement : null;
    if (!dot || !container) continue;

    const spans = container.getElementsByTagName('span');

    if (i <= step) {
      dot.style.borderColor = '#FF5C00';
      dot.style.backgroundColor = '#FF5C00';
      for (let span of spans) {
        span.style.color = '#FF5C00';
      }
    } else {
      dot.style.borderColor = '#D1D5DB';
      dot.style.backgroundColor = 'white';
      for (let span of spans) {
        span.style.color = '#9CA3AF';
      }
    }
  }
}

/* ─────────────────────────────────────────────
   STEP SWITCHING AND ANIMATION
   ───────────────────────────────────────────── */
function switchDiagStep(fromStep, toStep) {
  const fromEl = document.getElementById('diag-step-' + fromStep);
  const toEl = document.getElementById('diag-step-' + toStep);
  if (!fromEl || !toEl) return;

  fromEl.classList.add('opacity-0');
  setTimeout(() => {
    fromEl.classList.add('hidden');

    renderStepNew(toStep);

    if (diagSelected['step' + toStep]) {
      selectDiagnosticOption(toStep, diagSelected['step' + toStep], false);
    }

    toEl.classList.remove('hidden');
    setTimeout(() => {
      toEl.classList.remove('opacity-0');
    }, 50);

    diagState.current = toStep;
    updateProgressBarNew(toStep);

    // Back button state
    const backBtn = document.getElementById('diag-back');
    if (backBtn) {
      if (toStep > 1) {
        backBtn.style.display = 'flex';
        backBtn.style.opacity = '1';
        backBtn.style.pointerEvents = 'auto';
        backBtn.style.cursor = 'pointer';
      } else {
        backBtn.style.display = 'none';
      }
    }

    // Card click advances the diagnosis; the manual next button is intentionally hidden.
    const nextBtn = document.getElementById('diag-next');
    if (nextBtn) {
      nextBtn.style.display = 'none';
    }
  }, 300);
}

/* ─────────────────────────────────────────────
   CARD SELECTION INTERACTION
   ───────────────────────────────────────────── */
function selectDiagnosticOption(step, option, advance = true) {
  if (step === 1) {
    if (diagSelected['step1'] !== option) {
      delete diagSelected['step2'];
      delete diagSelected['step3'];
      
      const step2El = document.getElementById('diag-step-2');
      const step3El = document.getElementById('diag-step-3');
      const step4El = document.getElementById('diag-step-4');
      if (step2El) {
        step2El.innerHTML = '';
        step2El.classList.add('hidden', 'opacity-0');
      }
      if (step3El) {
        step3El.innerHTML = '';
        step3El.classList.add('hidden', 'opacity-0');
      }
      if (step4El) {
        step4El.innerHTML = '';
        step4El.classList.add('hidden', 'opacity-0');
      }

      const btnContainer = document.getElementById('diag-btn-container');
      if (btnContainer) {
        btnContainer.style.display = 'flex';
      }
      const footerEl = document.getElementById('diag-footer');
      if (footerEl) {
        footerEl.classList.remove('hidden');
      }

      updateProgressBarNew(1);
    }
  }

  diagSelected['step' + step] = option;

  const stepEl = document.getElementById('diag-step-' + step);
  if (!stepEl) return;

  stepEl.querySelectorAll('.diag-option-card').forEach(card => {
    card.classList.remove('border-[#FF5C00]', 'shadow-[0_0_0_3px_rgba(255,92,0,0.15)]');
    card.classList.add('border-slate-200');
    card.setAttribute('aria-pressed', 'false');

    const check = card.querySelector('.diag-check-tab');
    if (check) check.style.opacity = '0';

    const title = card.querySelector('.diag-title');
    if (title) title.style.color = '#1A2B4C';

    const underline = card.querySelector('.diag-underline');
    if (underline) underline.style.backgroundColor = '#D1D5DB';
  });

  const selected = stepEl.querySelector(`[data-option="${option}"]`);
  if (!selected) return;

  selected.classList.remove('border-gray-200', 'border-slate-200');
  selected.classList.add('border-[#FF5C00]', 'shadow-[0_0_0_3px_rgba(255,92,0,0.15)]');
  selected.setAttribute('aria-pressed', 'true');

  const check = selected.querySelector('.diag-check-tab');
  if (check) check.style.opacity = '1';

  const title = selected.querySelector('.diag-title');
  if (title) title.style.color = '#FF5C00';

  const underline = selected.querySelector('.diag-underline');
  if (underline) underline.style.backgroundColor = '#FF5C00';

  diagState.answers[step] = option;

  if (advance) {
    window.clearTimeout(diagAutoAdvanceTimer);
    diagAutoAdvanceTimer = window.setTimeout(() => {
      if (step < 3) {
        switchDiagStep(step, step + 1);
      } else {
        showDiagResultNew();
      }
    }, 220);
  }
}
window.selectDiagnosticOption = selectDiagnosticOption;

/* ─────────────────────────────────────────────
   NAVIGATION ACTIONS
   ───────────────────────────────────────────── */
function diagGoNext() {
  const currentStep = diagState.current;
  if (currentStep >= 4) return;

  if (!diagSelected['step' + currentStep]) {
    alert('選択肢を1つ選んでください。');
    return;
  }

  diagState.answers[currentStep] = diagSelected['step' + currentStep];

  if (currentStep < 3) {
    switchDiagStep(currentStep, currentStep + 1);
  } else {
    showDiagResultNew();
  }
}
window.diagGoNext = diagGoNext;

function diagGoBack() {
  const currentStep = diagState.current;
  if (currentStep <= 1) return;

  switchDiagStep(currentStep, currentStep - 1);
}
window.diagGoBack = diagGoBack;

function resetDiagnostic() {
  diagState.answers = {};
  diagState.current = 1;
  window.clearTimeout(diagAutoAdvanceTimer);
  for (let key in diagSelected) {
    delete diagSelected[key];
  }

  const step1El = document.getElementById('diag-step-1');
  const step2El = document.getElementById('diag-step-2');
  const step3El = document.getElementById('diag-step-3');
  const step4El = document.getElementById('diag-step-4');
  const footerEl = document.getElementById('diag-footer');
  const btnContainer = document.getElementById('diag-btn-container');

  if (step4El) {
    step4El.classList.add('opacity-0');
  }

  setTimeout(() => {
    if (step4El) {
      step4El.innerHTML = '';
      step4El.classList.add('hidden');
    }
    if (step2El) {
      step2El.innerHTML = '';
      step2El.classList.add('hidden', 'opacity-0');
    }
    if (step3El) {
      step3El.innerHTML = '';
      step3El.classList.add('hidden', 'opacity-0');
    }

    if (step1El) {
      renderStepNew(1);
      step1El.querySelectorAll('.diag-option-card').forEach(card => {
        card.classList.remove('border-[#FF5C00]', 'shadow-[0_0_0_3px_rgba(255,92,0,0.15)]');
        card.classList.add('border-slate-200');
        card.setAttribute('aria-pressed', 'false');

        const check = card.querySelector('.diag-check-tab');
        if (check) check.style.opacity = '0';

        const title = card.querySelector('.diag-title');
        if (title) title.style.color = '#1A2B4C';

        const underline = card.querySelector('.diag-underline');
        if (underline) underline.style.backgroundColor = '#D1D5DB';
      });

      step1El.classList.remove('hidden');
      setTimeout(() => {
        step1El.classList.remove('opacity-0');
      }, 50);
    }

    if (footerEl) {
      footerEl.classList.remove('hidden');
    }
    if (btnContainer) {
      btnContainer.style.display = 'flex';
    }

    const backBtn = document.getElementById('diag-back');
    if (backBtn) {
      backBtn.style.display = 'none';
      backBtn.style.opacity = '0.4';
      backBtn.style.pointerEvents = 'none';
      backBtn.style.cursor = 'default';
    }

    const nextBtn = document.getElementById('diag-next');
    if (nextBtn) {
      nextBtn.style.display = 'none';
    }

    updateProgressBarNew(1);
  }, 300);
}
window.resetDiagnostic = resetDiagnostic;

/* ─────────────────────────────────────────────
   DYNAMIC DIVISION & ROUTING RESOLVER
   ───────────────────────────────────────────── */
function resolveDivisionAndRouting(category, roleVal, stageVal) {
  let divName = '';
  let divSub = '';
  let page = 'jobs.html';
  let anchor = '';
  let color = '#FF5C00';
  let bg = '#fff3ed';
  let divisionLabel = '';

  if (category === 'sales') {
    if (['is', 'fs'].includes(roleVal)) {
      if (stageVal === 'new') {
        divName = '第一営業部';
        divSub = '医療機関向けマーケティング事業';
        page = 'service-division1.html';
        anchor = `jobs-${roleVal}`;
        divisionLabel = '第一営業部 / メンバー';
      } else {
        divName = 'HD事業部';
        divSub = '飲食店向けホームページ制作・集客支援';
        page = 'service-hd.html';
        const roleLabel = roleVal === 'is' ? 'インサイドセールス' : 'フィールドセールス';
        const posSuffix = stageVal === 'senior' ? 'リーダー候補' : 'メンバー';
        divisionLabel = `HD事業部 / ${roleLabel} ${posSuffix}`;
        anchor = roleVal === 'is' ? 'jobs-is-leader' : `jobs-${roleVal}` + (stageVal === 'senior' ? '-leader' : '');
        color = '#2563eb';
        bg = '#eff6ff';
      }
    } else {
      // marketing, bizdev, sales_ops
      divName = '営業・事業領域';
      divSub = '店舗グロースおよび事業企画推進';
      page = 'business.html';
      divisionLabel = '営業・事業領域のポジション';
    }
  } else if (category === 'product') {
    divName = 'プロダクト開発領域';
    divSub = '自社サービス・社内システムの開発・UIデザイン';
    page = 'business.html';
    color = '#059669';
    bg = '#ecfdf5';
    divisionLabel = 'プロダクト開発領域 of ポジション';
  } else if (category === 'corporate') {
    divName = 'コーポレート領域';
    divSub = '人事・財務・法務・広報・経営企画';
    page = 'corporate.html';
    color = '#1A2B4C';
    bg = '#f3f4f6';
    divisionLabel = 'コーポレート領域 of ポジション';
  }

  return { divName, divSub, page, anchor, color, bg, divisionLabel };
}

/* ─────────────────────────────────────────────
   RESULT SCREEN BUILDER
   ───────────────────────────────────────────── */
function showDiagResultNew() {
  const catVal = diagState.answers[1];
  const roleVal = diagState.answers[2];
  const stageVal = diagState.answers[3];

  const category = jobCategories.find(c => c.value === catVal);
  const role = jobRoles[catVal].find(r => r.value === roleVal);
  const stage = careerStages.find(s => s.value === stageVal);

  if (!category || !role || !stage) return;

  const step3El = document.getElementById('diag-step-3');
  const step4El = document.getElementById('diag-step-4');
  const btnContainer = document.getElementById('diag-btn-container');
  const backBtn = document.getElementById('diag-back');
  const nextBtn = document.getElementById('diag-next');

  if (!step3El || !step4El) return;

  step3El.classList.add('opacity-0');

  setTimeout(() => {
    step3El.classList.add('hidden');

    step4El.innerHTML = buildResultHTML(category, role, stage);

    step4El.classList.remove('hidden');
    setTimeout(() => {
      step4El.classList.remove('opacity-0');
    }, 50);

    diagState.current = 4;
    updateProgressBarNew(4);

    if (btnContainer) {
      btnContainer.style.display = 'flex';
    }
    if (backBtn) {
      backBtn.style.display = 'flex';
      backBtn.style.opacity = '1';
      backBtn.style.pointerEvents = 'auto';
      backBtn.style.cursor = 'pointer';
    }
    if (nextBtn) {
      nextBtn.style.display = 'none';
    }
  }, 300);
}

function buildResultHTML(category, role, stage) {
  const { divName, divSub, page, anchor, color, bg, divisionLabel } = resolveDivisionAndRouting(category.value, role.value, stage.value);

  const params = new URLSearchParams({
    role: role.value,
    stage: stage.value
  });
  const jobsURL = `jobs.html?${params.toString()}`;
  const serviceURL = anchor ? `${page}#${anchor}` : page;

  const answerChips = [
    `<span style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,92,0,0.1);border:1px solid rgba(255,92,0,0.25);color:#E65200;font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.12em;padding:4px 12px;border-radius:99px;">${category.shortLabel}</span>`,
    `<span style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,92,0,0.1);border:1px solid rgba(255,92,0,0.25);color:#E65200;font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.12em;padding:4px 12px;border-radius:99px;">${role.shortLabel}</span>`,
    `<span style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,92,0,0.1);border:1px solid rgba(255,92,0,0.25);color:#E65200;font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.12em;padding:4px 12px;border-radius:99px;">${stage.shortLabel}</span>`
  ].join('');

  return `
    <div class="diag-result-shell" style="display:flex;flex-direction:column;gap:2rem;animation:diagFadeUp 0.5s ease both;">
      <style>
        @keyframes diagFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      </style>

      <!-- Match badge + answer chips -->
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <span style="display:inline-flex;align-items:center;gap:8px;background:#FF5C00;color:#fff;font-family:'Noto Sans JP',sans-serif;font-size:11px;font-weight:800;letter-spacing:0.12em;padding:5px 18px;border-radius:99px;">
          診断結果
        </span>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">${answerChips}</div>
      </div>

      <!-- Title + description -->
      <div>
        <h3 class="diag-result-title" style="font-family:'Noto Sans JP',sans-serif;font-size:clamp(1.6rem,4vw,2.5rem);font-weight:900;color:#1A2B4C;letter-spacing:-0.02em;line-height:1.3;margin-bottom:1rem;">
          あなたに合うポジションは<br>
          <span class="diag-result-position" style="color:#FF5C00;">${role.title}</span> です。
        </h3>
        <p class="diag-result-lead" style="font-family:'Noto Sans JP',sans-serif;font-size:0.95rem;color:#555;line-height:1.9;font-weight:500;border-left:3px solid #FF5C00;padding-left:1.25rem;max-width:640px;">
          ${stage.title}として、${role.description}ポジションです。
        </p>
      </div>

      <!-- ★ Division card ★ -->
      <div style="
        background:${bg};
        border:1.5px solid ${color}30;
        border-radius:16px;
        padding:1.5rem 1.75rem;
        display:flex;
        align-items:center;
        justify-content:space-between;
        flex-wrap:wrap;
        gap:1rem;
      ">
        <div style="min-width:0;">
          <p style="font-family:'Poppins',sans-serif;font-size:11px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:${color};margin-bottom:3px;">${divName}</p>
          <p style="font-family:'Noto Sans JP',sans-serif;font-size:13px;font-weight:700;color:#333;">${divSub}</p>
          <p style="font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;color:#888;margin-top:3px;letter-spacing:0.1em;">${divisionLabel}</p>
        </div>
        <a href="${serviceURL}"
           style="
             display:inline-flex;align-items:center;gap:8px;
             background:${color};color:#fff;
             font-family:'Poppins',sans-serif;font-size:10px;font-weight:800;
             letter-spacing:0.25em;text-transform:uppercase;
             padding:0.75rem 1.75rem;border-radius:9999px;
             text-decoration:none;
             box-shadow:0 8px 24px ${color}40;
             transition:all 0.2s ease;white-space:nowrap;
           "
           onmouseover="this.style.transform='translateY(-2px)';this.style.opacity='0.9'"
           onmouseout="this.style.transform='';this.style.opacity='1'">
          詳細を見る <i class="fa-solid fa-arrow-right" style="font-size:9px;"></i>
        </a>
      </div>

      <!-- CTA row -->
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding-top:0.25rem;">
        <a href="${jobsURL}"
           style="
             display:inline-flex;align-items:center;gap:12px;
             background:linear-gradient(135deg,#FF5C00,#E65200);color:#fff;
             font-family:'Poppins',sans-serif;font-weight:900;font-size:11px;
             letter-spacing:0.35em;text-transform:uppercase;
             padding:1.1rem 2.5rem;border-radius:9999px;text-decoration:none;
             box-shadow:0 16px 40px rgba(255,92,0,0.35);
             transition:all 0.25s ease;
           "
           onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 24px 50px rgba(255,92,0,0.5)'"
           onmouseout="this.style.transform='';this.style.boxShadow='0 16px 40px rgba(255,92,0,0.35)'">
          募集要項を見る
          <i class="fa-solid fa-arrow-right-long"></i>
        </a>
        <a href="entry.html"
           style="
             display:inline-flex;align-items:center;gap:8px;
             border:1.5px solid rgba(0,0,0,0.12);color:#888;
             font-family:'Poppins',sans-serif;font-size:11px;font-weight:700;
             letter-spacing:0.25em;text-transform:uppercase;
             padding:1rem 2rem;border-radius:9999px;text-decoration:none;
             transition:all 0.2s;
           "
           onmouseover="this.style.borderColor='#1A2B4C';this.style.color='#1A2B4C'"
           onmouseout="this.style.borderColor='rgba(0,0,0,0.12)';this.style.color='#888'">
          採用について問い合わせる
        </a>
        <button onclick="resetDiagnostic()"
           style="background:none;border:1.5px solid rgba(0,0,0,0.12);color:#888;font-family:'Poppins',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;padding:1rem 2rem;border-radius:9999px;cursor:pointer;transition:all 0.2s;"
           onmouseover="this.style.borderColor='#FF5C00';this.style.color='#FF5C00'"
           onmouseout="this.style.borderColor='rgba(0,0,0,0.12)';this.style.color='#888'">
          <i class="fa-solid fa-rotate-right" style="margin-right:6px;"></i>最初からやり直す
        </button>
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────
   BOOT
   ───────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDiagnostic);
} else {
  initDiagnostic();
}
