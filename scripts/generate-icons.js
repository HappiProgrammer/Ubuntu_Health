const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(process.cwd(), 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Colors
const primaryColor = '#2563eb'; // Blue from the theme
const secondaryColor = '#1e40af'; // Darker blue

async function generateIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}" />
      <circle cx="${size * 0.35}" cy="${size * 0.4}" r="${size * 0.12}" fill="white" opacity="0.9"/>
      <circle cx="${size * 0.65}" cy="${size * 0.4}" r="${size * 0.12}" fill="white" opacity="0.9"/>
      <path d="M ${size * 0.25} ${size * 0.65} Q ${size * 0.5} ${size * 0.85} ${size * 0.75} ${size * 0.65}" 
            stroke="white" stroke-width="${size * 0.08}" fill="none" stroke-linecap="round"/>
      <text x="${size * 0.5}" y="${size * 0.95}" 
            font-family="Arial, sans-serif" font-size="${size * 0.1}" 
            fill="white" text-anchor="middle" opacity="0.8">CT</text>
    </svg>
  `;

  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`Generated: icon-${size}x${size}.png`);
}

async function generateShortcutIcon(name) {
  const size = 96;
  let iconPath = '';
  
  if (name === 'search') {
    iconPath = `<circle cx="${size*0.4}" cy="${size*0.4}" r="${size*0.2}" stroke="white" stroke-width="${size*0.08}" fill="none"/>
                <line x1="${size*0.55}" y1="${size*0.55}" x2="${size*0.75}" y2="${size*0.75}" stroke="white" stroke-width="${size*0.08}" stroke-linecap="round"/>`;
  } else if (name === 'post') {
    iconPath = `<rect x="${size*0.25}" y="${size*0.2}" width="${size*0.5}" height="${size*0.6}" rx="${size*0.05}" stroke="white" stroke-width="${size*0.06}" fill="none"/>
                <line x1="${size*0.35}" y1="${size*0.4}" x2="${size*0.65}" y2="${size*0.4}" stroke="white" stroke-width="${size*0.06}" stroke-linecap="round"/>
                <line x1="${size*0.35}" y1="${size*0.55}" x2="${size*0.55}" y2="${size*0.55}" stroke="white" stroke-width="${size*0.06}" stroke-linecap="round"/>`;
  } else if (name === 'chat') {
    iconPath = `<rect x="${size*0.2}" y="${size*0.25}" width="${size*0.6}" height="${size*0.5}" rx="${size*0.1}" stroke="white" stroke-width="${size*0.06}" fill="none"/>
                <path d="M ${size*0.35} ${size*0.75} L ${size*0.25} ${size*0.85} L ${size*0.4} ${size*0.75}" stroke="white" stroke-width="${size*0.06}" fill="none" stroke-linejoin="round"/>`;
  }
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${name}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad${name})" rx="${size * 0.2}" />
      ${iconPath}
    </svg>
  `;

  const outputPath = path.join(iconsDir, `${name}-96x96.png`);
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`Generated: ${name}-96x96.png`);
}

async function main() {
  console.log('Generating CareTaker PWA icons...\n');
  
  // Generate main app icons
  for (const size of iconSizes) {
    await generateIcon(size);
  }
  
  // Generate shortcut icons
  await generateShortcutIcon('search');
  await generateShortcutIcon('post');
  await generateShortcutIcon('chat');
  
  console.log('\nAll icons generated successfully!');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
