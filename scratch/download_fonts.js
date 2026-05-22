const fs = require('fs');
const https = require('https');
const path = require('path');

const fonts = [
  {
    name: 'Amiri-Regular.ttf',
    url: 'https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Regular.ttf'
  },
  {
    name: 'Amiri-Bold.ttf',
    url: 'https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Bold.ttf'
  }
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        download(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function main() {
  const dir = path.join(__dirname, '..', 'public', 'fonts');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const font of fonts) {
    console.log(`Downloading ${font.name}...`);
    try {
      await download(font.url, path.join(dir, font.name));
      console.log(`Downloaded ${font.name} successfully.`);
    } catch (err) {
      console.error(`Error downloading ${font.name}:`, err.message);
    }
  }
}

main();
