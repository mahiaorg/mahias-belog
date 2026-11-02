const { chromium } = require('playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, bytes) => {
    if (err) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); res.end(bytes);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const base = 'http://127.0.0.1:' + server.address().port;
  const results = [];
  fs.mkdirSync(path.join(root, 'work/audit-checks'), { recursive: true });
  try {
    for (const width of [320, 390, 768, 1024, 1366, 1920]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [], external = [], failed = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
      await page.route('**/*', route => {
        if (!route.request().url().startsWith(base)) { external.push(route.request().url()); return route.abort(); }
        return route.continue();
      });
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }));
      assert(dimensions.scroll <= dimensions.viewport + 1, 'Horizontal overflow at ' + width + ': ' + JSON.stringify(dimensions));
      assert(dimensions.height > 900, 'Content height missing');
      assert.equal(await page.locator('.project-card').count(), 3);
      assert.deepEqual(await page.locator('main section[id]').evaluateAll(sections => sections.map(s => s.id)), ['home','projects','skills','about','hobbies','contact']);
      assert.equal(await page.locator('#home canvas').count(), 1);
      assert.equal(await page.locator('#cursor-bubbles-canvas').evaluate(el => getComputedStyle(el).position), 'fixed');
      assert.equal(await page.locator('canvas').count(), 2);
      assert.equal(await page.locator('.hero-effects').evaluate(el => getComputedStyle(el).overflow), 'hidden');
      await page.locator('.pfilter-btn[data-pfilter="react"]').click();
      assert.equal(await page.locator('.project-card:visible').count(), 1);
      assert.equal(await page.locator('.pfilter-btn[data-pfilter="react"]').getAttribute('aria-pressed'), 'true');
      await page.locator('.pfilter-btn[data-pfilter="html-css"]').click();
      assert.equal(await page.locator('.project-card:visible').count(), 2);
      await page.locator('.pfilter-btn[data-pfilter="all"]').click();
      await page.locator('.skill-filter-btn[data-filter="core"]').click();
      assert.equal(await page.locator('.skill-category-block:visible').count(), 1);
      await page.locator('.skill-filter-btn[data-filter="all"]').click();
      const slideCount = await page.locator('.hobby-card-slide').count();
      const visibleSlides = width < 640 ? 1 : width < 1024 ? 2 : 3;
      const count = Math.max(1, slideCount - visibleSlides + 1);
      assert.equal(await page.locator('.hobby-dot').count(), count);
      await page.locator('.hobby-dot').last().click();
      assert.equal(await page.locator('.hobby-dot').last().getAttribute('aria-current'), 'true');
      await page.locator('#hobby-next-btn').click();
      assert.equal(await page.locator('.hobby-dot').first().getAttribute('aria-current'), 'true');
      await page.locator('#hobbies-carousel-viewport').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('.hobby-dot').nth(1).getAttribute('aria-current'), 'true');
      const cardsFit = await page.locator('.hobby-card-slide').evaluateAll(cards => cards.every(card => card.scrollHeight <= card.clientHeight + 1));
      assert(cardsFit, 'Hobby text clipped');
      if (width < 1024) {
        await page.locator('.mobile-menu-toggle').click();
        assert(await page.locator('#mobile-navigation').isVisible());
        await page.keyboard.press('Escape');
        assert(!(await page.locator('#mobile-navigation').isVisible()));
        await page.locator('.mobile-menu-toggle').click();
        await page.locator('#mobile-navigation a[href="#projects"]').click();
        assert(!(await page.locator('#mobile-navigation').isVisible()));
      }
      await page.locator('#contact').evaluate(section => section.scrollIntoView({ block: 'start' }));
      await page.waitForTimeout(100);
      assert(await page.evaluate(() => scrollY > 0));
      assert.equal(await page.locator('.desktop-navigation a[href="#contact"]').getAttribute('aria-current'), 'location');
      assert.equal(await page.locator('a[href="#"]').count(), 0);
      assert.equal(await page.locator('script[src*="tailwind"]').count(), 0);
      const images = await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0));
      assert(images, 'An image did not load');
      assert.equal(await page.locator('#motion-toggle').isDisabled(), true);
      assert.equal(external.length, 0, 'External assets: ' + external.join(', '));
      assert.deepEqual(errors, []); assert.deepEqual(failed, []);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(root, 'work/audit-checks/home-' + width + '.png') });
      if (width === 390 || width === 1366) await page.screenshot({ path: path.join(root, 'work/audit-checks/full-' + width + '.png'), fullPage: true });
      results.push({ width, ...dimensions, carouselPositions: count, errors });
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('#motion-toggle').isDisabled(), false);
    await page.waitForFunction(() => document.getElementById('home').dataset.motion === 'running');
    await page.locator('#projects').evaluate(el => scrollTo(0, el.getBoundingClientRect().top + scrollY));
    await page.waitForFunction(() => document.getElementById('home').dataset.motion === 'paused');
    assert(await page.locator('#ambient-bubbles-canvas').evaluate(canvas => canvas.getBoundingClientRect().bottom <= 100));
    await page.evaluate(() => scrollTo(0,0));
    await page.waitForFunction(() => document.getElementById('home').dataset.motion === 'running');
    await page.locator('#motion-toggle').click();
    assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'), 'true');
    await page.locator('#hobbies-carousel-viewport').scrollIntoViewIfNeeded();
    const rect = await page.locator('#hobbies-carousel-viewport').boundingBox();
    const session = await context.newCDPSession(page);
    const x = rect.x + rect.width * 0.75, y = rect.y + Math.min(rect.height / 2, 150);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 100, y: y + 2 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.hobby-dot').nth(1).getAttribute('aria-current'), 'true');
    await session.detach();
    await page.setViewportSize({ width: 768, height: 900 });
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.hobby-dot').count(), Math.max(1, await page.locator('.hobby-card-slide').count() - 1));
    const ratio = await page.locator('#ambient-bubbles-canvas').evaluate(canvas => canvas.width / canvas.getBoundingClientRect().width);
    assert.equal(ratio, 2);
    await page.addStyleTag({ content: 'html { font-size: 32px !important; }' });
    const fits = await page.locator('.hobby-card-slide').evaluateAll(cards => cards.every(card => card.scrollHeight <= card.clientHeight + 1));
    assert(fits, 'Enlarged hobby text clipped');
    await context.close();
    const pointerContext = await browser.newContext({viewport:{width:1366,height:900}});
    const pointerPage = await pointerContext.newPage();
    await pointerPage.goto(base, {waitUntil:'networkidle'});
    await pointerPage.locator('#contact').evaluate(el => el.scrollIntoView());
    await pointerPage.waitForFunction(() => document.getElementById('home').dataset.motion === 'paused');
    await pointerPage.mouse.move(200,300);
    await pointerPage.waitForFunction(() => {
      const pixels = document.getElementById('cursor-bubbles-canvas').getContext('2d').getImageData(170,270,60,60).data;
      return pixels.some((v,i) => i % 4 === 3 && v > 0);
    });
    await pointerContext.close();
    const noScript = await browser.newContext({javaScriptEnabled:false});
    const noScriptPage = await noScript.newPage();
    await noScriptPage.goto(base);
    assert.equal(await noScriptPage.locator('#contact-form').isVisible(), false);
    assert(await noScriptPage.locator('#contact a[href^="mailto:"]').first().isVisible());
    await noScript.close();
    fs.writeFileSync(path.join(root, 'work/audit-checks/results.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
    console.log('PASS: responsive layout, real local assets, filters, carousel, navigation, scrolling, motion and larger text.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
