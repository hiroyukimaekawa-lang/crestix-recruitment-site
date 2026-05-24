/* Crestix Recruitment Site - Modal & Layout Logic */

const businessDetailsData = {
    'sales': {
        category: 'Sales Agency（営業代行事業）',
        title: 'Sales Agency — 営業代行事業 —',
        catch: 'テクノロジー×マーケティングの力で、売れる仕組みを',
        desc: 'SaaS・IT業界に特化した営業代行サービスで、貴社の商談獲得から受注拡大までを一貫して支援します。属人的な営業から脱却し、データとマーケティングを駆使した再現性の高いセールスプロセスを構築。クライアントの事業成長を最短距離で牽引します。'
    },
    'meraise': {
        category: 'MeRaise（新卒領域特化HR事業）',
        title: 'MeRaise — 新卒領域特化HR事業 —',
        catch: 'ハタラ"苦"をハタ"楽"に',
        desc: '入社前と入社後のギャップをなくし、MeRaiseはミスマッチをなくす就活×採用の支援をします。表面的なスキルや条件だけではない、企業と学生の「本質的な価値観（スタンス）」をマッチングさせることで、早期離職を防ぎ、両者が幸せに働ける社会を実装します。'
    },
    'webcreate': {
        category: 'Web Creation（HP制作事業）',
        title: 'Web Creation — HP制作事業 —',
        catch: 'ビジネスを“伝わる”形へ',
        desc: '企画・デザイン・構築まで一気通貫で対応し「成果につながる」ホームページを制作します。ブランド価値を高めるデザインと、運用しやすい構成で貴社のオンライン戦略を強力に支援。マーケティング視点を持ったクリエイティブを提供します。'
    },
    'webad': {
        category: 'Web Advertising（Web広告事業）',
        title: 'Web Advertising — Web広告事業 —',
        catch: 'データとクリエイティブで、最適な approach を',
        desc: 'ターゲットに合わせたWeb広告の戦略設計から運用までをトータルサポート。費用対効果を最大化し、貴社のビジネス成長を加速させます。'
    },
    'freelance': {
        category: 'Freelance Support（フリーランス促進事業）',
        title: 'Freelance Support — フリーランス促進事業 —',
        catch: '自由な働き方を、確かなカタチに',
        desc: 'フリーランスとして活躍したい方を全面サポート。優良な案件紹介から契約回りのサポート、さらなる市場価値を高めるためのスキルアップ支援まで、安心して独立・活躍できる環境を提供します。個人の可能性を最大限に引き出す、新しい働き方のプラットフォームです。'
    }
};

const modalSystem = {
    open(id) {
        this.closeAll();
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            // Reset scroll
            const scrollArea = modal.querySelector('.overflow-y-auto');
            if (scrollArea) scrollArea.scrollTop = 0;
        }
    },
    closeAll() {
        const modals = ['corporate-modal', 'ceo-letter-modal', 'mvv-modal', 'business-modal', 'business-detail-modal', 'people-modal', 'jobs-modal', 'contact-modal'];
        modals.forEach(id => {
            const el = document.getElementById(id);
            if(el) { el.classList.add('hidden'); el.classList.remove('flex'); }
        });
    },
    openBusinessDetail(key) {
        const data = businessDetailsData[key];
        if(!data) return;
        const bCategory = document.getElementById('bdetail-category');
        const bTitle = document.getElementById('bdetail-title');
        const bCatch = document.getElementById('bdetail-catch');
        const bDesc = document.getElementById('bdetail-desc');
        if (bCategory) bCategory.innerText = data.category;
        if (bTitle) bTitle.innerText = data.title;
        if (bCatch) bCatch.innerText = data.catch;
        if (bDesc) bDesc.innerText = data.desc;
        this.open('business-detail-modal');
    }
};

// Export to global
window.modals = modalSystem;
window.closeAllModals = () => modalSystem.closeAll();
window.openCorporateModal = () => modalSystem.open('corporate-modal');
window.openCeoLetterModal = () => modalSystem.open('ceo-letter-modal');
window.openMvvModal = () => modalSystem.open('mvv-modal');
window.openBusinessModal = () => modalSystem.open('business-modal');
window.openPeopleModal = () => modalSystem.open('people-modal');
window.openJobsModal = () => modalSystem.open('jobs-modal');
window.openContactModal = () => modalSystem.open('contact-modal');
window.openBusinessDetailModal = (key) => modalSystem.openBusinessDetail(key);
window.closeAllAndOpenJobs = () => { modalSystem.closeAll(); modalSystem.open('jobs-modal'); };

// Form Handling
window.triggerB2bFormSubmit = (e) => {
    e.preventDefault();
    document.getElementById('contact-inner-form').classList.add('hidden');
    document.getElementById('contact-success-box').classList.remove('hidden');
};
window.resetContactFormFields = () => {
    document.getElementById('contact-inner-form').reset();
    document.getElementById('contact-inner-form').classList.remove('hidden');
    document.getElementById('contact-success-box').classList.add('hidden');
    modalSystem.closeAll();
};

// Layout Injection
function injectSharedLayoutsToModals() {
    const modalContents = ['corporate-modal', 'ceo-letter-modal', 'mvv-modal', 'business-modal', 'business-detail-modal', 'people-modal', 'jobs-modal', 'contact-modal'];
    const template = document.getElementById('shared-subpage-footer-template');
    if (!template) return;
    modalContents.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            const wrapper = modal.querySelector('.flex-content-wrapper') || modal.querySelector('.overflow-y-auto');
            if (wrapper) {
                // Remove existing injection if any to prevent duplicates
                const existing = wrapper.querySelector('.shared-footer-marker');
                if (!existing) {
                    const clone = template.content.cloneNode(true);
                    const marker = document.createElement('div');
                    marker.className = 'shared-footer-marker';
                    wrapper.appendChild(marker);
                    wrapper.appendChild(clone);
                }
            }
        }
    });
}

// Initialization & Bindings
window.addEventListener('DOMContentLoaded', () => {
    injectSharedLayoutsToModals();

    // Escape to close
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modalSystem.closeAll(); });

    // Sidebar & Nav Triggers
    const bindings = [
        { id: 'nav-hero', action: () => scrollToSection('sec-hero') },
        { id: 'nav-diag', action: () => scrollToSection('sec-diagnostic') },
        { id: 'nav-hub', action: () => scrollToSection('sec-site-contents') },
        { id: 'nav-works', action: () => scrollToSection('sec-youtube-carousel') },
        { id: 'sidebar-corp', action: window.openCorporateModal },
        { id: 'sidebar-biz', action: window.openBusinessModal },
        { id: 'sidebar-people', action: window.openPeopleModal },
        // Preview nav triggers (classes)
        { class: 'nav-corp-trigger', action: window.openCorporateModal },
        { class: 'nav-biz-trigger', action: window.openBusinessModal },
        { class: 'nav-people-trigger', action: window.openPeopleModal },
        { class: 'nav-works-trigger', action: () => scrollToSection('sec-youtube-carousel') },
        { class: 'jobs-modal-trigger', action: window.openJobsModal },
        { id: 'footer-contact-btn', action: window.openContactModal }
    ];

    bindings.forEach(b => {
        if (b.id) {
            const el = document.getElementById(b.id);
            if (el) el.addEventListener('click', b.action);
        }
        if (b.class) {
            document.querySelectorAll('.' + b.class).forEach(el => el.addEventListener('click', b.action));
        }
    });
});
