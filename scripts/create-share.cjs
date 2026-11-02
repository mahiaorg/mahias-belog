const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.setContent(`<html><head><style>*{box-sizing:border-box}body{margin:0;padding:80px;background:#090a14;color:#f1f5f9;font-family:Arial,sans-serif;height:630px;border:16px solid #211633}.monogram{color:#c084fc;font-weight:800;font-size:36px;letter-spacing:4px}h1{font-size:72px;margin:60px 0 18px;letter-spacing:-2px}p{font-size:32px;color:#d8b4fe;margin:0}.tags{font-size:22px;color:#bdc4d4;margin-top:58px;letter-spacing:1px}</style></head><body><div class="monogram">MT / PORTFOLIO</div><h1>Mahia Tavakkoli</h1><p>Front-End Developer</p><div class="tags">HTML &nbsp;·&nbsp; CSS &nbsp;·&nbsp; JavaScript &nbsp;·&nbsp; React</div></body></html>`);
    await page.screenshot({ path: path.resolve(__dirname, '../images/portfolio-share.png') });
    console.log('Created 1200 × 630 share image.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
