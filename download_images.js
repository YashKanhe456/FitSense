const fs = require('fs');
const https = require('https');
const path = require('path');

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        // Handle redirect
        downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

const categories = {
  cat_shirt: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
  cat_jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
  cat_sherwani: 'https://images.unsplash.com/photo-1585914924626-15adac1e6402?auto=format&fit=crop&w=600&q=80',
  cat_blazer: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4742?auto=format&fit=crop&w=600&q=80',
  cat_tshirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
  cat_pants: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
  cat_kurta: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80',
  cat_nehru: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80'
};

const products = {
  shirt_white: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
  shirt_blue: 'https://images.unsplash.com/photo-1603252110-1e2f02b21d00?auto=format&fit=crop&w=800&q=80',
  shirt_check: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?auto=format&fit=crop&w=800&q=80',
  tshirt_white: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
  tshirt_polo: 'https://images.unsplash.com/photo-1625910513422-3b5b8d04d51a?auto=format&fit=crop&w=800&q=80',
  pants_chino: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
  pants_formal: 'https://images.unsplash.com/photo-1548811087-a3b48f16c4fa?auto=format&fit=crop&w=800&q=80',
  jeans_dark: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
  jeans_light: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80',
  suit_charcoal: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4742?auto=format&fit=crop&w=800&q=80',
  blazer_navy: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  sherwani_gold: 'https://images.unsplash.com/photo-1585914924626-15adac1e6402?auto=format&fit=crop&w=800&q=80',
  sherwani_maroon: 'https://images.unsplash.com/photo-1620015509740-f192b0be6e19?auto=format&fit=crop&w=800&q=80',
  kurta_navy: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
  kurta_white: 'https://images.unsplash.com/photo-1603204961502-ad185f3debb1?auto=format&fit=crop&w=800&q=80',
  nehru_emerald: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
  indo_western: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80'
};

const init = async () => {
  const catDir = path.join(__dirname, 'Frontend', 'src', 'assets', 'categories');
  const prodDir = path.join(__dirname, 'Frontend', 'src', 'assets', 'products');

  fs.mkdirSync(catDir, { recursive: true });
  fs.mkdirSync(prodDir, { recursive: true });

  console.log("Downloading categories...");
  for (const [name, url] of Object.entries(categories)) {
    try {
      await downloadImage(url, path.join(catDir, `${name}.jpg`));
      console.log(`Downloaded ${name}.jpg`);
    } catch (e) {
      console.error(`Failed ${name}: ${e.message}`);
    }
  }

  console.log("Downloading products...");
  for (const [name, url] of Object.entries(products)) {
    try {
      await downloadImage(url, path.join(prodDir, `${name}.jpg`));
      console.log(`Downloaded ${name}.jpg`);
    } catch (e) {
      console.error(`Failed ${name}: ${e.message}`);
    }
  }
};

init();
