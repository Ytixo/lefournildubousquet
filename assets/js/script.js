document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const menuList = document.getElementById('menu-list');

    menuBtn.addEventListener('click', () => {
        menuList.classList.toggle('open');
        const headerHeight = document.querySelector('header').offsetHeight;
        menuList.style.top = headerHeight + 'px';
    });

    // Fermer le menu quand on clique sur un lien
    menuList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuList.classList.remove('open');
        });
    });
});

const track = document.getElementById('track');
const dotsEl = document.getElementById('dots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const cards = track.querySelectorAll('.review-card');
const total = cards.length;
const visible = window.innerWidth < 580 ? 1 : 3;
const steps = total - visible;
let current = 0;

function buildDots() {
dotsEl.innerHTML = '';
for (let i = 0; i <= steps; i++) {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Avis ' + (i + 1));
    d.onclick = () => goTo(i);
    dotsEl.appendChild(d);
}
}

function goTo(n) {
current = Math.max(0, Math.min(n, steps));
const cardW = cards[0].offsetWidth + 16;
track.style.transform = `translateX(-${current * cardW}px)`;
dotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
prevBtn.disabled = current === 0;
nextBtn.disabled = current === steps;
}

function move(dir) { goTo(current + dir); }

buildDots();
goTo(0);
