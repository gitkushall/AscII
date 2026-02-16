/**
 * LiveCam ASCII Filter — Web version
 * Supports both live camera and photo upload with high-detail character sets
 */

// Character sets: darkest → lightest (more chars = clearer image)
const CHAR_SETS = {
  ultra:   '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^\'`.',
  high:    '@%#*+=-:. ·\';^"~,:_!><i{}[]()1|/\\?lr+',
  medium:  '@%#*+=-:.·\'^",_!<>[]',
  standard:'@%#*+=-:. '
};

let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let asciiOutput = document.getElementById('ascii-output');
let stream = null;
let animationId = null;
let lastFrameTime = 0;
let frameCount = 0;
let fpsInterval = 0;
let currentMode = 'camera';

// DOM
const resolutionSlider = document.getElementById('resolution');
const resolutionVal = document.getElementById('resolution-val');
const charsetSelect = document.getElementById('charset');
const invertCheckbox = document.getElementById('invert');
const startCamBtn = document.getElementById('start-cam');
const stopCamBtn = document.getElementById('stop-cam');
const fileInput = document.getElementById('file-input');
const copyBtn = document.getElementById('copy-btn');
const fpsEl = document.getElementById('fps');
const dimsEl = document.getElementById('dimensions');

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentMode = tab.dataset.mode;

    if (currentMode === 'photo') {
      stopCamera();
      document.querySelector('.control-group.photo-only').classList.add('visible');
    } else {
      document.querySelector('.control-group.photo-only').classList.remove('visible');
    }
  });
});

// Resolution slider
resolutionSlider.addEventListener('input', () => {
  resolutionVal.textContent = resolutionSlider.value;
});

// Start / Stop camera
startCamBtn.addEventListener('click', startCamera);
stopCamBtn.addEventListener('click', stopCamera);

// Photo upload
fileInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => processImage(img);
  img.src = URL.createObjectURL(file);
});

copyBtn.addEventListener('click', () => {
  const text = asciiOutput.textContent;
  navigator.clipboard?.writeText(text).then(() => {
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy', 1500);
  });
});

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'q' || e.key === 'Q') stopCamera();
});

function getCharset() {
  const name = charsetSelect.value;
  let chars = CHAR_SETS[name] || CHAR_SETS.high;
  return invertCheckbox.checked ? [...chars].reverse().join('') : chars;
}

function pixelToChar(brightness, chars) {
  const index = Math.floor((brightness / 255) * (chars.length - 1));
  return chars[Math.max(0, Math.min(index, chars.length - 1))];
}

function imageToAscii(imageData, width, height, chars) {
  const cols = parseInt(resolutionSlider.value, 10);
  const aspect = width / height;
  const rows = Math.round(cols / aspect / 2); // account for char aspect
  const cellW = width / cols;
  const cellH = height / rows;
  const data = imageData.data;
  const lines = [];

  for (let row = 0; row < rows; row++) {
    let line = '';
    for (let col = 0; col < cols; col++) {
      const px = Math.floor(col * cellW);
      const py = Math.floor(row * cellH);
      const i = (py * width + px) << 2;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      line += pixelToChar(brightness, chars);
    }
    lines.push(line);
  }
  return lines.join('\n');
}

function processFrame() {
  if (!stream || !video.videoWidth) return;

  const w = video.videoWidth;
  const h = video.videoHeight;
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(video, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const chars = getCharset();
  const ascii = imageToAscii(imageData, w, h, chars);

  asciiOutput.textContent = ascii;
  asciiOutput.className = 'ascii-display' +
    (charsetSelect.value === 'ultra' ? ' ultra-res' : '') +
    (charsetSelect.value === 'high' ? ' high-res' : '');

  frameCount++;
  const now = performance.now();
  if (now - fpsInterval >= 1000) {
    fpsEl.textContent = frameCount;
    frameCount = 0;
    fpsInterval = now;
  }
  dimsEl.textContent = `${resolutionSlider.value}×${Math.round(parseInt(resolutionSlider.value, 10) / (w / h) / 2)}`;
}

function loop() {
  processFrame();
  animationId = requestAnimationFrame(loop);
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;
    video.classList.add('visible');
    startCamBtn.disabled = true;
    stopCamBtn.disabled = false;
    fpsInterval = performance.now();
    frameCount = 0;
    loop();
  } catch (err) {
    console.error('Camera error:', err);
    asciiOutput.textContent = 'Could not access camera. Allow camera permission and try again.';
  }
}

function stopCamera() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  video.srcObject = null;
  video.classList.remove('visible');
  startCamBtn.disabled = false;
  stopCamBtn.disabled = true;
  fpsEl.textContent = '—';
}

function processImage(img) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const chars = getCharset();
  const ascii = imageToAscii(imageData, w, h, chars);

  asciiOutput.textContent = ascii;
  asciiOutput.className = 'ascii-display' +
    (charsetSelect.value === 'ultra' ? ' ultra-res' : '') +
    (charsetSelect.value === 'high' ? ' high-res' : '');

  const cols = parseInt(resolutionSlider.value, 10);
  const aspect = w / h;
  const rows = Math.round(cols / aspect / 2);
  dimsEl.textContent = `${cols}×${rows}`;
}
