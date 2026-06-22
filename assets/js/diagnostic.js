/**
 * Crestix — Job Diagnosis Engine  v2.0
 * ─────────────────────────────────────
 * 3ステップ診断 → 結果表示 → 各事業部ページへ遷移
 *
 * 遷移マッピング:
 *   Division 01 (service-division1.html) : 医療マーケ
 *   Division HD (service-hd.html)        : 飲食店 HP制作・集客
 *
 * アンカー構造 (service-hd.html のみ):
 *   IS リーダー  →  service-hd.html#jobs-is-leader
 *   FS メンバー  →  service-hd.html#jobs-fs
 *   FS リーダー  →  service-hd.html#jobs-fs-leader
 *   CS メンバー  →  service-hd.html#jobs-cs
 *   CS リーダー  →  service-hd.html#jobs-cs-leader
 */

'use strict';

/* ─────────────────────────────────────────────
   DIVISION ROUTING TABLE
   key: "職種|働き方|経験"  →  { page, anchor, divisionLabel }
   ─────────────────────────────────────────────
   ルール概要:
   ・ビジネス × 未経験/3-5y → Division 01 (医療系営業)
   ・ビジネス × 6y+        → Division HD (HD責任者候補)
   ・マーケ × 全経験        → Division HD (Web/SNS寄り) or LL
   ・コーポレート           → Division LL (サポート系)
   ・成果報酬              → IS/FS へ
   ・チーム/自走            → CS/FS へ
   ─────────────────────────────────────────────*/
const DIVISION_ROUTES = {
  /* ── インサイドセールス ────────────────────── */
  'インサイドセールス|裁量大きく自走|未経験・第二新卒': { page: 'service-hd.html', anchor: 'jobs-is-leader', divisionLabel: 'HD事業部 / インサイドセールスリーダー候補' },
  'インサイドセールス|裁量大きく自走|3〜5年': { page: 'service-hd.html', anchor: 'jobs-is-leader', divisionLabel: 'HD事業部 / インサイドセールスリーダー候補' },
  'インサイドセールス|裁量大きく自走|6年以上': { page: 'service-hd.html', anchor: 'jobs-is-leader', divisionLabel: 'HD事業部 / インサイドセールスリーダー候補' },
  'インサイドセールス|チームで創る|未経験・第二新卒': { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / インサイドセールス' },
  'インサイドセールス|チームで創る|3〜5年': { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / インサイドセールス' },
  'インサイドセールス|チームで創る|6年以上': { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / インサイドセールス' },
  'インサイドセールス|成果報酬で稼ぐ|未経験・第二新卒': { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / インサイドセールス' },
  'インサイドセールス|成果報酬で稼ぐ|3〜5年': { page: 'service-hd.html', anchor: 'jobs-is-leader', divisionLabel: 'HD事業部 / インサイドセールスリーダー候補' },
  'インサイドセールス|成果報酬で稼ぐ|6年以上': { page: 'service-hd.html', anchor: 'jobs-is-leader', divisionLabel: 'HD事業部 / インサイドセールスリーダー候補' },

  /* ── フィールドセールス ────────────────────── */
  'フィールドセールス|裁量大きく自走|未経験・第二新卒': { page: 'service-hd.html', anchor: 'jobs-fs', divisionLabel: 'HD事業部 / フィールドセールス メンバー' },
  'フィールドセールス|裁量大きく自走|3〜5年': { page: 'service-hd.html', anchor: 'jobs-fs', divisionLabel: 'HD事業部 / フィールドセールス メンバー' },
  'フィールドセールス|裁量大きく自走|6年以上': { page: 'service-hd.html', anchor: 'jobs-fs-leader', divisionLabel: 'HD事業部 / フィールドセールス リーダー候補' },
  'フィールドセールス|チームで創る|未経験・第二新卒': { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / フィールドセールス' },
  'フィールドセールス|チームで創る|3〜5年': { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / フィールドセールス' },
  'フィールドセールス|チームで創る|6年以上': { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / フィールドセールス' },
  'フィールドセールス|成果報酬で稼ぐ|未経験・第二新卒': { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / フィールドセールス' },
  'フィールドセールス|成果報酬で稼ぐ|3〜5年': { page: 'service-hd.html', anchor: 'jobs-fs', divisionLabel: 'HD事業部 / フィールドセールス メンバー' },
  'フィールドセールス|成果報酬で稼ぐ|6年以上': { page: 'service-hd.html', anchor: 'jobs-fs-leader', divisionLabel: 'HD事業部 / フィールドセールス リーダー候補' },

  /* ── カスタマーサクセス ────────────────────── */
  'カスタマーサクセス|裁量大きく自走|未経験・第二新卒': { page: 'service-hd.html', anchor: 'jobs-cs', divisionLabel: 'HD事業部 / カスタマーサクセス メンバー' },
  'カスタマーサクセス|裁量大きく自走|3〜5年': { page: 'service-hd.html', anchor: 'jobs-cs', divisionLabel: 'HD事業部 / カスタマーサクセス メンバー' },
  'カスタマーサクセス|裁量大きく自走|6年以上': { page: 'service-hd.html', anchor: 'jobs-cs-leader', divisionLabel: 'HD事業部 / カスタマーサクセス リーダー候補' },
  'カスタマーサクセス|チームで創る|未経験・第二新卒': { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / カスタマーサクセス' },
  'カスタマーサクセス|チームで創る|3〜5年': { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / カスタマーサクセス' },
  'カスタマーサクセス|チームで創る|6年以上': { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / カスタマーサクセス' },
  'カスタマーサクセス|成果報酬で稼ぐ|未経験・第二新卒': { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / カスタマーサクセス' },
  'カスタマーサクセス|成果報酬で稼ぐ|3〜5年': { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / カスタマーサクセス' },
  'カスタマーサクセス|成果報酬で稼ぐ|6年以上': { page: 'service-hd.html', anchor: 'jobs-cs-leader', divisionLabel: 'HD事業部 / カスタマーサクセス リーダー候補' },
};

/* Division meta for display */
const DIVISION_META = {
  'service-division1.html': {
    name: 'Division 01',
    sub: '医療機関向けマーケティング事業',
    color: '#FF5C00',
    bg: '#fff3ed',
    icon: '🏥',
  },
  'service-hd.html': {
    name: 'HD事業部',
    sub: '飲食店向けホームページ制作・集客支援',
    color: '#2563eb',
    bg: '#eff6ff',
    icon: '🍽️',
  },
};

/* ─────────────────────────────────────────────
   DIAG STEPS
   ───────────────────────────────────────────── */
const DIAG_STEPS = [
  {
    id: 1,
    label: 'Step 01 / Career Expertise',
    question: '希望する職種領域は？',
    options: [
      { value: 'インサイドセールス', icon: 'IS', title: 'インサイドセールス', sub: 'Inside Sales' },
      { value: 'フィールドセールス', icon: 'FS', title: 'フィールドセールス', sub: 'Field Sales' },
      { value: 'カスタマーサクセス', icon: 'CS', title: 'カスタマーサクセス', sub: 'Customer Success' },
    ],
  },
  {
    id: 2,
    label: 'Step 02 / Work Style',
    question: 'どんな働き方が理想ですか？',
    options: [
      { value: '裁量大きく自走', icon: '自走', title: '裁量大きく自走', sub: 'High Autonomy' },
      { value: 'チームで創る', icon: 'Team', title: 'チームで創る', sub: 'Collaborative' },
      { value: '成果報酬で稼ぐ', icon: '成果', title: '成果報酬で稼ぐ', sub: 'Performance' },
    ],
  },
  {
    id: 3,
    label: 'Step 03 / Experience',
    question: 'あなたの経験年数は？',
    options: [
      { value: '未経験・第二新卒', icon: '新卒', title: '未経験・第二新卒', sub: '0〜2 years' },
      { value: '3〜5年', icon: 'Mid', title: '3〜5年', sub: 'Mid Level' },
      { value: '6年以上', icon: 'Sr.', title: '6年以上', sub: 'Senior+' },
    ],
  },
];

/* ─────────────────────────────────────────────
   27-pattern RESULT MAP  (existing content kept)
   ───────────────────────────────────────────── */
const DIAG_RESULTS = {
  /* ── インサイドセールス ────────────────────── */
  'インサイドセールス|裁量大きく自走|未経験・第二新卒': { title: '【HD】インサイドセールス メンバー', desc: '飲食店向けに集客支援サービスの魅力を伝え、関係構築の第一歩を築くポジションです。裁量を持ってアプローチ手法を工夫できます。', tags: ['飲食店支援', 'アポイント獲得', '未経験歓迎'], query: 'hd-is' },
  'インサイドセールス|裁量大きく自走|3〜5年': { title: '【HD】インサイドセールス メンバー（専任）', desc: '飲食店のオーナー様へ課題解決のきっかけとなるアポイントを獲得する役割です。培った営業スキルを活かし、チームを牽引してください。', tags: ['顧客アプローチ', '即戦力採用', '裁量大'], query: 'hd-is' },
  'インサイドセールス|裁量大きく自走|6年以上': { title: '【HD】インサイドセールス リーダー候補', desc: 'ISチームの戦略設計やアプローチフローの改善、メンバー育成を担当するリーダー職です。組織の最大化に貢献します。', tags: ['リーダー候補', '戦略設計', 'マネジメント'], query: 'hd-is-leader' },
  'インサイドセールス|チームで創る|未経験・第二新卒': { title: '【Division 01】インサイドセールス メンバー', desc: 'チーム一丸となって医療機関へのアプローチを行う仕事です。丁寧な研修制度があり、未経験からでも安心して成長できます。', tags: ['医療マーケ', 'チーム体制', '第二新卒歓迎'], query: 'd01-is' },
  'インサイドセールス|チームで創る|3〜5年': { title: '【Division 01】インサイドセールス アソエイト', desc: 'データとチームワークを活かし、クリニックの課題解決への足がかりを創ります。営業プロセス改善にも携われます。', tags: ['データ活用', 'チーム連携', 'キャリアアップ'], query: 'd01-is' },
  'インサイドセールス|チームで創る|6年以上': { title: '【Division 01】インサイドセールス リーダー候補', desc: '医療機関向けIS組織のプレイングリーダーとして、アプローチ率向上の仕組み化やメンバー育成を主導します。', tags: ['プレイングリーダー', '仕組み化', '医療業界'], query: 'd01-is' },
  'インサイドセールス|成果報酬で稼ぐ|未経験・第二新卒': { title: '【Division 01】インサイドセールス（成果連動モデル）', desc: '頑張った成果がダイレクトに評価・還元される環境で、未経験からでも高収入と営業スキルを獲得できます。', tags: ['インセンティブ', '未経験OK', '成果主義'], query: 'd01-is' },
  'インサイドセールス|成果報酬で稼ぐ|3〜5年': { title: '【HD】インサイドセールス（高歩合）', desc: '成果に対して青天井の評価を行うインサイドセールスです。培った営業力を成果と報酬に直結させたい方に最適です。', tags: ['高歩合', '成果追求', '実力主義'], query: 'hd-is' },
  'インサイドセールス|成果報酬で稼ぐ|6年以上': { title: '【HD】インサイドセールス リーダー候補（トッププレーヤー）', desc: '自身の高い獲得力でチームを牽引しながら、組織達成に応じたボーナスなど最大級のリターンを得られるポジションです。', tags: ['トッププレイヤー', '組織成果連動', 'キャリアアップ'], query: 'hd-is-leader' },

  /* ── フィールドセールス ────────────────────── */
  'フィールドセールス|裁量大きく自走|未経験・第二新卒': { title: '【HD】フィールドセールス メンバー', desc: '飲食店のオーナー様に寄り添い、MEOやHP制作などを組み合わせた総合的な集客改善を提案する営業です。', tags: ['集客支援', 'ソリューション営業', '成長環境'], query: 'hd-fs' },
  'フィールドセールス|裁量大きく自走|3〜5年': { title: '【HD】フィールドセールス メンバー（主戦力）', desc: '飲食店の集客課題に対してMEO、HP、SaaS、広告などを組み合わせた上流の提案をリードするエース営業候補です。', tags: ['ソリューション提案', '複数プロダクト', '主戦力募集'], query: 'hd-fs' },
  'フィールドセールス|裁量大きく自走|6年以上': { title: '【HD】フィールドセールス リーダー候補', desc: '大規模な飲食店チェーンや複数店舗展開を行う企業に対する提案営業と、自チームの商談設計を行うリーダー職です。', tags: ['リーダー候補', '大口提案', '戦略設計'], query: 'hd-fs-leader' },
  'フィールドセールス|チームで創る|未経験・第二新卒': { title: '【Division 01】フィールドセールス メンバー', desc: 'チームで医療機関の課題を共有し、マイナビ送客サービスやMEOなどの提案をチーム連携で進める仕事です。', tags: ['医療マーケ', 'チーム提案', '第二新卒歓迎'], query: 'd01-fs' },
  'フィールドセールス|チームで創る|3〜5年': { title: '【Division 01】フィールドセールス アカウントプランナー', desc: 'クリニックの状況に応じたデータドリブンな提案を、開発担当やCS担当とチームになって実行していくポジションです。', tags: ['医療マーケ', 'データ分析', 'プロジェクト営業'], query: 'd01-fs' },
  'フィールドセールス|チームで創る|6年以上': { title: '【HD】フィールドセールス リーダー候補（組織開発）', desc: '個人の成果だけでなく、チーム全体の営業ナレッジの共有や成約率向上を組織ぐるみで底上げする推進リーダー。', tags: ['ナレッジ共有', '組織開発', '営業マネジメント'], query: 'hd-fs-leader' },
  'フィールドセールス|成果報酬で稼ぐ|未経験・第二新卒': { title: '【Division 01】フィールドセールス（ハイキャリア候補）', desc: '成果が正当に評価されるインセンティブ制度のもと、医療マーケティング分野で早期のキャリアアップを目指せます。', tags: ['ハイキャリア', '成果還元', '医療業界'], query: 'd01-fs' },
  'フィールドセールス|成果報酬で稼ぐ|3〜5年': { title: '【HD】フィールドセールス メンバー（高歩合）', desc: '飲食店の売上アップ・集客課題を解決し、受注した実績が年収に直結する完全成果志向のフィールドセールス。', tags: ['インセンティブ充実', '高収入', '実力主義'], query: 'hd-fs' },
  'フィールドセールス|成果報酬で稼ぐ|6年以上': { title: '【HD】フィールドセールス リーダー候補（トッププレイヤー）', desc: '自身の高い営業力で成果を上げながら、チーム全体の達成ボーナスによる大きなリターンを得られる責任者。', tags: ['トッププレイヤー', 'ハイリターン', '営業幹部候補'], query: 'hd-fs-leader' },

  /* ── カスタマーサクセス ────────────────────── */
  'カスタマーサクセス|裁量大きく自走|未経験・第二新卒': { title: '【Division 01】カスタマーサクセス アシスタント', desc: 'クリニックのMEO運用や設定代行、マイナビ送客の原稿入稿管理など、医療機関の成功に自走して伴走する仕事です。', tags: ['医療マーケ', '未経験歓迎', 'サポート'], query: 'd01-cs' },
  'カスタマーサクセス|裁量大きく自走|3〜5年': { title: '【HD】カスタマーサクセス メンバー（専任担当）', desc: 'ホームページ制作からMEO運用、SaaS活用まで飲食店の成功体験をデザインし、顧客と伴走して課題解決をする役割です。', tags: ['顧客伴走', 'アップセル', '進行管理'], query: 'hd-cs' },
  'カスタマーサクセス|裁量大きく自走|6年以上': { title: '【HD】カスタマーサクセス リーダー候補', desc: '飲食店の継続率最大化に向けたCS戦略の策定、解約防止プロセスの設計、複数案件の進捗管理を行う責任者ポジション。', tags: ['CSリーダー', 'チャーンレート改善', '戦略設計'], query: 'hd-cs-leader' },
  'カスタマーサクセス|チームで創る|未経験・第二新卒': { title: '【Division 01】カスタマーサクセス メンバー', desc: 'チームで複数クリニックを分担サポートし、運用課題を共有しながら安定したサービス継続を目指すポジション。', tags: ['医療マーケ', 'チームワーク', '安定成長'], query: 'd01-cs' },
  'カスタマーサクセス|チームで創る|3〜5年': { title: '【HD】カスタマーサクセス メンバー（連携重視）', desc: '営業や制作チームと密に連携し、飲食店の期待値を超える納品とスムーズなオンボーディングを実現するCS担当です。', tags: ['オンボーディング', 'チーム連携', '顧客満足度'], query: 'hd-cs' },
  'カスタマーサクセス|チームで創る|6年以上': { title: '【HD】カスタマーサクセス リーダー候補（組織マネジメント）', desc: '制作・営業との連携体制の再設計や、CSメンバーのオンボーディング and 育成を担当する組織のマネージャー。', tags: ['組織マネジメント', 'プロセス改善', '採用連携'], query: 'hd-cs-leader' },
  'カスタマーサクセス|成果報酬で稼ぐ|未経験・第二新卒': { title: '【Division 01】カスタマーサクセス（成果連動モデル）', desc: '担当顧客のアップセル・クロスセル（追加施策提案）による利益から、高インセンティブを得られる仕事です。', tags: ['成果報酬', 'アップセル', '未経験OK'], query: 'd01-cs' },
  'カスタマーサクセス|成果報酬で稼ぐ|3〜5年': { title: '【Division 01】カスタマーサクセス スペシャリスト', desc: '高い顧客ロイヤルティを構築し、追加提案を通じて自社サービス全体の売上に貢献するCSのスペシャリスト。', tags: ['追加提案', 'ロイヤルティ', '高歩合'], query: 'd01-cs' },
  'カスタマーサクセス|成果報酬で稼ぐ|6年以上': { title: '【HD】カスタマーサクセス リーダー候補（リテンション責任）', desc: 'アップセル全体のインセンティブとチームの解約防止率を成果指標に持ち、事業貢献度の高いCS組織を創る責任者。', tags: ['リテンション責任', 'アップセル推進', '高報酬'], query: 'hd-cs-leader' },
};

/* ─────────────────────────────────────────────
   STATE (Redesigned Design System Version)
   ───────────────────────────────────────────── */
const diagState = {
  current: 1,
  answers: {},
};

// 選択状態を保持するオブジェクト
const diagSelected = {};

/* ─────────────────────────────────────────────
   INIT
   ───────────────────────────────────────────── */
function initDiagnostic() {
  diagState.current = 1;
  diagState.answers = {};
  for (let key in diagSelected) {
    delete diagSelected[key];
  }
  updateProgressBarNew(1);
}

/* ─────────────────────────────────────────────
   CARD OPTIONS HELPERS
   ───────────────────────────────────────────── */
function getOptionDescription(value) {
  switch (value) {
    // Step 1
    case 'インサイドセールス':
      return '見込み顧客に価値を届け、<br>商談を創出する';
    case 'フィールドセールス':
      return '顧客の課題を深く捉え、<br>最適な提案を実行する';
    case 'カスタマーサクセス':
      return '顧客の成功に伴走し、<br>長期的な価値を育てる';
    // Step 2
    case '裁量大きく自走':
      return '主体的に行動し、自身のアイデアや<br>判断でビジネスを推進する';
    case 'チームで創る':
      return '仲間とナレッジを共有し、協力して<br>大きな目標を達成する';
    case '成果報酬で稼ぐ':
      return '成果に正当な対価を求め、高い<br>モチベーションで目標に挑戦する';
    // Step 3
    case '未経験・第二新卒':
      return '新しい分野に挑戦し、基礎から<br>スキルを身につけて成長する';
    case '3〜5年':
      return 'これまでの経験を活かし、チームの<br>主戦力として活躍を広げる';
    case '6年以上':
      return '培った高い専門性とリーダーシップで、<br>組織の成長を牽引する';
    default:
      return '';
  }
}

/* ─────────────────────────────────────────────
   STEP RENDERING (DYNAMIC FOR STEPS 2, 3)
   ───────────────────────────────────────────── */
function renderStepNew(stepNum) {
  const stepEl = document.getElementById('diag-step-' + stepNum);
  if (!stepEl) return;

  const step = DIAG_STEPS[stepNum - 1];
  let stepIntroText = '';
  if (stepNum === 1) {
    stepIntroText = 'あなたの強みや志向に最もフィットする領域を選択してください。';
  } else if (stepNum === 2) {
    stepIntroText = '理想とする仕事の進め方や評価基準を選択してください。';
  } else if (stepNum === 3) {
    stepIntroText = 'これまでの実務経験やキャリアの段階を選択してください。';
  }

  stepEl.innerHTML = `
    <!-- ステップヘッダー（中央） -->
    <div class="text-center mb-12" style="padding-top: 10px;">
        <span style="font-family:'Poppins',sans-serif;font-size:0.75rem;font-weight:800;letter-spacing:0.4em;color:#FF5C00;display:block;margin-bottom:12px;">
            ${step.label.toUpperCase()}
        </span>
        <h3 style="font-family:'Noto Sans JP',sans-serif;font-size:clamp(2rem,4vw,3.2rem);font-weight:900;color:#1A2B4C;letter-spacing:-0.02em;">
            ${step.question}
        </h3>
        <p style="font-size:0.9rem;color:#777;margin-top:12px;font-weight:500;">
            ${stepIntroText}
        </p>
    </div>

    <!-- 選択カード 3枚 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        ${step.options.map(opt => `
        <div class="diag-option-card relative bg-white rounded-2xl p-10 flex flex-col items-center text-center border-2 border-gray-200 cursor-pointer transition-all duration-300 hover:border-[#FF5C00] hover:shadow-[0_0_0_3px_rgba(255,92,0,0.12)]"
            onclick="selectDiagnosticOption(${stepNum},'${opt.value}')"
            data-option="${opt.value}">
            <!-- 選択時チェックタブ（右上） -->
            <div class="diag-check-tab absolute top-0 right-0 w-10 h-10 bg-[#FF5C00] rounded-bl-xl rounded-tr-xl flex items-center justify-center opacity-0 transition-opacity duration-300">
                <i class="fa-solid fa-check text-white text-xs"></i>
            </div>
            <!-- スコープ装飾（左上小ドット） -->
            <div class="absolute top-5 left-5 w-2 h-2 rounded-full bg-[#FF5C00] opacity-40"></div>
            <!-- 略称 -->
            <span class="diag-abbr font-poppins font-black text-[#1A2B4C] transition-colors duration-300"
                style="font-size:clamp(3rem,6vw,5rem);letter-spacing:-0.04em;line-height:1;">${opt.icon}</span>
            <!-- オプション名 -->
            <span style="font-family:'Noto Sans JP',sans-serif;font-size:1rem;font-weight:700;color:#1A2B4C;margin-top:16px;">${opt.title}</span>
            <!-- 下線 -->
            <div class="diag-underline w-10 h-0.5 bg-gray-300 mt-2 mb-4 transition-colors duration-300"></div>
            <!-- 説明テキスト -->
            <p style="font-size:0.82rem;color:#666;line-height:1.7;font-weight:500;">
                ${getOptionDescription(opt.value)}
            </p>
        </div>
        `).join('')}
    </div>
  `;
}

/* ─────────────────────────────────────────────
   PROGRESS BAR UPDATING
   ───────────────────────────────────────────── */
function updateProgressBarNew(step) {
  const progressLine = document.getElementById('diag-progress-line');
  if (progressLine) {
    if (step === 1) progressLine.style.width = '0%';
    else if (step === 2) progressLine.style.width = '50%';
    else if (step === 3) progressLine.style.width = '100%';
  }

  for (let i = 1; i <= 3; i++) {
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

  // Hide old step
  fromEl.classList.add('opacity-0');
  setTimeout(() => {
    fromEl.classList.add('hidden');

    // Render next step dynamically if it's step 2 or 3
    if (toStep === 2 || toStep === 3) {
      renderStepNew(toStep);
    }

    // Restore previous selection style if it exists
    if (diagSelected['step' + toStep]) {
      selectDiagnosticOption(toStep, diagSelected['step' + toStep]);
    }

    // Show new step
    toEl.classList.remove('hidden');
    setTimeout(() => {
      toEl.classList.remove('opacity-0');
    }, 50);

    diagState.current = toStep;
    updateProgressBarNew(toStep);

    // Back button state styling (active above step 1, inactive/disabled at step 1)
    const backBtn = document.getElementById('diag-back');
    if (backBtn) {
      if (toStep > 1) {
        backBtn.style.opacity = '1';
        backBtn.style.pointerEvents = 'auto';
        backBtn.style.cursor = 'pointer';
      } else {
        backBtn.style.opacity = '0.4';
        backBtn.style.pointerEvents = 'none';
        backBtn.style.cursor = 'default';
      }
    }

    // Next button label
    const nextBtn = document.getElementById('diag-next');
    if (nextBtn) {
      if (toStep === 3) {
        nextBtn.innerHTML = `結果を見る <i class="fa-solid fa-arrow-right-long"></i>`;
      } else {
        nextBtn.innerHTML = `次へ <i class="fa-solid fa-arrow-right-long"></i>`;
      }
    }
  }, 300);
}

/* ─────────────────────────────────────────────
   CARD SELECTION INTERACTION
   ───────────────────────────────────────────── */
function selectDiagnosticOption(step, option) {
  diagSelected['step' + step] = option;

  const stepEl = document.getElementById('diag-step-' + step);
  if (!stepEl) return;

  stepEl.querySelectorAll('.diag-option-card').forEach(card => {
    card.style.borderColor = '#E5E7EB';
    card.style.boxShadow = '';

    const check = card.querySelector('.diag-check-tab');
    if (check) check.style.opacity = '0';

    const abbr = card.querySelector('.diag-abbr');
    if (abbr) abbr.style.color = '#1A2B4C';

    const underline = card.querySelector('.diag-underline');
    if (underline) underline.style.backgroundColor = '#D1D5DB';
  });

  const selected = stepEl.querySelector(`[data-option="${option}"]`);
  if (!selected) return;

  selected.style.borderColor = '#FF5C00';
  selected.style.boxShadow = '0 0 0 3px rgba(255,92,0,0.15)';

  const check = selected.querySelector('.diag-check-tab');
  if (check) check.style.opacity = '1';

  const abbr = selected.querySelector('.diag-abbr');
  if (abbr) abbr.style.color = '#FF5C00';

  const underline = selected.querySelector('.diag-underline');
  if (underline) underline.style.backgroundColor = '#FF5C00';
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
  if (currentStep <= 1 || currentStep >= 4) return;

  switchDiagStep(currentStep, currentStep - 1);
}
window.diagGoBack = diagGoBack;

function resetDiagnostic() {
  diagState.answers = {};
  for (let key in diagSelected) {
    delete diagSelected[key];
  }

  const step4El = document.getElementById('diag-step-4');
  const step1El = document.getElementById('diag-step-1');
  const footerEl = document.getElementById('diag-footer');

  if (step4El) {
    step4El.classList.add('opacity-0');
  }

  setTimeout(() => {
    if (step4El) step4El.classList.add('hidden');

    const step2El = document.getElementById('diag-step-2');
    const step3El = document.getElementById('diag-step-3');
    if (step2El) {
      step2El.innerHTML = '';
      step2El.classList.add('hidden', 'opacity-0');
    }
    if (step3El) {
      step3El.innerHTML = '';
      step3El.classList.add('hidden', 'opacity-0');
    }

    if (step1El) {
      step1El.querySelectorAll('.diag-option-card').forEach(card => {
        card.style.borderColor = '#E5E7EB';
        card.style.boxShadow = '';
        const check = card.querySelector('.diag-check-tab');
        if (check) check.style.opacity = '0';
        const abbr = card.querySelector('.diag-abbr');
        if (abbr) abbr.style.color = '#1A2B4C';
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
    const backBtn = document.getElementById('diag-back');
    if (backBtn) {
      backBtn.style.opacity = '0.4';
      backBtn.style.pointerEvents = 'none';
      backBtn.style.cursor = 'default';
    }

    const nextBtn = document.getElementById('diag-next');
    if (nextBtn) nextBtn.innerHTML = `次へ <i class="fa-solid fa-arrow-right-long"></i>`;

    diagState.current = 1;
    updateProgressBarNew(1);
  }, 300);
}
window.resetDiagnostic = resetDiagnostic;

/* ─────────────────────────────────────────────
   RESULT SCREEN
   ───────────────────────────────────────────── */
function showDiagResultNew() {
  const key = [diagState.answers[1], diagState.answers[2], diagState.answers[3]].join('|');
  const result = DIAG_RESULTS[key] || {
    title: 'カスタムポジション',
    desc: 'あなたのプロフィールに合わせた特別なポジションをご用意します。まずはカジュアル面談からご応募ください。',
    tags: ['要相談', 'カスタムポジション', 'カジュアル面談歓迎'],
    query: '',
  };

  const route = DIVISION_ROUTES[key] || { page: 'service-division1.html', anchor: '', divisionLabel: 'Division 01 / インサイドセールス' };
  const divMeta = DIVISION_META[route.page] || DIVISION_META['service-division1.html'];

  const step3El = document.getElementById('diag-step-3');
  const step4El = document.getElementById('diag-step-4');
  const footerEl = document.getElementById('diag-footer');

  if (!step3El || !step4El) return;

  step3El.classList.add('opacity-0');
  if (footerEl) {
    footerEl.classList.add('hidden');
  }

  setTimeout(() => {
    step3El.classList.add('hidden');

    step4El.innerHTML = buildResultHTML(result, key, route, divMeta);

    step4El.classList.remove('hidden');
    setTimeout(() => {
      step4El.classList.remove('opacity-0');
    }, 50);

    diagState.current = 4;

    step4El.querySelectorAll('.result-tag').forEach((tag, i) => {
      tag.style.opacity = '0';
      tag.style.transform = 'translateY(8px)';
      setTimeout(() => {
        tag.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        tag.style.opacity = '1';
        tag.style.transform = 'translateY(0)';
      }, 300 + i * 80);
    });
  }, 300);
}

function buildResultHTML(result, key, route, divMeta) {
  const params = new URLSearchParams({
    role: diagState.answers[1] || '',
    style: diagState.answers[2] || '',
    exp: diagState.answers[3] || '',
    pos: result.query || '',
  });
  const jobsURL = `jobs.html?${params.toString()}`;

  const serviceURL = route.anchor ? `${route.page}#${route.anchor}` : route.page;

  const tagsHTML = result.tags.map(tag => `
    <span class="result-tag" style="display:inline-block;background:#1A2B4C;color:#fff;font-family:'Poppins',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.15em;padding:6px 18px;border-radius:99px;">${tag}</span>
  `).join('');

  const answerChips = [1, 2, 3].map(n => {
    const val = diagState.answers[n];
    if (!val) return '';
    const step = DIAG_STEPS[n - 1];
    const opt = step.options.find(o => o.value === val);
    return `<span style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,92,0,0.1);border:1px solid rgba(255,92,0,0.25);color:#E65200;font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.15em;padding:4px 12px;border-radius:99px;">${opt ? opt.icon : ''} ${val}</span>`;
  }).join('');

  return `
    <div style="display:flex;flex-direction:column;gap:2rem;animation:diagFadeUp 0.5s ease both;">
      <style>
        @keyframes diagFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      </style>

      <!-- Match badge + answer chips -->
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <span style="display:inline-flex;align-items:center;gap:8px;background:#FF5C00;color:#fff;font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;padding:5px 18px;border-radius:99px;">
          ✦ Your Match
        </span>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">${answerChips}</div>
      </div>

      <!-- Title + description -->
      <div>
        <h3 style="font-family:'Poppins',sans-serif;font-size:clamp(1.6rem,4vw,2.8rem);font-weight:900;color:#1A2B4C;letter-spacing:-0.04em;line-height:1.1;margin-bottom:1rem;">${result.title}</h3>
        <p style="font-family:'Noto Sans JP',sans-serif;font-size:0.9rem;color:#555;line-height:1.9;font-weight:500;border-left:3px solid #FF5C00;padding-left:1.25rem;max-width:560px;">${result.desc}</p>
      </div>

      <!-- Tags -->
      <div style="display:flex;flex-wrap:wrap;gap:10px;">${tagsHTML}</div>

      <!-- ★ Division card ★ -->
      <div style="
        background:${divMeta.bg};
        border:1.5px solid ${divMeta.color}30;
        border-radius:16px;
        padding:1.5rem 1.75rem;
        display:flex;
        align-items:center;
        justify-content:space-between;
        flex-wrap:wrap;
        gap:1rem;
      ">
        <div style="display:flex;align-items:center;gap:14px;">
          <span style="font-size:2rem;line-height:1;">${divMeta.icon}</span>
          <div>
            <p style="font-family:'Poppins',sans-serif;font-size:11px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:${divMeta.color};margin-bottom:3px;">${divMeta.name}</p>
            <p style="font-family:'Noto Sans JP',sans-serif;font-size:13px;font-weight:700;color:#333;">${divMeta.sub}</p>
            <p style="font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;color:#888;margin-top:3px;letter-spacing:0.1em;">${route.divisionLabel}</p>
          </div>
        </div>
        <a href="${serviceURL}"
           style="
             display:inline-flex;align-items:center;gap:8px;
             background:${divMeta.color};color:#fff;
             font-family:'Poppins',sans-serif;font-size:10px;font-weight:800;
             letter-spacing:0.25em;text-transform:uppercase;
             padding:0.75rem 1.75rem;border-radius:9999px;
             text-decoration:none;
             box-shadow:0 8px 24px ${divMeta.color}40;
             transition:all 0.2s ease;white-space:nowrap;
           "
           onmouseover="this.style.transform='translateY(-2px)';this.style.opacity='0.9'"
           onmouseout="this.style.transform='';this.style.opacity='1'">
          事業部詳細を見る <i class="fa-solid fa-arrow-right" style="font-size:9px;"></i>
        </a>
      </div>

      <!-- CTA row -->
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding-top:0.25rem;">
        <a href="${serviceURL}"
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
          このポジションに応募する
          <i class="fa-solid fa-arrow-right-long"></i>
        </a>
        <a href="${jobsURL}"
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
          全ポジションを見る
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