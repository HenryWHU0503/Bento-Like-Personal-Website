const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const wideLayout = matchMedia('(min-width: 760px)');

function setMenu(open) {
    menuToggle.setAttribute('aria-expanded', String(open));
    sidebar.classList.toggle('is-open', open);
}

sidebar.classList.add('has-menu-toggle');

menuToggle.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') === 'false');
});
wideLayout.addEventListener('change', () => setMenu(false));

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuToggle.focus();
    }
});
document.addEventListener('click', event => {
    if (!sidebar.contains(event.target)) setMenu(false);
});

const qrDialog = document.getElementById('wechat-dialog');
if (qrDialog) {
    const qrLink = document.querySelector('[data-wechat]');
    if (typeof qrDialog.showModal === 'function') qrLink.setAttribute('aria-haspopup', 'dialog');
    qrLink.addEventListener('click', event => {
        if (typeof qrDialog.showModal !== 'function' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        qrDialog.showModal();
    });
    qrDialog.addEventListener('click', event => {
        if (event.target === qrDialog) qrDialog.close();
    });
}

const searchForm = document.getElementById('article-search');
if (searchForm) {
    const searchInput = document.getElementById('search-input');
    const clearButton = document.getElementById('clear-search');
    const empty = document.getElementById('no-results');
    const articles = Array.from(document.querySelectorAll('.article-item'));

    function filterArticles() {
        const query = searchInput.value.trim().toLowerCase();
        let found = false;
        for (const article of articles) {
            const matches = article.textContent.toLowerCase().includes(query);
            article.hidden = !matches;
            found ||= matches;
        }
        empty.hidden = found;
        clearButton.hidden = searchInput.value.length === 0;
    }

    searchForm.addEventListener('submit', event => {
        event.preventDefault();
        filterArticles();
    });
    searchInput.addEventListener('input', event => {
        if (!event.isComposing) filterArticles();
    });
    searchInput.addEventListener('compositionend', filterArticles);
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        filterArticles();
        searchInput.focus();
    });
    searchForm.hidden = false;
    filterArticles();
}

const precisePointer = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
for (const card of document.querySelectorAll('.bento-card')) {
    card.addEventListener('pointermove', event => {
        if (!precisePointer.matches || event.pointerType === 'touch') return;
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--shine-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--shine-y', `${event.clientY - bounds.top}px`);
    }, { passive: true });
}

const comments = document.getElementById('tcomment');
if (comments) {
    function showCommentError() {
        document.getElementById('comment-status').hidden = false;
    }

    function loadComments() {
        const script = document.createElement('script');
        script.src = 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/twikoo/1.6.37/twikoo.min.js';
        script.onerror = showCommentError;
        script.onload = async () => {
            try {
                await window.twikoo.init({
                    envId: 'https://twikoo.henrywhu.cn',
                    el: '#tcomment',
                    region: 'ap-shanghai',
                });
            } catch {
                showCommentError();
            }
        };
        document.head.append(script);
    }

    if (typeof IntersectionObserver === 'undefined') {
        loadComments();
    } else {
        const observer = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            observer.disconnect();
            loadComments();
        }, { rootMargin: '220px' });
        observer.observe(comments);
    }
}
