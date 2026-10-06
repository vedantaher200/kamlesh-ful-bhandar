# Kamlesh Ful Bhandar - Image Assets Directory

To replace online sample images with actual photos of Kamlesh Ful Bhandar:

1. Place your photos into the respective directories:
   - `public/images/branding/` -> Store logo.png, hero-banner.jpg
   - `public/images/services/` -> wedding-decor.jpg, car-decor.jpg, bouquets.jpg, haar-mala.jpg, event-decor.jpg, custom-decor.jpg
   - `public/images/flowers/` -> roses.jpg, marigold.jpg, mogra.jpg, lotus.jpg, gerbera.jpg, mixed.jpg, seasonal.jpg
   - `public/images/wedding/` -> haldi.jpg, mandap.jpg, stage.jpg, reception.jpg
   - `public/images/gallery/` -> real-wedding-1.jpg, real-car-1.jpg, etc.

2. Open `src/config/businessConfig.js` and change the `image:` property for the item:
   Example:
   Change:
   `image: "https://images.unsplash.com/photo-..."`
   To:
   `image: "/images/services/wedding-decor.jpg"`

3. Run `npm run build` to update the production website.
