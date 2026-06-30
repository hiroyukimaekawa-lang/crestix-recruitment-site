/**
 * Crestix — Job Diagnosis Engine
 * 表示デザインは維持し、質問テキストと判定ロジックだけを管理する
 */

'use strict';

// STEP 1: Burning Moment
const diagCategories = [
  {
    value: 'q1_is',
    title: '新しい顧客に切り込み、<br>突破口をつくりたい',
    description: '新規開拓に燃える'
  },
  {
    value: 'q1_fs',
    title: '顧客の課題を見抜き、<br>商談で勝ち切りたい',
    description: '提案で勝ち切る'
  },
  {
    value: 'q1_cs',
    title: '顧客に伴走し、<br>成果まで向き合いたい',
    description: '成果まで伴走する'
  }
];

// STEP 2: Challenge Area
const diagRoles = [
  {
    value: 'q2_hd',
    title: '地域店舗・ローカル事業の<br>成長を支えたい',
    description: '店舗の成長を支える'
  },
  {
    value: 'q2_first',
    title: 'クリニック・医療領域の<br>成長を支えたい',
    description: '医療領域を支える'
  },
  {
    value: 'q2_ai',
    title: 'AIを活用して、<br>営業組織を変えたい',
    description: '営業組織を変える'
  }
];

// STEP 3: Challenge Stage
const diagPositions = [
  {
    value: 'q3_member',
    title: 'プレイヤーとして、<br>誰よりも成果を出したい',
    description: '成果で突き抜ける'
  },
  {
    value: 'q3_leader',
    title: 'プレイヤーで終わらず、<br>早期にチームを率いたい',
    description: 'チームを率いる'
  },
  {
    value: 'q3_mg',
    title: '営業経験を武器に、<br>仕組みづくりに挑戦したい',
    description: '仕組みをつくる'
  }
];

// Diagnosis target jobs
const activeJobs = {
  hd_fs_member: {
    title: "HD FSメンバー",
    catch: "地域店舗の成長を、商談の最前線からつくる。",
    entryUrl: "entry.html?job=hd-fs-member",
    detailUrl: "job-hd-fs-member.html",
    division: "HD事業部",
    description: "飲食店や地域店舗に対して、集客・ホームページ制作・運用支援などの提案および受注を担うポジションです。"
  },
  hd_cs_member: {
    title: "HD CSメンバー",
    catch: "顧客に伴走し、店舗の成果が出るまで向き合う。",
    entryUrl: "entry.html?job=hd-cs-member",
    detailUrl: "job-hd-cs-member.html",
    division: "HD事業部",
    description: "ご契約いただいた店舗に伴走し、サービスの導入・運用支援、成果最大化を担うカスタマーサクセス職です。"
  },
  hd_is_leader: {
    title: "HD ISリーダー候補",
    entryUrl: "entry.html?job=hd-is-leader",
    detailUrl: "job-hd-inside-sales-leader.html",
    division: "HD事業部",
    catch: "新しい顧客接点をつくり、チームで突破口を広げる。",
    description: "飲食店や地域店舗に向けて、DX・集客支援サービスの提案機会を創出し、インサイドセールスチームを牽引する候補ポジションです。"
  },
  hd_fs_leader: {
    title: "HD FSリーダー候補",
    entryUrl: "entry.html?job=hd-fs-leader",
    detailUrl: "job-hd-fs-leader.html",
    division: "HD事業部",
    catch: "店舗ビジネスの課題を見抜き、勝てる営業チームをつくる。",
    description: "飲食店・地域店舗向け営業チームにおいて、プレイヤーとしての成果創出およびチームの数値管理・育成を担うリーダー候補です。"
  },
  hd_cs_leader: {
    title: "HD CSリーダー候補",
    entryUrl: "entry.html?job=hd-cs-leader",
    detailUrl: "job-hd-cs-leader.html",
    division: "HD事業部",
    catch: "顧客成果に向き合い、成功体験をチームで再現する。",
    description: "店舗向けカスタマーサクセスチームにおいて、解約防止やアップセル施策の立案、メンバーの育成およびKPI管理を担うリーダー候補です。"
  },
  first_fs_member: {
    title: "医療向け フィールドセールス（FS）",
    catch: "医療機関の課題を見抜き、集患と経営成長を前に進める。",
    entryUrl: "entry.html?job=division1-fs",
    detailUrl: "job-division1-field-sales.html",
    division: "第一営業部",
    description: "クリニック・医療機関に対して、マーケティング・集客支援の提案から導入・成果創出までを担うポジションです。"
  },
  first_is_leader: {
    title: "医療向け インサイドセールス（IS）",
    catch: "医療領域の新しい接点をつくり、商談機会を生み出す。",
    entryUrl: "entry.html?job=division1-is",
    detailUrl: "job-division1-is-leader.html",
    division: "第一営業部",
    description: "クリニック・医療機関に対し、Web集客やCRMツールなどの提案機会を創出するインサイドセールス職です。"
  },
  first_fs_leader: {
    title: "医療向け フィールドセールス（FS）リーダー候補",
    catch: "医療マーケットで勝ち切る営業組織をつくる。",
    entryUrl: "entry.html?job=division1-fs-leader",
    detailUrl: "job-division1-fs-leader.html",
    division: "第一営業部",
    description: "医療機関向けの提案活動を牽引しながら、営業戦略・KPI管理・育成にも関わるリーダー候補です。"
  },
  ai_mg: {
    title: "【AI Sales Enablement事業部 MG候補】",
    catch: "AIを活用し、営業組織の生産性を変える。",
    entryUrl: "entry.html?job=ai-sales-mg",
    detailUrl: "job-ai-sales-mg.html",
    division: "AI Sales Enablement事業部",
    description: "営業代行・営業支援事業を推進し、AIを活用した営業組織づくり・マネジメントを担うポジションです。"
  }
};

const tieBreakPriority = [
  'ai_mg',
  'first_fs_leader',
  'hd_fs_leader',
  'hd_cs_leader',
  'first_is_leader',
  'hd_is_leader',
  'first_fs_member',
  'hd_fs_member',
  'hd_cs_member'
];

const jobProfiles = {
  hd_fs_member: { domain: 'q2_hd', role: 'q1_fs', stage: 'q3_member' },
  hd_cs_member: { domain: 'q2_hd', role: 'q1_cs', stage: 'q3_member' },
  hd_is_leader: { domain: 'q2_hd', role: 'q1_is', stage: 'q3_leader' },
  hd_fs_leader: { domain: 'q2_hd', role: 'q1_fs', stage: 'q3_leader' },
  hd_cs_leader: { domain: 'q2_hd', role: 'q1_cs', stage: 'q3_leader' },
  first_fs_member: { domain: 'q2_first', role: 'q1_fs', stage: 'q3_member' },
  first_is_leader: { domain: 'q2_first', role: 'q1_is', stage: 'q3_leader' },
  first_fs_leader: { domain: 'q2_first', role: 'q1_fs', stage: 'q3_leader' },
  ai_mg: { domain: 'q2_ai', role: 'q1_fs', stage: 'q3_mg' }
};

function getDiagnosisResults(q1, q2, q3) {
  const scores = Object.keys(activeJobs).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

  Object.entries(jobProfiles).forEach(([key, profile]) => {
    if (profile.role === q1) scores[key] += 5;
    if (profile.domain === q2) scores[key] += 6;
    if (profile.stage === q3) scores[key] += 4;
  });

  if (q1 === 'q1_is') {
    scores.hd_is_leader += 2;
    scores.first_is_leader += 2;
  }
  if (q1 === 'q1_fs') {
    scores.hd_fs_member += 1;
    scores.first_fs_member += 1;
  }
  if (q1 === 'q1_cs') {
    scores.hd_cs_member += 2;
    scores.hd_cs_leader += 2;
  }

  if (q2 === 'q2_ai') scores.ai_mg += 8;
  if (q3 === 'q3_mg') scores.ai_mg += 8;
  if (q3 === 'q3_leader') {
    scores.hd_is_leader += 1;
    scores.hd_fs_leader += 1;
    scores.hd_cs_leader += 1;
    scores.first_is_leader += 1;
    scores.first_fs_leader += 1;
  }

  // Exceptions: keep the result useful when a direct opening does not exist.
  if (q1 === 'q1_cs' && q2 === 'q2_first') scores.first_fs_member += 4;
  if (q1 === 'q1_is' && q2 === 'q2_hd' && q3 === 'q3_member') scores.hd_is_leader += 5;
  if (q2 === 'q2_ai' && q3 === 'q3_mg') scores.ai_mg += 6;

  return Object.keys(activeJobs)
    .sort((a, b) => {
      const scoreDiff = scores[b] - scores[a];
      if (scoreDiff !== 0) return scoreDiff;
      return tieBreakPriority.indexOf(a) - tieBreakPriority.indexOf(b);
    })
    .slice(0, 2)
    .map((key, index) => ({ key, rank: index + 1, score: scores[key] }));
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
    stepTitle = 'どんな瞬間に、一番燃えますか?';
    stepHelpText = '直感に近いものを選んでください。';
    options = diagCategories;
    currentValue = diagState.business;
  } else if (stepNum === 2) {
    stepTitle = 'どんな領域に挑戦したいですか?';
    stepHelpText = 'Crestixで挑戦したい領域を選んでください。';
    options = diagRoles;
    currentValue = diagState.role;
  } else if (stepNum === 3) {
    stepTitle = '今のあなたに一番近い挑戦ステージはどれですか?';
    stepHelpText = '今の挑戦意欲に一番近いものを選んでください。';
    options = diagPositions;
    currentValue = diagState.position;
  } else {
    return;
  }

  el.innerHTML = `
    <div class="diag-step-header text-center mb-12">
      <span class="diag-step-subtitle">あなたが燃える挑戦診断</span>
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
  const results = getDiagnosisResults(diagState.business, diagState.role, diagState.position);
  const [primary, secondary] = results.map(result => activeJobs[result.key]).filter(Boolean);
  const resultCards = [
    { label: '一番おすすめ', job: primary },
    { label: '次点でおすすめ', job: secondary }
  ].filter(item => item.job).map(item => `
      <div class="diag-result-division-card">
        <p class="diag-result-division-name">${item.label} / ${item.job.division}</p>
        <p class="diag-result-division-sub">${item.job.title}</p>
        <p class="diag-result-division-label">${item.job.catch}<br>${item.job.description}</p>
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:1.5rem;">
          <a href="${item.job.entryUrl}" class="diag-result-division-link">この職種に応募する</a>
          <a href="${item.job.detailUrl}" class="diag-result-division-link" style="background:white;color:#FF5C00;border:2px solid #FF5C00 !important;box-shadow:none;">募集要項を見る</a>
        </div>
      </div>
    `).join('');

  return `
    <div class="diag-result-shell" style="display:flex;flex-direction:column;gap:2rem;animation:diagFadeUp 0.5s ease both;">
      <style>@keyframes diagFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}</style>
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;">
        <span style="display:inline-flex;align-items:center;background:#FF5C00;color:#fff;font-family:'Noto Sans JP',sans-serif;font-size:11px;font-weight:800;letter-spacing:0.12em;padding:5px 18px;border-radius:99px;">診断結果</span>
      </div>
      <div style="text-align:center;">
        <h3 class="diag-result-title">あなたが一番燃えられる挑戦</h3>
        <p class="diag-result-lead">3つの回答から、Crestixで力を発揮しやすいポジションを選びました。</p>
      </div>

      <div class="diag-result-cards">
        ${resultCards}
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
