const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const passwordInput = document.getElementById('password');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');

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

lengthValue.textContent = lengthSlider.value;
generatePassword();

window.addEventListener('resize', () => {
  if (passwordInput.value) scalePasswordFont();
});
