const puppeteer = require('puppeteer');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = 'production_super_secret_key_change_me_later';
const BASE_URL = 'https://intec-service-hub.vercel.app';
const OUT_DIR = path.join(__dirname, 'presentation_screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Dummy company ID
const companyId = '666666666666666666666666';

const users = {
  super_admin: { id: '111111111111111111111111', name: 'John Super', email: 'super@test.com', role: 'super_admin', department: 'IT', companyId },
  admin: { id: '222222222222222222222222', name: 'Jane Admin', email: 'admin@test.com', role: 'Admin', department: 'IT', companyId },
  engineer: { id: '333333333333333333333333', name: 'Bob Engineer', email: 'engineer@test.com', role: 'Engineer', department: 'IT', companyId },
  employee: { id: '444444444444444444444444', name: 'Alice Employee', email: 'employee@test.com', role: 'Employee', department: 'Sales', companyId },
};

function generateToken(userObj) {
  return jwt.sign(userObj, JWT_SECRET, { expiresIn: '1d' });
}

async function injectSession(page, userKey) {
  const userObj = users[userKey];
  const token = generateToken(userObj);
  await page.evaluate((t, u) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', u);
  }, token, JSON.stringify(userObj));
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    defaultViewport: { width: 1280, height: 800 }
  });
  const page = await browser.newPage();

  try {
    console.log('1. Slide 1 - Landing Page');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(1000);
    await page.screenshot({ path: path.join(OUT_DIR, 'Slide_1_Landing_Page.png') });

    console.log('2. Slide 4 - Onboarding');
    await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'networkidle0' });
    await delay(1000);
    // Click Next Step
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next Step'));
      if(btn) btn.click();
    });
    await delay(1500);
    await page.screenshot({ path: path.join(OUT_DIR, 'Slide_4_Onboarding.png') });

    console.log('3. Slide 5 - Super Admin Dashboard');
    // Clear & Inject
    await page.goto(`${BASE_URL}/login`); 
    await injectSession(page, 'super_admin');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
    await delay(2500); // Wait for KPIs to load
    await page.screenshot({ path: path.join(OUT_DIR, 'Slide_5_Super_Admin_Dashboard.png') });

    console.log('4. Slide 6 - Admin Assign Engineer');
    await page.goto(`${BASE_URL}/login`); 
    await injectSession(page, 'admin');
    await page.goto(`${BASE_URL}/tickets`, { waitUntil: 'networkidle0' });
    await delay(2500);
    await page.evaluate(() => {
      const firstRowBtn = document.querySelector('tbody tr:first-child td:last-child button');
      if(firstRowBtn) firstRowBtn.click();
    });
    await delay(1000);
    await page.screenshot({ path: path.join(OUT_DIR, 'Slide_6_Admin_Assign_Engineer.png') });

    console.log('5. Slide 7 - Engineer Side Panel');
    await page.goto(`${BASE_URL}/login`); 
    await injectSession(page, 'engineer');
    await page.goto(`${BASE_URL}/tickets`, { waitUntil: 'networkidle0' });
    await delay(2500);
    await page.evaluate(() => {
      const firstRow = document.querySelector('tbody tr:first-child td:nth-child(3)');
      if(firstRow) firstRow.click();
    });
    await delay(1500);
    await page.screenshot({ path: path.join(OUT_DIR, 'Slide_7_Engineer_Side_Panel.png') });

    console.log('6. Slide 8 - Employee Raise Ticket');
    await page.goto(`${BASE_URL}/login`); 
    await injectSession(page, 'employee');
    await page.goto(`${BASE_URL}/tickets`, { waitUntil: 'networkidle0' });
    await delay(2500);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Raise Ticket'));
      if(btn) btn.click();
    });
    await delay(1500);
    await page.screenshot({ path: path.join(OUT_DIR, 'Slide_8_Employee_Raise_Ticket.png') });

    console.log('7. Slide 9 - Master Admin Wipe');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login/anantsoni456789123anant@2005`, { waitUntil: 'networkidle0' });
    await delay(1000);
    await page.screenshot({ path: path.join(OUT_DIR, 'Slide_9_Master_Admin_Secret.png') });

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Error taking screenshots:', err);
  } finally {
    await browser.close();
  }
}

run();
