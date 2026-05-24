/* ══════════════════════════════════════════════════════════════
   Crestix Careers - High-Fidelity Main UI & Carousel Logic
   ══════════════════════════════════════════════════════════════ */

// 1. Hero Slider (Mercari Style)
let currentHeroSlide = 1;
const totalHeroSlides = 3;
let heroAutoPlay = true;
let heroTimer = null;

const heroData = {
    1: { 
        title: "常識の枠を超え、<br>大胆な挑戦を。", 
        desc: "クレスティックスには、メンバー全員の手に<br>社会を本質的に前進させるミッションがあります。<br>失敗を恐れず、常に一歩先へ進み続ける情熱をここに集結させます。",
        content: `<div class="flex justify-between items-start"><span class="text-[11px] bg-white/20 border border-white/30 px-6 py-2.5 rounded-2xl font-mono font-black tracking-widest uppercase">Phase 01 / Go Bold</span><i class="fa-solid fa-bolt text-4xl text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.8)] animate-pulse"></i></div><div class="text-center py-10"><svg class="w-1/2 mx-auto h-40" viewBox="0 0 200 100" fill="none"><rect x="20" y="30" width="30" height="50" rx="10" fill="white" fill-opacity="0.9"/><path d="M10 80 Q100 0 190 60" stroke="#FFE600" stroke-width="7" stroke-linecap="round"/><circle cx="100" cy="35" r="14" fill="#FFE600" class="animate-ping shadow-2xl"/></svg></div><div class="text-[11px] text-white/70 font-mono flex justify-between tracking-[0.5em] uppercase font-black opacity-60"><span>Market Optimization</span><span>Ver. 2026.05</span></div>`
    },
    2: { 
        title: "多様な才能が、<br>最高速度で共鳴する。", 
        desc: "SaaS営業代行、新卒特化HR、Web制作・広告。<br>異なるフィールドのプロが集い、<br>最高のシナジーを無限に拡張し続けます。",
        content: `<div class="flex justify-between items-start"><span class="text-[11px] bg-white/20 border border-white/30 px-6 py-2.5 rounded-2xl font-mono font-black tracking-widest uppercase">Phase 02 / Synergy</span><i class="fa-solid fa-users text-4xl text-white drop-shadow-2xl"></i></div><div class="py-10 text-center"><svg class="w-1/2 mx-auto h-40" viewBox="0 0 200 100" fill="none"><circle cx="60" cy="50" r="25" fill="white" fill-opacity="0.4"/><circle cx="100" cy="50" r="35" fill="white" fill-opacity="0.9"/><circle cx="140" cy="50" r="25" fill="white" fill-opacity="0.4"/></svg></div><div class="text-[11px] text-white/70 font-mono flex justify-between tracking-[0.5em] uppercase font-black opacity-60"><span>One Piece Strategy</span><span>Unity</span></div>`
    },
    3: { 
        title: "世界屈指の、<br>挑戦し続けるチームへ。", 
        desc: "私たちのゴールは、現状維持を壊し続けること。<br>自律したプロが個の限界を超え、<br>圧倒的スピードで新規市場をハックします。",
        content: `<div class="flex justify-between items-start"><span class="text-[11px] bg-white/20 border border-white/30 px-6 py-2.5 rounded-2xl font-mono font-black tracking-widest uppercase">Phase 03 / Professional</span><i class="fa-solid fa-rocket text-4xl text-white drop-shadow-2xl"></i></div><div class="py-10 text-center"><svg class="w-1/2 mx-auto h-40" viewBox="0 0 200 100" fill="none"><path d="M100 10 L140 90 L100 75 L60 90 Z" fill="white" fill-opacity="0.9"/><circle cx="100" cy="45" r="8" fill="#FFE600"/></svg></div><div class="text-[11px] text-white/70 font-mono flex justify-between tracking-[0.5em] uppercase font-black opacity-60"><span>Autonomy & Speed</span><span>Global Scale</span></div>`
    }
};

function setSlide(num) {
    currentHeroSlide = num;
    updateHeroUI();
}

function nextSlide() { currentHeroSlide = currentHeroSlide === totalHeroSlides ? 1 : currentHeroSlide + 1; updateHeroUI(); }
function prevSlide() { currentHeroSlide = currentHeroSlide === 1 ? totalHeroSlides : currentHeroSlide - 1; updateHeroUI(); }

function updateHeroUI() {
    const titleEl = document.getElementById('slide-title-text');
    const descEl = document.getElementById('slide-desc-text');
    
    for(let i = 1; i <= totalHeroSlides; i++) {
        const slide = document.getElementById(`slide-img-${i}`);
        const dot = document.getElementById(`dot-${i}`);
        if (slide && dot) {
            if (i === currentHeroSlide) {
                slide.innerHTML = heroData[i].content;
                slide.classList.remove('hidden', 'opacity-0', 'scale-95');
                slide.classList.add('opacity-100', 'scale-100');
                dot.className = "w-14 h-2 rounded-full bg-white cursor-pointer transition-all shadow-xl";
            } else {
                slide.classList.add('hidden', 'opacity-0', 'scale-95');
                slide.classList.remove('opacity-100', 'scale-100');
                dot.className = "w-4 h-2 rounded-full bg-white/30 hover:bg-white cursor-pointer transition-all";
            }
        }
    }

    if (titleEl) {
        titleEl.style.opacity = 0;
        titleEl.style.transform = "translateY(20px)";
        setTimeout(() => {
            titleEl.innerHTML = heroData[currentHeroSlide].title;
            titleEl.style.opacity = 1;
            titleEl.style.transform = "translateY(0)";
        }, 300);
    }
    if (descEl) {
        descEl.style.opacity = 0;
        descEl.style.transform = "translateY(10px)";
        setTimeout(() => {
            descEl.innerHTML = heroData[currentHeroSlide].desc;
            descEl.style.opacity = 1;
            descEl.style.transform = "translateY(0)";
        }, 400);
    }
}

function startHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => { if(heroAutoPlay) nextSlide(); }, 7000);
}

function toggleHeroAutoPlay() {
    heroAutoPlay = !heroAutoPlay;
    const btn = document.getElementById('hero-play-btn');
    if (btn) btn.innerHTML = heroAutoPlay ? `<i class="fa-solid fa-pause"></i>` : `<i class="fa-solid fa-play ml-0.5"></i>`;
    if (heroAutoPlay) startHeroTimer();
    else clearInterval(heroTimer);
}

// 2. 3D Carousel (Black Corp Style)
let focusedVideoId = 1;
let carouselAutoPlay = true;
let carouselTimer = null;

const videoContentData = {
    1: { title: "【代表密着】創業1年で年商280%成長。代表・縞谷蓮志が目指す世界。", tag: "Documentary" },
    2: { title: "【1日のルーティーン】急成長スタートアップ・マーケターの思考回路。", tag: "Culture Vlog" },
    3: { title: "【本音対談】ミスマッチのない就活を創る「MeRaise」の舞台裏。", tag: "Interview" }
};

function rotateCarouselRight() { focusedVideoId = focusedVideoId === 3 ? 1 : focusedVideoId + 1; updateCarouselUI(); }
function rotateCarouselLeft() { focusedVideoId = focusedVideoId === 1 ? 3 : focusedVideoId - 1; updateCarouselUI(); }

function updateCarouselUI() {
    for (let i = 1; i <= 3; i++) {
        const card = document.getElementById(`vcard-${i}`);
        if (card) {
            const data = videoContentData[i];
            card.innerHTML = `
                <div class="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-gray-900 border border-white/10 group-hover:border-crestix-orange/50 transition-all duration-700">
                    <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop" class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" alt="Video">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="w-24 h-24 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.5)] group-hover:scale-110 group-hover:bg-red-500 transition-all duration-500"><i class="fa-solid fa-play ml-1.5 text-4xl"></i></div>
                    </div>
                </div>
                <div class="mt-8 px-6 pb-4 space-y-4">
                    <span class="inline-block bg-gray-100 text-gray-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-gray-100">${data.tag}</span>
                    <h3 class="text-2xl font-black text-crestix-charcoal line-clamp-1 tracking-tighter group-hover:text-crestix-orange transition-colors">${data.title}</h3>
                </div>
            `;

            if (i === focusedVideoId) {
                card.className = "bc-card-3d active bg-white border border-gray-100 rounded-[4rem] p-8 flex flex-col justify-between cursor-pointer w-[320px] md:w-[600px] h-full shrink-0 shadow-3d-depth group";
            } else if ((focusedVideoId === 1 && i === 2) || (focusedVideoId === 2 && i === 3) || (focusedVideoId === 3 && i === 1)) {
                card.className = "bc-card-3d inactive-right bg-white border border-gray-100 rounded-[4rem] p-8 flex flex-col justify-between cursor-pointer w-[320px] md:w-[600px] h-full shrink-0 opacity-25 grayscale-[0.8]";
            } else {
                card.className = "bc-card-3d inactive-left bg-white border border-gray-100 rounded-[4rem] p-8 flex flex-col justify-between cursor-pointer w-[320px] md:w-[600px] h-full shrink-0 opacity-25 grayscale-[0.8]";
            }
        }
    }
}

function startCarouselTimer() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => { if(carouselAutoPlay) rotateCarouselRight(); }, 5000);
}

function toggleCarouselAutoPlay() {
    carouselAutoPlay = !carouselAutoPlay;
    const btn = document.getElementById('carousel-play-btn');
    if (btn) btn.innerHTML = carouselAutoPlay ? `<i class="fa-solid fa-pause"></i>` : `<i class="fa-solid fa-play ml-0.5"></i>`;
    if (carouselAutoPlay) startCarouselTimer();
    else clearInterval(carouselTimer);
}

// 3. Dashboard Controller
function switchView(mode) {
    const viewport = document.getElementById('preview-viewport');
    const btnDesktop = document.getElementById('btn-desktop');
    const btnMobile = document.getElementById('btn-mobile');
    if (!viewport) return;

    if (mode === 'mobile') {
        viewport.style.maxWidth = '414px';
        if(btnMobile) btnMobile.classList.add('bg-crestix-orange', 'text-white', 'shadow-orange-200');
        if(btnMobile) btnMobile.classList.remove('bg-white', 'text-gray-500');
        if(btnDesktop) btnDesktop.classList.remove('bg-crestix-orange', 'text-white', 'shadow-orange-200');
        if(btnDesktop) btnDesktop.classList.add('bg-white', 'text-gray-500');
    } else {
        viewport.style.maxWidth = '1500px';
        if(btnDesktop) btnDesktop.classList.add('bg-crestix-orange', 'text-white', 'shadow-orange-200');
        if(btnDesktop) btnDesktop.classList.remove('bg-white', 'text-gray-500');
        if(btnMobile) btnMobile.classList.remove('bg-crestix-orange', 'text-white', 'shadow-orange-200');
        if(btnMobile) btnMobile.classList.add('bg-white', 'text-gray-500');
    }
}

function scrollToSection(id) {
    if (window.closeAllModals) window.closeAllModals();
    const scrollContainer = document.getElementById('preview-content-box');
    const target = document.getElementById(id);
    if (scrollContainer && target) {
        scrollContainer.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
}

// Global exposure
window.scrollToSection = scrollToSection;
window.setSlide = setSlide;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.toggleHeroAutoPlay = toggleHeroAutoPlay;
window.rotateCarouselLeft = rotateCarouselLeft;
window.rotateCarouselRight = rotateCarouselRight;
window.toggleCarouselAutoPlay = toggleCarouselAutoPlay;

// 4. Lifecycle & Bindings
window.addEventListener('DOMContentLoaded', () => {
    startHeroTimer();
    startCarouselTimer();
    updateHeroUI();
    updateCarouselUI();

    // Browser Simulation
    const btnDesktop = document.getElementById('btn-desktop');
    const btnMobile = document.getElementById('btn-mobile');
    if(btnDesktop) btnDesktop.addEventListener('click', () => switchView('desktop'));
    if(btnMobile) btnMobile.addEventListener('click', () => switchView('mobile'));

    // Navigation triggers
    const hPrev = document.getElementById('hero-prev');
    const hNext = document.getElementById('hero-next');
    const hPlay = document.getElementById('hero-play-btn');
    if(hPrev) hPrev.addEventListener('click', prevSlide);
    if(hNext) hNext.addEventListener('click', nextSlide);
    if(hPlay) hPlay.addEventListener('click', toggleHeroAutoPlay);
    
    for(let i=1; i<=3; i++) {
        const dot = document.getElementById(`dot-${i}`);
        if(dot) dot.addEventListener('click', () => setSlide(i));
    }

    const cLeft = document.getElementById('carousel-left');
    const cRight = document.getElementById('carousel-right');
    const cPlay = document.getElementById('carousel-play-btn');
    if(cLeft) cLeft.addEventListener('click', rotateCarouselLeft);
    if(cRight) cRight.addEventListener('click', rotateCarouselRight);
    if(cPlay) cPlay.addEventListener('click', toggleCarouselAutoPlay);

    // Navbar scroll effect
    const scrollContainer = document.getElementById('preview-content-box');
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                if (scrollContainer.scrollTop > 50) {
                    navbar.classList.add('bg-black/60', 'py-4', 'shadow-2xl');
                    navbar.classList.remove('bg-black/10', 'py-6');
                } else {
                    navbar.classList.add('bg-black/10', 'py-6');
                    navbar.classList.remove('bg-black/60', 'py-4', 'shadow-2xl');
                }
            }
        });
    }
});
