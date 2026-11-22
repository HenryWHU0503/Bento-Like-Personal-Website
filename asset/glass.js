// Edge normals bend the backdrop towards the interior of each rounded card.
const chromium = /Chrom(?:e|ium)\//.test(navigator.userAgent) && !/Android/.test(navigator.userAgent);
if (chromium && typeof ResizeObserver !== 'undefined' && typeof IntersectionObserver !== 'undefined' &&
    CSS.supports('backdrop-filter', 'url(#glass)')) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    const definitions = document.createElementNS(svgNS, 'defs');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('glass-filters');
    svg.append(definitions);
    document.body.prepend(svg);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const maximumSize = 280;
    const displacement = 42;
    const maps = new Map();
    let nextFilter = 0;

    function edgeMap(width, height, radius) {
        const key = `${width}:${height}:${radius}`;
        if (maps.has(key)) return maps.get(key);

        const ratio = Math.min(1, maximumSize / Math.max(width, height));
        canvas.width = Math.ceil(width * ratio);
        canvas.height = Math.ceil(height * ratio);
        const pixels = context.createImageData(canvas.width, canvas.height);
        const rim = radius * 0.88;

        for (let row = 0; row < canvas.height; row++) {
            const y = (row + 0.5) * height / canvas.height;
            const normalY = y - Math.min(height - radius, Math.max(radius, y));

            for (let column = 0; column < canvas.width; column++) {
                const x = (column + 0.5) * width / canvas.width;
                const normalX = x - Math.min(width - radius, Math.max(radius, x));
                const length = Math.hypot(normalX, normalY);
                const depth = Math.max(0, radius - length);
                const bend = length && depth < rim ? 120 * (1 - depth / rim) ** 2 / length : 0;
                const i = (row * canvas.width + column) * 4;

                pixels.data[i] = 128 - normalX * bend;
                pixels.data[i + 1] = 128 - normalY * bend;
                pixels.data[i + 2] = 128;
                pixels.data[i + 3] = 255;
            }
        }

        context.putImageData(pixels, 0, 0);
        const url = canvas.toDataURL();
        if (maps.size >= 40) maps.delete(maps.keys().next().value);
        maps.set(key, url);
        return url;
    }

    const elements = new WeakMap();

    function updateFilter(card) {
        const width = card.clientWidth;
        const height = card.clientHeight;
        if (!width || !height) return;

        let entry = elements.get(card);
        if (!entry) {
            const filter = document.createElementNS(svgNS, 'filter');
            const image = document.createElementNS(svgNS, 'feImage');
            const refraction = document.createElementNS(svgNS, 'feDisplacementMap');
            filter.id = `glass-${nextFilter++}`;
            filter.setAttribute('color-interpolation-filters', 'sRGB');
            image.setAttribute('result', 'edgeMap');
            image.setAttribute('preserveAspectRatio', 'none');
            refraction.setAttribute('in', 'SourceGraphic');
            refraction.setAttribute('in2', 'edgeMap');
            refraction.setAttribute('scale', displacement);
            refraction.setAttribute('xChannelSelector', 'R');
            refraction.setAttribute('yChannelSelector', 'G');
            filter.append(image, refraction);
            definitions.append(filter);
            entry = { filter, image };
            elements.set(card, entry);
        }

        const corner = parseFloat(getComputedStyle(card).borderTopLeftRadius);
        const radius = Math.round(Math.min(corner, width / 2, height / 2));
        entry.image.setAttribute('width', width);
        entry.image.setAttribute('height', height);
        entry.image.setAttribute('href', edgeMap(width, height, radius));
        card.style.setProperty('--refraction', `url(#${entry.filter.id})`);
    }

    if (context) {
        const resize = new ResizeObserver(entries => {
            for (const { target } of entries) updateFilter(target);
        });
        const visible = new IntersectionObserver(entries => {
            for (const { target, isIntersecting } of entries) {
                if (isIntersecting) {
                    resize.observe(target);
                } else {
                    resize.unobserve(target);
                    const entry = elements.get(target);
                    if (!entry) continue;
                    target.style.removeProperty('--refraction');
                    entry.filter.remove();
                    elements.delete(target);
                }
            }
        }, { rootMargin: '140px' });

        for (const card of document.querySelectorAll('.bento-card')) visible.observe(card);
    }
}
