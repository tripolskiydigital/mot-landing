# Иллюстрация кодом вместо фото

Если своих фото нет, графика кодом и есть стиль. Выбери 1–2 приёма под метафору и повтори их в 3+ секциях.
Фрагменты взяты из демо https://mot.stage.slavic.digital/<slug>/; пути ниже вида `event/main.js` — файлы этих страниц (например, https://mot.stage.slavic.digital/event/main.js).
Случайность — только детерминированная, чтобы картинка не менялась при перезагрузке: `rng(seed)` и `hash(str)` из `event/main.js`.

**1. Зерно поверх секции (feTurbulence).** Нужно почти всегда: убирает «цифровую» гладкость. Всё — `event/style.css` (`--grain`), `education/style.css`.
```css
:root{--grain:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.hero::after{content:"";position:absolute;inset:0;pointer-events:none;background:var(--grain);opacity:.14;mix-blend-mode:multiply} /* на тёмном — screen */
```
**2. SVG-чертёж изделия с размерами.** Мебель, архитектура, техника: контур 1,4 px + размерные линии .8 px с засечками + моно-подписи.
Библиотека `<symbol>` → `<use href="#d-stair">`. Всё — `business/index.html` (`d-kitchen`, `d-stair`, `d-door`).
```html
<symbol id="d-stair" viewBox="0 0 400 500"><g fill="none" stroke="currentColor">
  <path stroke-width="1.4" d="M40 440V400H78V360H116V320H154V280H192V240H230V200H268V160H306V120H344"/>
  <path stroke-width=".8" opacity=".7" d="M40 470H344M40 463v14M344 463v14M372 120V440M365 120h14M365 440h14"/></g>
  <g font-family="JetBrains Mono, monospace" font-size="13" fill="currentColor"><text x="192" y="494" text-anchor="middle">8 × 280</text>
    <text transform="translate(360 280) rotate(-90)" text-anchor="middle">3 000</text></g></symbol>
```
**3. Генеративная топокарта (шум Перлина → marching squares).** Площадка события, маршрут, «местность» бренда; каждая 5-я изолиния толще.
Всё (perlin, таблица `MS`, точка на ребре `pt()`) — `event/main.js`, функция `contours()`.
```js
for (let l = 1; l <= levels; l++) { const t = min + (max - min) * l / (levels + 1); ctx.beginPath();   // f — шум на сетке cols×rows
  for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
    const a = f[j*cols+i], b = f[j*cols+i+1], c = f[(j+1)*cols+i+1], d = f[(j+1)*cols+i];
    const idx = (a > t) * 8 + (b > t) * 4 + (c > t) * 2 + (d > t); if (idx === 0 || idx === 15) continue;
    for (const [e1, e2] of MS[idx]) { ctx.moveTo(...pt(e1)); ctx.lineTo(...pt(e2)); } }
  ctx.lineWidth = l % 5 === 0 ? width * 1.8 : width; ctx.stroke(); }
```
**4. Растровый (гекс) портрет на canvas.** Силуэт рисуется в маленький offscreen-canvas (1 px = 1 ячейка), ячейка → точка радиусом по темноте,
нечётные ряды сдвинуты на полшага (шаг по Y = step·0,866); свет водится мышью. Всё (`scene()`, класс `Halftone`) — `portfolio/main.js`.
```js
const data = sctx.getImageData(0, 0, cols, rows).data, dy = step * .866; c.beginPath();
for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
  const d = 1 - data[(j * cols + i) * 4] / 255; if (d < .07) continue;
  const r = Math.min(Math.sqrt(d ** 1.15) * step * .5, step * .46), x = ox + i * step + (j & 1 ? step / 2 : 0), y = oy + j * dy;
  c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2); }
c.fill();   // одна заливка на все точки — быстро; вместо силуэта можно drawImage своего фото
```
**5. Звёздное небо на canvas.** Ночь, космос, тёмные темы. 1 500 звёзд, 42 % в диагональной полосе Млечного Пути, яркость `r()**3.4`,
10 % холодных и 3 % тёплых, мерцание синусом, ореол у ярких; рисовать только в экране. Всё — `media/main.js`, класс `Sky`.
```js
const STARS = Array.from({ length: 1500 }, () => { let x, y;
  if (r() < .42) { const t = r(), o = gauss(r) * .07; x = -.1 + t * 1.2 + o * .6; y = .98 - t * .96 + o; } else { x = r() * 1.2 - .1; y = r() * 1.2 - .1; }
  const b = r() ** 3.4; return { x, y, b, ph: r() * 6.28, per: 2 + r() * 4, rad: .45 + b * 1.35 }; });
// draw(t): alpha = (.32 + .68*Math.sqrt(s.b)) * (.4 + .6*(.5 + .5*Math.sin(s.ph + t*2*Math.PI/1000/s.per)))
new IntersectionObserver(([e]) => { sky.visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(cv);
```
**6. Генеративные аватары по хешу имени.** Лайн-ап, команда, подопечные без фото: сетка 6×6, в ячейке четверть круга / полукруг / квадрат
с поворотом 0–270°, 2 цвета палитры; одно имя → всегда один рисунок. Всё — `event/main.js`, `buildAvatars()`.
```js
const r = rng(hash(card.dataset.name)), N = 6, s = 100 / N; let out = `<rect width="100" height="100" fill="${bg}"/>`;
for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const v = r(), rot = Math.floor(r() * 4) * 90;
  const d = v < .4 ? `M0 0H${s}A${s} ${s} 0 0 1 0 ${s}Z` : v < .72 ? `M0 0A${s/2} ${s/2} 0 0 1 0 ${s}Z` : `M0 0H${s}V${s}H0Z`;
  out += `<path d="${d}" fill="${fg}" transform="translate(${i*s} ${j*s}) rotate(${rot} ${s/2} ${s/2})"/>`; }
svg.innerHTML = out;
```
**7. Керамика (любое тело вращения) из полупрофиля.** Посуда, вазы, бутылки, лампы. Профиль `[радиус, высота]` → правый край `cx + r`, левый `cx − r`,
горло и дно — эллипсы с перспективой `k`, сглаживание Катмулл — Ром; «постер» — градиент глазури + тень, «разрез» — штриховка. Всё — `shop/main.js` (`V`, `glazed()`, `drawing()`).
```js
const V = { inei: { p: [[27,0],[31,2],[35,10],[39,30],[42,60],[43.5,88],[44,92]], k: .22, g: 'frost', hw: 26 } }; // hw — ручка
const smooth = (pts) => pts.slice(0, -1).map((p1, i) => { const p0 = pts[i-1] || p1, p2 = pts[i+1], p3 = pts[i+2] || p2;
  return `C${P([p1[0]+(p2[0]-p0[0])/6, p1[1]+(p2[1]-p0[1])/6])} ${P([p2[0]-(p3[0]-p1[0])/6, p2[1]-(p3[1]-p1[1])/6])} ${P(p2)}`; }).join('');
const R = p.map(([r, y]) => [cx + r*s, base - y*s]), L = p.map(([r, y]) => [cx - r*s, base - y*s]);
const body = `M${P(L.at(-1))}A${rT} ${rT*k} 0 0 1 ${P(R.at(-1))}${smooth([...R].reverse())}A${rF} ${rF*k} 0 0 1 ${P(L[0])}${smooth(L)}Z`;
```
**8. Фактура дерева, камня, льна фильтром.** Анизотропный шум (частота X ≪ Y) → «пилообразная» таблица → тонировка; годичные кольца —
`feDisplacementMap` по кругам. Всё — `business/index.html` (`f-oak`, `f-ash`, `f-walnut`, `f-rings`), `shop/main.js` (`f-wood`, `f-linen`, `f-crackle`).
```html
<filter id="f-oak" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.07" numOctaves="4" seed="7"/>
  <feComponentTransfer><feFuncR type="table" tableValues="0 .9 .25 1 .4 .85 .1 .95 .3 1"/></feComponentTransfer>
  <feColorMatrix type="matrix" values=".26 0 0 0 .62  .22 0 0 0 .46  .16 0 0 0 .28  0 0 0 0 1"/></filter>
```
**9. Подгонка кегля вордмарка под ширину.** Бренд или имя от края до края в hero и подвале; мерить после `document.fonts.ready` и на resize.
Всё — `business/main.js` (`fit`), построчно для мобильного — `media/main.js` (`fitHero`).
```js
const fit = () => fitEls.forEach((el) => { el.style.fontSize = '100px';
  const cs = getComputedStyle(el), avail = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const rg = document.createRange(); rg.selectNodeContents(el); const w = rg.getBoundingClientRect().width;
  if (w > 0) el.style.fontSize = `${Math.floor(100 * avail / w * .995 * 10) / 10}px`; });
fit(); document.fonts?.ready.then(fit); addEventListener('resize', () => { clearTimeout(t); t = setTimeout(fit, 120); });
```
**10. Выезд букв по одной.** Название в hero, stagger 40–70 мс. JS оборачивает каждую букву: `<span class="ch" style="--d:${n}"><span>${ch}</span></span>`
(пробелы оставить текстом), после `fonts.ready` добавляет `.go`. Всё — `business/main.js`, `business/style.css` (`.ch`).
```css
.ch{display:inline-block;overflow:hidden;vertical-align:bottom;padding:.06em 0 .1em}.ch>span{display:inline-block}
html.js .ch>span{transform:translateY(105%)}
html.js .go .ch>span{transform:none;transition:transform 1.1s cubic-bezier(.2,.7,.2,1) calc(var(--d)*40ms + 200ms)}
```
**11. Бегущая строка с замедлением на hover.** Текст продублирован, сдвиг на −50 %; Web Animations — чтобы менять скорость плавно. Всё — `business/main.js`, `portfolio/main.js`.
```js
const anim = track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 40000, iterations: Infinity }), slow = (k) => anim.updatePlaybackRate ? anim.updatePlaybackRate(k) : (anim.playbackRate = k);
sec.addEventListener('mouseenter', () => slow(.25)); sec.addEventListener('mouseleave', () => slow(1)); // вне экрана — pause(); reduced-motion — не запускать
```
**12. Превью за курсором в нумерованном списке.** Услуги, категории, индекс проектов; lerp ≈0,15, только при `(hover:hover)`, превью можно рисовать
кодом и кешировать. Всё — `shop/main.js` (категории), `portfolio/main.js` (курсор + peek), `business/main.js` (только по Y).
```js
const loop = () => { x += (tx - x) * .16; y += (ty - y) * .16; pv.style.transform = `translate(${x}px,${y}px)`; raf = Math.abs(tx - x) + Math.abs(ty - y) > .5 ? requestAnimationFrame(loop) : 0; };
list.addEventListener('mousemove', (e) => { const r = box.getBoundingClientRect(), h = pv.offsetHeight;
  tx = Math.min(r.width - pv.offsetWidth - 16, e.clientX - r.left + 36); ty = Math.max(0, Math.min(r.height - h, e.clientY - r.top - h / 2));
  if (!raf) raf = requestAnimationFrame(loop); });
```
**13. Появление при прокрутке со «страховкой».** IO пропускает элементы при быстрой прокрутке и переходе по якорю (тогда у `shoot.mjs` `invisible > 0`) —
добиваем всё, что уже выше 90 % окна. Всё — `event/main.js` (`observe`), `education/main.js`.
```js
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
  { rootMargin: '0px 0px -8% 0px', threshold: .12 });
let pending = [...document.querySelectorAll('[data-rv]')], tick = false; pending.forEach((el) => io.observe(el));
const sweep = () => { tick = false; pending = pending.filter((el) => { if (el.classList.contains('in')) return false;
  if (el.getBoundingClientRect().top < innerHeight * .9) { el.classList.add('in'); io.unobserve(el); return false; } return true; }); };
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(sweep); } }, { passive: true });
```
**Ещё приёмы одной строкой**
- Буквы из «кипящего» шума: `color:transparent; background:url(шум-SVG) 0 0/240px; background-clip:text` + `@keyframes` со `steps(1)` по `background-position` — `other/style.css` (`.noise`, `boil`).
- Билет с вырубками: `mask: radial-gradient(circle 16px at 0 calc(100% - 112px), #0000 97%, #000) left/51% 100% no-repeat, …right` — `event/style.css` (`.tier`); штрихкод из 40 случайных `<line>` — `event/main.js` (`buildTicket`).
- Прорисовка линий: `--len` = `getTotalLength()` → `stroke-dasharray/offset: var(--len)` → `.drawn{stroke-dashoffset:0}`, повтор на hover — `personal/main.js`, `personal/style.css` (`.draw`).
- Дышащая сфера вместо портрета: 3 слоя `radial-gradient` + `blur(24–40px)`, `scale 1 → 1.06` за 8 с, зерно с круглой маской — `personal/style.css` (`.orb`); лучи прожекторов: конусы `clip-path` + `blur(6px)` + `mix-blend-mode:screen`, анимация только в видимых кадрах (`.is-live`) — `event/main.js` (`beamsScene`).
- Маркер под словом: `linear-gradient(lime,lime) 0 88%/0 72% no-repeat` → `.in .hl{background-size:100% 72%}`, тетрадь — `repeating-linear-gradient` (`education/style.css`); рваный мазок: `feTurbulence baseFrequency=".045 .9"` + `feDisplacementMap scale="6"` на толстом `stroke-linecap:round` — `media/main.js` (`#rough`).
