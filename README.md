# Password Generator

[View on GitHub](https://github.com/roy-adler/password-generator)

A secure password generator web app that runs in Docker and now also exposes an HTTP API.

## Features

- **Secure randomness** — Uses `crypto.getRandomValues()` for cryptographically secure password generation
- **Configurable length** — Slider from 8 to 64 characters
- **Character options** — Toggle uppercase, lowercase, numbers, and special characters
- **One-click copy** — Copy generated passwords to clipboard
- **API endpoint** — Generate passwords from `curl` or another app via `/api/password`
- **Shareable URL settings** — Browser settings are reflected in query params

## Quick Start

### With Docker

```bash
# Build the image
docker build -t password-generator .

# Run the container (serves on port 8080)
docker run -p 8080:80 password-generator
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

## API Usage

Generate a password as JSON:

```bash
curl "http://localhost:8080/api/password?length=20&uppercase=1&lowercase=1&numbers=1&symbols=1"
```

Generate as plain text (easy for scripts):

```bash
curl "http://localhost:8080/api/password?length=20&symbols=0&format=text"
```

### Query Parameters

- `length` — integer from `8` to `64` (default `12`)
- `uppercase` — `1` or `0` (default `1`)
- `lowercase` — `1` or `0` (default `1`)
- `numbers` — `1` or `0` (default `1`)
- `symbols` — `1` or `0` (default `1`)
- `format` — `json` or `text` (default `json`)

## Security Notes

- Browser generation uses the Web Crypto API (`crypto.getRandomValues()`).
- API generation uses Node.js crypto (`crypto.randomInt()`).
- Use HTTPS in production when exposing the API.
