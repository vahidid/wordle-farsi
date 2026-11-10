import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9444;
const PROFILE_DIR = '/tmp/chrome-wordle-profile-' + Date.now();

async function run() {
  console.log('Launching headless Chrome...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${PROFILE_DIR}`,
    'about:blank',
  ]);

  await new Promise((r) => setTimeout(r, 1500));

  // Get WebSocket Debugger URL
  const versionRes = await fetch(`http://127.0.0.1:${PORT}/json/version`);
  const versionData = await versionRes.json();
  const wsUrl = versionData.webSocketDebuggerUrl;

  console.log('Connecting to Chrome WebSocket:', wsUrl);
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((r) => (ws.onopen = r));

  function send(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Create a new target/page
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', {
    targetId,
    flatten: true,
  });

  function sendPage(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, sessionId, method, params }));
    });
  }

  // Emulate iPhone 14 Pro Mobile Viewport
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  await sendPage('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 5,
  });

  await sendPage('Page.enable');
  await sendPage('Runtime.enable');

  console.log('Navigating to https://wordle-farsi.vercel.app ...');
  await sendPage('Page.navigate', { url: 'https://wordle-farsi.vercel.app' });

  // Wait for page load
  await new Promise((r) => setTimeout(r, 4000));

  async function takeScreenshot(filePath) {
    const { data } = await sendPage('Page.captureScreenshot', {
      format: 'png',
    });
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);
  }

  async function evalJs(expression) {
    return await sendPage('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
  }

  // Screenshot 1: Help Modal (if first visit, it appears automatically)
  console.log('Taking Screenshot 1: Help Modal...');
  await takeScreenshot('screenshots/1-how-to-play.png');

  // Dismiss Help modal if visible
  await evalJs(`
    const closeBtn = document.querySelector('button[aria-label="بستن"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('شروع بازی') || b.textContent.includes('متوجه شدم'));
    if (closeBtn) closeBtn.click();
    else {
      // Click backdrop
      const backdrop = document.querySelector('.fixed.inset-0');
      if (backdrop) backdrop.click();
    }
  `);

  await new Promise((r) => setTimeout(r, 1000));

  // Screenshot 2: Clean game board with new QWERTY Persian keyboard
  console.log('Taking Screenshot 2: Clean Board & QWERTY Keyboard...');
  await takeScreenshot('screenshots/2-main-gameplay.png');

  // Now simulate typing real words using keyboard buttons!
  console.log('Simulating typing words on keyboard...');
  await evalJs(`
    // Function to click letter button
    function clickKey(char) {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.trim() === char);
      if (btn) btn.click();
    }

    function clickEnter() {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('ثبت'));
      if (btn) btn.click();
    }

    // Type first guess: ب - ا - ر - ا - ن
    ['ب', 'ا', 'ر', 'ا', 'ن'].forEach(c => clickKey(c));
    clickEnter();
  `);

  await new Promise((r) => setTimeout(r, 1600));

  // Type second guess: ت - ه - ر - ا - ن
  await evalJs(`
    function clickKey(char) {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.trim() === char);
      if (btn) btn.click();
    }
    function clickEnter() {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('ثبت'));
      if (btn) btn.click();
    }
    ['ت', 'ه', 'ر', 'ا', 'ن'].forEach(c => clickKey(c));
    clickEnter();
  `);

  await new Promise((r) => setTimeout(r, 1800));

  // Screenshot 3: Active gameplay with colored tiles and colored keyboard keys
  console.log('Taking Screenshot 3: Active Gameplay with Evaluated Tiles...');
  await takeScreenshot('screenshots/3-active-gameplay.png');

  // Open Leaderboard / Stats Modal
  console.log('Opening Leaderboard Modal...');
  await evalJs(`
    const trophyBtn = document.querySelector('button[aria-label="جدول رده‌بندی"]') || document.querySelector('button[title*="رده‌بندی"]');
    if (trophyBtn) trophyBtn.click();
  `);

  await new Promise((r) => setTimeout(r, 1500));

  // Screenshot 4: Leaderboard Modal
  console.log('Taking Screenshot 4: Leaderboard Modal...');
  await takeScreenshot('screenshots/4-leaderboard.png');

  console.log('All screenshots captured successfully!');
  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
