/* Crestix Recruitment Site - Diagnostic Logic */

let diagnosticAnswers = { step1: '', step2: '', step3: '' };
let currentDiagStep = 1;

const pJobData = {
    'ビジネス_中途（キャリア）_成長・速度': { title: 'Sales Agency / パートナーセールスマネージャー', desc: '急拡大中の営業代行組織において、新規開拓からチームビルディングまでを圧倒的スピードで主導する中途特化ポジションです。' },
    'ビジネス_中途（キャリア）_人の力・伴走': { title: 'MeRaise / アカウントパートナー', desc: '企業の採用課題に深く入り込み、若手人材とクライアント企業の両者にとって「最も納得のいくマッチング」をデザインします。' },
    'ビジネス_第二新卒_成長・速度': { title: 'Web Advertising / クライアントサクセス（ジュニア）', desc: '社会人経験をアドバンテージに、Crestixのコアバリューである圧倒的速度を体現。営業の第一線で実務の打席に立ち続けます。' },
    'ビジネス_新卒・インターン_成長・速度': { title: '新規事業開発 / オープンポジション・インターン', desc: '年次に関わらず即戦力。まずはセールス・広報の第一線に混ざり、新規の仕組みを一緒にハックして創り出していく超実践型です。' },
    'グロースマーケ_中途（キャリア）_テクノロジー': { title: 'Web Advertising / 統括グロースマーケター', desc: 'Google/Meta/YouTube等の最適化をハックする精鋭マーケチームの総責任者。論理的なアプローチで最大成果を築きます。' },
    'グロースマーケ_第二新卒_成長・速度': { title: 'Web Creation / Webディレクター（アソシエイト）', desc: 'ビジネスを「伝わる」形にする制作ディレクション業務。クライアント企業のオンライン戦略を最高速度で形にします。' },
    'コーポレート_中途（キャリア）_人の力・伴走': { title: '組織開発人事（HRビジネスパートナー）', desc: '学生の強みを引き出すキャリア教育事業や全社採用の総指揮。個別カウンセリング、全社HRの評価制度設計などを主導します。' },
    'コーポレート_新卒・インターン_人の力・伴走': { title: 'Freelance Support / エージェントアシスタント', desc: 'フリーランスとして活躍したい方々と同じ目線に立って、案件紹介やスキルアップ支援に伴走するエージェント業務。' }
};

const defaultJobData = { title: 'Crestix / チャレンジング・オープンポジション', desc: 'ご経験と志向に合わせて、Sales Agency・MeRaise、またはWeb領域など、最適なポジションをカジュアル面談ですり合わせましょう。' };

function selectDiagnosticOption(step, value) {
    diagnosticAnswers[`step${step}`] = value;
    if (step < 3) {
        nextDiagnosticStep();
    } else {
        showDiagnosticResult();
    }
}

function nextDiagnosticStep() {
    if (currentDiagStep >= 3) return;
    const currentEl = document.getElementById(`diag-step-${currentDiagStep}`);
    currentDiagStep++;
    const nextEl = document.getElementById(`diag-step-${currentDiagStep}`);
    
    if (currentEl && nextEl) {
        currentEl.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            currentEl.classList.add('hidden');
            nextEl.classList.remove('hidden');
            setTimeout(() => {
                nextEl.classList.remove('opacity-0', 'scale-95');
                updateDiagnosticFooter();
            }, 50);
        }, 300);
    }
}

function prevDiagnosticStep() {
    if (currentDiagStep <= 1) return;
    const currentEl = document.getElementById(`diag-step-${currentDiagStep}`);
    currentDiagStep--;
    const prevEl = document.getElementById(`diag-step-${currentDiagStep}`);
    
    if (currentEl && prevEl) {
        currentEl.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            currentEl.classList.add('hidden');
            prevEl.classList.remove('hidden');
            setTimeout(() => {
                prevEl.classList.remove('opacity-0', 'scale-95');
                updateDiagnosticFooter();
            }, 50);
        }, 300);
    }
}

function restartDiagnostic() {
    const currentEl = document.getElementById(`diag-step-${currentDiagStep}`);
    currentDiagStep = 1;
    diagnosticAnswers = { step1: '', step2: '', step3: '' };
    const firstEl = document.getElementById('diag-step-1');

    if (currentEl && firstEl) {
        currentEl.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            currentEl.classList.add('hidden');
            for (let i = 2; i <= 4; i++) {
                const target = document.getElementById(`diag-step-${i}`);
                if (target) target.classList.add('hidden', 'opacity-0');
            }
            firstEl.classList.remove('hidden');
            setTimeout(() => {
                firstEl.classList.remove('opacity-0', 'scale-100');
                updateDiagnosticFooter();
            }, 50);
        }, 300);
    }
}

function showDiagnosticResult() {
    const currentEl = document.getElementById('diag-step-3');
    currentDiagStep = 4;
    const resultEl = document.getElementById('diag-step-4');

    const sel1 = document.getElementById('diag-sel-1');
    const sel2 = document.getElementById('diag-sel-2');
    const sel3 = document.getElementById('diag-sel-3');
    if (sel1) sel1.innerText = diagnosticAnswers.step1;
    if (sel2) sel2.innerText = diagnosticAnswers.step2;
    if (sel3) sel3.innerText = diagnosticAnswers.step3;

    const matchKey = `${diagnosticAnswers.step1}_${diagnosticAnswers.step2}_${diagnosticAnswers.step3}`;
    const jobMatch = pJobData[matchKey] || defaultJobData;

    const resTitle = document.getElementById('diag-result-job-title');
    const resDesc = document.getElementById('diag-result-job-desc');
    if (resTitle) resTitle.innerText = jobMatch.title;
    if (resDesc) resDesc.innerText = jobMatch.desc;

    if (currentEl && resultEl) {
        currentEl.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            currentEl.classList.add('hidden');
            resultEl.classList.remove('hidden');
            setTimeout(() => {
                resultEl.classList.remove('opacity-0', 'scale-95');
                updateDiagnosticFooter();
            }, 50);
        }, 300);
    }
}

function updateDiagnosticFooter() {
    const footerText = document.getElementById('diagnostic-progress-text');
    const backBtn = document.getElementById('diag-back');

    for (let i = 1; i <= 4; i++) {
        const pbar = document.getElementById(`pbar-${i}`);
        if (pbar) {
            if (i <= currentDiagStep) {
                pbar.className = "w-3 h-1 rounded-full bg-[#FF5C00] transition-all";
            } else {
                pbar.className = "w-1.5 h-1 rounded-full bg-gray-200 transition-all";
            }
        }
    }

    if (footerText && backBtn) {
        if (currentDiagStep === 1) {
            footerText.innerText = "1/4 職種領域の選別";
            backBtn.classList.add('hidden');
        } else if (currentDiagStep === 2) {
            footerText.innerText = "2/4 希望するキャリア形態";
            backBtn.classList.remove('hidden');
        } else if (currentDiagStep === 3) {
            footerText.innerText = "3/4 最も惹かれる行動規範";
            backBtn.classList.remove('hidden');
        } else if (currentDiagStep === 4) {
            footerText.innerText = "4/4 診断結果の提案";
            backBtn.classList.remove('hidden');
        }
    }
}

// Event Bindings
window.addEventListener('DOMContentLoaded', () => {
    // Diagnostic options
    document.querySelectorAll('.diag-option').forEach(el => {
        el.addEventListener('click', () => {
            const step = parseInt(el.getAttribute('data-diag-step'));
            const val = el.getAttribute('data-diag-val');
            selectDiagnosticOption(step, val);
        });
    });

    const restartBtn = document.getElementById('diag-restart');
    if(restartBtn) restartBtn.addEventListener('click', restartDiagnostic);

    const backBtn = document.getElementById('diag-back');
    if(backBtn) backBtn.addEventListener('click', prevDiagnosticStep);
});
