const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const passwordInput = document.getElementById('password');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');
function parseBooleanParam(value, defaultValue) {
  if (value === null) return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return defaultValue;
}

function clampLength(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return Number.parseInt(lengthSlider.value, 10);
  return Math.min(64, Math.max(8, parsed));
}

function getSettingsFromUi() {
  return {
    length: Number.parseInt(lengthSlider.value, 10),
    uppercase: document.getElementById('uppercase').checked,
    lowercase: document.getElementById('lowercase').checked,
    numbers: document.getElementById('numbers').checked,
    symbols: document.getElementById('symbols').checked
  };
}

function applySettingsToUi(settings) {
  lengthSlider.value = String(settings.length);
  lengthValue.textContent = String(settings.length);
  document.getElementById('uppercase').checked = settings.uppercase;
  document.getElementById('lowercase').checked = settings.lowercase;
  document.getElementById('numbers').checked = settings.numbers;
  document.getElementById('symbols').checked = settings.symbols;
}

function readSettingsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    length: clampLength(params.get('length') ?? lengthSlider.value),
    uppercase: parseBooleanParam(params.get('uppercase'), true),
    lowercase: parseBooleanParam(params.get('lowercase'), true),
    numbers: parseBooleanParam(params.get('numbers'), true),
    symbols: parseBooleanParam(params.get('symbols'), true)
  };
}

function writeSettingsToUrl() {
  const settings = getSettingsFromUi();
  const params = new URLSearchParams(window.location.search);
  params.set('length', String(settings.length));
  params.set('uppercase', settings.uppercase ? '1' : '0');
  params.set('lowercase', settings.lowercase ? '1' : '0');
  params.set('numbers', settings.numbers ? '1' : '0');
  params.set('symbols', settings.symbols ? '1' : '0');

  const nextSearch = params.toString();
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', nextUrl);
}

function getCharacterSet() {
  let charset = '';
  if (document.getElementById('uppercase').checked) charset += UPPERCASE;
  if (document.getElementById('lowercase').checked) charset += LOWERCASE;
  if (document.getElementById('numbers').checked) charset += NUMBERS;
  if (document.getElementById('symbols').checked) charset += SYMBOLS;
  return charset;
}

function scalePasswordFont() {
  if (!passwordInput.value) {
    passwordInput.style.fontSize = '';
    return;
  }
  const minFontSize = 8;
  let fontSize = 16;
  passwordInput.style.fontSize = fontSize + 'px';
  while (passwordInput.scrollWidth > passwordInput.clientWidth && fontSize > minFontSize) {
    fontSize -= 1;
    passwordInput.style.fontSize = fontSize + 'px';
  }
}

function generatePassword() {
  const charset = getCharacterSet();
  if (!charset) {
    passwordInput.value = '';
    passwordInput.style.fontSize = '';
    writeSettingsToUrl();
    return;
  }

  const length = parseInt(lengthSlider.value, 10);
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  passwordInput.value = password;
  requestAnimationFrame(scalePasswordFont);
  writeSettingsToUrl();
}

async function copyPassword() {
  const password = passwordInput.value;
  if (!password) return;

  try {
    await navigator.clipboard.writeText(password);
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = 'Copy password';
      copyBtn.classList.remove('copied');
    }, 2000);
  } catch (err) {
    passwordInput.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = 'Copy password';
      copyBtn.classList.remove('copied');
    }, 2000);
  }
}

lengthSlider.addEventListener('input', () => {
  lengthValue.textContent = lengthSlider.value;
  if (passwordInput.value) {
    generatePassword();
  }
});

['uppercase', 'lowercase', 'numbers', 'symbols'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {
    if (passwordInput.value) {
      generatePassword();
    }
  });
});

generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyPassword);

applySettingsToUi(readSettingsFromUrl());
generatePassword();

window.addEventListener('resize', () => {
  if (passwordInput.value) scalePasswordFont();
});
