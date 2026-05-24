/* ══════════════════════════════════════════════════════════════
   Crestix Careers - High-Fidelity Modal & Architecture Logic
   ══════════════════════════════════════════════════════════════ */

const businessDetailsData = {
    'sales': {
        category: 'Market Hack / Sales',
        title: 'Sales Agency — 営業代行事業 —',
        catch: 'テクノロジー×マーケティングの力で、売れる仕組みを',
        desc: 'SaaS・IT業界に特化した営業代行サービスで、貴社の商談獲得から受注拡大までを一貫して支援します。属人的な営業から脱却し、データとマーケティングを駆使した再現性の高いセールスプロセスを構築。クライアントの事業成長を最短距離で牽引します。'
    },
    'meraise': {
        category: 'Co-Creation / HR Tech',
        title: 'MeRaise — 新卒特化HR事業 —',
        catch: 'ハタラ"苦"をハタ"楽"に。就活ミスマッチの打破。',
        desc: '入社前と入社後のギャップをなくし、MeRaiseはミスマッチをなくす就活×採用の支援をします。表面的な条件だけでなく、企業と学生の「本質的な価値観（スタンス）」をマッチングさせることで、早期離職を防ぎ、両者が幸せに働ける社会を実装します。'
    },
    'webcreate': {
        category: 'Creative / Digital',
        title: 'Web Creation — HP制作事業 —',
        catch: 'ビジネスを“伝わる”形へ',
        desc: '企画・デザイン・構築まで一気通貫で対応。ブランド価値を高めるデザインと運用しやすい構成で貴社のオンライン戦略を強力に支援。マーケティング視点を持ったクリエイティブを提供します。'
    },
    'webad': {
        category: 'Performance / Growth',
        title: 'Web Advertising — Web広告事業 —',
        catch: 'データとクリエイティブで、最適な approach を',
        desc: 'ターゲットに合わせたWeb広告の戦略設計から運用まで。費用対効果を最大化し、貴社のビジネス成長を加速させます。'
    },
    'freelance': {
        category: 'Platform / Independence',
        title: 'Freelance Support — フリーランス促進事業 —',
        catch: '自由な働き方を、確かなカタチに',
        desc: '独立を希望するプロフェッショナルを全面サポート。案件紹介から契約・スキルアップ支援まで、個人の可能性を最大限に引き出すプラットフォームです。'
    }
};

const modalSystem = {
    open(id) {
        this.closeAll();
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('hidden', 'modal-hidden');
            modal.classList.add('flex');
            const scrollArea = modal.querySelector('.overflow-y-auto');
            if (scrollArea) scrollArea.scrollTop = 0;
            this.injectSharedLayout(modal);
        }
    },
    
    closeAll() {
        const modals = ['corporate-modal', 'ceo-letter-modal', 'mvv-modal', 'business-modal', 'business-detail-modal', 'people-modal', 'jobs-modal', 'contact-modal'];
        modals.forEach(id => {
            const el = document.getElementById(id);
            if(el && !el.classList.contains('hidden')) {
                el.classList.add('modal-hidden');
                setTimeout(() => {
                    if (el.classList.contains('modal-hidden')) {
                        el.classList.add('hidden');
                        el.classList.remove('flex');
                        el.classList.remove('modal-hidden');
                    }
                }, 500);
            }
        });
    },

    openBusinessDetail(key) {
        const data = businessDetailsData[key];
        if(!data) return;
        document.getElementById('bdetail-category').innerText = data.category;
        document.getElementById('bdetail-title').innerText = data.title;
        document.getElementById('bdetail-catch').innerText = data.catch;
        document.getElementById('bdetail-desc').innerText = data.desc;
        this.open('business-detail-modal');
    },

    injectSharedLayout(modal) {
        const wrapper = modal.querySelector('.flex-content-wrapper') || modal.querySelector('.overflow-y-auto');
        if (!wrapper || wrapper.querySelector('.shared-footer-injected')) return;
        
        const template = document.getElementById('shared-subpage-footer-template');
        if (template) {
            wrapper.appendChild(template.content.cloneNode(true));
        }
    }
};

// Global Exports
window.openCorporateModal = () => modalSystem.open('corporate-modal');
window.openBusinessModal = () => modalSystem.open('business-modal');
window.openPeopleModal = () => modalSystem.open('people-modal');
window.openJobsModal = () => modalSystem.open('jobs-modal');
window.openContactModal = () => modalSystem.open('contact-modal');
window.openCeoLetterModal = () => modalSystem.open('ceo-letter-modal');
window.openMvvModal = () => modalSystem.open('mvv-modal');
window.openBusinessDetailModal = (key) => modalSystem.openBusinessDetail(key);
window.closeAllModals = () => modalSystem.closeAll();
window.closeAllAndOpenJobs = () => { modalSystem.closeAll(); setTimeout(() => modalSystem.open('jobs-modal'), 550); };

// Event Bindings
window.addEventListener('DOMContentLoaded', () => {
    // Dashboard & Sidebar
    const sidebarItems = [
        { id: 'nav-hero', action: () => window.scrollToSection('sec-hero') },
        { id: 'nav-diag', action: () => window.scrollToSection('sec-diagnostic') },
        { id: 'nav-hub', action: () => window.scrollToSection('sec-site-contents') },
        { id: 'nav-works', action: () => window.scrollToSection('sec-youtube-carousel') },
        { id: 'sidebar-corp', action: window.openCorporateModal },
        { id: 'sidebar-biz', action: window.openBusinessModal },
        { id: 'sidebar-people', action: window.openPeopleModal },
        { id: 'sidebar-jobs', action: window.openJobsModal }
    ];
    sidebarItems.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) el.addEventListener('click', item.action);
    });

    // Class Triggers
    const classBinds = [
        { cls: 'nav-corp-trigger', action: window.openCorporateModal },
        { cls: 'nav-biz-trigger', action: window.openBusinessModal },
        { cls: 'nav-people-trigger', action: window.openPeopleModal },
        { cls: 'nav-works-trigger', action: () => window.scrollToSection('sec-youtube-carousel') },
        { cls: 'jobs-modal-trigger', action: window.openJobsModal }
    ];
    classBinds.forEach(b => {
        document.querySelectorAll('.' + b.cls).forEach(el => el.addEventListener('click', b.action));
    });

    // Inner Modal Triggers
    const binds = [
        { id: 'btn-open-ceo', action: window.openCeoLetterModal },
        { id: 'btn-open-mvv', action: window.openMvvModal },
        { id: 'btn-back-to-corp', action: window.openCorporateModal },
        { id: 'btn-back-to-corp-mvv', action: window.openCorporateModal },
        { id: 'btn-back-to-biz', action: window.openBusinessModal },
        { id: 'footer-contact-btn', action: window.openContactModal }
    ];
    binds.forEach(b => {
        const el = document.getElementById(b.id);
        if (el) el.addEventListener('click', b.action);
    });

    // Business domain triggers
    document.querySelectorAll('.biz-detail-trigger').forEach(el => {
        el.addEventListener('click', () => window.openBusinessDetailModal(el.getAttribute('data-biz-key')));
    });

    // Close buttons & Global
    document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', window.closeAllModals));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.closeAllModals(); });
});
