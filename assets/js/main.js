/* Crestix Recruitment Site - Main UI & Dashboard Logic */

let currentSlide = 1;
const totalSlides = 3;
let heroAutoPlay = true;
let heroTimer = null;

function setSlide(num) { 
    currentSlide = num; 
    updateSlideUI(); 
}

function nextSlide() { 
    currentSlide = currentSlide === totalSlides ? 1 : currentSlide + 1; 
    updateSlideUI(); 
}

function prevSlide() { 
    currentSlide = currentSlide === 1 ? totalSlides : currentSlide - 1; 
    updateSlideUI(); 
}

function updateSlideUI() {
    const titleEl = document.getElementById('slide-title-text');
    const descEl = document.getElementById('slide-desc-text');
    
    for(let i = 1; i <= totalSlides; i++) {
        const el = document.getElementById(`slide-img-${i}`);
        const dot = document.getElementById(`dot-${i}`);
        if (el && dot) {
            if (i === currentSlide) {
                el.classList.remove('hidden', 'opacity-0', 'scale-95');
                el.classList.add('opacity-100', 'scale-100');
                dot.className = "w-6 h-1.5 rounded-full bg-white cursor-pointer transition-all";
            } else {
                el.classList.add('hidden', 'opacity-0', 'scale-95');
                el.classList.remove('opacity-100', 'scale-100');
                dot.className = "w-2 h-1.5 rounded-full bg-white/40 hover:bg-white cursor-pointer transition-all";
            }
        }
    }
    const slideData = {
        1: { title: "常識の枠を超え、<br>大胆な挑戦を。", desc: "クレスティックスには、メンバー全員の手に社会を本質的に前進させるミッションがあります。失敗を恐れず、常に一歩先へ進み続ける情熱をここに集結させます。" },
        2: { title: "多様な才能が、<br>最高速度で共鳴する。", desc: "SaaS営業代行、新卒領域特化HR、Web制作・広告、フリーランス。異なるフィールドのプロが集い、最高のシナジーを無限に拡張します。" },
        3: { title: "世界屈指の、<br>挑戦し続けるチームへ。", desc: "私たちのゴールは、現状維持を壊し続けること。自律したプロフェッショナルが個の限界を超え、世界に通用する圧倒的なスピードで新規市場をハックし続けます。" }
    };
    if (titleEl) titleEl.innerHTML = slideData[currentSlide].title;
    if (descEl) descEl.innerText = slideData[currentSlide].desc;
}

function toggleHeroAutoPlay() {
    heroAutoPlay = !heroAutoPlay;
    const btn = document.getElementById('hero-play-btn');
    if (heroAutoPlay) {
        if (btn) btn.innerHTML = `<i class="fa-solid fa-pause text-[9px]"></i>`;
        startHeroTimer();
    } else {
        if (btn) btn.innerHTML = `<i class="fa-solid fa-play text-[9px] ml-0.5"></i>`;
        clearInterval(heroTimer);
    }
}

function startHeroTimer() { 
    clearInterval(heroTimer); 
    heroTimer = setInterval(nextSlide, 6000); 
}

// Carousel logic (YouTube/実績)
let focusedVideoId = 1;
let carouselAutoPlay = true;
let carouselTimer = null;

function rotateCarouselRight() { 
    focusedVideoId = focusedVideoId === 3 ? 1 : focusedVideoId + 1; 
    updateCarouselUI(); 
}

function rotateCarouselLeft() { 
    focusedVideoId = focusedVideoId === 1 ? 3 : focusedVideoId - 1; 
    updateCarouselUI(); 
}

function updateCarouselUI() {
    for (let i = 1; i <= 3; i++) {
        const card = document.getElementById(`vcard-${i}`);
        if (card) {
            if (i === focusedVideoId) {
                card.className = "bc-card-3d active bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between cursor-pointer w-[280px] md:w-[450px] h-full shrink-0 shadow-2xl scale-105 duration-500 opacity-100 z-10 text-gray-800";
            } else if ((focusedVideoId === 1 && i === 2) || (focusedVideoId === 2 && i === 3) || (focusedVideoId === 3 && i === 1)) {
                card.className = "bc-card-3d inactive-right bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between cursor-pointer w-[280px] md:w-[450px] h-full shrink-0 opacity-40 z-5 scale-90 duration-500 translate-x-4 md:translate-x-12 rotate-y-[-15deg] text-gray-800";
            } else {
                card.className = "bc-card-3d inactive-left bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between cursor-pointer w-[280px] md:w-[450px] h-full shrink-0 opacity-40 z-5 scale-90 duration-500 -translate-x-4 md:-translate-x-12 rotate-y-[15deg] text-gray-800";
            }
        }
    }
}

function toggleCarouselAutoPlay() {
    carouselAutoPlay = !carouselAutoPlay;
    const btn = document.getElementById('carousel-play-btn');
    if (carouselAutoPlay) {
        if (btn) btn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        startCarouselTimer();
    } else {
        if (btn) btn.innerHTML = `<i class="fa-solid fa-play ml-0.5"></i>`;
        clearInterval(carouselTimer);
    }
}

function startCarouselTimer() { 
    clearInterval(carouselTimer); 
    carouselTimer = setInterval(rotateCarouselRight, 5000); 
}

// Dashboard Utils
function switchView(mode) {
    const viewport = document.getElementById('preview-viewport');
    const btnDesktop = document.getElementById('btn-desktop');
    const btnMobile = document.getElementById('btn-mobile');
    if (mode === 'mobile') {
        if (viewport) viewport.style.maxWidth = '390px';
        if (btnMobile) btnMobile.className = "px-3.5 py-1.5 rounded-md text-sm font-bold bg-crestix-orange text-white flex items-center gap-2 transition-all shadow-md";
        if (btnDesktop) btnDesktop.className = "px-3.5 py-1.5 rounded-md text-sm font-bold bg-white text-gray-500 hover:text-crestix-charcoal border border-gray-300 flex items-center gap-2 transition-all";
    } else {
        if (viewport) viewport.style.maxWidth = '1200px';
        if (btnDesktop) btnDesktop.className = "px-3.5 py-1.5 rounded-md text-sm font-bold bg-crestix-orange text-white flex items-center gap-2 transition-all shadow-md";
        if (btnMobile) btnMobile.className = "px-3.5 py-1.5 rounded-md text-sm font-bold bg-white text-gray-500 hover:text-crestix-charcoal border border-gray-300 flex items-center gap-2 transition-all";
    }
}

function scrollToSection(id) {
    if (window.modals && typeof window.modals.closeAll === 'function') window.modals.closeAll();
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

// Initialization
window.addEventListener('DOMContentLoaded', () => {
    startHeroTimer();
    startCarouselTimer();

    // View switcher bindings
    const btnDesktop = document.getElementById('btn-desktop');
    const btnMobile = document.getElementById('btn-mobile');
    if (btnDesktop) btnDesktop.addEventListener('click', () => switchView('desktop'));
    if (btnMobile) btnMobile.addEventListener('click', () => switchView('mobile'));

    // Global scroll listener for navbar (optional depending on layout)
    const previewContent = document.getElementById('preview-content-box');
    if (previewContent) {
        previewContent.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.classList.toggle('bg-white/95', previewContent.scrollTop > 30);
                navbar.classList.toggle('shadow-sm', previewContent.scrollTop > 30);
            }
        });
    }
});

// Export functions to global for HTML event attributes (if still needed)
window.scrollToSection = scrollToSection;
window.setSlide = setSlide;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.toggleHeroAutoPlay = toggleHeroAutoPlay;
window.rotateCarouselLeft = rotateCarouselLeft;
window.rotateCarouselRight = rotateCarouselRight;
window.toggleCarouselAutoPlay = toggleCarouselAutoPlay;
