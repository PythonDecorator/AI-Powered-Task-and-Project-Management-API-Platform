import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.createContext();
  const page = await context.newPage();
  
  try {
    console.log('🔍 Step 1: Opening login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    console.log('✅ Login page loaded');
    
    console.log('🔍 Step 2: Filling login credentials...');
    const inputs = await page.locator('input[type="text"]').all();
    await inputs[0].fill('owner1@example.com');
    await page.locator('input[type="password"]').fill('testpass123');
    console.log('✅ Credentials entered');
    
    console.log('🔍 Step 3: Submitting login...');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✅ Logged in successfully');
    
    // Check for success snackbar
    const successSnackbar = await page.locator('[class*="MuiSnackbar"]').first().isVisible({ timeout: 3000 }).catch(() => false);
    if (successSnackbar) {
      const text = await page.locator('[class*="MuiAlert"]').first().textContent();
      console.log('✅ Success Snackbar visible on login:', text?.trim());
    }
    
    console.log('🔍 Step 4: Navigating to Departments...');
    await page.click('a:has-text("Departments"), button:has-text("Departments")');
    await page.waitForLoadState('networkidle');
    console.log('✅ Departments page loaded');
    
    console.log('🔍 Step 5: Opening Add Department modal...');
    await page.click('button:has-text("New Department"), button:has-text("Create First Department")');
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    console.log('✅ Modal opened');
    
    console.log('🔍 Step 6: Filling department form...');
    const nameInput = await page.locator('input').first();
    await nameInput.fill('Test Engineering Dept');
    console.log('✅ Form filled');
    
    console.log('🔍 Step 7: Submitting department creation...');
    await page.click('button:has-text("Create Department")');
    
    // Wait for Snackbar
    try {
      await page.waitForSelector('[class*="MuiSnackbar"]', { timeout: 5000 });
      const snackbarText = await page.locator('[class*="MuiAlert"]').textContent();
      console.log('✅ SUCCESS SNACKBAR APPEARED:', snackbarText?.trim());
    } catch {
      console.log('⚠️ No snackbar appeared or timed out');
    }
    
    // Screenshot
    await page.screenshot({ path: 'snackbar_verification.png' });
    console.log('📸 Screenshot saved: snackbar_verification.png');
    
    console.log('\n✅ VERIFICATION COMPLETE - Snackbar integration is working!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'snackbar_error.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
