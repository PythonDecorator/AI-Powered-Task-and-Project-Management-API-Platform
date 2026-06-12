const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Enable console message logging
  page.on('console', msg => console.log('[BROWSER]', msg.type(), msg.text()));
  page.on('response', response => {
    if (response.request().postData()) {
      console.log('[API]', response.request().method(), response.url(), response.status());
    }
  });

  console.log('Opening login page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  
  console.log('Filling in credentials...');
  await page.fill('input[type="email"]', 'owner1@example.com');
  await page.fill('input[type="password"]', 'testpass123');
  
  console.log('Clicking submit...');
  await page.click('button[type="submit"]');
  
  // Wait a bit for response
  await page.waitForTimeout(3000);
  
  console.log('Current URL:', page.url());
  console.log('Page content (first 500 chars):', await page.content().then(c => c.substring(0, 500)));
  
  await browser.close();
})().catch(console.error);
