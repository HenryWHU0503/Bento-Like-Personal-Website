// 深色模式切换功能
document.addEventListener('DOMContentLoaded', function() {
    const html = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    
    // 检查用户偏好或保存的设置
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
    
    // 切换主题（页面没有切换按钮时跳过，避免中断后续逻辑）
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.theme = 'light';
            } else {
                html.classList.add('dark');
                localStorage.theme = 'dark';
            }
        });
    }

    // 添加卡片动画效果
    const bentoCards = document.querySelectorAll('.bento-card');
    bentoCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// ===== 月之暗面官网同款自定义光标 =====
// 外圈 36px 圆环 + 5px 内点，双层 lerp 缓动跟随；
// 悬停链接/按钮时外圈放大至 56px；仅在带精确指针（鼠标）的设备启用。
(function initCustomCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const ring = document.createElement('div');
    ring.className = 'ms-cursor-ring';
    const dot = document.createElement('div');
    dot.className = 'ms-cursor-dot';
    document.body.appendChild(ring);
    document.body.appendChild(dot);

    // 启用自定义光标时隐藏系统光标
    const hideNative = document.createElement('style');
    hideNative.textContent = '* { cursor: none !important; }';
    document.head.appendChild(hideNative);

    const hoverTargets = 'a[href], button, input, textarea, select, [data-cursor-hover]';
    const speed = 0.2;
    const ringKeep = 1 - speed;                  // 外圈缓动系数
    const dotKeep = 1 - Math.min(4 * speed, 0.8); // 内点更快
    const epsilon = 0.5;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { x: target.x, y: target.y };
    const dotPos = { x: target.x, y: target.y };
    let last = performance.now();
    let rafId = 0;
    let visible = false;

    function frame() {
        const now = performance.now();
        const dt = 60 * (now - last) / 1000; // 帧率无关
        last = now;

        const rf = 1 - Math.pow(ringKeep, dt);
        ringPos.x += (target.x - ringPos.x) * rf;
        ringPos.y += (target.y - ringPos.y) * rf;
        ring.style.translate = ringPos.x + 'px ' + ringPos.y + 'px 0';

        const df = 1 - Math.pow(dotKeep, dt);
        dotPos.x += (target.x - dotPos.x) * df;
        dotPos.y += (target.y - dotPos.y) * df;
        dot.style.translate = dotPos.x + 'px ' + dotPos.y + 'px 0';

        const settled =
            Math.abs(target.x - ringPos.x) < epsilon && Math.abs(target.y - ringPos.y) < epsilon &&
            Math.abs(target.x - dotPos.x) < epsilon && Math.abs(target.y - dotPos.y) < epsilon;
        rafId = settled ? 0 : requestAnimationFrame(frame);
    }

    function onMouseMove(e) {
        target.x = e.clientX;
        target.y = e.clientY;
        if (!rafId) {
            last = performance.now();
            rafId = requestAnimationFrame(frame);
        }
        if (!visible) {
            visible = true;
            ringPos.x = dotPos.x = target.x;
            ringPos.y = dotPos.y = target.y;
            ring.style.opacity = '1';
            dot.style.opacity = '1';
        }
    }

    function onMouseLeave() {
        visible = false;
        ring.style.opacity = '0';
        dot.style.opacity = '0';
    }

    function onMouseOver(e) {
        if (e.target.closest(hoverTargets)) ring.classList.add('is-hover');
    }

    function onMouseOut(e) {
        const from = e.target.closest(hoverTargets);
        if (from && !(e.relatedTarget && from.contains(e.relatedTarget))) {
            ring.classList.remove('is-hover');
        }
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
})();
