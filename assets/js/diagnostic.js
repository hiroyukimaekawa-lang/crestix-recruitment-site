/**
 * Crestix — Job Diagnosis Engine
 * 3ステップ診断 → 結果表示 → jobs.html遷移
 */

'use strict';

/* ─────────────────────────────────────────────
   DATA: Steps definition
───────────────────────────────────────────── */
const DIAG_STEPS = [
  {
    id: 1,
    label: 'Step 01 / Career Expertise',
    question: '希望する職種領域は？',
    options: [
      { value: 'ビジネス',    icon: '💼', title: 'ビジネス',    sub: 'Sales / BizDev / Agency' },
      { value: 'マーケ・制作', icon: '🎨', title: 'マーケ・制作', sub: 'Ads / Web / Creative'    },
      { value: 'コーポレート', icon: '🏢', title: 'コーポレート', sub: 'HR / Strategy / Assist'  },
    ],
  },
  {
    id: 2,
    label: 'Step 02 / Work Style',
    question: 'どんな働き方が理想ですか？',
    options: [
      { value: '裁量大きく自走', icon: '🚀', title: '裁量大きく自走', sub: 'High Autonomy'   },
      { value: 'チームで創る',   icon: '🤝', title: 'チームで創る',   sub: 'Collaborative'  },
      { value: '成果報酬で稼ぐ', icon: '💰', title: '成果報酬で稼ぐ', sub: 'Performance'    },
    ],
  },
  {
    id: 3,
    label: 'Step 03 / Experience',
    question: 'あなたの経験年数は？',
    options: [
      { value: '未経験・第二新卒', icon: '🌱', title: '未経験・第二新卒', sub: '0〜2 years' },
      { value: '3〜5年',          icon: '📈', title: '3〜5年',          sub: 'Mid Level'  },
      { value: '6年以上',         icon: '⭐', title: '6年以上',         sub: 'Senior+'    },
    ],
  },
];

/* ─────────────────────────────────────────────
   DATA: 27-pattern result map
   Key: "職種|働き方|経験"
───────────────────────────────────────────── */
const DIAG_RESULTS = {
  'ビジネス|裁量大きく自走|未経験・第二新卒': {
    title: 'セールスインターン / 第二新卒エントリー',
    desc:  '裁量権を持ちながらゼロからビジネスセンスを磨けるポジションです。担当顧客を持ち、早期から実績を積むことができます。成長意欲さえあれば経験は問いません。',
    tags:  ['インサイドセールス', '第二新卒歓迎', 'フルリモート可', '成果報酬あり'],
    query: 'sales-junior',
  },
  'ビジネス|裁量大きく自走|3〜5年': {
    title: 'アカウントエグゼクティブ',
    desc:  '中堅として自ら戦略を組み、エンタープライズ顧客を攻略するハイインパクトなポジション。PLを意識しながら大型案件をクローズする醍醐味があります。',
    tags:  ['エンタープライズ営業', 'AE', 'OTE 1,000万〜', '裁量大'],
    query: 'account-executive',
  },
  'ビジネス|裁量大きく自走|6年以上': {
    title: 'セールスマネージャー / Head of Sales',
    desc:  'チームを束ねながらプロセス設計・採用・育成まで担うリーダーポジション。事業をスケールさせるミッションのど真ん中に立てます。',
    tags:  ['マネジメント', '採用権限あり', '執行役員候補', 'RSU対象'],
    query: 'sales-manager',
  },
  'ビジネス|チームで創る|未経験・第二新卒': {
    title: 'BizDev / 新規事業スタッフ',
    desc:  'チームで新規事業の仮説検証を回していくポジション。多様なバックグラウンドのメンバーと共創し、アイデアを形にする経験ができます。',
    tags:  ['新規事業', '第二新卒OK', 'BizDev', 'クロスファンクション'],
    query: 'bizdev-junior',
  },
  'ビジネス|チームで創る|3〜5年': {
    title: 'ストラテジックパートナーシップ',
    desc:  '大手企業との共同事業やアライアンス交渉をリードするポジション。交渉力と関係構築力を最大限に発揮できます。',
    tags:  ['アライアンス', 'B2B', 'パートナーシップ', '出張あり'],
    query: 'partnership',
  },
  'ビジネス|チームで創る|6年以上': {
    title: 'VP of Business Development',
    desc:  '事業の成長エンジンとして全社横断の戦略立案から実行まで担います。経営層とも密接に連携するエグゼクティブポジションです。',
    tags:  ['VP', '経営直結', '全社横断', 'IPO準備中'],
    query: 'vp-bizdev',
  },
  'ビジネス|成果報酬で稼ぐ|未経験・第二新卒': {
    title: 'インサイドセールス（インセンティブ型）',
    desc:  '成果に応じて青天井の報酬が得られるポジション。未経験でも3ヶ月で月収100万を達成したメンバーが多数在籍しています。',
    tags:  ['インサイドセールス', '青天井報酬', '月収100万実績あり', '週5出社'],
    query: 'inside-sales',
  },
  'ビジネス|成果報酬で稼ぐ|3〜5年': {
    title: 'フィールドセールス（エース級）',
    desc:  '数字にコミットし、自分の実力を収入に直結させたい人向けのポジション。トップセールスは年収2,000万超えも現実的です。',
    tags:  ['フィールドセールス', '年収2,000万実績', '完全実力主義', '社用車支給'],
    query: 'field-sales',
  },
  'ビジネス|成果報酬で稼ぐ|6年以上': {
    title: 'GM / エリアマネージャー（成果連動型）',
    desc:  'チームの売上責任を持ちながら自分のパフォーマンスも評価されるマネジメントポジション。組織を動かす快感と高収入を両立できます。',
    tags:  ['GM', 'チームP/L責任', '成果連動ボーナス', 'マネジメント経験者優遇'],
    query: 'area-manager',
  },
  'マーケ・制作|裁量大きく自走|未経験・第二新卒': {
    title: 'マーケターアシスタント / クリエイティブ見習い',
    desc:  'SNS運用や広告クリエイティブ制作を通じてデジタルマーケの基礎を身につけるポジション。手を動かしながら学べる環境です。',
    tags:  ['SNSマーケ', 'クリエイティブ', '未経験歓迎', 'Adobe研修あり'],
    query: 'marketer-junior',
  },
  'マーケ・制作|裁量大きく自走|3〜5年': {
    title: 'グロースマーケター',
    desc:  '広告・SEO・CRO・LPを横断してKPIオーナーとして数字を動かすポジション。データドリブンで施策を高速検証します。',
    tags:  ['グロース', 'CRO', 'Meta/Google広告', 'データ分析'],
    query: 'growth-marketer',
  },
  'マーケ・制作|裁量大きく自走|6年以上': {
    title: 'CMO / マーケ責任者',
    desc:  'ブランド戦略から集客・CRM・クリエイティブまで一気通貫で担うポジション。マーケ組織の立ち上げから推進まで任せます。',
    tags:  ['CMO候補', 'ブランド戦略', '組織構築', '執行役員候補'],
    query: 'cmo',
  },
  'マーケ・制作|チームで創る|未経験・第二新卒': {
    title: 'コンテンツ・SNSクリエイター',
    desc:  'チームで企画からシナリオ・撮影・編集まで関わるコンテンツポジション。クリエイティブの全工程を学べます。',
    tags:  ['YouTube', 'TikTok', 'コンテンツ制作', 'チーム制作'],
    query: 'content-creator',
  },
  'マーケ・制作|チームで創る|3〜5年': {
    title: 'ブランドデザイナー / クリエイティブディレクター',
    desc:  'プロダクト・採用・広告のクリエイティブを横断してブランドの世界観を構築するポジション。デザイン×ビジネスの視点が活かせます。',
    tags:  ['ブランディング', 'UI/UX', 'Figma', 'クリエイティブ統括'],
    query: 'brand-designer',
  },
  'マーケ・制作|チームで創る|6年以上': {
    title: 'Head of Creative / クリエイティブ本部長',
    desc:  'クリエイティブチームのマネジメントから外部代理店との折衝まで担うリーダーポジション。Crestixの顔を創ります。',
    tags:  ['Head of Creative', 'チームマネジメント', '代理店折衝', '採用権限'],
    query: 'head-creative',
  },
  'マーケ・制作|成果報酬で稼ぐ|未経験・第二新卒': {
    title: 'アフィリエイト・メディア運営スタッフ',
    desc:  '成果に直結するメディア運営でSEOや広告収益の仕組みを学べるポジション。成果が数字で見える爽快感があります。',
    tags:  ['SEO', 'メディア運営', '成果連動', 'リモートワーク'],
    query: 'media-staff',
  },
  'マーケ・制作|成果報酬で稼ぐ|3〜5年': {
    title: 'パフォーマンスマーケター（高報酬型）',
    desc:  'ROASを最大化しながら自分の成果が収入に反映されるポジション。広告費数億を動かす経験ができます。',
    tags:  ['パフォーマンスマーケ', 'ROAS最大化', '億規模広告運用', 'インセンティブ'],
    query: 'performance-marketer',
  },
  'マーケ・制作|成果報酬で稼ぐ|6年以上': {
    title: 'マーケ × ビジネスハイブリッド責任者',
    desc:  'マーケの知見を持ちながら収益責任も担うユニークなポジション。PLを持ちながらクリエイティブをリードします。',
    tags:  ['PL責任', 'マーケ×ビジネス', 'ハイブリッドロール', '高報酬'],
    query: 'marketer-hybrid',
  },
  'コーポレート|裁量大きく自走|未経験・第二新卒': {
    title: '人事・採用スタッフ（裁量型）',
    desc:  '採用戦略の立案から媒体運用・面接まで一人で回す経験ができるポジション。人事の全工程を早期に習得できます。',
    tags:  ['人事', '採用', '第二新卒', '裁量大'],
    query: 'hr-junior',
  },
  'コーポレート|裁量大きく自走|3〜5年': {
    title: 'HRBPパートナー / 組織開発',
    desc:  '事業部と密接に連携しながら採用・育成・組織設計を推進するポジション。経営陣へ直接提言できる環境です。',
    tags:  ['HRBP', '組織開発', '経営直結', '人事企画'],
    query: 'hrbp',
  },
  'コーポレート|裁量大きく自走|6年以上': {
    title: 'CHRO / 人事責任者',
    desc:  '全社の人事戦略を立案・実行する責任者ポジション。採用・育成・制度設計・文化醸成まで統括します。',
    tags:  ['CHRO候補', '人事戦略', '組織文化', '執行役員候補'],
    query: 'chro',
  },
  'コーポレート|チームで創る|未経験・第二新卒': {
    title: '総務・バックオフィスアシスタント',
    desc:  '経理・法務・総務を横断してコーポレートの基礎を学べるポジション。少数精鋭のチームで何でも経験できます。',
    tags:  ['総務', 'バックオフィス', '未経験OK', '幅広く経験'],
    query: 'backoffice',
  },
  'コーポレート|チームで創る|3〜5年': {
    title: '経営企画スタッフ',
    desc:  '予算管理・KPI設計・投資家対応などを担う経営の参謀ポジション。数字で会社を俯瞰する視点が身につきます。',
    tags:  ['経営企画', 'KPI管理', '投資家対応', 'IPO準備'],
    query: 'corp-planning',
  },
  'コーポレート|チームで創る|6年以上': {
    title: '経営企画室長 / CFO候補',
    desc:  '財務・経営・法務を横断してIPOや成長戦略を主導するポジション。会社の命運を左右する意思決定に携わります。',
    tags:  ['CFO候補', 'IPO主導', '財務戦略', 'エグゼクティブ'],
    query: 'cfo',
  },
  'コーポレート|成果報酬で稼ぐ|未経験・第二新卒': {
    title: '採用エージェント（インセンティブ型）',
    desc:  '採用決定に連動した報酬体系で、成果が収入に直結するポジション。人の人生に関わる仕事にやりがいを感じる方向け。',
    tags:  ['リクルーター', 'インセンティブ', '第二新卒OK', '成果報酬型'],
    query: 'recruiter-junior',
  },
  'コーポレート|成果報酬で稼ぐ|3〜5年': {
    title: 'シニアリクルーター / タレントアクイジション',
    desc:  '採用ブランド構築からスカウト・クロージングまで担うエース採用担当ポジション。採用難易度の高いポジションで実力を証明できます。',
    tags:  ['タレントアクイジション', 'スカウト', '採用ブランド', '高報酬'],
    query: 'talent-acquisition',
  },
  'コーポレート|成果報酬で稼ぐ|6年以上': {
    title: 'VP of People / 採用責任者（高報酬型）',
    desc:  '急成長フェーズの採用・人事組織全体をリードしながら成果連動の高報酬を得られるポジション。',
    tags:  ['VP of People', '採用責任者', '成果連動', '組織スケール'],
    query: 'vp-people',
  },
};

/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */
const diagState = {
  current: 1,
  answers: {},   // { 1: '...', 2: '...', 3: '...' }
};

/* ─────────────────────────────────────────────
   INIT — called after DOM is ready
───────────────────────────────────────────── */
function initDiagnostic() {
  renderStep(1);

  /* Reset button */
  const resetBtn = document.getElementById('diag-restart');
  if (resetBtn) resetBtn.addEventListener('click', resetDiagnostic);

  /* Back button */
  const backBtn = document.getElementById('diag-back');
  if (backBtn) backBtn.addEventListener('click', diagGoBack);
}

/* ─────────────────────────────────────────────
   RENDER STEP
───────────────────────────────────────────── */
function renderStep(stepNum) {
  const container = document.getElementById('diagnostic-container');
  if (!container) return;

  diagState.current = stepNum;
  updateProgressBar(stepNum);

  const step = DIAG_STEPS[stepNum - 1];

  /* Build inner HTML */
  container.innerHTML = `
    ${buildProgressBar(stepNum)}
    <div class="diag-step-body" style="flex:1;">
      <div style="text-align:center;margin-bottom:3rem;">
        <span style="font-family:'Poppins',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.6em;text-transform:uppercase;color:#FF5C00;display:block;margin-bottom:0.75rem;">${step.label}</span>
        <h3 style="font-family:'Poppins',sans-serif;font-size:clamp(1.6rem,4vw,2.8rem);font-weight:900;color:#1A2B4C;letter-spacing:-0.04em;line-height:1.1;">${step.question}</h3>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;">
        ${step.options.map(opt => buildOptionCard(stepNum, opt)).join('')}
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid rgba(0,0,0,0.06);">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-family:'Poppins',sans-serif;font-size:11px;font-weight:700;color:#bbb;letter-spacing:0.3em;text-transform:uppercase;">Progress</span>
        <div style="display:flex;gap:6px;">${buildDots(stepNum)}</div>
      </div>
      ${stepNum > 1
        ? `<button onclick="diagGoBack()" style="display:flex;align-items:center;gap:8px;background:none;border:none;cursor:pointer;font-family:'Poppins',sans-serif;font-size:11px;font-weight:700;color:#aaa;letter-spacing:0.3em;text-transform:uppercase;transition:color 0.2s;" onmouseover="this.style.color='#FF5C00'" onmouseout="this.style.color='#aaa'"><i class="fa-solid fa-arrow-left-long"></i> Return</button>`
        : `<span></span>`
      }
    </div>
  `;
}

function buildOptionCard(stepNum, opt) {
  return `
    <div class="diag-opt-card"
         onclick="diagSelect(${stepNum}, '${opt.value}')"
         style="
           background:rgba(255,255,255,0.85);
           border:2px solid rgba(255,255,255,0.9);
           border-radius:20px;
           padding:2rem 1.25rem;
           cursor:pointer;
           text-align:center;
           display:flex;flex-direction:column;align-items:center;gap:12px;
           min-height:160px;justify-content:center;
           transition:all 0.25s cubic-bezier(0.16,1,0.3,1);
           box-shadow:0 4px 16px rgba(0,0,0,0.06);
         "
         onmouseover="
           this.style.borderColor='#FF5C00';
           this.style.boxShadow='0 12px 32px rgba(255,92,0,0.2)';
           this.style.transform='translateY(-4px)';
         "
         onmouseout="
           this.style.borderColor='rgba(255,255,255,0.9)';
           this.style.boxShadow='0 4px 16px rgba(0,0,0,0.06)';
           this.style.transform='translateY(0)';
         ">
      <span style="font-size:2rem;line-height:1;">${opt.icon}</span>
      <span style="font-family:'Poppins',sans-serif;font-size:15px;font-weight:900;color:#1A2B4C;letter-spacing:-0.02em;">${opt.title}</span>
      <span style="font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;color:#aaa;letter-spacing:0.2em;text-transform:uppercase;">${opt.sub}</span>
    </div>
  `;
}

function buildDots(stepNum) {
  return [1, 2, 3].map(i => {
    const done   = i < stepNum;
    const active = i === stepNum;
    const bg     = done ? '#1A2B4C' : active ? '#FF5C00' : 'rgba(0,0,0,0.1)';
    const w      = active ? '2.5rem' : '0.6rem';
    return `<span style="height:6px;width:${w};border-radius:99px;background:${bg};display:inline-block;transition:all 0.4s ease;"></span>`;
  }).join('');
}

function buildProgressBar() { return ''; } /* progress is in dots */

/* ─────────────────────────────────────────────
   INTERACTIONS
───────────────────────────────────────────── */
function diagSelect(stepNum, value) {
  diagState.answers[stepNum] = value;

  if (stepNum < 3) {
    /* Animate out, then render next step */
    const container = document.getElementById('diagnostic-container');
    if (container) {
      container.style.opacity = '0';
      container.style.transform = 'translateY(10px)';
      container.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      setTimeout(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        renderStep(stepNum + 1);
      }, 220);
    }
  } else {
    showDiagResult();
  }
}

/* Exposed globally for inline onclick in renderStep fallback */
window.diagSelect = diagSelect;

function diagGoBack() {
  if (diagState.current <= 1) return;
  delete diagState.answers[diagState.current - 1];
  const container = document.getElementById('diagnostic-container');
  if (container) {
    container.style.opacity = '0';
    container.style.transform = 'translateY(-10px)';
    container.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    setTimeout(() => {
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
      renderStep(diagState.current - 1);
    }, 180);
  }
}
window.diagGoBack = diagGoBack;

function resetDiagnostic() {
  diagState.answers = {};
  const container = document.getElementById('diagnostic-container');
  if (container) {
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.2s ease';
    setTimeout(() => {
      container.style.opacity = '1';
      renderStep(1);
    }, 180);
  }
}
window.resetDiagnostic = resetDiagnostic;

/* Legacy support — original HTML onclick="selectDiagnosticOption()" */
window.selectDiagnosticOption = function(step, value) {
  diagSelect(step, value);
};

/* ─────────────────────────────────────────────
   RESULT SCREEN
───────────────────────────────────────────── */
function showDiagResult() {
  const key    = [diagState.answers[1], diagState.answers[2], diagState.answers[3]].join('|');
  const result = DIAG_RESULTS[key] || {
    title: 'カスタムポジション',
    desc:  'あなたのプロフィールに合わせた特別なポジションをご用意します。まずはカジュアル面談からご応募ください。',
    tags:  ['要相談', 'カスタムポジション', 'カジュアル面談歓迎'],
    query: '',
  };

  const container = document.getElementById('diagnostic-container');
  if (!container) return;

  container.style.opacity = '0';
  container.style.transform = 'translateY(12px)';
  container.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

  setTimeout(() => {
    container.innerHTML = buildResultHTML(result, key);
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';

    /* Stagger tag animations */
    const tags = container.querySelectorAll('.result-tag');
    tags.forEach((tag, i) => {
      tag.style.opacity = '0';
      tag.style.transform = 'translateY(8px)';
      setTimeout(() => {
        tag.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        tag.style.opacity = '1';
        tag.style.transform = 'translateY(0)';
      }, 300 + i * 80);
    });
  }, 220);
}

function buildResultHTML(result, key) {
  /* Encode answers for URL */
  const params = new URLSearchParams({
    role:  diagState.answers[1] || '',
    style: diagState.answers[2] || '',
    exp:   diagState.answers[3] || '',
    pos:   result.query || '',
  });
  const jobsURL = `jobs.html?${params.toString()}`;

  const tagsHTML = result.tags.map(tag => `
    <span class="result-tag" style="
      display:inline-block;
      background:#1A2B4C;
      color:#fff;
      font-family:'Poppins',sans-serif;
      font-size:11px;font-weight:700;letter-spacing:0.15em;
      padding:6px 18px;border-radius:99px;
    ">${tag}</span>
  `).join('');

  /* Summary chips of selected answers */
  const answerChips = [1,2,3].map(n => {
    const val = diagState.answers[n];
    if (!val) return '';
    const step = DIAG_STEPS[n-1];
    const opt  = step.options.find(o => o.value === val);
    return `<span style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,92,0,0.1);border:1px solid rgba(255,92,0,0.25);color:#E65200;font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.15em;padding:4px 12px;border-radius:99px;">${opt ? opt.icon : ''} ${val}</span>`;
  }).join('');

  return `
    <div style="display:flex;flex-direction:column;gap:2rem;animation:diagFadeUp 0.5s ease both;">
      <style>
        @keyframes diagFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      </style>

      <!-- Match badge -->
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <span style="display:inline-flex;align-items:center;gap:8px;background:#FF5C00;color:#fff;font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;padding:5px 18px;border-radius:99px;">
          ✦ Your Match
        </span>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">${answerChips}</div>
      </div>

      <!-- Title -->
      <div>
        <h3 style="font-family:'Poppins',sans-serif;font-size:clamp(1.6rem,4vw,2.8rem);font-weight:900;color:#1A2B4C;letter-spacing:-0.04em;line-height:1.1;margin-bottom:1rem;">${result.title}</h3>
        <p style="font-family:'Noto Sans JP',sans-serif;font-size:0.9rem;color:#555;line-height:1.9;font-weight:500;border-left:3px solid #FF5C00;padding-left:1.25rem;max-width:560px;">${result.desc}</p>
      </div>

      <!-- Tags -->
      <div style="display:flex;flex-wrap:wrap;gap:10px;">${tagsHTML}</div>

      <!-- CTA row -->
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding-top:0.5rem;">
        <a href="${jobsURL}"
           style="
             display:inline-flex;align-items:center;gap:12px;
             background:linear-gradient(135deg,#FF5C00,#E65200);
             color:#fff;
             font-family:'Poppins',sans-serif;font-weight:900;font-size:11px;
             letter-spacing:0.35em;text-transform:uppercase;
             padding:1.1rem 2.5rem;border-radius:9999px;
             text-decoration:none;
             box-shadow:0 16px 40px rgba(255,92,0,0.35);
             transition:all 0.25s ease;
           "
           onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 24px 50px rgba(255,92,0,0.5)'"
           onmouseout="this.style.transform='';this.style.boxShadow='0 16px 40px rgba(255,92,0,0.35)'">
          このポジションに応募する
          <i class="fa-solid fa-arrow-right-long"></i>
        </a>
        <button onclick="resetDiagnostic()"
           style="
             background:none;
             border:1.5px solid rgba(0,0,0,0.12);
             color:#888;
             font-family:'Poppins',sans-serif;font-size:11px;font-weight:700;
             letter-spacing:0.3em;text-transform:uppercase;
             padding:1rem 2rem;border-radius:9999px;
             cursor:pointer;transition:all 0.2s;
           "
           onmouseover="this.style.borderColor='#FF5C00';this.style.color='#FF5C00'"
           onmouseout="this.style.borderColor='rgba(0,0,0,0.12)';this.style.color='#888'">
          <i class="fa-solid fa-rotate-right" style="margin-right:6px;"></i>
          最初からやり直す
        </button>
      </div>

    </div>
  `;
}

/* ─────────────────────────────────────────────
   PROGRESS BAR HELPER (legacy pbar elements)
───────────────────────────────────────────── */
function updateProgressBar(stepNum) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('pbar-' + i);
    if (!el) continue;
    if (i < stepNum) {
      el.style.cssText = 'width:3rem;height:8px;border-radius:99px;background:#1A2B4C;';
    } else if (i === stepNum) {
      el.style.cssText = 'width:3rem;height:8px;border-radius:99px;background:#FF5C00;box-shadow:0 3px 8px rgba(255,92,0,0.4);';
    } else {
      el.style.cssText = 'width:0.75rem;height:8px;border-radius:99px;background:rgba(255,255,255,0.3);';
    }
  }
}

/* ─────────────────────────────────────────────
   BOOT
───────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDiagnostic);
} else {
  initDiagnostic();
}