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
