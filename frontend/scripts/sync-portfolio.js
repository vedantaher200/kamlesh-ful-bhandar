const fs = require('fs');
const path = require('path');

const portfolioDir = path.join(__dirname, '../public/images/portfolio');
const outputFile = path.join(__dirname, '../src/data/uploadedPhotos.json');

if (!fs.existsSync(portfolioDir)) {
  fs.mkdirSync(portfolioDir, { recursive: true });
}

const entries = fs.readdirSync(portfolioDir);
const imageFiles = entries.filter((f) => /\.(jpg|jpeg|png|webp|jfif|avif)$/i.test(f));

console.log(`🌸 Found ${imageFiles.length} uploaded photos in public/images/portfolio/`);

const photoObjects = imageFiles.map((filename, index) => {
  // Infer category from filename if available, or default to general floral decor
  const lower = filename.toLowerCase();
  let category = 'customer-work';
  let categoryLabel = 'Our Real Work';
  let subCategory = 'Floral Work';
  let carType = undefined;
  let carModel = undefined;

  if (lower.includes('car') || lower.includes('thar') || lower.includes('sedan') || lower.includes('suv')) {
    category = 'car-decoration';
    categoryLabel = 'Car Decoration';
    subCategory = 'Car Decoration';
  } else if (lower.includes('haar') || lower.includes('mala') || lower.includes('varmala')) {
    category = 'haar-varmala';
    categoryLabel = 'Haar & Varmala';
    if (lower.includes('rose')) subCategory = 'Rose Varmala';
    else if (lower.includes('pink')) subCategory = 'Pink Rose Varmala';
    else if (lower.includes('white')) subCategory = 'White Rose Varmala';
    else if (lower.includes('lotus')) subCategory = 'Lotus Varmala';
    else subCategory = 'Traditional Haar';
  } else if (lower.includes('bouquet') || lower.includes('gift') || lower.includes('money')) {
    category = 'bouquets';
    categoryLabel = 'Flower Bouquets';
    if (lower.includes('money')) subCategory = 'Money Bouquet';
    else if (lower.includes('birthday')) subCategory = 'Birthday Bouquet';
    else subCategory = 'Fresh Flower Bouquet';
  } else if (lower.includes('door') || lower.includes('entrance') || lower.includes('arch') || lower.includes('toran')) {
    category = 'entrance-decoration';
    categoryLabel = 'Door & Entrance Decoration';
    subCategory = 'Floral Entrance';
  } else if (lower.includes('wedding') || lower.includes('mandap') || lower.includes('stage') || lower.includes('haldi')) {
    category = 'wedding-engagement';
    categoryLabel = 'Wedding & Engagement';
    subCategory = 'Wedding Decoration';
  }

  // Clean title from filename
  const cleanTitle = filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id: `upload-${index + 1}`,
    index: index + 1,
    title: cleanTitle || `Real Work Photo ${index + 1}`,
    filename: filename,
    image: `/images/portfolio/${filename}`,
    category,
    categoryLabel,
    subCategory,
    carType,
    carModel,
    altText: `${cleanTitle} by Kamlesh Ful Bhandar Nashik`,
    priceText: 'Price on Request',
    suitableFor: 'Celebrations & Weddings',
    floralStyle: 'Fresh Handcrafted Flowers'
  };
});

fs.writeFileSync(outputFile, JSON.stringify(photoObjects, null, 2), 'utf8');
console.log(`✓ Generated ${outputFile} with ${photoObjects.length} photo entries.`);
