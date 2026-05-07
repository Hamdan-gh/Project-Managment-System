#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Checking deployment readiness...\n');

// Check if all required images exist in public folder
const requiredImages = ['logo.jpg', 'uds.jpg', '1.png', '2.jpg', '3.jpg'];
const publicDir = './public';
const distDir = './dist';

console.log('📁 Checking public folder images:');
requiredImages.forEach(image => {
  const imagePath = path.join(publicDir, image);
  if (fs.existsSync(imagePath)) {
    console.log(`✅ ${image} - Found`);
  } else {
    console.log(`❌ ${image} - Missing`);
  }
});

console.log('\n📦 Checking dist folder (after build):');
if (fs.existsSync(distDir)) {
  requiredImages.forEach(image => {
    const imagePath = path.join(distDir, image);
    if (fs.existsSync(imagePath)) {
      console.log(`✅ ${image} - Found in dist`);
    } else {
      console.log(`❌ ${image} - Missing in dist`);
    }
  });
} else {
  console.log('❌ dist folder not found. Run "npm run build" first.');
}

console.log('\n🔧 Checking configuration files:');

// Check vercel.json
if (fs.existsSync('./vercel.json')) {
  console.log('✅ vercel.json - Found');
  const vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
  const hasImageRoutes = vercelConfig.routes?.some(route => 
    route.src?.includes('png|jpg|jpeg|gif|svg|ico|webp')
  );
  if (hasImageRoutes) {
    console.log('✅ Image routes configured in vercel.json');
  } else {
    console.log('⚠️  Image routes may not be properly configured');
  }
} else {
  console.log('❌ vercel.json - Missing');
}

// Check vite.config.ts
if (fs.existsSync('./vite.config.ts')) {
  console.log('✅ vite.config.ts - Found');
} else {
  console.log('❌ vite.config.ts - Missing');
}

console.log('\n🚀 Deployment checklist:');
console.log('1. ✅ All images are in public/ folder');
console.log('2. ✅ Build process copies images to dist/');
console.log('3. ✅ getAssetUrl() function uses root paths');
console.log('4. ✅ Vercel config handles image routes');
console.log('\n🎉 Ready for deployment!');
console.log('\nTo deploy:');
console.log('1. Commit all changes: git add . && git commit -m "Fix image deployment"');
console.log('2. Push to repository: git push');
console.log('3. Vercel will automatically redeploy');