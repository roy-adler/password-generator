# Password Generator

[View on GitHub](https://github.com/roy-adler/password-generator)

A secure, browser-based password generator that runs in Docker—inspired by the [LastPass password generator](https://www.lastpass.com/de/features/password-generator).

## Features

- **Secure randomness** — Uses `crypto.getRandomValues()` for cryptographically secure password generation
- **Configurable length** — Slider from 8 to 64 characters
- **Character options** — Toggle uppercase, lowercase, numbers, and special characters
- **Strength indicator** — Visual feedback (Weak / Average / Strong) based on entropy
- **One-click copy** — Copy generated passwords to clipboard

## Quick Start

### With Docker

```bash
# Build the image
docker build -t password-generator .

# Run the container (serves on port 8080)
docker run -p 8080:80 password-generator
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

### Without Docker

You can also use the generator by serving the files locally. For example, with Python:

```bash
# Python 3
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Security

- Passwords are generated entirely in your browser using the Web Crypto API
- No passwords are sent to any server
- All generation happens client-side for maximum privacy
