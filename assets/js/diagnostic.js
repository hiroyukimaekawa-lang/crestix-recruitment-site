/* ══════════════════════════════════════════════════════════════
   Crestix Careers - High-Fidelity Diagnostic Logic (LayerX Style)
   ══════════════════════════════════════════════════════════════ */

let diagnosticAnswers = { step1: '', step2: '', step3: '' };
let currentDiagStep = 1;

const pJobData = {
    'ビジネス_中途（キャリア）_成長・速度': { title: 'Sales Agency / パートナーセールスマネージャー', desc: '急拡大中の営業代行組織において、新規開拓からチームビルディングまで圧倒的スピードで主導するリーダーポジション。' },
    'ビジネス_中途（キャリア）_人の力・伴走': { title: 'MeRaise / アカウントパートナー', desc: '企業の採用課題に深く入り込み、若手人材とクライアントの「最も納得のいくマッチング」をデザインします。' },
    'グロースマーケ_中途（キャリア）_テクノロジー': { title: 'Web Advertising / 統括グロースマーケター', desc: 'Google/Meta/YouTube等の媒体最適化をハックする精鋭マーケチームの総責任者。論理的なアプローチで最大成果を築きます。' },
    'コーポレート_中途（キャリア）_人の力・伴走': { title: '組織開発人事（HRビジネスパートナー）', desc: '学生の強みを引き出すキャリア教育事業や全社採用の総指揮。個別カウンセリング、全社HRの評価制度設計などを主導します。' }
};

const defaultJobData = { title: 'Crestix / チャレンジング・オープンポジション', desc: 'ご経験と志向に合わせて、Sales Agency・MeRaise、またはWeb領域など、最適なポジションをカジュアル面談ですり合わせましょう。' };

function selectDiagnosticOption(step, value) {
    diagnosticAnswers[`step${step}`] = value;
    if (step < 3) {
        renderDiagStep(step + 1);
    } else {
        showDiagnosticResult();
    }
}

function renderDiagStep(step) {
    const currentEl = document.getElementById(`diag-step-${currentDiagStep}`);
    const nextEl = document.getElementById(`diag-step-${step}`);
    
    let content = '';
    if (step === 2) {
        content = `
            <div class="text-center space-y-6"><span class="text-[12px] font-black text-crestix-orange font-poppins tracking-[0.5em] uppercase block">Phase 02 / Career Stage</span><h3 class="text-5xl lg:text-6xl font-black text-crestix-charcoal tracking-tighter">希望するキャリア形態</h3></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div class="diag-option bg-white hover:shadow-orange-glow border border-crestix-border rounded-[2.5rem] p-16 cursor-pointer transition-all duration-700 text-center flex flex-col justify-center min-h-[300px] group border-b-[12px] border-b-gray-100 hover:border-crestix-orange" onclick="selectDiagnosticOption(2, '中途（キャリア）')">
                    <span class="text-4xl font-black text-crestix-charcoal group-hover:text-crestix-orange transition-colors tracking-tight">キャリア採用</span>
                    <p class="text-[11px] text-gray-400 mt-10 leading-loose font-black tracking-[0.25em] uppercase opacity-50 group-hover:opacity-100">Professional Hire</p>
                </div>
                <div class="diag-option bg-white hover:shadow-orange-glow border border-crestix-border rounded-[2.5rem] p-16 cursor-pointer transition-all duration-700 text-center flex flex-col justify-center min-h-[300px] group border-b-[12px] border-b-gray-100 hover:border-crestix-orange" onclick="selectDiagnosticOption(2, '第二新卒')">
                    <span class="text-4xl font-black text-crestix-charcoal group-hover:text-crestix-orange transition-colors tracking-tight">第二新卒</span>
                    <p class="text-[11px] text-gray-400 mt-10 leading-loose font-black tracking-[0.25em] uppercase opacity-50 group-hover:opacity-100">Potential / Junior</p>
                </div>
                <div class="diag-option bg-white hover:shadow-orange-glow border border-crestix-border rounded-[2.5rem] p-16 cursor-pointer transition-all duration-700 text-center flex flex-col justify-center min-h-[300px] group border-b-[12px] border-b-gray-100 hover:border-crestix-orange" onclick="selectDiagnosticOption(2, '新卒・インターン')">
                    <span class="text-4xl font-black text-crestix-charcoal group-hover:text-crestix-orange transition-colors tracking-tight">新卒・学生</span>
                    <p class="text-[11px] text-gray-400 mt-10 leading-loose font-black tracking-[0.25em] uppercase opacity-50 group-hover:opacity-100">New Grad / Intern</p>
                </div>
            </div>
        `;
    } else if (step === 3) {
        content = `
            <div class="text-center space-y-6"><span class="text-[12px] font-black text-crestix-orange font-poppins tracking-[0.5em] uppercase block">Phase 03 / Stance</span><h3 class="text-5xl lg:text-6xl font-black text-crestix-charcoal tracking-tighter">重視するスタンス</h3></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div class="diag-option bg-white hover:shadow-orange-glow border border-crestix-border rounded-[2.5rem] p-16 cursor-pointer transition-all duration-700 text-center flex flex-col justify-center min-h-[300px] group border-b-[12px] border-b-gray-100 hover:border-crestix-orange" onclick="selectDiagnosticOption(3, '成長・速度')">
                    <span class="text-4xl font-black text-crestix-charcoal group-hover:text-crestix-orange transition-colors tracking-tight">無限の挑戦心</span>
                    <p class="text-[11px] text-gray-400 mt-10 leading-loose font-black tracking-[0.25em] uppercase opacity-50 group-hover:opacity-100">Growth & Speed</p>
                </div>
                <div class="diag-option bg-white hover:shadow-orange-glow border border-crestix-border rounded-[2.5rem] p-16 cursor-pointer transition-all duration-700 text-center flex flex-col justify-center min-h-[300px] group border-b-[12px] border-b-gray-100 hover:border-crestix-orange" onclick="selectDiagnosticOption(3, '人の力・伴走')">
                    <span class="text-4xl font-black text-crestix-charcoal group-hover:text-crestix-orange transition-colors tracking-tight">人の想いと伴走</span>
                    <p class="text-[11px] text-gray-400 mt-10 leading-loose font-black tracking-[0.25em] uppercase opacity-50 group-hover:opacity-100">Co-Creation / HR</p>
                </div>
                <div class="diag-option bg-white hover:shadow-orange-glow border border-crestix-border rounded-[2.5rem] p-16 cursor-pointer transition-all duration-700 text-center flex flex-col justify-center min-h-[300px] group border-b-[12px] border-b-gray-100 hover:border-crestix-orange" onclick="selectDiagnosticOption(3, 'テクノロジー')">
                    <span class="text-4xl font-black text-crestix-charcoal group-hover:text-crestix-orange transition-colors tracking-tight">仕組みの構築</span>
                    <p class="text-[11px] text-gray-400 mt-10 leading-loose font-black tracking-[0.25em] uppercase opacity-50 group-hover:opacity-100">Tech & Logic</p>
                </div>
            </div>
        `;
    }

    if (nextEl) {
        nextEl.innerHTML = content;
        currentEl.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            currentEl.classList.add('hidden');
            nextEl.classList.remove('hidden');
            setTimeout(() => {
                nextEl.classList.remove('opacity-0', 'scale-95');
                currentDiagStep = step;
                updateDiagUI();
            }, 50);
        }, 400);
    }
}

function showDiagnosticResult() {
    const currentEl = document.getElementById(`diag-step-${currentDiagStep}`);
    const resultEl = document.getElementById('diag-step-4');
    
    const matchKey = `${diagnosticAnswers.step1}_${diagnosticAnswers.step2}_${diagnosticAnswers.step3}`;
    const jobMatch = pJobData[matchKey] || defaultJobData;

    document.getElementById('diag-result-job-title').innerText = jobMatch.title;
    document.getElementById('diag-result-job-desc').innerText = jobMatch.desc;

    currentEl.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        currentEl.classList.add('hidden');
        resultEl.classList.remove('hidden');
        setTimeout(() => {
            resultEl.classList.remove('opacity-0', 'scale-95');
            currentDiagStep = 4;
            updateDiagUI();
        }, 50);
    }, 400);
}

function restartDiagnostic() {
    const currentEl = document.getElementById(`diag-step-${currentDiagStep}`);
    const firstEl = document.getElementById('diag-step-1');
    diagnosticAnswers = { step1: '', step2: '', step3: '' };

    currentEl.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        currentEl.classList.add('hidden');
        for(let i=2; i<=4; i++) {
            const el = document.getElementById(`diag-step-${i}`);
            if(el) el.classList.add('hidden', 'opacity-0');
        }
        firstEl.classList.remove('hidden');
        setTimeout(() => {
            firstEl.classList.remove('opacity-0', 'scale-95');
            currentDiagStep = 1;
            updateDiagUI();
        }, 50);
    }, 400);
}

function prevDiagnosticStep() {
    if (currentDiagStep <= 1) return;
    renderDiagStep(currentDiagStep - 1);
}

function updateDiagUI() {
    const progressText = document.getElementById('diagnostic-progress-text');
    const backBtn = document.getElementById('diag-back');
    const labels = ["Domain", "Career", "Mindset", "Result"];
    
    if (progressText) progressText.innerText = `${currentDiagStep}/4 ${labels[currentDiagStep-1]}`;
    if (backBtn) {
        if (currentDiagStep > 1 && currentDiagStep < 4) backBtn.classList.remove('hidden');
        else backBtn.classList.add('hidden');
    }

    for (let i = 1; i <= 4; i++) {
        const pbar = document.getElementById(`pbar-${i}`);
        if (pbar) {
            if (i <= currentDiagStep) {
                pbar.className = "w-12 h-2.5 rounded-full bg-crestix-orange transition-all duration-700 shadow-lg shadow-orange-200";
            } else {
                pbar.className = "w-3 h-2.5 rounded-full bg-gray-100 transition-all duration-700";
            }
        }
    }
}

// Bind reset to button
window.addEventListener('DOMContentLoaded', () => {
    const restartBtn = document.getElementById('diag-restart');
    if (restartBtn) restartBtn.addEventListener('click', restartDiagnostic);
    const backBtn = document.getElementById('diag-back');
    if (backBtn) backBtn.addEventListener('click', prevDiagnosticStep);
});

// Global exposure
window.selectDiagnosticOption = selectDiagnosticOption;
window.restartDiagnostic = restartDiagnostic;
window.prevDiagnosticStep = prevDiagnosticStep;
