import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// Helper to generate slugs
const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, availability, featured, minPrice, maxPrice } = req.query;

    const whereClause: any = {};

    // Availability filter (default for customers: AVAILABLE unless admin requests all)
    if (availability) {
      if (availability !== 'ALL') {
        whereClause.availability = String(availability);
      }
    } else {
      // By default customer views AVAILABLE or OUT_OF_STOCK, but NOT HIDDEN
      whereClause.availability = { in: ['AVAILABLE', 'OUT_OF_STOCK'] };
    }

    // Category filter by slug or id
    if (category && category !== 'All' && category !== 'all') {
      whereClause.category = {
        OR: [
          { slug: String(category) },
          { id: String(category) },
          { name: { contains: String(category), mode: 'insensitive' } }
        ]
      };
    }

    // Featured filter
    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    // Search query
    if (search) {
      whereClause.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(String(minPrice));
      if (maxPrice) whereClause.price.lte = parseFloat(String(maxPrice));
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
    });

    res.json({ success: true, count: products.length, products });
  } catch (error: any) {
    console.error('getProducts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.', error: error.message });
  }
};

export const getProductByIdOrSlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }]
      },
      include: {
        category: true
      }
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch product details.', error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      categoryId,
      description,
      price,
      isContactForPrice,
      availability,
      isFeatured,
      image,
      imagePublicId,
      whatsappMessage
    } = req.body;

    let primaryImage = image;
    if (!primaryImage && Array.isArray((req.body as any).images) && (req.body as any).images.length > 0) {
      primaryImage = (req.body as any).images[0];
    }

    if (!name || !categoryId || !primaryImage) {
      res.status(400).json({ success: false, message: 'Name, Category, and Image are required.' });
      return;
    }

    // Ensure category exists
    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      res.status(400).json({ success: false, message: 'Invalid category specified.' });
      return;
    }

    let baseSlug = generateSlug(name);
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }

    const parsedPrice = isContactForPrice || price === '' || price === null || price === undefined
      ? null
      : parseFloat(String(price));

    let resolvedAvailability = availability || 'AVAILABLE';
    if ((req.body as any).isAvailable !== undefined && !availability) {
      resolvedAvailability = (req.body as any).isAvailable ? 'AVAILABLE' : 'OUT_OF_STOCK';
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: uniqueSlug,
        description: description ? description.trim() : '',
        price: parsedPrice,
        isContactForPrice: Boolean(isContactForPrice),
        availability: resolvedAvailability,
        isFeatured: Boolean(isFeatured),
        image: primaryImage.trim(),
        imagePublicId: imagePublicId || null,
        whatsappMessage: whatsappMessage ? whatsappMessage.trim() : null,
        categoryId
      },
      include: {
        category: true
      }
    });

    res.status(201).json({ success: true, message: 'Product created successfully.', product });
  } catch (error: any) {
    console.error('createProduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product.', error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      categoryId,
      description,
      price,
      isContactForPrice,
      availability,
      isFeatured,
      image,
      imagePublicId,
      whatsappMessage
    } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const dataToUpdate: any = {};

    if (name !== undefined) {
      dataToUpdate.name = name.trim();
      if (name.trim() !== existingProduct.name) {
        let baseSlug = generateSlug(name);
        let uniqueSlug = baseSlug;
        let count = 1;
        while (
          await prisma.product.findFirst({
            where: { slug: uniqueSlug, NOT: { id } }
          })
        ) {
          uniqueSlug = `${baseSlug}-${count++}`;
        }
        dataToUpdate.slug = uniqueSlug;
      }
    }

    if (categoryId !== undefined) dataToUpdate.categoryId = categoryId;
    if (description !== undefined) dataToUpdate.description = description.trim();
    if (isContactForPrice !== undefined) dataToUpdate.isContactForPrice = Boolean(isContactForPrice);

    if (price !== undefined) {
      dataToUpdate.price = dataToUpdate.isContactForPrice || price === '' || price === null
        ? null
        : parseFloat(String(price));
    }

    if (availability !== undefined) {
      dataToUpdate.availability = availability;
    } else if ((req.body as any).isAvailable !== undefined) {
      dataToUpdate.availability = (req.body as any).isAvailable ? 'AVAILABLE' : 'OUT_OF_STOCK';
    }
    if (isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(isFeatured);
    if (image !== undefined) dataToUpdate.image = image.trim();
    if (imagePublicId !== undefined) dataToUpdate.imagePublicId = imagePublicId;
    if (whatsappMessage !== undefined) dataToUpdate.whatsappMessage = whatsappMessage;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: true
      }
    });

    res.json({ success: true, message: 'Product updated successfully.', product: updatedProduct });
  } catch (error: any) {
    console.error('updateProduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product.', error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    await prisma.product.delete({ where: { id } });

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete product.', error: error.message });
  }
};
