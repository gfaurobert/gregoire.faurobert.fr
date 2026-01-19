# Online Resume - Static Site

This is the git repo for my Online Resume, built with Hugo and enhanced with JavaScript features.

## Features

The static site includes the following JavaScript enhancements:

- **Language Switcher**: Switch between English, French, and German versions of the CV
- **Smooth Scrolling**: Enhanced navigation with smooth scroll behavior
- **Print Optimization**: Print button for easy printing
- **Copy Email**: Click-to-copy email functionality
- **Section Highlighting**: Sections fade in as you scroll
- **Responsive Navigation**: Mobile-friendly navigation menu

## Development

### Prerequisites

- Node.js and npm installed
- Hugo (for generating the static site)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Generate the Hugo site (if needed):
```bash
hugo
```

3. Start the development server:
```bash
npm run serve
# or
npm run dev
```

The site will be available at `http://localhost:3000`

### Scripts

- `npm run serve` - Start a simple HTTP server on port 3000
- `npm run dev` - Start server with CORS enabled (useful for development)
- `npm start` - Alias for `npm run serve`

## Project Structure

```
.
├── public/              # Generated static site (Hugo output)
│   ├── index.html      # Main HTML file
│   ├── js/             # JavaScript enhancements
│   │   └── enhancements.js
│   ├── data_*.json     # Language data files
│   └── assets/         # CSS, fonts, images
├── data/               # Hugo data files (source)
├── themes/             # Hugo theme
├── config.yml          # Hugo configuration
└── package.json        # Node.js dependencies and scripts
```

## Deployment

The `public/` folder contains the complete static site and can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

For server deployment, use the included `deploy.sh` script:
```bash
./deploy.sh site    # Deploy site files
./deploy.sh nginx   # Deploy nginx configuration
```
