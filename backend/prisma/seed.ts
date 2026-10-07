import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌸 Seeding Kamlesh Ful Bhandar database...');

  // 1. Create Default Admin User
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kamleshfulbhandar.com' },
    update: {},
    create: {
      name: 'Kamlesh Ful Bhandar Admin',
      email: 'admin@kamleshfulbhandar.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });
  console.log(`✓ Admin user ready: ${admin.email}`);

  // 2. Categories
  const categoriesData = [
    { name: 'Haar & Mala', slug: 'haar-mala', description: 'Handcrafted traditional wedding varmalas, groom/bride garlands and deity malas.' },
    { name: 'Car Decoration', slug: 'car-decoration', description: 'Real vehicle floral styling for weddings, groom entry and ceremonial cars.' },
    { name: 'Bouquets', slug: 'bouquets', description: 'Handcrafted celebration bouquets for birthdays, anniversaries and greetings.' },
    { name: 'Wedding Decoration', slug: 'wedding-decoration', description: 'Grand wedding stages, floral backdrops, mandaps and venue entrances.' },
    { name: 'Haldi Decoration', slug: 'haldi-decoration', description: 'Vibrant marigold themes, yellow backdrops and traditional seating decor.' },
    { name: 'Roses', slug: 'roses', description: 'Fresh Dutch and Nashik-grown roses in crimson, peach, pink, yellow and white.' },
    { name: 'Marigold / Zendu', slug: 'marigold-zendu', description: 'Auspicious yellow and orange zendu blooms for daily puja and festivities.' },
    { name: 'Mogra / Jasmine', slug: 'mogra-jasmine', description: 'Intensely fragrant white mogra blossoms and handcrafted gajras.' },
    { name: 'Lotus', slug: 'lotus', description: 'Sacred pink and white lotus flowers for puja and Abhishek ceremonies.' },
    { name: 'Gerbera', slug: 'gerbera', description: 'Vivid gerbera blooms in bright colors for celebrations and decor.' },
    { name: 'Stage Decoration', slug: 'stage-decoration', description: 'Banquet hall and reception floral stage backgrounds and frame setups.' },
    { name: 'Mandap Decoration', slug: 'mandap-decoration', description: 'Traditional four-pillar floral mandaps with hanging floral garlands.' }
  ];

  const categoryMap = new Map();
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat
    });
    categoryMap.set(cat.slug, createdCat.id);
  }
  console.log('✓ Categories seeded.');

  // 3. Products: 12 Dedicated Haar/Mala + Car Decor + Bouquets + Decor + Flowers
  const productsData = [
    // --- HAAR & MALA (12 items with real specifications & diverse prices) ---
    {
      name: 'Premium Wedding Haar',
      slug: 'premium-wedding-haar',
      categorySlug: 'haar-mala',
      subcategory: 'Wedding Haar',
      description: 'Royal wedding varmala crafted with fresh Dutch roses, mogra, and delicate baby breath accents.',
      shortDescription: 'Grand royal wedding varmala with Dutch roses & mogra',
      price: 8000,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      flowerType: 'Dutch Red Rose + Mogra + Gypsophila',
      length: '95 cm',
      width: '8 cm',
      color: 'Red + White',
      suitableFor: 'Wedding / Varmala',
      image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to book the Premium Wedding Haar (₹8,000).'
    },
    {
      name: 'Royal Red Rose & Mogra Varmala Pair',
      slug: 'royal-red-rose-mogra-varmala-pair',
      categorySlug: 'haar-mala',
      subcategory: 'Varmala',
      description: 'Handcrafted matching varmala pair for bride and groom with fragrant mogra beads and velvet red rose petals.',
      shortDescription: 'Dual bridal varmala set with fresh roses and fragrant mogra',
      price: 6000,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      flowerType: 'Velvet Rose + Fragrant Mogra',
      length: '90 cm each',
      width: '7 cm',
      color: 'Crimson Red + Pearl White',
      suitableFor: 'Groom & Bride Varmala',
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to book the Royal Red Rose & Mogra Varmala Pair (₹6,000).'
    },
    {
      name: 'Traditional Groom Haar (Navra Mulga)',
      slug: 'traditional-groom-haar',
      categorySlug: 'haar-mala',
      subcategory: 'Groom Haar',
      description: 'Special groom entry garland designed with bold rose clusters and gold ribbon trimming.',
      shortDescription: 'Grand groom garland with gold border accent',
      price: 4500,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      flowerType: 'Country Rose + Carnation + Mogra',
      length: '85 cm',
      width: '7.5 cm',
      color: 'Dark Red + Yellow Border',
      suitableFor: 'Groom Entry / Baraat',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to book the Traditional Groom Haar (₹4,500).'
    },
    {
      name: 'Elegant Bride Varmala (Navri Mala)',
      slug: 'elegant-bride-varmala',
      categorySlug: 'haar-mala',
      subcategory: 'Bride Haar',
      description: 'Lightweight, feather-soft wedding garland crafted specifically for the bride with baby roses and mogra buds.',
      shortDescription: 'Comfortable lightweight pastel bridal garland',
      price: 4500,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Baby Pink Rose + Mogra Buds',
      length: '80 cm',
      width: '6 cm',
      color: 'Soft Pink + White',
      suitableFor: 'Bride Varmala Ceremony',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to book the Elegant Bride Varmala (₹4,500).'
    },
    {
      name: 'Classic Mogra & Carnation Garland Pair',
      slug: 'classic-mogra-carnation-garland-pair',
      categorySlug: 'haar-mala',
      subcategory: 'Traditional Mala',
      description: 'Dual ceremonial garlands woven closely with fresh fragrant mogra and alternating carnation bands.',
      shortDescription: 'Fragrant mogra garland set with carnation bands',
      price: 2500,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Mogra + Carnation',
      length: '75 cm each',
      width: '5 cm',
      color: 'White + Scarlet',
      suitableFor: 'Traditional Wedding Rituals',
      image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to order the Classic Mogra & Carnation Garland Pair (₹2,500).'
    },
    {
      name: 'Yellow & Orange Marigold Wedding Haar',
      slug: 'yellow-orange-marigold-wedding-haar',
      categorySlug: 'haar-mala',
      subcategory: 'Traditional Mala',
      description: 'Auspicious dense marigold (zendu) garland with rose pendant for traditional Marathi wedding ceremonies.',
      shortDescription: 'Traditional Marathi wedding marigold garland with rose pendant',
      price: 2000,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Fresh Yellow & Orange Marigold + Rose',
      length: '85 cm',
      width: '6 cm',
      color: 'Yellow + Saffron Orange',
      suitableFor: 'Engagement / Traditional Haldi-Wedding',
      image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to order the Yellow & Orange Marigold Wedding Haar (₹2,000).'
    },
    {
      name: 'Grand Velvet Rose Royal Mala',
      slug: 'grand-velvet-rose-royal-mala',
      categorySlug: 'haar-mala',
      subcategory: 'Wedding Haar',
      description: 'Extra-thick, dense velvet rose garland crafted for royal stage appearance and photography.',
      shortDescription: 'Extra-thick dense royal rose garland',
      price: 7500,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      flowerType: 'Dutch Velvet Rose + Foliage Pearls',
      length: '100 cm',
      width: '9 cm',
      color: 'Deep Maroon / Red',
      suitableFor: 'Grand Wedding Stage / Reception',
      image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to book the Grand Velvet Rose Royal Mala (₹7,500).'
    },
    {
      name: 'Fresh Jasmine Sugandhi Haar Pair',
      slug: 'fresh-jasmine-sugandhi-haar-pair',
      categorySlug: 'haar-mala',
      subcategory: 'Mogra Mala',
      description: 'Intensely fragrant pure white jasmine garland pair with delicate rosebud borders.',
      shortDescription: 'Pure white sweet jasmine garland pair',
      price: 3500,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Pure Jasmine / Mogra Buds',
      length: '80 cm each',
      width: '5.5 cm',
      color: 'Pristine White + Red Accents',
      suitableFor: 'Varmala & Religious Ceremony',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to order the Fresh Jasmine Sugandhi Haar Pair (₹3,500).'
    },
    {
      name: 'Pearl & Rose Designer Varmala',
      slug: 'pearl-rose-designer-varmala',
      categorySlug: 'haar-mala',
      subcategory: 'Varmala',
      description: 'Modern pastel varmala incorporating fine pearl strings, gypsophila and peach roses.',
      shortDescription: 'Modern pastel varmala with pearl embellishments',
      price: 5500,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Peach Rose + Pearl Strands + Baby Breath',
      length: '85 cm',
      width: '6.5 cm',
      color: 'Peach + White Pearl',
      suitableFor: 'Pastel Themed Weddings',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to book the Pearl & Rose Designer Varmala (₹5,500).'
    },
    {
      name: 'Sacred Mandir & Deity Puja Haar (Daily/Festive)',
      slug: 'sacred-mandir-deity-puja-haar',
      categorySlug: 'haar-mala',
      subcategory: 'Traditional Mala',
      description: 'Long traditional garland crafted for temple deities, house-warming puja and Ganesh Mandir seva.',
      shortDescription: 'Auspicious long garland for deity and temple seva',
      price: 1500,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Marigold + Mogra + Tulsi + Rose',
      length: '120 cm',
      width: '6 cm',
      color: 'Yellow + Orange + Red',
      suitableFor: 'Deity Puja / Mandir Vastu',
      image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to order the Sacred Mandir & Deity Puja Haar (₹1,500).'
    },
    {
      name: 'Exotic Orchid & White Rose Varmala Set',
      slug: 'exotic-orchid-white-rose-varmala-set',
      categorySlug: 'haar-mala',
      subcategory: 'Varmala',
      description: 'Luxurious imported purple orchid blossoms intertwined with ivory white roses for contemporary weddings.',
      shortDescription: 'Premium imported orchid and ivory rose varmala',
      price: 8500,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      flowerType: 'Purple Orchid + Ivory Rose + Hydrangea',
      length: '95 cm each',
      width: '7.5 cm',
      color: 'Purple + Ivory White',
      suitableFor: 'Contemporary & Luxury Weddings',
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to order the Exotic Orchid & White Rose Varmala Set (₹8,500).'
    },
    {
      name: 'Bespoke Custom Luxury Varmala',
      slug: 'bespoke-custom-luxury-varmala',
      categorySlug: 'haar-mala',
      subcategory: 'Custom Haar',
      description: 'Tailor-made varmala crafted according to your wedding attire color theme, specific flowers and desired length.',
      shortDescription: 'Customized garland according to your wedding dress colors',
      price: null,
      priceType: 'CONTACT_FOR_PRICE',
      isContactForPrice: true,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Client Selected Fresh Flowers',
      length: 'Custom',
      width: 'Custom',
      color: 'Customized to Match Bride & Groom Outfits',
      suitableFor: 'Bespoke Weddings',
      image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to consult on a Bespoke Custom Luxury Varmala.'
    },

    // --- CAR DECORATION (ACTUAL CAR DECORATION PHOTOS ONLY) ---
    {
      name: 'Premium Wedding Car Decoration',
      slug: 'premium-wedding-car-decoration',
      categorySlug: 'car-decoration',
      subcategory: 'Wedding Car Decoration',
      description: 'Complete luxury floral styling for wedding cars: bonnet floral arc, net canopy, door handle ribbons, and rear boot floral spray.',
      shortDescription: 'Full bridal/groom car floral decoration with bonnet arc',
      price: 4999,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      flowerType: 'Red Roses + White Carnations + Asparagus Greens',
      color: 'Red + White Ribbon',
      suitableFor: 'Bridal Car Entry',
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to book the Premium Wedding Car Decoration (₹4,999).'
    },
    {
      name: 'Classic Red & White Bonnet Arc Car Decor',
      slug: 'classic-red-white-bonnet-arc-car-decor',
      categorySlug: 'car-decoration',
      subcategory: 'Wedding Car Decoration',
      description: 'Elegant front-hood floral arc with side handle bouquets using fresh roses and organza ribbons.',
      shortDescription: 'Front hood floral arc and side handle bouquets',
      price: 2999,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Dutch Roses + Baby Breath + Satin Ribbon',
      color: 'Red + White',
      suitableFor: 'Groom Car / Family Vehicle',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I am interested in the Classic Red & White Bonnet Arc Car Decor (₹2,999).'
    },
    {
      name: 'Royal Orchid & Rose Luxury Car Decor',
      slug: 'royal-orchid-rose-luxury-car-decor',
      categorySlug: 'car-decoration',
      subcategory: 'Premium Car Decoration',
      description: 'Exotic blue/purple orchids and ivory roses styled in diagonal bonnet drape with premium net accents.',
      shortDescription: 'Diagonal bonnet drape with purple orchids & ivory roses',
      price: 6499,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      flowerType: 'Orchids + Ivory Roses + Net Drape',
      color: 'Purple + Ivory + Silver Ribbon',
      suitableFor: 'Luxury Sedan / SUV Entry',
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to book the Royal Orchid & Rose Luxury Car Decor (₹6,499).'
    },
    {
      name: 'Traditional Ghargadi Marigold & Rose Decor',
      slug: 'traditional-ghargadi-marigold-rose-decor',
      categorySlug: 'car-decoration',
      subcategory: 'Traditional Car Decoration',
      description: 'Traditional floral styling using auspicious yellow-orange marigold garlands and red rose motifs.',
      shortDescription: 'Traditional Marathi wedding vehicle garland styling',
      price: 2499,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Fresh Marigold + Red Rose Buds',
      color: 'Yellow + Orange + Red',
      suitableFor: 'Traditional Ritual Vehicle / New Car Puja',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to book the Traditional Ghargadi Car Decor (₹2,499).'
    },

    // --- BOUQUETS (ACTUAL BOUQUET PHOTOS ONLY) ---
    {
      name: 'Dutch Red Roses Luxury Bouquet (20 Roses)',
      slug: 'dutch-red-roses-luxury-bouquet',
      categorySlug: 'bouquets',
      subcategory: 'Rose Bouquet',
      description: 'Handcrafted bunch of 20 fresh long-stem Dutch red roses wrapped in luxury matte paper with satin ribbon.',
      shortDescription: '20 fresh Dutch roses in luxury gift wrap',
      price: 799,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      flowerType: '20 Dutch Red Roses + Gypsophila',
      color: 'Deep Red',
      suitableFor: 'Anniversary, Birthday, Valentine & Celebrations',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to order the Dutch Red Roses Luxury Bouquet (₹799).'
    },
    {
      name: 'Celebration Mixed Flower Bouquet',
      slug: 'celebration-mixed-flower-bouquet',
      categorySlug: 'bouquets',
      subcategory: 'Birthday Bouquet',
      description: 'Vibrant mix of Gerberas, Carnations, Lilies, and lush greens hand-tied for congratulations and birthdays.',
      shortDescription: 'Colorful mix of Gerberas, Lilies & Carnations',
      price: 899,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      flowerType: 'Gerbera + Lily + Carnation + Ferns',
      color: 'Multicolor (Yellow, Pink, White)',
      suitableFor: 'Birthdays & Felicitation',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to order the Celebration Mixed Flower Bouquet (₹899).'
    },
    {
      name: 'Pastel Rose & Carnation Engagement Bouquet',
      slug: 'pastel-rose-carnation-engagement-bouquet',
      categorySlug: 'bouquets',
      subcategory: 'Engagement Bouquet',
      description: 'Soft pastel pink and peach roses combined with white carnations and eucalyptus leaves.',
      shortDescription: 'Soft pastel pink roses and carnations bouquet',
      price: 1199,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Peach Rose + Pink Carnation + Eucalyptus',
      color: 'Pastel Pink + Peach + Ivory',
      suitableFor: 'Engagement Ceremony & Special Greetings',
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to order the Pastel Engagement Bouquet (₹1,199).'
    },
    {
      name: 'Grand Exotic Royal Orchid Bunch',
      slug: 'grand-exotic-royal-orchid-bunch',
      categorySlug: 'bouquets',
      subcategory: 'Premium Bouquet',
      description: 'Stem cluster of fresh purple orchids and oriental lilies in designer tissue wrap.',
      shortDescription: 'Purple orchids and lilies in premium wrap',
      price: 1499,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Imported Orchids + Oriental Lilies',
      color: 'Purple + White',
      suitableFor: 'VIP Greetings & Corporate Events',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to order the Royal Orchid Bunch (₹1,499).'
    },

    // --- DECORATION (ACTUAL DECORATION PHOTOS ONLY) ---
    {
      name: 'Royal Wedding Mandap Floral Canopy',
      slug: 'royal-wedding-mandap-floral-canopy',
      categorySlug: 'wedding-decoration',
      subcategory: 'Mandap Decoration',
      description: 'Traditional four-pillar floral mandap with cascading rose and marigold drops, ritual backdrop and havan kund decor.',
      shortDescription: 'Four-pillar royal floral mandap with cascading drops',
      price: null,
      priceType: 'STARTING_FROM',
      isContactForPrice: true,
      availability: 'AVAILABLE',
      isFeatured: true,
      flowerType: 'Marigold + Rose + Mogra + Foliage',
      color: 'Yellow + Red + White',
      suitableFor: 'Wedding Mandap / Vivah Sanskar',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to enquire about the Royal Wedding Mandap Floral Canopy.'
    },
    {
      name: 'Vibrant Haldi Ceremony Marigold Backdrop',
      slug: 'vibrant-haldi-ceremony-marigold-backdrop',
      categorySlug: 'haldi-decoration',
      subcategory: 'Haldi Decoration',
      description: 'All-yellow theme backdrop, urli flower styling, floral umbrella accents and marigold strings for pre-wedding Haldi rituals.',
      shortDescription: 'Bright marigold yellow backdrop & urli floral styling',
      price: null,
      priceType: 'STARTING_FROM',
      isContactForPrice: true,
      availability: 'AVAILABLE',
      isFeatured: true,
      flowerType: 'Fresh Yellow & Orange Marigold Blooms',
      color: 'Sunny Yellow + Deep Orange',
      suitableFor: 'Haldi Rasam / Mehendi',
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=900&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to enquire about Haldi Ceremony Marigold Backdrop.'
    },
    {
      name: 'Engagement Circular Floral Ring Arch',
      slug: 'engagement-circular-floral-ring-arch',
      categorySlug: 'wedding-decoration',
      subcategory: 'Stage Decoration',
      description: 'Romantic circular metallic arch decorated with dense roses, baby breath and fairy lights for ring ceremonies.',
      shortDescription: 'Circular floral ring arch backdrop for ring exchange',
      price: null,
      priceType: 'STARTING_FROM',
      isContactForPrice: true,
      availability: 'AVAILABLE',
      isFeatured: true,
      flowerType: 'Roses + Carnations + Gypsophila',
      color: 'Pastel Pink + White + Peach',
      suitableFor: 'Engagement Ceremony / Ring Ceremony',
      image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to enquire about the Engagement Circular Floral Ring Arch.'
    },

    // --- FRESH BLOOMS & DAILY PUJA FLOWERS ---
    {
      name: 'Daily Puja Fresh Marigold Mala (5 ft)',
      slug: 'daily-puja-fresh-marigold-mala',
      categorySlug: 'marigold-zendu',
      subcategory: 'Traditional Mala',
      description: 'Fresh yellow and orange marigold garland freshly threaded for home mandir, door toran, or vehicle puja.',
      shortDescription: 'Daily 5 ft fresh marigold garland for puja',
      price: 150,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Fresh Yellow Zendu',
      length: '5 ft (150 cm)',
      color: 'Yellow',
      suitableFor: 'Home Mandir & Vehicle Puja',
      image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to order Daily Puja Fresh Marigold Mala (₹150).'
    },
    {
      name: 'Sacred Fresh Pink Lotus (Pair)',
      slug: 'sacred-fresh-pink-lotus-pair',
      categorySlug: 'lotus',
      subcategory: 'Sacred Flowers',
      description: 'Pristine fresh pink lotus blossoms handpicked for Lakshmi puja, Abhishek, and auspicious ceremonies.',
      shortDescription: 'Pair of fresh sacred pink lotus blossoms',
      price: 150,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Pink Lotus (Kamal)',
      color: 'Sacred Pink',
      suitableFor: 'Lakshmi Puja & Mandir Abhishek',
      image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to order Sacred Pink Lotus Pair (₹150).'
    },
    {
      name: 'Fresh Fragrant Mogra Gajra Set (Pair)',
      slug: 'fresh-fragrant-mogra-gajra-set',
      categorySlug: 'mogra-jasmine',
      subcategory: 'Gajra',
      description: 'Authentic handcrafted mogra gajra woven with dense, fragrant fresh jasmine buds for hair adornment.',
      shortDescription: 'Handcrafted fragrant mogra gajra pair',
      price: 250,
      priceType: 'FIXED',
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      flowerType: 'Fragrant Mogra Buds',
      length: '30 cm each',
      color: 'Pure White',
      suitableFor: 'Hair Styling for Weddings & Festivals',
      image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I want to order Fresh Mogra Gajra Set (₹250).'
    }
  ];

  for (const prod of productsData) {
    const categoryId = categoryMap.get(prod.categorySlug);
    if (!categoryId) continue;

    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        description: prod.description,
        shortDescription: prod.shortDescription,
        price: prod.price,
        priceType: prod.priceType,
        isContactForPrice: prod.isContactForPrice,
        availability: prod.availability,
        isFeatured: prod.isFeatured,
        image: prod.image,
        subcategory: prod.subcategory,
        flowerType: prod.flowerType,
        length: prod.length || null,
        width: prod.width || null,
        color: prod.color || null,
        suitableFor: prod.suitableFor || null,
        whatsappMessage: prod.whatsappMessage,
        categoryId: categoryId
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription,
        price: prod.price,
        priceType: prod.priceType,
        isContactForPrice: prod.isContactForPrice,
        availability: prod.availability,
        isFeatured: prod.isFeatured,
        image: prod.image,
        subcategory: prod.subcategory,
        flowerType: prod.flowerType,
        length: prod.length || null,
        width: prod.width || null,
        color: prod.color || null,
        suitableFor: prod.suitableFor || null,
        whatsappMessage: prod.whatsappMessage,
        categoryId: categoryId
      }
    });
  }
  console.log('✓ Products seeded.');

  // 4. Locations: Nashik District Talukas & Villages as specified
  const locationsData = [
    // Niphad Taluka
    { district: 'Nashik', taluka: 'Niphad', village: 'Niphad', area: 'Main Market' },
    { district: 'Nashik', taluka: 'Niphad', village: 'Pimpalgaon Baswant', area: 'Market Yard / Highway' },
    { district: 'Nashik', taluka: 'Niphad', village: 'Janwad', area: 'Village Centre' },
    { district: 'Nashik', taluka: 'Niphad', village: 'Vadai', area: 'Village Area' },
    { district: 'Nashik', taluka: 'Niphad', village: 'Bhutyane', area: 'Village Area' },
    { district: 'Nashik', taluka: 'Niphad', village: 'Sogras', area: 'Village Area' },
    { district: 'Nashik', taluka: 'Niphad', village: 'Malchane', area: 'Village Area' },
    { district: 'Nashik', taluka: 'Niphad', village: 'Mangrul', area: 'Village Area' },
    { district: 'Nashik', taluka: 'Niphad', village: 'Pore / Podar', area: 'Village Area' },
    { district: 'Nashik', taluka: 'Niphad', village: 'Saykheda', area: 'Town Area' },
    { district: 'Nashik', taluka: 'Niphad', village: 'Lasalgaon', area: 'APMC Market' },

    // Nashik Taluka (Urban & Rural)
    { district: 'Nashik', taluka: 'Nashik', village: 'Pawan Nagar', area: 'Ganpati Mandir Jawal' },
    { district: 'Nashik', taluka: 'Nashik', village: 'CIDCO', area: 'Uttam Nagar / Trimurti Chowk' },
    { district: 'Nashik', taluka: 'Nashik', village: 'Panchavati', area: 'Ramkund / Tapovan' },
    { district: 'Nashik', taluka: 'Nashik', village: 'Adgaon Tappa', area: 'Highway Tappa' },
    { district: 'Nashik', taluka: 'Nashik', village: 'Satpur', area: 'MIDC / Colony' },
    { district: 'Nashik', taluka: 'Nashik', village: 'Nashik Road', area: 'Station Road / Jail Road' },
    { district: 'Nashik', taluka: 'Nashik', village: 'Gangapur Road', area: 'College Road / Vidya Nagar' },
    { district: 'Nashik', taluka: 'Nashik', village: 'Indira Nagar', area: 'Pathardi Phata' },
    { district: 'Nashik', taluka: 'Nashik', village: 'Deolali Camp', area: 'Rest Camp Road' },
    { district: 'Nashik', taluka: 'Nashik', village: 'Ambad', area: 'MIDC Link Road' },

    // Dindori Taluka
    { district: 'Nashik', taluka: 'Dindori', village: 'Dindori', area: 'Main Town' },
    { district: 'Nashik', taluka: 'Dindori', village: 'Vani', area: 'Saptashrungi Road' },
    { district: 'Nashik', taluka: 'Dindori', village: 'Janori', area: 'Airport Road' },

    // Sinnar Taluka
    { district: 'Nashik', taluka: 'Sinnar', village: 'Sinnar', area: 'Ganesh Chowk' },
    { district: 'Nashik', taluka: 'Sinnar', village: 'Musalgaon', area: 'Industrial Area' }
  ];

  for (const loc of locationsData) {
    const existing = await prisma.location.findFirst({
      where: {
        district: loc.district,
        taluka: loc.taluka,
        village: loc.village
      }
    });
    if (!existing) {
      await prisma.location.create({
        data: {
          district: loc.district,
          taluka: loc.taluka,
          village: loc.village,
          area: loc.area,
          isActive: true
        }
      });
    }
  }
  console.log('✓ Locations seeded.');

  // 5. Services
  const servicesData = [
    {
      title: 'Wedding Flower Decoration',
      slug: 'wedding-flower-decoration',
      description: 'Complete floral styling for weddings: entry gates, aisle runners, stage backdrop and varmala arrangements.',
      highlight: 'Grand Stages & Mandaps',
      category: 'Wedding',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
      isFeatured: true
    },
    {
      title: 'Haldi Flower Decoration',
      slug: 'haldi-flower-decoration',
      description: 'Vibrant marigold and yellow floral themes, photo backdrops, and traditional seating for Haldi rasam.',
      highlight: 'Yellow & Marigold Themes',
      category: 'Wedding',
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=900&q=80',
      isFeatured: true
    },
    {
      title: 'Car / Ghargadi Decoration',
      slug: 'car-ghargadi-decoration',
      description: 'Real flower decoration for wedding cars, groom vehicles, and ceremonial entry cars with secure non-damaging fittings.',
      highlight: 'Secure & Long-Lasting',
      category: 'Car',
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
      isFeatured: true
    },
    {
      title: 'Haar & Mala Crafting',
      slug: 'haar-and-mala',
      description: 'Traditional and customized wedding varmalas, groom garlands, and daily temple malas freshly crafted daily.',
      highlight: 'Fresh Varmala & Daily Puja',
      category: 'Garlands',
      image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=900&q=80',
      isFeatured: true
    },
    {
      title: 'Celebration Bouquets',
      slug: 'bouquets-service',
      description: 'Handcrafted floral bunches for birthdays, anniversaries, graduations and felicitations in Nashik.',
      highlight: 'Fresh Hand-Tied Blooms',
      category: 'Bouquets',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=80',
      isFeatured: true
    },
    {
      title: 'Traditional Mandap Decoration',
      slug: 'mandap-decoration',
      description: 'Four-pillar sacred floral mandaps adorned with natural flowers, mango leaves, and marigold canopies.',
      highlight: 'Auspicious Ritual Canopies',
      category: 'Wedding',
      image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80',
      isFeatured: false
    }
  ];

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: s
    });
  }
  console.log('✓ Services seeded.');

  // 6. Gallery: Category-relevant photos
  const galleryData = [
    {
      title: 'Royal Mandap Floral Canopy',
      category: 'Wedding',
      categoryName: 'Wedding Decorations',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
      description: 'Traditional wedding mandap with cascading rose and marigold drops.'
    },
    {
      title: 'Yellow Marigold Haldi Backdrop',
      category: 'Events',
      categoryName: 'Event Decorations',
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1000&q=80',
      description: 'Vibrant marigold frame for pre-wedding Haldi rituals.'
    },
    {
      title: 'Wedding Car Floral Styling',
      category: 'Car',
      categoryName: 'Car Decorations',
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80',
      description: 'Real bridal car decorated with red rose netting and door ribbons.'
    },
    {
      title: 'Red Dutch Roses Hand Bouquet',
      category: 'Bouquets',
      categoryName: 'Bouquets',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
      description: 'Fresh luxury bunch of red roses wrapped in matte paper.'
    },
    {
      title: 'Royal Wedding Rose & Mogra Varmala',
      category: 'Haar & Mala',
      categoryName: 'Garlands',
      image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=1000&q=80',
      description: 'Fresh royal varmala pair crafted for bride and groom.'
    },
    {
      title: 'Engagement Ring Ceremony Arch',
      category: 'Wedding',
      categoryName: 'Wedding Decorations',
      image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80',
      description: 'Circular floral ring arch with pastel carnations and roses.'
    }
  ];

  for (const g of galleryData) {
    const existing = await prisma.galleryImage.findFirst({ where: { title: g.title } });
    if (!existing) {
      await prisma.galleryImage.create({ data: g });
    }
  }
  console.log('✓ Gallery seeded.');

  // 7. Business Settings
  const settingsData = [
    { key: 'business_name', value: 'Kamlesh Ful Bhandar', description: 'Official business name' },
    { key: 'phone_primary', value: '9921972936', description: 'Primary contact phone' },
    { key: 'phone_secondary', value: '8208672409', description: 'Secondary contact phone' },
    { key: 'whatsapp_number', value: '919921972936', description: 'WhatsApp ordering number' },
    { key: 'address', value: 'Ganpati Mandir Jawal, Pawan Nagar, Nashik, Maharashtra', description: 'Shop address' },
    { key: 'city', value: 'Nashik', description: 'Operating city' },
    { key: 'state', value: 'Maharashtra', description: 'Operating state' },
    { key: 'hours', value: 'Monday – Sunday: 6:00 AM – 10:00 PM', description: 'Working hours' },
    { key: 'maps_embed_url', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3749.638291888496!2d73.7656!3d19.9856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDU5JzA4LjIiTiA3M8KwNDUnNTYuMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin', description: 'Google Maps Embed iframe URL' },
    { key: 'maps_directions_url', value: 'https://maps.google.com/?q=Ganpati+Mandir+Jawal,+Pawan+Nagar,+Nashik,+Maharashtra', description: 'Google Maps Directions URL' }
  ];

  for (const set of settingsData) {
    await prisma.businessSetting.upsert({
      where: { key: set.key },
      update: { value: set.value },
      create: set
    });
  }
  // 8. Seed Initial Car Decoration Posts (Admin-managed single source of truth)
  const existingCarPosts = await prisma.carDecorationPost.count();
  if (existingCarPosts === 0) {
    const initialCarPosts = [
      {
        title: 'BMW Flower Decoration',
        description: 'Beautiful flower decoration for wedding car with fresh Dutch roses and lilies.',
        price: 5000,
        priceText: '₹5,000',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80',
        status: 'PUBLISHED'
      },
      {
        title: 'Thar Bold Floral Decoration',
        description: 'Rugged yet regal floral arrangement crafted specifically for bold bonnet contours.',
        price: 4500,
        priceText: '₹4,500',
        image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
        status: 'PUBLISHED'
      },
      {
        title: 'Wedding Car Full Floral Arch',
        description: 'Sleek aerodynamic curved floral arch cascading from windshield to grille with red roses.',
        price: 5500,
        priceText: '₹5,500',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
        status: 'PUBLISHED'
      },
      {
        title: 'Grand SUV Floral Garland Wrap',
        description: 'High-impact floral coverage with fresh marigold, rose garlands and side mirror accents.',
        price: 4200,
        priceText: '₹4,200',
        image: 'https://images.unsplash.com/photo-1519225424987-4340d8aa8f61?auto=format&fit=crop&w=1000&q=80',
        status: 'PUBLISHED'
      },
      {
        title: 'Minimalist Elegant Car Decoration',
        description: 'Refined minimalist floral accents on four doors, side mirrors and front bonnet.',
        price: 3200,
        priceText: '₹3,200',
        image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80',
        status: 'PUBLISHED'
      }
    ];

    for (const post of initialCarPosts) {
      await prisma.carDecorationPost.create({ data: post });
    }
    console.log(`✓ Initial Car Decoration Posts seeded (${initialCarPosts.length} posts).`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
