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
    const {
      category,
      subcategory,
      search,
      availability,
      featured,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
      includeUnpublished
    } = req.query;

    const whereClause: any = {};

    // Published filter (default: only published products visible to public)
    if (includeUnpublished !== 'true') {
      whereClause.isPublished = true;
    }

    // Availability filter
    if (availability) {
      if (availability !== 'ALL') {
        whereClause.availability = String(availability);
      }
    } else {
      // By default customer views AVAILABLE or OUT_OF_STOCK, but NOT HIDDEN
      whereClause.availability = { in: ['AVAILABLE', 'OUT_OF_STOCK'] };
    }

    // Category filter by slug, id, or name
    if (category && category !== 'All' && category !== 'all') {
      whereClause.category = {
        OR: [
          { slug: String(category) },
          { id: String(category) },
          { name: { contains: String(category), mode: 'insensitive' } }
        ]
      };
    }

    // Subcategory filter
    if (subcategory) {
      whereClause.subcategory = { contains: String(subcategory), mode: 'insensitive' };
    }

    // Featured filter
    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    // Search query across name, description, flowerType, color, subcategory
    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { shortDescription: { contains: q, mode: 'insensitive' } },
        { flowerType: { contains: q, mode: 'insensitive' } },
        { color: { contains: q, mode: 'insensitive' } },
        { subcategory: { contains: q, mode: 'insensitive' } },
        { suitableFor: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(String(minPrice));
      if (maxPrice) whereClause.price.lte = parseFloat(String(maxPrice));
    }

    // Sorting
    let orderBy: any = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    if (sort === 'price_asc') {
      orderBy = [{ price: 'asc' }, { createdAt: 'desc' }];
    } else if (sort === 'price_desc') {
      orderBy = [{ price: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'latest') {
      orderBy = [{ createdAt: 'desc' }];
    } else if (sort === 'featured') {
      orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    }

    // Pagination
    const pageNum = page ? Math.max(1, parseInt(String(page), 10)) : 1;
    const limitNum = limit ? Math.max(1, parseInt(String(limit), 10)) : undefined;
    const skip = limitNum ? (pageNum - 1) * limitNum : undefined;

    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          },
          images: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy,
        skip,
        take: limitNum
      })
    ]);

    res.json({
      success: true,
      count: products.length,
      total: totalCount,
      page: pageNum,
      totalPages: limitNum ? Math.ceil(totalCount / limitNum) : 1,
      products
    });
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
        category: true,
        images: {
          orderBy: { createdAt: 'asc' }
        }
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

/**
 * Category-based Related Products (Strictly in the same category)
 */
export const getRelatedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;

    const currentProduct = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }]
      },
      select: { id: true, categoryId: true, subcategory: true }
    });

    if (!currentProduct) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Find related products in the same category, excluding the current item
    const related = await prisma.product.findMany({
      where: {
        categoryId: currentProduct.categoryId,
        id: { not: currentProduct.id },
        isPublished: true,
        availability: { in: ['AVAILABLE', 'OUT_OF_STOCK'] }
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        }
      },
      take: 6,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
    });

    res.json({ success: true, count: related.length, products: related });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch related products.', error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      categoryId,
      subcategory,
      description,
      shortDescription,
      price,
      priceType,
      isContactForPrice,
      availability,
      isFeatured,
      isPublished,
      image,
      imagePublicId,
      images,
      flowerType,
      length,
      width,
      height,
      weight,
      color,
      suitableFor,
      whatsappMessage
    } = req.body;

    let primaryImage = image;
    if (!primaryImage && Array.isArray(images) && images.length > 0) {
      primaryImage = typeof images[0] === 'string' ? images[0] : images[0].url;
    }

    if (!name || !categoryId || !primaryImage) {
      res.status(400).json({ success: false, message: 'Name, Category, and primary Image are required.' });
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

    const contactForPrice = Boolean(isContactForPrice || priceType === 'CONTACT_FOR_PRICE');
    const parsedPrice = contactForPrice || price === '' || price === null || price === undefined
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
        shortDescription: shortDescription ? shortDescription.trim() : null,
        price: parsedPrice,
        priceType: priceType || (contactForPrice ? 'CONTACT_FOR_PRICE' : 'FIXED'),
        isContactForPrice: contactForPrice,
        availability: resolvedAvailability,
        isFeatured: Boolean(isFeatured),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        image: primaryImage.trim(),
        imagePublicId: imagePublicId || null,
        subcategory: subcategory ? subcategory.trim() : null,
        flowerType: flowerType ? flowerType.trim() : null,
        length: length ? String(length).trim() : null,
        width: width ? String(width).trim() : null,
        height: height ? String(height).trim() : null,
        weight: weight ? String(weight).trim() : null,
        color: color ? color.trim() : null,
        suitableFor: suitableFor ? suitableFor.trim() : null,
        whatsappMessage: whatsappMessage ? whatsappMessage.trim() : null,
        categoryId
      },
      include: {
        category: true,
        images: true
      }
    });

    // Handle additional images if provided
    if (Array.isArray(images) && images.length > 0) {
      for (const imgItem of images) {
        const imgUrl = typeof imgItem === 'string' ? imgItem : imgItem.url;
        const imgPid = typeof imgItem === 'object' ? imgItem.publicId : null;
        if (imgUrl && imgUrl.trim() !== primaryImage.trim()) {
          await prisma.productImage.create({
            data: {
              url: imgUrl.trim(),
              publicId: imgPid,
              productId: product.id
            }
          });
        }
      }
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, images: true }
    });

    res.status(201).json({ success: true, message: 'Product created successfully.', product: fullProduct });
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
      subcategory,
      description,
      shortDescription,
      price,
      priceType,
      isContactForPrice,
      availability,
      isFeatured,
      isPublished,
      image,
      imagePublicId,
      images,
      flowerType,
      length,
      width,
      height,
      weight,
      color,
      suitableFor,
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
    if (subcategory !== undefined) dataToUpdate.subcategory = subcategory ? subcategory.trim() : null;
    if (description !== undefined) dataToUpdate.description = description.trim();
    if (shortDescription !== undefined) dataToUpdate.shortDescription = shortDescription ? shortDescription.trim() : null;

    if (isContactForPrice !== undefined || priceType === 'CONTACT_FOR_PRICE') {
      dataToUpdate.isContactForPrice = Boolean(isContactForPrice || priceType === 'CONTACT_FOR_PRICE');
    }

    if (priceType !== undefined) dataToUpdate.priceType = priceType;

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
    if (isPublished !== undefined) dataToUpdate.isPublished = Boolean(isPublished);
    if (image !== undefined) dataToUpdate.image = image.trim();
    if (imagePublicId !== undefined) dataToUpdate.imagePublicId = imagePublicId;
    if (flowerType !== undefined) dataToUpdate.flowerType = flowerType ? flowerType.trim() : null;
    if (length !== undefined) dataToUpdate.length = length ? String(length).trim() : null;
    if (width !== undefined) dataToUpdate.width = width ? String(width).trim() : null;
    if (height !== undefined) dataToUpdate.height = height ? String(height).trim() : null;
    if (weight !== undefined) dataToUpdate.weight = weight ? String(weight).trim() : null;
    if (color !== undefined) dataToUpdate.color = color ? color.trim() : null;
    if (suitableFor !== undefined) dataToUpdate.suitableFor = suitableFor ? suitableFor.trim() : null;
    if (whatsappMessage !== undefined) dataToUpdate.whatsappMessage = whatsappMessage;

    await prisma.product.update({
      where: { id },
      data: dataToUpdate
    });

    // Update gallery images if provided
    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      for (const imgItem of images) {
        const imgUrl = typeof imgItem === 'string' ? imgItem : imgItem.url;
        const imgPid = typeof imgItem === 'object' ? imgItem.publicId : null;
        if (imgUrl && imgUrl.trim() !== (dataToUpdate.image || existingProduct.image).trim()) {
          await prisma.productImage.create({
            data: {
              url: imgUrl.trim(),
              publicId: imgPid,
              productId: id
            }
          });
        }
      }
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true
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
