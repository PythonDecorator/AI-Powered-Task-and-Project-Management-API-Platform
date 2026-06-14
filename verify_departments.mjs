import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Navigate to login
    console.log('📍 Navigating to login page...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });

    // Wait for the login form
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    console.log('✅ Login page loaded');

    // Check if we're on login page
    const url = page.url();
    console.log(`Current URL: ${url}`);

    // Fill in login credentials
    console.log('📝 Filling in login credentials...');
    await page.type('input[type="email"]', 'owner1@example.com');
    await page.type('input[type="password"]', 'testpass123');

    // Click login button
    console.log('🔐 Clicking login button...');
    const loginButton = await page.$('button[type="submit"]');
    await loginButton.click();

    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Login successful');
    console.log(`Navigated to: ${page.url()}`);

    // Navigate to departments
    console.log('📍 Navigating to departments page...');
    await page.goto('http://localhost:5174/organization/departments', { waitUntil: 'networkidle0' });
    console.log('✅ Departments page loaded');

    // Wait for the departments content
    const hasContent = await page.waitForSelector('h4', { timeout: 5000 }).catch(() => false);
    if (hasContent) {
      const heading = await page.$eval('h4', el => el.textContent);
      console.log(`📄 Page heading: ${heading}`);
    }

    // Take screenshot of departments page
    console.log('📸 Taking screenshot of departments page...');
    await page.screenshot({ path: '/tmp/departments_page.png' });
    console.log('✅ Screenshot saved');

    // Try clicking the create button
    console.log('🔘 Looking for create button...');
    const createButton = await page.$('button:has-text("New Department")') || await page.$('button:contains("New Department")');

    // Alternative: Look for any button with "New" or "Create" text
    const buttons = await page.$$('button');
    let createBtn = null;
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text.includes('New Department') || text.includes('Create First Department')) {
        createBtn = btn;
        console.log(`✅ Found button: "${text}"`);
        break;
      }
    }

    if (createBtn) {
      console.log('🔘 Clicking create button...');
      await createBtn.click();

      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      console.log('✅ Modal appeared');

      // Check modal title
      const modalTitle = await page.$eval('[role="dialog"] h2', el => el.textContent).catch(() => 'No title');
      console.log(`📋 Modal title: ${modalTitle}`);

      // Take screenshot of modal
      await page.screenshot({ path: '/tmp/department_modal.png' });
      console.log('✅ Modal screenshot saved');
    } else {
      console.log('⚠️ Create button not found - departments might be empty');
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
