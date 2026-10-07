import uploadedPhotosRaw from './uploadedPhotos.json';

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'car-decoration' | 'haar-varmala' | 'wedding-engagement' | 'bouquets' | 'birthday-gifts' | 'fresh-flowers' | 'entrance-decoration' | 'customer-work';
  categoryLabel: string;
  subCategory: string;
  style?: string;
  suitableFor?: string;
  occasion?: string;
  floralStyle?: string;
  priceText?: string;
  image: string;
  altText: string;
  description?: string;
  whatsappMessage?: string;
}

const DEFAULT_PORTFOLIO_ITEMS: PortfolioItem[] = [
  // ==========================================
  // 1. CAR DECORATION (Unified Car Decoration)
  // ==========================================
  {
    id: 'car-decor-1',
    title: 'Bold Front Hood Floral Styling',
    category: 'car-decoration',
    categoryLabel: 'Car Decoration',
    subCategory: 'Car Decoration',
    style: 'Floral Hood Decoration',
    suitableFor: 'Groom Entry / Baraat',
    occasion: 'Wedding Day & Groom Procession',
    floralStyle: 'Red Roses, Carnations & Exotic Green Foliage',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80',
    altText: 'Floral car decoration with red roses on front hood',
    description: 'Regal floral arrangement crafted for bold bonnet contours with scratch-safe high-speed anchor ties.'
  },
  {
    id: 'car-decor-2',
    title: 'Ring Bonnet & Grille Floral Decor',
    category: 'car-decoration',
    categoryLabel: 'Car Decoration',
    subCategory: 'Car Decoration',
    style: 'Garland / Varmala Style Car Decoration',
    suitableFor: 'Wedding / Reception Entry',
    occasion: 'Groom Entry & Wedding',
    floralStyle: 'Dense Rose Ring & Ribbon Trail',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
    altText: 'Floral ring bonnet car decoration',
    description: 'Circular floral ring center design on car bonnet complemented by side mirror and door handle accents.'
  },
  {
    id: 'car-decor-3',
    title: 'Elegant Full Bonnet Floral Arch',
    category: 'car-decoration',
    categoryLabel: 'Car Decoration',
    subCategory: 'Car Decoration',
    style: 'Floral Hood Decoration',
    suitableFor: 'Wedding / Doli / Bidaai',
    occasion: 'Wedding Day Ceremony',
    floralStyle: 'Dutch Red Roses & Gypsophila Spray',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    altText: 'Car decoration with elegant floral bonnet arch',
    description: 'Sleek aerodynamic curved floral arch cascading from windshield to grille with pristine red roses and baby breath.'
  },
  {
    id: 'car-decor-4',
    title: 'Minimalist Symmetrical Rose Netting',
    category: 'car-decoration',
    categoryLabel: 'Car Decoration',
    subCategory: 'Car Decoration',
    style: 'Minimal Elegant Decoration',
    suitableFor: 'Reception / Family Event',
    occasion: 'Reception & Engagement',
    floralStyle: 'Pastel Peach Roses & White Satin Ribbons',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80',
    altText: 'Minimal elegant car decoration with pastel roses',
    description: 'Refined minimalist floral accents on four doors, side mirrors and front bonnet with neat satin netting.'
  },
  {
    id: 'car-decor-5',
    title: 'Grand Floral Bonnet & Roof Wrap',
    category: 'car-decoration',
    categoryLabel: 'Car Decoration',
    subCategory: 'Car Decoration',
    style: 'Full Floral Car Decoration',
    suitableFor: 'Wedding & Reception',
    occasion: 'Wedding Day Celebration',
    floralStyle: 'Red & Yellow Carnations with Orchids',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1519225424987-4340d8aa8f61?auto=format&fit=crop&w=1000&q=80',
    altText: 'Wedding car floral decoration with grand hood wrap',
    description: 'High-impact floral coverage tailored for wide bonnets, roof rails, and rear glass borders.'
  },
  {
    id: 'car-decor-6',
    title: 'Traditional Floral Garland Drape',
    category: 'car-decoration',
    categoryLabel: 'Car Decoration',
    subCategory: 'Car Decoration',
    style: 'Garland / Varmala Style Car Decoration',
    suitableFor: 'Traditional Wedding Entry',
    occasion: 'Traditional Wedding Baraat',
    floralStyle: 'Fresh Marigold, Rose & Mogra Malas',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1545232979-fbf68fe9ec44?auto=format&fit=crop&w=1000&q=80',
    altText: 'Traditional floral garland car decoration',
    description: 'Traditional Indian floral garland drapes sweeping across the hood with fresh marigold and velvet roses.'
  },
  {
    id: 'car-decor-7',
    title: 'Royal Grille & Bonnet Orchid Cascade',
    category: 'car-decoration',
    categoryLabel: 'Car Decoration',
    subCategory: 'Car Decoration',
    style: 'Minimal Elegant Decoration',
    suitableFor: 'Luxury Wedding Entry / Reception',
    occasion: 'Royal Wedding & VIP Entry',
    floralStyle: 'White Lilies, Blue Orchids & Soft Pink Roses',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1000&q=80',
    altText: 'Royal car floral decoration with white lilies',
    description: 'Understated luxury styling using scratch-safe suction bases, rare white Asiatic lilies, and imported orchids.'
  },
  {
    id: 'car-decor-8',
    title: 'Heart-Shape Rose Centerpiece Car Decor',
    category: 'car-decoration',
    categoryLabel: 'Car Decoration',
    subCategory: 'Car Decoration',
    style: 'Floral Hood Decoration',
    suitableFor: 'Bidaai / Wedding Couple Car',
    occasion: 'Wedding Bidaai',
    floralStyle: 'Double Heart Velvet Rose Frame with Baby Breath',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80',
    altText: 'Heart shape rose car decoration',
    description: 'Iconic double heart red rose arrangement placed centrally on the bonnet with trailing ribbons.'
  },
  {
    id: 'car-decor-9',
    title: 'Compact Elegant Front & Side Floral Accent',
    category: 'car-decoration',
    categoryLabel: 'Car Decoration',
    subCategory: 'Car Decoration',
    style: 'Minimal Elegant Decoration',
    suitableFor: 'Family Occasion / Engagement',
    occasion: 'Engagement & Family Celebration',
    floralStyle: 'Crisp Rose Bunches & Netting Ribbons',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80',
    altText: 'Compact car flower decoration',
    description: 'Proportionate floral styling designed without obstructing driver visibility.'
  },

  // ==========================================
  // 2. HAAR & VARMALA COLLECTION
  // ==========================================
  {
    id: 'varmala-rose-1',
    title: 'Royal Red Velvet Rose Wedding Varmala Pair',
    category: 'haar-varmala',
    categoryLabel: 'Haar & Varmala',
    subCategory: 'Rose Varmala',
    style: 'Dense Petal Work',
    suitableFor: 'Bride & Groom Exchange',
    occasion: 'Hindu / Indian Wedding Ceremony',
    floralStyle: 'Dutch Red Velvet Rose Petals & Golden Tissue Trim',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=1000&q=80',
    altText: 'Red rose wedding varmala pair',
    description: 'Exquisite handcrafted bridal varmala pair composed of tightly woven fresh red rose petals, fragrant and feather-light.'
  },
  {
    id: 'varmala-pink-1',
    title: 'Pastel Pink Rose & Gypsophila Bridal Varmala',
    category: 'haar-varmala',
    categoryLabel: 'Haar & Varmala',
    subCategory: 'Pink Rose Varmala',
    style: 'Modern Pastel Theme',
    suitableFor: 'Contemporary Wedding / Engagement',
    occasion: 'Pastel Theme Wedding',
    floralStyle: 'Baby Pink Roses & White Baby Breath',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80',
    altText: 'Pink rose wedding varmala',
    description: 'Dreamy pastel pink roses interspersed with soft white gypsophila for modern day-wedding ceremonies.'
  },
  {
    id: 'varmala-white-1',
    title: 'Pristine White Rose & Mogra Bud Varmala',
    category: 'haar-varmala',
    categoryLabel: 'Haar & Varmala',
    subCategory: 'White Rose Varmala',
    style: 'Fragrant Traditional',
    suitableFor: 'Bride & Groom Wedding',
    occasion: 'Traditional Indian Wedding',
    floralStyle: 'Fresh White Dutch Roses & Nashik Mogra Buds',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80',
    altText: 'White rose and mogra wedding garland',
    description: 'Pure white rose buds woven with hand-picked Nashik mogra offering an enchanting natural fragrance.'
  },
  {
    id: 'varmala-lotus-1',
    title: 'Sacred Pink Lotus Centerpiece Varmala',
    category: 'haar-varmala',
    categoryLabel: 'Haar & Varmala',
    subCategory: 'Lotus Varmala',
    style: 'Royal Sacred Traditional',
    suitableFor: 'Vedic Wedding / Grand Muhurt',
    occasion: 'Muhurt & Sacred Wedding',
    floralStyle: 'Fresh Blooming Pink Lotus & Pearl Beads',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1000&q=80',
    altText: 'Pink lotus flower wedding varmala',
    description: 'Handpicked fresh blooming pink lotus buds nestled between aromatic white mogra and pearl bead strings.'
  },
  {
    id: 'varmala-trad-1',
    title: 'Traditional Multi-Colour Marigold & Gulchadi Haar',
    category: 'haar-varmala',
    categoryLabel: 'Haar & Varmala',
    subCategory: 'Traditional Haar',
    style: 'Auspicious Heritage',
    suitableFor: 'Puja, Welcome & Ceremonial Honours',
    occasion: 'Religious Festivities & Traditional Receptions',
    floralStyle: 'Yellow Zendu, Orange Marigold & White Gulchadi',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=1000&q=80',
    altText: 'Traditional flower garland with marigold and roses',
    description: 'Vibrant auspicious garland honoring Maharashtrian cultural heritage, crafted fresh on morning of event.'
  },
  {
    id: 'varmala-designer-1',
    title: 'Designer Dual-Tone Orchids & Carnations Varmala',
    category: 'haar-varmala',
    categoryLabel: 'Haar & Varmala',
    subCategory: 'Designer Varmala',
    style: 'Contemporary Royal',
    suitableFor: 'Luxury Destination Wedding',
    occasion: 'Evening Wedding Muhurt',
    floralStyle: 'Purple Dendrobium Orchids & Cream Carnations',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1000&q=80',
    altText: 'Designer orchid and carnation varmala',
    description: 'Modern luxury varmala combining resilient purple orchids with velvety cream carnations.'
  },

  // ==========================================
  // 3. BOUQUETS & FLOWER GIFTS (Including Money Bouquet)
  // ==========================================
  {
    id: 'bouquet-money-1',
    title: 'Celebration Money Bouquet with Fresh Red Roses',
    category: 'bouquets',
    categoryLabel: 'Flower Bouquets',
    subCategory: 'Money Bouquet',
    style: 'Custom Cash Flower Arrangement',
    suitableFor: 'Milestone Birthdays, Weddings & Anniversaries',
    occasion: 'Milestone Celebrations',
    floralStyle: 'Fresh Red Roses with Elegant Banknote Folds',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?auto=format&fit=crop&w=1000&q=80',
    altText: 'Money bouquet with fresh roses for celebration',
    description: 'Handcrafted celebratory money bouquet featuring crisp currency folds arranged tastefully alongside premium red roses.'
  },
  {
    id: 'bouquet-rose-1',
    title: 'Classic 20 Dutch Red Roses Luxury Hand-Tied Bunch',
    category: 'bouquets',
    categoryLabel: 'Flower Bouquets',
    subCategory: 'Red Rose Bouquet',
    style: 'Classic Romantic',
    suitableFor: 'Anniversary, Valentine & Romance',
    occasion: 'Anniversary & Romantic Gifting',
    floralStyle: 'Grade-A Nashik Dutch Red Roses & Baby Breath',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    altText: 'Red rose bouquet wrapped in luxury paper',
    description: 'Twenty long-stemmed velvet red roses wrapped in imported matte black craft paper with satin ribbon bow.'
  },
  {
    id: 'bouquet-mixed-1',
    title: 'Vibrant Garden Mixed Flower Celebration Bunch',
    category: 'bouquets',
    categoryLabel: 'Flower Bouquets',
    subCategory: 'Mixed Flower Bouquet',
    style: 'Cheerful Garden Bunch',
    suitableFor: 'Congratulations, Get Well Soon & Welcome',
    occasion: 'Celebration & Greetings',
    floralStyle: 'Yellow Gerberas, Pink Carnations & Asiatic Lilies',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80',
    altText: 'Mixed flower bouquet with lilies and gerberas',
    description: 'Colourful mood-lifting bouquet filled with freshly harvested gerberas, carnations, and fragrant lilies.'
  },
  {
    id: 'bouquet-bday-1',
    title: 'Happy Birthday Special Rose & Balloon Floral Gift',
    category: 'birthday-gifts',
    categoryLabel: 'Birthday & Special Gifts',
    subCategory: 'Birthday Bouquet',
    style: 'Festive Birthday Styling',
    suitableFor: 'Birthday Surprise & Midnight Delivery',
    occasion: 'Birthday Party',
    floralStyle: 'Pastel Roses, Ferrero Chocolates & Birthday Topper',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80',
    altText: 'Birthday flower bouquet gift with balloons and topper',
    description: 'Festive arrangement with "Happy Birthday" tag, fresh pink roses, balloon accents, and gourmet chocolate pairings.'
  },
  {
    id: 'bouquet-basket-1',
    title: 'Handcrafted Cane Basket Flower Arrangement',
    category: 'bouquets',
    categoryLabel: 'Flower Bouquets',
    subCategory: 'Flower Basket / Arrangement',
    style: 'Rustic Cane Basket',
    suitableFor: 'Housewarming, Welcome & Corporate Table',
    occasion: 'Home Puja & Opening Ceremonies',
    floralStyle: 'Sunflowers, Gerberas, Roses & Ivy Ferns',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=1000&q=80',
    altText: 'Handcrafted flower basket arrangement with fresh blooms',
    description: 'Long-lasting sponge-hydrated floral basket arrangement suited for center tables, stage pedestals, and welcoming guests.'
  },

  // ==========================================
  // 4. DOOR & ENTRANCE FLOWER DECORATION
  // ==========================================
  {
    id: 'entrance-purple-white-1',
    title: 'Royal Purple & White Floral Entrance Door Frame',
    category: 'entrance-decoration',
    categoryLabel: 'Door & Entrance Decoration',
    subCategory: 'Floral Door Frame',
    style: 'Purple & White Royal Arch',
    suitableFor: 'Wedding Entrance & Reception Gate',
    occasion: 'Wedding Day & Sangeet',
    floralStyle: 'Purple Dendrobium Orchids & White Carnations',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    altText: 'Floral entrance decoration in purple and white orchids',
    description: 'Grand door surround featuring cascading purple orchid strings and white carnation clusters creating an enchanting portal.'
  },
  {
    id: 'entrance-yellow-white-1',
    title: 'Auspicious Yellow & White Traditional Marigold Entrance',
    category: 'entrance-decoration',
    categoryLabel: 'Door & Entrance Decoration',
    subCategory: 'Traditional Flower Entrance',
    style: 'Yellow & White Toran & Pillars',
    suitableFor: 'Home Griha Pravesh & Haldi Ceremony',
    occasion: 'Haldi, Puja & Home Entry',
    floralStyle: 'Yellow Zendu, Mogra Torans & Mango Leaves',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1545232979-fbf68fe9ec44?auto=format&fit=crop&w=1000&q=80',
    altText: 'Traditional yellow and white marigold door entrance decoration',
    description: 'Traditional Maharashtrian doorway decoration with dense yellow marigold garlands, hanging bell motifs, and fresh mango leaf toran.'
  },
  {
    id: 'entrance-colourful-1',
    title: 'Grand Colourful Wedding Walkway Floral Arch',
    category: 'entrance-decoration',
    categoryLabel: 'Door & Entrance Decoration',
    subCategory: 'Premium Floral Arch',
    style: 'Full Bloom Colourful Arch',
    suitableFor: 'Grand Lawns & Banquet Entrance',
    occasion: 'Grand Wedding Celebration',
    floralStyle: 'Roses, Gerberas, Chrysanthemums & Fern Foliage',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80',
    altText: 'Colourful wedding entrance floral arch decoration',
    description: 'Spectacular floral arch welcoming guests into the venue with vibrant blossoms and subtle warm ambient uplighting.'
  },

  // ==========================================
  // 5. WEDDING & ENGAGEMENT DECORATION
  // ==========================================
  {
    id: 'wedding-mandap-1',
    title: 'Four-Pillar Traditional Floral Mandap Setup',
    category: 'wedding-engagement',
    categoryLabel: 'Wedding & Engagement',
    subCategory: 'Wedding Decoration',
    style: 'Traditional Vedic Mandap',
    suitableFor: 'Sacred Wedding Pheras & Muhurt',
    occasion: 'Wedding Day Ceremony',
    floralStyle: 'Marigold Canopy, Hanging Mogra & Rose Pillars',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
    altText: 'Traditional Indian wedding mandap flower decoration',
    description: 'Auspicious wedding mandap designed for traditional Marathi and Indian rituals with hanging floral bells and floral havan surround.'
  },
  {
    id: 'wedding-engagement-ring-1',
    title: 'Romantic Floral Ring Backdrop for Engagement',
    category: 'wedding-engagement',
    categoryLabel: 'Wedding & Engagement',
    subCategory: 'Engagement Decoration',
    style: 'Modern Circular Ring Arch',
    suitableFor: 'Ring Exchange Ceremony & Couple Photos',
    occasion: 'Engagement Ceremony',
    floralStyle: 'Pastel Peach Roses, Hydrangeas & Pampas Grass',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    altText: 'Engagement floral ring backdrop decoration',
    description: 'Contemporary 8-foot circular metallic ring adorned with asymmetric floral sprays of blush roses and greenery.'
  },

  // ==========================================
  // 6. FRESH FLOWERS CATALOGUE
  // ==========================================
  {
    id: 'flower-rose-fresh',
    title: 'Fresh Dutch & Country Roses (Daily Harvest)',
    category: 'fresh-flowers',
    categoryLabel: 'Fresh Flowers',
    subCategory: 'Roses',
    style: 'Farm Fresh Nashik Harvest',
    suitableFor: 'Daily Puja, Temple Offering & Event Decor',
    occasion: 'Everyday & Special Occasions',
    floralStyle: 'Crimson, Pink, Peach, Yellow & White Roses',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    altText: 'Fresh Nashik cut roses in multiple colours',
    description: 'Sourced daily from polyhouse flower growers around Nashik and Niphad, offering maximum vase life and fresh fragrance.'
  },
  {
    id: 'flower-marigold-fresh',
    title: 'Auspicious Zendu / Marigold (Yellow & Orange)',
    category: 'fresh-flowers',
    categoryLabel: 'Fresh Flowers',
    subCategory: 'Marigold',
    style: 'Loose & Stringed Flowers',
    suitableFor: 'Festival Puja, Griha Pravesh & Car Puja',
    occasion: 'Daily Puja & Festivals',
    floralStyle: 'Golden Yellow & Deep Orange Fresh Zendu',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=1000&q=80',
    altText: 'Fresh yellow and orange marigold flowers for puja',
    description: 'Fresh aromatic zendu flowers available in loose bulk kilograms or pre-threaded malas for all auspicious occasions.'
  },
  {
    id: 'flower-mogra-fresh',
    title: 'Fragrant Mogra & Jasmine Blossoms',
    category: 'fresh-flowers',
    categoryLabel: 'Fresh Flowers',
    subCategory: 'Jasmine / Mogra',
    style: 'Fragrant Buds & Hand-Knitted Gajras',
    suitableFor: 'Bridal Hair Styling, Temple Offering & Scenting',
    occasion: 'Weddings & Daily Aarti',
    floralStyle: 'Pure White Fragrant Mogra Buds',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80',
    altText: 'Fresh fragrant mogra jasmine buds and gajras',
    description: 'Intensely fragrant fresh mogra buds harvested at dawn, perfect for gajras and sacred offerings.'
  },
  {
    id: 'flower-chrysanthemum-fresh',
    title: 'Shevanti / Chrysanthemum (White, Yellow & Violet)',
    category: 'fresh-flowers',
    categoryLabel: 'Fresh Flowers',
    subCategory: 'Chrysanthemum',
    style: 'Loose Festival Blooms',
    suitableFor: 'Diwali, Ganesh Utsav & Garland Weaving',
    occasion: 'Festivals & Mala Making',
    floralStyle: 'Fresh Shevanti Cut Flowers',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1000&q=80',
    altText: 'Fresh chrysanthemum shevanti flowers in Nashik',
    description: 'Dense, long-lasting Shevanti flowers available in white, yellow, and violet for puja rituals and traditional garlands.'
  },

  // ==========================================
  // 7. OUR REAL CUSTOMER WORK
  // ==========================================
  {
    id: 'cust-work-1',
    title: 'Wedding Car Decoration',
    category: 'customer-work',
    categoryLabel: 'Our Real Customer Work',
    subCategory: 'Wedding Car Decoration',
    style: 'Bonnet Rose Spray & Ribbon Trim',
    suitableFor: 'Wedding Day Procession',
    occasion: 'Wedding Day',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80',
    altText: 'Wedding car decoration real project work',
    description: 'Real on-site floral installation executed in Nashik for wedding day groom procession.'
  },
  {
    id: 'cust-work-2',
    title: 'Wedding Floral Work',
    category: 'customer-work',
    categoryLabel: 'Our Real Customer Work',
    subCategory: 'Wedding Floral Work',
    style: 'Stage & Mandap Fresh Floral Styling',
    suitableFor: 'Wedding Venue Decor',
    occasion: 'Wedding Ceremony',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    altText: 'Wedding floral work by Kamlesh Ful Bhandar',
    description: 'Customized stage floral backdrop designed and completed on schedule for client family.'
  },
  {
    id: 'cust-work-3',
    title: 'Entrance Decoration',
    category: 'customer-work',
    categoryLabel: 'Our Real Customer Work',
    subCategory: 'Entrance Decoration',
    style: 'Floral Door Frame & Toran',
    suitableFor: 'Home Celebration Entry',
    occasion: 'Family Celebration',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1545232979-fbf68fe9ec44?auto=format&fit=crop&w=1000&q=80',
    altText: 'Entrance decoration real work photograph',
    description: 'Fresh doorway floral toran and pillar wrapping installed for local celebration.'
  },
  {
    id: 'cust-work-4',
    title: 'Varmala Design',
    category: 'customer-work',
    categoryLabel: 'Our Real Customer Work',
    subCategory: 'Varmala Design',
    style: 'Bridal Red Rose & Mogra Varmala Pair',
    suitableFor: 'Wedding Muhurt',
    occasion: 'Wedding Muhurt',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=1000&q=80',
    altText: 'Varmala design real customer wedding garland',
    description: 'Special customized bride & groom varmala pair delivered fresh on wedding morning.'
  },
  {
    id: 'cust-work-5',
    title: 'Special Occasion Bouquet',
    category: 'customer-work',
    categoryLabel: 'Our Real Customer Work',
    subCategory: 'Special Occasion Bouquet',
    style: 'Handcrafted Dutch Rose Bunch',
    suitableFor: 'Birthday & Anniversary Greeting',
    occasion: 'Birthday Greeting',
    priceText: 'Price on Request',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    altText: 'Special occasion bouquet real client order',
    description: 'Handcrafted fresh rose bouquet designed for milestone birthday celebration.'
  }
];

export const PORTFOLIO_ITEMS: PortfolioItem[] =
  Array.isArray(uploadedPhotosRaw) && uploadedPhotosRaw.length > 0
    ? (uploadedPhotosRaw as PortfolioItem[])
    : DEFAULT_PORTFOLIO_ITEMS;

