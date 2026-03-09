const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const passwordInput = document.getElementById('password');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');
const strengthFill = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');

function getCharacterSet() {
  let charset = '';
  if (document.getElementById('uppercase').checked) charset += UPPERCASE;
  if (document.getElementById('lowercase').checked) charset += LOWERCASE;
  if (document.getElementById('numbers').checked) charset += NUMBERS;
  if (document.getElementById('symbols').checked) charset += SYMBOLS;
  return charset;
}

function generatePassword() {
  const charset = getCharacterSet();
  if (!charset) {
    passwordInput.value = '';
    updateStrength('');
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
  updateStrength(password);
}

function calculateStrength(password) {
  if (!password) return { score: 0, label: '—' };

  let entropy = 0;
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
  if (charsetSize === 0) charsetSize = 1;

  entropy = password.length * Math.log2(charsetSize);

  if (entropy < 28) return { score: 0.33, label: 'Weak' };
  if (entropy < 44) return { score: 0.66, label: 'Average' };
  return { score: 1, label: 'Strong' };
}

function updateStrength(password) {
  const { score, label } = calculateStrength(password);
  strengthFill.style.width = `${score * 100}%`;
  strengthFill.className = 'strength-fill ' +
    (score < 0.5 ? 'weak' : score < 0.85 ? 'average' : 'strong');
  strengthLabel.textContent = label;
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
