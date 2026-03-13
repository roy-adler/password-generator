const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number.parseInt(process.env.PORT || '80', 10);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function parseBooleanParam(value, defaultValue) {
  if (value == null) return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return defaultValue;
}

function parseLength(value, defaultValue = 12) {
  const parsed = Number.parseInt(String(value ?? defaultValue), 10);
  if (Number.isNaN(parsed)) return defaultValue;
  return Math.min(64, Math.max(8, parsed));
}

function getCharset(options) {
  let charset = '';
  if (options.uppercase) charset += UPPERCASE;
  if (options.lowercase) charset += LOWERCASE;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;
  return charset;
}

function generatePassword(length, charset) {
  let result = '';
  for (let i = 0; i < length; i += 1) {
    const index = crypto.randomInt(0, charset.length);
    result += charset[index];
  }
  return result;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

function securityHeaders() {
  return {
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block'
  };
}

function handleApiPassword(req, res, url, forcedFormat) {
  const length = parseLength(url.searchParams.get('length'), 12);
  const options = {
    uppercase: parseBooleanParam(url.searchParams.get('uppercase'), true),
    lowercase: parseBooleanParam(url.searchParams.get('lowercase'), true),
    numbers: parseBooleanParam(url.searchParams.get('numbers'), true),
    symbols: parseBooleanParam(url.searchParams.get('symbols'), true)
  };

  const charset = getCharset(options);
  if (!charset) {
    sendJson(res, 400, {
      error: 'At least one character class must be enabled.',
      acceptedParams: {
        length: '8-64',
        uppercase: '1|0',
        lowercase: '1|0',
        numbers: '1|0',
        symbols: '1|0',
        format: 'json|text'
      }
    });
    return;
  }

  const password = generatePassword(length, charset);
  const format = (forcedFormat || url.searchParams.get('format') || 'json').toLowerCase();
  if (format === 'text') {
    sendText(res, 200, `${password}\n`);
    return;
  }

  sendJson(res, 200, { password, length, ...options });
}

function safeRelativePath(urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  return normalized === '/' ? '/index.html' : normalized;
}

function handleStatic(req, res, url) {
  const relative = safeRelativePath(url.pathname);
  const absolutePath = path.join(ROOT, relative);

  if (!absolutePath.startsWith(ROOT)) {
    res.writeHead(403, securityHeaders());
    res.end('Forbidden');
    return;
  }

  fs.readFile(absolutePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(ROOT, 'index.html'), (indexError, indexContent) => {
        if (indexError) {
          res.writeHead(500, securityHeaders());
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(200, {
          ...securityHeaders(),
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        res.end(indexContent);
      });
      return;
    }

    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const cacheControl = ext === '.html' ? 'no-cache' : 'public, max-age=86400';
    res.writeHead(200, {
      ...securityHeaders(),
      'Content-Type': contentType,
      'Cache-Control': cacheControl
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  if (url.pathname === '/api/password') {
    handleApiPassword(req, res, url);
    return;
  }

  if (url.pathname === '/api/password.txt') {
    handleApiPassword(req, res, url, 'text');
    return;
  }

  handleStatic(req, res, url);
});

server.listen(PORT, HOST, () => {
  console.log(`Password generator server running on http://${HOST}:${PORT}`);
});
