import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Kamlesh Ful Bhandar database...');

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
    { name: 'Roses', slug: 'roses', description: 'Fresh Dutch and country roses in multiple shades.' },
    { name: 'Haar & Mala', slug: 'haar-mala', description: 'Handcrafted traditional wedding and puja garlands.' },
    { name: 'Car Decoration', slug: 'car-decoration', description: 'Exquisite vehicle floral styling for weddings.' },
    { name: 'Bouquets', slug: 'bouquets', description: 'Handcrafted celebration and congratulatory flower bunches.' },
    { name: 'Marigold / Zendu', slug: 'marigold-zendu', description: 'Auspicious yellow and orange zendu blooms.' },
    { name: 'Mogra / Jasmine', slug: 'mogra-jasmine', description: 'Intensely fragrant white mogra blossoms.' },
    { name: 'Lotus', slug: 'lotus', description: 'Sacred pink and white lotus flowers for puja and decor.' },
    { name: 'Gerbera', slug: 'gerbera', description: 'Vivid gerbera blooms in multiple vibrant colors.' },
    { name: 'Mixed Flowers', slug: 'mixed-flowers', description: 'Curated mix of exotic seasonal varieties.' },
    { name: 'Custom Arrangements', slug: 'custom-arrangements', description: 'Tailored floral baskets and centerpieces.' }
  ];

  const categoryMap = new Map();
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
    categoryMap.set(cat.slug, createdCat.id);
  }
  console.log('✓ Categories seeded.');

  // 3. Products
  const productsData = [
    {
      name: 'Premium Wedding Haar',
      slug: 'premium-wedding-haar',
      description: 'Grand royal wedding varmala crafted with fresh Dutch roses, mogra, and gypsophila accents.',
      price: 8000,
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'haar-mala',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I am interested in ordering the Premium Wedding Haar (₹8,000).'
    },
    {
      name: 'Traditional Rose Varmala Pair',
      slug: 'traditional-rose-varmala-pair',
      description: 'Elegant dual varmala set crafted with fragrant fresh red and white roses for wedding rituals.',
      price: 4500,
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'haar-mala',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to book the Traditional Rose Varmala Pair (₹4,500).'
    },
    {
      name: 'Premium Wedding Car Decoration',
      slug: 'premium-wedding-car-decoration',
      description: 'Complete luxury floral styling for bridal/groom cars with bonnet floral nets, door ribbons, and boot accents.',
      price: 4999,
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'car-decoration',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to book the Premium Wedding Car Decoration (₹4,999).'
    },
    {
      name: 'Classic Red & White Car Decor',
      slug: 'classic-red-white-car-decor',
      description: 'Elegant front-hood floral arc with side handle bouquets using fresh roses and carnations.',
      price: 2999,
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'car-decoration',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I am interested in the Classic Red & White Car Decor (₹2,999).'
    },
    {
      name: 'Dutch Red Roses Bouquet',
      slug: 'dutch-red-roses-bouquet',
      description: 'Handcrafted bunch of 20 fresh long-stem red roses wrapped in luxury matte paper with ribbon.',
      price: 799,
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'roses',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to order the Dutch Red Roses Bouquet (₹799).'
    },
    {
      name: 'Celebration Mixed Flower Bouquet',
      slug: 'celebration-mixed-flower-bouquet',
      description: 'Vibrant mix of Gerberas, Carnations, Lilies, and lush greens for birthdays and felicitations.',
      price: 899,
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'bouquets',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to order the Celebration Mixed Flower Bouquet (₹899).'
    },
    {
      name: 'Daily Puja Marigold Mala (5 ft)',
      slug: 'daily-puja-marigold-mala',
      description: 'Fresh yellow and orange marigold garland freshly threaded for mandir, home entrance, or vehicle puja.',
      price: 150,
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'marigold-zendu',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to order the Daily Puja Marigold Mala (₹150).'
    },
    {
      name: 'Sacred Pink Lotus Flowers (Pair)',
      slug: 'sacred-pink-lotus-flowers-pair',
      description: 'Pair of fresh, pristine pink lotus blossoms for Lakshmi puja, Abhishek, and holy ceremonies.',
      price: 150,
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'lotus',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to order the Sacred Pink Lotus Flowers (₹150).'
    },
    {
      name: 'Fresh Fragrant Mogra Gajra Set',
      slug: 'fresh-fragrant-mogra-gajra-set',
      description: 'Intensely fragrant fresh mogra flower gajra for hair adornment and auspicious occasions.',
      price: 250,
      isContactForPrice: false,
      availability: 'AVAILABLE',
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'mogra-jasmine',
      whatsappMessage: 'Hello Kamlesh Ful Bhandar, I would like to order the Fresh Mogra Gajra Set (₹250).'
    }
  ];

  for (const prod of productsData) {
    const categoryId = categoryMap.get(prod.categorySlug);
    if (!categoryId) continue;

    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        isContactForPrice: prod.isContactForPrice,
        availability: prod.availability,
        isFeatured: prod.isFeatured,
        image: prod.image,
        categoryId: categoryId,
        whatsappMessage: prod.whatsappMessage
      }
    });
  }
  console.log('✓ Products seeded.');

  // 4. Services
  const servicesData = [
    {
      title: 'Wedding Flower Decoration',
      slug: 'wedding-flower-decoration',
      description: 'Beautiful floral decoration for weddings and marriage ceremonies tailored to family traditions.',
      highlight: 'Grand Stages & Mandaps',
      category: 'Wedding',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
      isFeatured: true
    },
    {
      title: 'Haldi Flower Decoration',
      slug: 'haldi-flower-decoration',
      description: 'Vibrant marigold and yellow floral themes, photo backdrops, and traditional seating for Haldi.',
      highlight: 'Yellow & Marigold Themes',
      category: 'Wedding',
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=900&q=80',
      isFeatured: true
    },
    {
      title: 'Engagement Decoration',
      slug: 'engagement-decoration',
      description: 'Pastel backdrops, ring ceremony flower circles, and romantic stage lighting setups.',
      highlight: 'Romantic Ring Arches',
      category: 'Wedding',
      image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80',
      isFeatured: true
    },
    {
      title: 'Car / Ghargadi Decoration',
      slug: 'car-ghargadi-decoration',
      description: 'Beautiful flower decoration for wedding cars, groom vehicles, and ceremonial entry cars.',
      highlight: 'Secure & Long-Lasting',
      category: 'Car',
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
      isFeatured: true
    },
    {
      title: 'Haar & Mala',
      slug: 'haar-and-mala',
      description: 'Traditional and customized flower garlands crafted fresh with roses, mogra, and marigold.',
      highlight: 'Varmala & Daily Puja',
      category: 'Garlands',
      image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=900&q=80',
      isFeatured: true
    },
    {
      title: 'Bouquets',
      slug: 'bouquets-service',
      description: 'Beautiful bouquets for birthdays, anniversaries, celebrations and special occasions.',
      highlight: 'Fresh Hand-Tied Blooms',
      category: 'Bouquets',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=80',
      isFeatured: true
    },
    {
      title: 'Mandap Decoration',
      slug: 'mandap-decoration',
      description: 'Traditional four-pillar floral mandaps with cascading garlands and sacred floral canopies.',
      highlight: 'Auspicious Ritual Canopies',
      category: 'Wedding',
      image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80',
      isFeatured: false
    },
    {
      title: 'Custom Flower Decoration',
      slug: 'custom-flower-decoration',
      description: 'Customized floral decoration according to customer requirements, venue size, and colors.',
      highlight: 'Bespoke On-Site Styling',
      category: 'Custom',
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=80',
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

  // 5. Gallery Images
  const galleryData = [
    {
      title: 'Grand Mandap Floral Canopy',
      category: 'Wedding',
      categoryName: 'Wedding Decorations',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
      description: 'Full mandap with cascading rose and marigold drops.'
    },
    {
      title: 'Vibrant Haldi Ceremony Floral Frame',
      category: 'Events',
      categoryName: 'Event Decorations',
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1000&q=80',
      description: 'Yellow and orange backdrop for haldi rituals.'
    },
    {
      title: 'Royal Wedding Car Decoration',
      category: 'Car',
      categoryName: 'Car Decorations',
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80',
      description: 'White BMW decorated with red rose netting.'
    },
    {
      title: 'Handcrafted Rose & Gypsophila Bouquet',
      category: 'Bouquets',
      categoryName: 'Bouquets',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80',
      description: 'Pastel bunch for anniversary celebration.'
    },
    {
      title: 'Traditional Mogra & Marigold Garland',
      category: 'Traditional',
      categoryName: 'Traditional Decorations',
      image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=1000&q=80',
      description: 'Fresh festive garland pair.'
    },
    {
      title: 'Engagement Floral Backdrop & Ring Stage',
      category: 'Wedding',
      categoryName: 'Wedding Decorations',
      image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80',
      description: 'Ring ceremony circular floral ring backdrop.'
    }
  ];

  for (const g of galleryData) {
    const existing = await prisma.galleryImage.findFirst({ where: { title: g.title } });
    if (!existing) {
      await prisma.galleryImage.create({ data: g });
    }
  }
  console.log('✓ Gallery seeded.');

  // 6. Business Settings
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
  console.log('✓ Business settings seeded.');

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
