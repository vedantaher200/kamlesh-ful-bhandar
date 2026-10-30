// src/server.ts
import express from "express";
import cors from "cors";
import dotenv2 from "dotenv";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

// src/routes/index.ts
import { Router as Router14 } from "express";

// src/routes/authRoutes.ts
import { Router } from "express";

// src/controllers/authController.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// src/config/prisma.ts
import { PrismaClient } from "@prisma/client";
var globalForPrisma = globalThis;
if (!process.env.DATABASE_URL) {
  console.warn("\u26A0\uFE0F [Prisma] DATABASE_URL environment variable is not set. Ensure it is defined in your Vercel Project Settings.");
} else if (process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1")) {
  console.warn("\u26A0\uFE0F [Prisma] DATABASE_URL points to localhost. Cloud deployments require a hosted PostgreSQL URL (e.g., Neon, Supabase).");
}
var _prismaInstance = null;
function getPrismaClient() {
  if (!_prismaInstance) {
    if (globalForPrisma.prisma) {
      _prismaInstance = globalForPrisma.prisma;
    } else {
      const dbUrl = process.env.DATABASE_URL;
      _prismaInstance = new PrismaClient({
        datasources: dbUrl ? { db: { url: dbUrl } } : void 0,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
      });
      globalForPrisma.prisma = _prismaInstance;
    }
  }
  return _prismaInstance;
}
var prisma = new Proxy({}, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
});

// src/controllers/authController.ts
function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}
var login = async (req, res) => {
  try {
    const { adminKey, admin_key, key, username, email, password } = req.body;
    const providedKey = (adminKey || admin_key || key || username || email || "").toString().trim();
    const rawPassword = (password || "").toString();
    const trimmedPassword = rawPassword.trim();
    if (!providedKey || !rawPassword) {
      res.status(400).json({
        success: false,
        message: "Admin Key and Password are required."
      });
      return;
    }
    const envAdminKey = process.env.ADMIN_KEY?.trim();
    const envPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
    const envPasswordPlain = process.env.ADMIN_PASSWORD?.trim();
    let isKeyValid = false;
    if (envAdminKey) {
      if (safeCompare(providedKey, envAdminKey) || safeCompare(providedKey.toLowerCase(), envAdminKey.toLowerCase())) {
        isKeyValid = true;
      }
    }
    let isPasswordValid = false;
    if (envPasswordHash) {
      const matchRaw = await bcrypt.compare(rawPassword, envPasswordHash);
      const matchTrimmed = trimmedPassword !== rawPassword ? await bcrypt.compare(trimmedPassword, envPasswordHash) : false;
      if (matchRaw || matchTrimmed) {
        isPasswordValid = true;
      }
    }
    if (!isPasswordValid && envPasswordPlain) {
      if (safeCompare(rawPassword, envPasswordPlain) || safeCompare(trimmedPassword, envPasswordPlain)) {
        isPasswordValid = true;
      }
    }
    if (!isKeyValid || !isPasswordValid) {
      try {
        const dbAdmin = await prisma.user.findFirst({
          where: { role: "ADMIN" }
        });
        if (dbAdmin) {
          if (!isKeyValid) {
            if (safeCompare(providedKey.toLowerCase(), dbAdmin.email.toLowerCase()) || providedKey.toLowerCase() === "admin") {
              isKeyValid = true;
            }
          }
          if (!isPasswordValid && dbAdmin.password) {
            const matchDbRaw = await bcrypt.compare(rawPassword, dbAdmin.password);
            const matchDbTrimmed = trimmedPassword !== rawPassword ? await bcrypt.compare(trimmedPassword, dbAdmin.password) : false;
            if (matchDbRaw || matchDbTrimmed) {
              isPasswordValid = true;
            }
          }
        }
      } catch (dbErr) {
        console.warn("\u26A0\uFE0F [AUTH] Database query during fallback credential evaluation failed:", dbErr);
      }
    }
    console.log(`[AUTH] Admin login evaluation: KeyValid=${isKeyValid}, PasswordValid=${isPasswordValid}`);
    if (!isKeyValid || !isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid Admin Key or Password."
      });
      return;
    }
    let adminUser = null;
    try {
      adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" }
      });
      if (!adminUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = envPasswordHash || await bcrypt.hash(rawPassword, salt);
        adminUser = await prisma.user.create({
          data: {
            name: "Kamlesh Ful Bhandar Admin",
            email: "admin@kamleshfulbhandar.com",
            password: hashedPassword,
            role: "ADMIN"
          }
        });
      }
    } catch (dbErr) {
      console.warn("\u26A0\uFE0F [AUTH] Database unavailable during admin user lookup; using session fallback:", dbErr);
    }
    const adminId = adminUser?.id || "admin-configured";
    const adminRole = adminUser?.role || "ADMIN";
    const adminName = adminUser?.name || "Kamlesh Ful Bhandar Admin";
    const adminEmail = adminUser?.email || "admin@kamleshfulbhandar.com";
    const secret = process.env.JWT_SECRET || "kamlesh_default_jwt_secret";
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    const token = jwt.sign(
      {
        id: adminId,
        role: adminRole,
        name: adminName,
        email: adminEmail
      },
      secret,
      { expiresIn }
    );
    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: adminId,
        name: adminName,
        role: adminRole,
        email: adminEmail
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication.",
      error: error.message
    });
  }
};
var getMe = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }
    let user = null;
    try {
      if (req.user.id && req.user.id !== "admin-configured") {
        user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
      }
    } catch (dbErr) {
      console.warn("\u26A0\uFE0F [Auth] Could not fetch user from DB in getMe, using token payload:", dbErr);
    }
    res.json({
      success: true,
      user: user || {
        id: req.user.id,
        name: req.user.name || "Kamlesh Ful Bhandar Admin",
        role: req.user.role || "ADMIN",
        email: req.user.email || "admin@kamleshfulbhandar.com"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving profile.", error: error.message });
  }
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Authentication required. No token provided." });
      return;
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "kamlesh_default_jwt_secret";
    const decoded = jwt2.verify(token, secret);
    if (!decoded || decoded.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Access denied. Administrator privileges required." });
      return;
    }
    let user = null;
    try {
      if (decoded.id && decoded.id !== "admin-configured") {
        user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, name: true, email: true, role: true }
        });
      }
      if (!user) {
        user = await prisma.user.findFirst({
          where: { role: "ADMIN" },
          select: { id: true, name: true, email: true, role: true }
        });
      }
    } catch (dbErr) {
      console.warn("\u26A0\uFE0F [Auth Middleware] Database lookup failed, falling back to verified JWT claims:", dbErr);
    }
    if (!user) {
      user = {
        id: decoded.id || "admin-configured",
        name: decoded.name || "Kamlesh Ful Bhandar Admin",
        email: decoded.email || "admin@kamleshfulbhandar.com",
        role: decoded.role || "ADMIN"
      };
    }
    if (user.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Access denied. Administrator privileges required." });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

// src/routes/authRoutes.ts
var router = Router();
router.post("/login", login);
router.get("/me", authenticateAdmin, getMe);
var authRoutes_default = router;

// src/routes/productRoutes.ts
import { Router as Router2 } from "express";

// src/controllers/productController.ts
var generateSlug = (text) => {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
};
var getProducts = async (req, res) => {
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
    const whereClause = {};
    if (includeUnpublished !== "true") {
      whereClause.isPublished = true;
    }
    if (availability) {
      if (availability !== "ALL") {
        whereClause.availability = String(availability);
      }
    } else {
      whereClause.availability = { in: ["AVAILABLE", "OUT_OF_STOCK"] };
    }
    if (category && category !== "All" && category !== "all") {
      whereClause.category = {
        OR: [
          { slug: String(category) },
          { id: String(category) },
          { name: { contains: String(category), mode: "insensitive" } }
        ]
      };
    }
    if (subcategory) {
      whereClause.subcategory = { contains: String(subcategory), mode: "insensitive" };
    }
    if (featured === "true") {
      whereClause.isFeatured = true;
    }
    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { flowerType: { contains: q, mode: "insensitive" } },
        { color: { contains: q, mode: "insensitive" } },
        { subcategory: { contains: q, mode: "insensitive" } },
        { suitableFor: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } }
      ];
    }
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(String(minPrice));
      if (maxPrice) whereClause.price.lte = parseFloat(String(maxPrice));
    }
    let orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];
    if (sort === "price_asc") {
      orderBy = [{ price: "asc" }, { createdAt: "desc" }];
    } else if (sort === "price_desc") {
      orderBy = [{ price: "desc" }, { createdAt: "desc" }];
    } else if (sort === "latest") {
      orderBy = [{ createdAt: "desc" }];
    } else if (sort === "featured") {
      orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];
    }
    const pageNum = page ? Math.max(1, parseInt(String(page), 10)) : 1;
    const limitNum = limit ? Math.max(1, parseInt(String(limit), 10)) : void 0;
    const skip = limitNum ? (pageNum - 1) * limitNum : void 0;
    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          },
          images: {
            orderBy: { createdAt: "asc" }
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
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products.", error: error.message });
  }
};
var getProductByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }]
      },
      include: {
        category: true,
        images: {
          orderBy: { createdAt: "asc" }
        }
      }
    });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch product details.", error: error.message });
  }
};
var getRelatedProducts = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const currentProduct = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }]
      },
      select: { id: true, categoryId: true, subcategory: true }
    });
    if (!currentProduct) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }
    const related = await prisma.product.findMany({
      where: {
        categoryId: currentProduct.categoryId,
        id: { not: currentProduct.id },
        isPublished: true,
        availability: { in: ["AVAILABLE", "OUT_OF_STOCK"] }
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        }
      },
      take: 6,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }]
    });
    res.json({ success: true, count: related.length, products: related });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch related products.", error: error.message });
  }
};
var createProduct = async (req, res) => {
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
      primaryImage = typeof images[0] === "string" ? images[0] : images[0].url;
    }
    const contactForPrice = Boolean(isContactForPrice || priceType === "CONTACT_FOR_PRICE");
    const parsedPrice = contactForPrice ? null : Number(price);
    if (typeof name !== "string" || !name.trim() || !categoryId || !primaryImage || typeof description !== "string" || !description.trim()) {
      res.status(400).json({ success: false, message: "Product name, category, description, and primary image are required." });
      return;
    }
    if (!contactForPrice && (price === "" || price === null || price === void 0 || parsedPrice === null || !Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      res.status(400).json({ success: false, message: "Enter a valid price of zero or more, or select Contact for Price." });
      return;
    }
    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      res.status(400).json({ success: false, message: "Invalid category specified." });
      return;
    }
    let baseSlug = generateSlug(name);
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }
    let resolvedAvailability = availability || "AVAILABLE";
    if (req.body.isAvailable !== void 0 && !availability) {
      resolvedAvailability = req.body.isAvailable ? "AVAILABLE" : "OUT_OF_STOCK";
    }
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: uniqueSlug,
        description: description ? description.trim() : "",
        shortDescription: shortDescription ? shortDescription.trim() : null,
        price: parsedPrice,
        priceType: priceType || (contactForPrice ? "CONTACT_FOR_PRICE" : "FIXED"),
        isContactForPrice: contactForPrice,
        availability: resolvedAvailability,
        isFeatured: Boolean(isFeatured),
        isPublished: isPublished !== void 0 ? Boolean(isPublished) : true,
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
    if (Array.isArray(images) && images.length > 0) {
      for (const imgItem of images) {
        const imgUrl = typeof imgItem === "string" ? imgItem : imgItem.url;
        const imgPid = typeof imgItem === "object" ? imgItem.publicId : null;
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
    res.status(201).json({ success: true, message: "Product created successfully.", product: fullProduct });
  } catch (error) {
    console.error("createProduct error:", error);
    res.status(500).json({ success: false, message: "Failed to create product.", error: error.message });
  }
};
var updateProduct = async (req, res) => {
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
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }
    const dataToUpdate = {};
    if (name !== void 0 && (typeof name !== "string" || !name.trim())) {
      res.status(400).json({ success: false, message: "Product name is required." });
      return;
    }
    if (description !== void 0 && (typeof description !== "string" || !description.trim())) {
      res.status(400).json({ success: false, message: "Product description is required." });
      return;
    }
    if (categoryId !== void 0 && !await prisma.category.findUnique({ where: { id: categoryId } })) {
      res.status(400).json({ success: false, message: "Invalid category specified." });
      return;
    }
    const contactPriceUpdate = isContactForPrice !== void 0 || priceType !== void 0 ? Boolean(isContactForPrice || priceType === "CONTACT_FOR_PRICE") : existingProduct.isContactForPrice;
    if (price !== void 0 && !contactPriceUpdate) {
      const parsed = Number(price);
      if (price === "" || price === null || !Number.isFinite(parsed) || parsed < 0) {
        res.status(400).json({ success: false, message: "Enter a valid price of zero or more, or select Contact for Price." });
        return;
      }
    }
    if (name !== void 0) {
      dataToUpdate.name = name.trim();
      if (name.trim() !== existingProduct.name) {
        let baseSlug = generateSlug(name);
        let uniqueSlug = baseSlug;
        let count = 1;
        while (await prisma.product.findFirst({
          where: { slug: uniqueSlug, NOT: { id } }
        })) {
          uniqueSlug = `${baseSlug}-${count++}`;
        }
        dataToUpdate.slug = uniqueSlug;
      }
    }
    if (categoryId !== void 0) dataToUpdate.categoryId = categoryId;
    if (subcategory !== void 0) dataToUpdate.subcategory = subcategory ? subcategory.trim() : null;
    if (description !== void 0) dataToUpdate.description = description.trim();
    if (shortDescription !== void 0) dataToUpdate.shortDescription = shortDescription ? shortDescription.trim() : null;
    if (isContactForPrice !== void 0 || priceType === "CONTACT_FOR_PRICE") {
      dataToUpdate.isContactForPrice = Boolean(isContactForPrice || priceType === "CONTACT_FOR_PRICE");
    }
    if (priceType !== void 0) dataToUpdate.priceType = priceType;
    if (price !== void 0) {
      dataToUpdate.price = contactPriceUpdate || price === "" || price === null ? null : Number(price);
    }
    if (availability !== void 0) {
      dataToUpdate.availability = availability;
    } else if (req.body.isAvailable !== void 0) {
      dataToUpdate.availability = req.body.isAvailable ? "AVAILABLE" : "OUT_OF_STOCK";
    }
    if (isFeatured !== void 0) dataToUpdate.isFeatured = Boolean(isFeatured);
    if (isPublished !== void 0) dataToUpdate.isPublished = Boolean(isPublished);
    if (image !== void 0) dataToUpdate.image = image.trim();
    if (imagePublicId !== void 0) dataToUpdate.imagePublicId = imagePublicId;
    if (flowerType !== void 0) dataToUpdate.flowerType = flowerType ? flowerType.trim() : null;
    if (length !== void 0) dataToUpdate.length = length ? String(length).trim() : null;
    if (width !== void 0) dataToUpdate.width = width ? String(width).trim() : null;
    if (height !== void 0) dataToUpdate.height = height ? String(height).trim() : null;
    if (weight !== void 0) dataToUpdate.weight = weight ? String(weight).trim() : null;
    if (color !== void 0) dataToUpdate.color = color ? color.trim() : null;
    if (suitableFor !== void 0) dataToUpdate.suitableFor = suitableFor ? suitableFor.trim() : null;
    if (whatsappMessage !== void 0) dataToUpdate.whatsappMessage = whatsappMessage;
    await prisma.product.update({
      where: { id },
      data: dataToUpdate
    });
    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      for (const imgItem of images) {
        const imgUrl = typeof imgItem === "string" ? imgItem : imgItem.url;
        const imgPid = typeof imgItem === "object" ? imgItem.publicId : null;
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
    res.json({ success: true, message: "Product updated successfully.", product: updatedProduct });
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ success: false, message: "Failed to update product.", error: error.message });
  }
};
var deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete product.", error: error.message });
  }
};

// src/routes/productRoutes.ts
var router2 = Router2();
router2.get("/", getProducts);
router2.get("/:idOrSlug/related", getRelatedProducts);
router2.get("/:idOrSlug", getProductByIdOrSlug);
router2.post("/", authenticateAdmin, createProduct);
router2.put("/:id", authenticateAdmin, updateProduct);
router2.delete("/:id", authenticateAdmin, deleteProduct);
var productRoutes_default = router2;

// src/routes/categoryRoutes.ts
import { Router as Router3 } from "express";

// src/controllers/categoryController.ts
var generateSlug2 = (text) => {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
};
var getCategories = async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: "asc" }
    });
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch categories.", error: error.message });
  }
};
var createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: "Category name is required." });
      return;
    }
    const slug = generateSlug2(name);
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: name.trim() }, { slug }] }
    });
    if (existing) {
      res.status(400).json({ success: false, message: "Category with this name already exists." });
      return;
    }
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description ? description.trim() : null,
        image: image ? image.trim() : null
      }
    });
    res.status(201).json({ success: true, message: "Category created.", category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create category.", error: error.message });
  }
};
var updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Category not found." });
      return;
    }
    const dataToUpdate = {};
    if (name) {
      dataToUpdate.name = name.trim();
      dataToUpdate.slug = generateSlug2(name);
    }
    if (description !== void 0) dataToUpdate.description = description;
    if (image !== void 0) dataToUpdate.image = image;
    const category = await prisma.category.update({
      where: { id },
      data: dataToUpdate
    });
    res.json({ success: true, message: "Category updated.", category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update category.", error: error.message });
  }
};
var deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete category.", error: error.message });
  }
};

// src/routes/categoryRoutes.ts
var router3 = Router3();
router3.get("/", getCategories);
router3.post("/", authenticateAdmin, createCategory);
router3.put("/:id", authenticateAdmin, updateCategory);
router3.delete("/:id", authenticateAdmin, deleteCategory);
var categoryRoutes_default = router3;

// src/routes/serviceRoutes.ts
import { Router as Router4 } from "express";

// src/controllers/serviceController.ts
var generateSlug3 = (text) => {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
};
var getServices = async (req, res) => {
  try {
    const { category, featured } = req.query;
    const whereClause = {};
    if (category && category !== "All") {
      whereClause.category = String(category);
    }
    if (featured === "true") {
      whereClause.isFeatured = true;
    }
    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }]
    });
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch services.", error: error.message });
  }
};
var createService = async (req, res) => {
  try {
    const { title, description, highlight, image, category, isAvailable, isFeatured } = req.body;
    if (!title || !description || !image) {
      res.status(400).json({ success: false, message: "Title, description, and image are required." });
      return;
    }
    let baseSlug = generateSlug3(title);
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await prisma.service.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }
    const service = await prisma.service.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        description: description.trim(),
        highlight: highlight ? highlight.trim() : null,
        image: image.trim(),
        category: category || "Decoration",
        isAvailable: isAvailable !== void 0 ? Boolean(isAvailable) : true,
        isFeatured: Boolean(isFeatured)
      }
    });
    res.status(201).json({ success: true, message: "Service created successfully.", service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create service.", error: error.message });
  }
};
var updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, highlight, image, category, isAvailable, isFeatured } = req.body;
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Service not found." });
      return;
    }
    const dataToUpdate = {};
    if (title) dataToUpdate.title = title.trim();
    if (description) dataToUpdate.description = description.trim();
    if (highlight !== void 0) dataToUpdate.highlight = highlight ? highlight.trim() : null;
    if (image) dataToUpdate.image = image.trim();
    if (category) dataToUpdate.category = category;
    if (isAvailable !== void 0) dataToUpdate.isAvailable = Boolean(isAvailable);
    if (isFeatured !== void 0) dataToUpdate.isFeatured = Boolean(isFeatured);
    const updated = await prisma.service.update({
      where: { id },
      data: dataToUpdate
    });
    res.json({ success: true, message: "Service updated successfully.", service: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update service.", error: error.message });
  }
};
var deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id } });
    res.json({ success: true, message: "Service deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete service.", error: error.message });
  }
};

// src/routes/serviceRoutes.ts
var router4 = Router4();
router4.get("/", getServices);
router4.post("/", authenticateAdmin, createService);
router4.put("/:id", authenticateAdmin, updateService);
router4.delete("/:id", authenticateAdmin, deleteService);
var serviceRoutes_default = router4;

// src/routes/galleryRoutes.ts
import { Router as Router5 } from "express";

// src/controllers/galleryController.ts
var getGalleryImages = async (req, res) => {
  try {
    const { category, includeUnpublished } = req.query;
    const whereClause = {};
    if (includeUnpublished !== "true") {
      whereClause.isPublished = true;
    }
    if (category && category !== "All" && category !== "all") {
      whereClause.category = String(category);
    }
    const images = await prisma.galleryImage.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, count: images.length, images });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch gallery images.", error: error.message });
  }
};
var createGalleryImage = async (req, res) => {
  try {
    const { title, category, categoryName, image, imagePublicId, description, isPublished, price, priceMode } = req.body;
    if (!title || !category || !image) {
      res.status(400).json({ success: false, message: "Title, category, and image are required." });
      return;
    }
    const resolvedPriceMode = priceMode === "FIXED" ? "FIXED" : "ENQUIRY_ONLY";
    const parsedPrice = price === "" || price === null || price === void 0 ? null : Number(price);
    if (resolvedPriceMode === "FIXED" && (parsedPrice === null || !Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      res.status(400).json({ success: false, message: "Enter a valid non-negative price for fixed pricing." });
      return;
    }
    const galleryImage = await prisma.galleryImage.create({
      data: {
        title: title.trim(),
        category: category.trim(),
        categoryName: categoryName || `${category} Decorations`,
        image: image.trim(),
        imagePublicId: imagePublicId || null,
        description: description ? description.trim() : null,
        price: resolvedPriceMode === "FIXED" ? parsedPrice : null,
        priceMode: resolvedPriceMode,
        isPublished: isPublished !== void 0 ? Boolean(isPublished) : true
      }
    });
    res.status(201).json({ success: true, message: "Image added to gallery.", galleryImage });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add gallery image.", error: error.message });
  }
};
var updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, categoryName, image, imagePublicId, description, isPublished, price, priceMode } = req.body;
    const dataToUpdate = {};
    if (title) dataToUpdate.title = title.trim();
    if (category) dataToUpdate.category = category.trim();
    if (categoryName) dataToUpdate.categoryName = categoryName;
    if (image) dataToUpdate.image = image.trim();
    if (imagePublicId !== void 0) dataToUpdate.imagePublicId = imagePublicId;
    if (description !== void 0) dataToUpdate.description = description ? description.trim() : null;
    if (isPublished !== void 0) dataToUpdate.isPublished = Boolean(isPublished);
    if (priceMode !== void 0 || price !== void 0) {
      const resolvedPriceMode = priceMode === "FIXED" ? "FIXED" : "ENQUIRY_ONLY";
      const parsedPrice = price === "" || price === null || price === void 0 ? null : Number(price);
      if (resolvedPriceMode === "FIXED" && (parsedPrice === null || !Number.isFinite(parsedPrice) || parsedPrice < 0)) {
        res.status(400).json({ success: false, message: "Enter a valid non-negative price for fixed pricing." });
        return;
      }
      dataToUpdate.priceMode = resolvedPriceMode;
      dataToUpdate.price = resolvedPriceMode === "FIXED" ? parsedPrice : null;
    }
    const updated = await prisma.galleryImage.update({
      where: { id },
      data: dataToUpdate
    });
    res.json({ success: true, message: "Gallery image updated.", galleryImage: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update gallery image.", error: error.message });
  }
};
var deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.galleryImage.delete({ where: { id } });
    res.json({ success: true, message: "Gallery image deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete gallery image.", error: error.message });
  }
};

// src/routes/galleryRoutes.ts
var router5 = Router5();
router5.get("/", getGalleryImages);
router5.post("/", authenticateAdmin, createGalleryImage);
router5.put("/:id", authenticateAdmin, updateGalleryImage);
router5.delete("/:id", authenticateAdmin, deleteGalleryImage);
var galleryRoutes_default = router5;

// src/routes/enquiryRoutes.ts
import { Router as Router6 } from "express";

// src/controllers/enquiryController.ts
var createEnquiry = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      phone,
      eventType,
      eventDate,
      eventLocation,
      district = "Nashik",
      taluka,
      village,
      service,
      productId,
      productName,
      budget,
      message
    } = req.body;
    const finalPhone = customerPhone || phone;
    if (!customerName || !finalPhone) {
      res.status(400).json({ success: false, message: "Customer Name and Mobile Number are required." });
      return;
    }
    const enquiry = await prisma.enquiry.create({
      data: {
        customerName: customerName.trim(),
        customerPhone: finalPhone.trim(),
        eventType: eventType || "Flower Order",
        eventDate: eventDate || null,
        eventLocation: eventLocation || (village ? `${village}, ${taluka || "Nashik"}` : "Nashik"),
        district: district ? district.trim() : "Nashik",
        taluka: taluka ? taluka.trim() : null,
        village: village ? village.trim() : null,
        service: service || productName || "Flower Decoration",
        productId: productId || null,
        productName: productName || null,
        budget: budget || null,
        message: message ? message.trim() : null,
        status: "NEW"
      }
    });
    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully. Our team will contact you shortly.",
      enquiry
    });
  } catch (error) {
    console.error("createEnquiry error:", error);
    res.status(500).json({ success: false, message: "Failed to record enquiry.", error: error.message });
  }
};
var getEnquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = {};
    if (status && status !== "ALL") {
      whereClause.status = String(status);
    }
    const enquiries = await prisma.enquiry.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, count: enquiries.length, enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch enquiries.", error: error.message });
  }
};
var updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ success: false, message: "Status is required." });
      return;
    }
    const updated = await prisma.enquiry.update({
      where: { id },
      data: { status }
    });
    res.json({ success: true, message: "Enquiry status updated.", enquiry: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update enquiry status.", error: error.message });
  }
};
var deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.enquiry.delete({ where: { id } });
    res.json({ success: true, message: "Enquiry deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete enquiry.", error: error.message });
  }
};

// src/routes/enquiryRoutes.ts
var router6 = Router6();
router6.post("/", createEnquiry);
router6.get("/", authenticateAdmin, getEnquiries);
router6.put("/:id/status", authenticateAdmin, updateEnquiryStatus);
router6.delete("/:id", authenticateAdmin, deleteEnquiry);
var enquiryRoutes_default = router6;

// src/routes/bookingRoutes.ts
import { Router as Router7 } from "express";

// src/controllers/bookingController.ts
var getBlockedAndBookedDates = async (_req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { isDateBlocked: true },
          { status: { in: ["CONFIRMED", "NEW"] } }
        ]
      },
      select: {
        id: true,
        eventDate: true,
        eventType: true,
        status: true,
        isDateBlocked: true
      }
    });
    const dates = bookings.map((b) => ({
      id: b.id,
      date: b.eventDate.toISOString().split("T")[0],
      eventType: b.eventType,
      status: b.status,
      isDateBlocked: b.isDateBlocked
    }));
    res.json({ success: true, count: dates.length, dates });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch calendar dates.", error: error.message });
  }
};
var getBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = {};
    if (status && status !== "ALL") {
      whereClause.status = String(status);
    }
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { eventDate: "asc" }
    });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings.", error: error.message });
  }
};
var createBooking = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      phone,
      eventType,
      eventDate,
      eventLocation,
      district = "Nashik",
      taluka,
      village,
      serviceId,
      productId,
      productName,
      budget,
      message
    } = req.body;
    const finalPhone = customerPhone || phone;
    if (!customerName || !finalPhone || !eventDate) {
      res.status(400).json({ success: false, message: "Name, phone, and event date are required." });
      return;
    }
    const targetDate = new Date(eventDate);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    const conflicting = await prisma.booking.findFirst({
      where: {
        eventDate: { gte: startOfDay, lte: endOfDay },
        isDateBlocked: true
      }
    });
    if (conflicting) {
      res.status(409).json({
        success: false,
        message: "This date has been marked unavailable for new bookings. Please contact us directly."
      });
      return;
    }
    const booking = await prisma.booking.create({
      data: {
        customerName: customerName.trim(),
        customerPhone: finalPhone.trim(),
        eventType: eventType || "Wedding",
        eventDate: targetDate,
        eventLocation: eventLocation || (village ? `${village}, ${taluka || "Nashik"}` : "Nashik"),
        district: district ? district.trim() : "Nashik",
        taluka: taluka ? taluka.trim() : null,
        village: village ? village.trim() : null,
        serviceId: serviceId || null,
        productId: productId || null,
        productName: productName || null,
        budget: budget || null,
        message: message ? message.trim() : null,
        status: "NEW",
        isDateBlocked: false
      }
    });
    res.status(201).json({ success: true, message: "Booking request registered.", booking });
  } catch (error) {
    console.error("createBooking error:", error);
    res.status(500).json({ success: false, message: "Failed to create booking.", error: error.message });
  }
};
var blockDate = async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date) {
      res.status(400).json({ success: false, message: "Date is required to block." });
      return;
    }
    const blockBooking = await prisma.booking.create({
      data: {
        customerName: "Admin Blocked Date",
        customerPhone: "0000000000",
        eventType: reason || "Fully Booked / Date Blocked",
        eventDate: new Date(date),
        eventLocation: "Nashik",
        status: "CONFIRMED",
        isDateBlocked: true,
        message: reason || "Date manually blocked by business owner."
      }
    });
    res.status(201).json({ success: true, message: "Date successfully blocked on calendar.", blockBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to block date.", error: error.message });
  }
};
var updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isDateBlocked } = req.body;
    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (isDateBlocked !== void 0) dataToUpdate.isDateBlocked = Boolean(isDateBlocked);
    const updated = await prisma.booking.update({
      where: { id },
      data: dataToUpdate
    });
    res.json({ success: true, message: "Booking updated.", booking: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update booking.", error: error.message });
  }
};
var deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.booking.delete({ where: { id } });
    res.json({ success: true, message: "Booking deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete booking.", error: error.message });
  }
};

// src/routes/bookingRoutes.ts
var router7 = Router7();
router7.get("/calendar-dates", getBlockedAndBookedDates);
router7.get("/blocked-dates", getBlockedAndBookedDates);
router7.post("/", createBooking);
router7.get("/", authenticateAdmin, getBookings);
router7.post("/block-date", authenticateAdmin, blockDate);
router7.put("/:id", authenticateAdmin, updateBookingStatus);
router7.delete("/:id", authenticateAdmin, deleteBooking);
var bookingRoutes_default = router7;

// src/routes/reviewRoutes.ts
import { Router as Router8 } from "express";

// src/controllers/reviewController.ts
var getApprovedReviews = async (_req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch reviews.", error: error.message });
  }
};
var getAllReviews = async (_req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch reviews.", error: error.message });
  }
};
var submitReview = async (req, res) => {
  try {
    const { customerName, rating, comment } = req.body;
    const cleanName = typeof customerName === "string" ? customerName.trim() : "";
    const cleanComment = typeof comment === "string" ? comment.trim() : "";
    const numericRating = Number(rating);
    if (!cleanName || !cleanComment || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400).json({ success: false, message: "Enter your name, a review, and a whole-number rating from 1 to 5." });
      return;
    }
    if (cleanName.length > 100 || cleanComment.length > 3e3) {
      res.status(400).json({ success: false, message: "Name must be 100 characters or less and review must be 3,000 characters or less." });
      return;
    }
    const review = await prisma.review.create({
      data: {
        customerName: cleanName,
        rating: numericRating,
        comment: cleanComment,
        isApproved: false,
        status: "PENDING"
      }
    });
    res.status(201).json({
      success: true,
      message: "Thank you! Your review has been submitted and is pending administrator approval.",
      review
    });
  } catch (error) {
    console.error("submitReview error:", error);
    const databaseUnavailable = error?.code === "P1001" || error?.errorCode === "P1001" || /can't reach database server/i.test(String(error?.message || ""));
    res.status(databaseUnavailable ? 503 : 500).json({
      success: false,
      message: databaseUnavailable ? "Reviews are temporarily unavailable because the database cannot be reached. Please try again later." : "Failed to submit review. Please try again later."
    });
  }
};
var updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status, isApproved } = req.body;
    if (isApproved !== void 0 && !status) {
      status = isApproved ? "APPROVED" : "REJECTED";
    } else {
      isApproved = status === "APPROVED";
    }
    const updated = await prisma.review.update({
      where: { id },
      data: { status: status || "PENDING", isApproved: Boolean(isApproved) }
    });
    res.json({ success: true, message: `Review marked as ${status}.`, review: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update review status.", error: error.message });
  }
};
var deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    res.json({ success: true, message: "Review deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete review.", error: error.message });
  }
};

// src/routes/reviewRoutes.ts
var router8 = Router8();
router8.get("/approved", getApprovedReviews);
router8.post("/", submitReview);
router8.get("/all", authenticateAdmin, getAllReviews);
router8.put("/:id", authenticateAdmin, updateReviewStatus);
router8.patch("/:id", authenticateAdmin, updateReviewStatus);
router8.put("/:id/status", authenticateAdmin, updateReviewStatus);
router8.patch("/:id/status", authenticateAdmin, updateReviewStatus);
router8.delete("/:id", authenticateAdmin, deleteReview);
var reviewRoutes_default = router8;

// src/routes/offerRoutes.ts
import { Router as Router9 } from "express";

// src/controllers/offerController.ts
var getActiveOffers = async (_req, res) => {
  try {
    const now = /* @__PURE__ */ new Date();
    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, count: offers.length, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch offers.", error: error.message });
  }
};
var getAllOffers = async (_req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, count: offers.length, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch offers.", error: error.message });
  }
};
var createOffer = async (req, res) => {
  try {
    const { title, description, image, startDate, endDate, isActive } = req.body;
    if (!title || !description) {
      res.status(400).json({ success: false, message: "Title and description are required." });
      return;
    }
    const offer = await prisma.offer.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        image: image ? image.trim() : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== void 0 ? Boolean(isActive) : true
      }
    });
    res.status(201).json({ success: true, message: "Offer created.", offer });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create offer.", error: error.message });
  }
};
var updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, startDate, endDate, isActive } = req.body;
    const dataToUpdate = {};
    if (title) dataToUpdate.title = title.trim();
    if (description) dataToUpdate.description = description.trim();
    if (image !== void 0) dataToUpdate.image = image;
    if (startDate !== void 0) dataToUpdate.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== void 0) dataToUpdate.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== void 0) dataToUpdate.isActive = Boolean(isActive);
    const updated = await prisma.offer.update({
      where: { id },
      data: dataToUpdate
    });
    res.json({ success: true, message: "Offer updated.", offer: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update offer.", error: error.message });
  }
};
var deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.offer.delete({ where: { id } });
    res.json({ success: true, message: "Offer deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete offer.", error: error.message });
  }
};

// src/routes/offerRoutes.ts
var router9 = Router9();
router9.get("/active", getActiveOffers);
router9.get("/", authenticateAdmin, getAllOffers);
router9.post("/", authenticateAdmin, createOffer);
router9.put("/:id", authenticateAdmin, updateOffer);
router9.delete("/:id", authenticateAdmin, deleteOffer);
var offerRoutes_default = router9;

// src/routes/settingsRoutes.ts
import { Router as Router10 } from "express";

// src/controllers/settingsController.ts
var getSettings = async (_req, res) => {
  try {
    const settings = await prisma.businessSetting.findMany();
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    res.json({ success: true, settings: settingsMap });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch settings.", error: error.message });
  }
};
var updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== "object") {
      res.status(400).json({ success: false, message: "Settings object is required." });
      return;
    }
    for (const [key, value] of Object.entries(settings)) {
      await prisma.businessSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }
    res.json({ success: true, message: "Settings updated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update settings.", error: error.message });
  }
};
var getDashboardStats = async (_req, res) => {
  try {
    const [
      totalProducts,
      publishedProducts,
      availableProducts,
      totalEnquiries,
      pendingEnquiries,
      upcomingBookings,
      galleryImages,
      activeOffers,
      totalLocations,
      carDecorations,
      publishedCarDecorations
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.product.count({ where: { availability: "AVAILABLE" } }),
      prisma.enquiry.count(),
      prisma.enquiry.count({ where: { status: "NEW" } }),
      prisma.booking.count({
        where: {
          eventDate: { gte: /* @__PURE__ */ new Date() },
          status: { in: ["NEW", "CONFIRMED"] }
        }
      }),
      prisma.galleryImage.count(),
      prisma.offer.count({ where: { isActive: true } }),
      prisma.location.count(),
      prisma.carDecorationPost.count(),
      prisma.carDecorationPost.count({ where: { status: "PUBLISHED" } })
    ]);
    res.json({
      success: true,
      stats: {
        totalProducts,
        publishedProducts,
        availableProducts,
        totalEnquiries,
        pendingEnquiries,
        upcomingBookings,
        galleryImages,
        activeOffers,
        totalLocations,
        carDecorations,
        publishedCarDecorations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats.", error: error.message });
  }
};

// src/routes/settingsRoutes.ts
var router10 = Router10();
router10.get("/", getSettings);
router10.get("/public", getSettings);
router10.get("/dashboard-stats", authenticateAdmin, getDashboardStats);
router10.put("/", authenticateAdmin, updateSettings);
var settingsRoutes_default = router10;

// src/routes/uploadRoutes.ts
import { Router as Router11 } from "express";

// src/config/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
var isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log("\u2713 Cloudinary configured successfully.");
} else {
  console.warn("Cloudinary is not configured; image uploads are disabled until durable storage credentials are set.");
}

// src/controllers/uploadController.ts
import { Readable } from "stream";
var uploadToCloudinary = (buffer, mimetype) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({
    folder: "kamlesh-ful-bhandar",
    resource_type: "image",
    format: mimetype === "image/png" ? "png" : mimetype === "image/webp" ? "webp" : "jpg",
    transformation: [{ quality: "auto", fetch_format: "auto" }]
  }, (error, result) => error ? reject(error) : resolve(result));
  Readable.from(buffer).pipe(stream);
});
var handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded." });
      return;
    }
    if (!isCloudinaryConfigured) {
      res.status(503).json({ success: false, message: "Image storage is not configured. Set the Cloudinary environment variables before uploading." });
      return;
    }
    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      source: "cloudinary"
    });
  } catch (error) {
    console.error("Upload handling error:", error);
    res.status(502).json({ success: false, message: "Image upload failed. Please retry; no product was saved." });
  }
};

// src/middleware/upload.ts
import multer from "multer";
var fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only JPEG, PNG, and WEBP images are allowed."));
};
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

// src/routes/uploadRoutes.ts
var router11 = Router11();
var handleUpload = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      const tooLarge = error.code === "LIMIT_FILE_SIZE";
      res.status(tooLarge ? 413 : 400).json({
        success: false,
        message: tooLarge ? "Image must be 5 MB or smaller." : error.message || "Invalid image upload."
      });
      return;
    }
    next();
  });
};
router11.post("/", authenticateAdmin, handleUpload, handleImageUpload);
router11.post("/image", authenticateAdmin, handleUpload, handleImageUpload);
var uploadRoutes_default = router11;

// src/routes/locationRoutes.ts
import { Router as Router12 } from "express";

// src/controllers/locationController.ts
var getActiveLocations = async (req, res) => {
  try {
    const { taluka, search } = req.query;
    const whereClause = { isActive: true };
    if (taluka) {
      whereClause.taluka = String(taluka);
    }
    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { village: { contains: q, mode: "insensitive" } },
        { taluka: { contains: q, mode: "insensitive" } },
        { area: { contains: q, mode: "insensitive" } }
      ];
    }
    const locations = await prisma.location.findMany({
      where: whereClause,
      orderBy: [{ taluka: "asc" }, { village: "asc" }]
    });
    const talukas = Array.from(new Set(locations.map((l) => l.taluka))).sort();
    res.json({
      success: true,
      count: locations.length,
      talukas,
      locations
    });
  } catch (error) {
    console.error("getActiveLocations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch locations.", error: error.message });
  }
};
var getAllLocationsAdmin = async (req, res) => {
  try {
    const { search, taluka } = req.query;
    const whereClause = {};
    if (taluka && taluka !== "ALL") {
      whereClause.taluka = String(taluka);
    }
    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { village: { contains: q, mode: "insensitive" } },
        { taluka: { contains: q, mode: "insensitive" } },
        { area: { contains: q, mode: "insensitive" } }
      ];
    }
    const locations = await prisma.location.findMany({
      where: whereClause,
      orderBy: [{ taluka: "asc" }, { village: "asc" }]
    });
    res.json({ success: true, count: locations.length, locations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch admin locations.", error: error.message });
  }
};
var createLocation = async (req, res) => {
  try {
    const { district = "Nashik", taluka, village, area, isActive = true } = req.body;
    if (!taluka || !village) {
      res.status(400).json({ success: false, message: "Taluka and Village are required." });
      return;
    }
    const existing = await prisma.location.findFirst({
      where: {
        district: district.trim(),
        taluka: taluka.trim(),
        village: village.trim()
      }
    });
    if (existing) {
      res.status(400).json({ success: false, message: `Location "${village}" in taluka "${taluka}" already exists.` });
      return;
    }
    const location = await prisma.location.create({
      data: {
        district: district.trim(),
        taluka: taluka.trim(),
        village: village.trim(),
        area: area ? area.trim() : null,
        isActive: Boolean(isActive)
      }
    });
    res.status(201).json({ success: true, message: "Location added successfully.", location });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create location.", error: error.message });
  }
};
var updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { district, taluka, village, area, isActive } = req.body;
    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Location not found." });
      return;
    }
    const updated = await prisma.location.update({
      where: { id },
      data: {
        district: district !== void 0 ? district.trim() : void 0,
        taluka: taluka !== void 0 ? taluka.trim() : void 0,
        village: village !== void 0 ? village.trim() : void 0,
        area: area !== void 0 ? area ? area.trim() : null : void 0,
        isActive: isActive !== void 0 ? Boolean(isActive) : void 0
      }
    });
    res.json({ success: true, message: "Location updated successfully.", location: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update location.", error: error.message });
  }
};
var toggleLocationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Location not found." });
      return;
    }
    const updated = await prisma.location.update({
      where: { id },
      data: { isActive: !existing.isActive }
    });
    res.json({
      success: true,
      message: `Location ${updated.village} is now ${updated.isActive ? "active" : "inactive"}.`,
      location: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to toggle location status.", error: error.message });
  }
};
var deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Location not found." });
      return;
    }
    await prisma.location.delete({ where: { id } });
    res.json({ success: true, message: "Location deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete location.", error: error.message });
  }
};

// src/routes/locationRoutes.ts
var router12 = Router12();
router12.get("/", getActiveLocations);
router12.get("/admin", authenticateAdmin, getAllLocationsAdmin);
router12.post("/", authenticateAdmin, createLocation);
router12.put("/:id", authenticateAdmin, updateLocation);
router12.patch("/:id/toggle", authenticateAdmin, toggleLocationStatus);
router12.delete("/:id", authenticateAdmin, deleteLocation);
var locationRoutes_default = router12;

// src/routes/carDecorationRoutes.ts
import { Router as Router13 } from "express";

// src/controllers/carDecorationController.ts
var getPublishedCarDecorations = async (_req, res) => {
  try {
    const posts = await prisma.carDecorationPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" }
    });
    res.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    console.error("Error fetching published car decorations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch car decorations" });
  }
};
var getAllCarDecorationsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = {};
    if (status && typeof status === "string" && status !== "ALL") {
      whereClause.status = status;
    }
    const posts = await prisma.carDecorationPost.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    });
    const publishedCount = await prisma.carDecorationPost.count({ where: { status: "PUBLISHED" } });
    const unpublishedCount = await prisma.carDecorationPost.count({ where: { status: "UNPUBLISHED" } });
    res.json({
      success: true,
      count: posts.length,
      stats: {
        total: posts.length,
        published: publishedCount,
        unpublished: unpublishedCount
      },
      posts
    });
  } catch (error) {
    console.error("Error fetching admin car decorations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch car decorations" });
  }
};
var getCarDecorationById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.carDecorationPost.findUnique({
      where: { id }
    });
    if (!post) {
      return res.status(404).json({ success: false, message: "Car decoration post not found" });
    }
    res.json({ success: true, post });
  } catch (error) {
    console.error("Error fetching car decoration by ID:", error);
    res.status(500).json({ success: false, message: "Failed to fetch car decoration" });
  }
};
var createCarDecoration = async (req, res) => {
  try {
    const { title, description, price, priceText, status } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    let imageUrl = req.body.image;
    let imagePublicId = req.body.imagePublicId;
    if (req.file) {
      imageUrl = req.file.path || `/uploads/${req.file.filename}`;
      imagePublicId = req.file.filename;
    }
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "Image is required for car decoration post" });
    }
    const parsedPrice = price !== void 0 && price !== "" && !isNaN(Number(price)) ? Number(price) : null;
    const postStatus = status === "UNPUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
    const post = await prisma.carDecorationPost.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        price: parsedPrice,
        priceText: priceText || (parsedPrice ? `\u20B9${parsedPrice.toLocaleString("en-IN")}` : "Price on Request"),
        image: imageUrl,
        imagePublicId,
        status: postStatus
      }
    });
    res.status(201).json({
      success: true,
      message: "Car decoration post created successfully",
      post
    });
  } catch (error) {
    console.error("Error creating car decoration:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create car decoration" });
  }
};
var updateCarDecoration = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, priceText, status } = req.body;
    const existing = await prisma.carDecorationPost.findUnique({
      where: { id }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Car decoration post not found" });
    }
    let imageUrl = existing.image;
    let imagePublicId = existing.imagePublicId;
    if (req.file) {
      imageUrl = req.file.path || `/uploads/${req.file.filename}`;
      imagePublicId = req.file.filename;
    } else if (req.body.image && typeof req.body.image === "string" && req.body.image.trim()) {
      imageUrl = req.body.image.trim();
    }
    const parsedPrice = price !== void 0 && price !== "" && !isNaN(Number(price)) ? Number(price) : price === null ? null : existing.price;
    const postStatus = status ? status === "UNPUBLISHED" ? "UNPUBLISHED" : "PUBLISHED" : existing.status;
    const updatedPost = await prisma.carDecorationPost.update({
      where: { id },
      data: {
        title: title !== void 0 ? title.trim() : existing.title,
        description: description !== void 0 ? description ? description.trim() : null : existing.description,
        price: parsedPrice,
        priceText: priceText !== void 0 ? priceText : parsedPrice ? `\u20B9${parsedPrice.toLocaleString("en-IN")}` : "Price on Request",
        image: imageUrl,
        imagePublicId,
        status: postStatus
      }
    });
    res.json({
      success: true,
      message: "Car decoration post updated successfully",
      post: updatedPost
    });
  } catch (error) {
    console.error("Error updating car decoration:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update car decoration" });
  }
};
var toggleCarDecorationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.carDecorationPost.findUnique({
      where: { id }
    });
    if (!post) {
      return res.status(404).json({ success: false, message: "Car decoration post not found" });
    }
    const newStatus = post.status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
    const updated = await prisma.carDecorationPost.update({
      where: { id },
      data: { status: newStatus }
    });
    res.json({
      success: true,
      message: `Car decoration post is now ${newStatus.toLowerCase()}`,
      post: updated
    });
  } catch (error) {
    console.error("Error toggling status:", error);
    res.status(500).json({ success: false, message: "Failed to toggle status" });
  }
};
var deleteCarDecoration = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.carDecorationPost.findUnique({
      where: { id }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Car decoration post not found" });
    }
    await prisma.carDecorationPost.delete({
      where: { id }
    });
    res.json({
      success: true,
      message: "Car decoration post deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting car decoration:", error);
    res.status(500).json({ success: false, message: "Failed to delete car decoration" });
  }
};

// src/routes/carDecorationRoutes.ts
var router13 = Router13();
router13.get("/", getPublishedCarDecorations);
router13.get("/:id", getCarDecorationById);
router13.get("/admin/all", authenticateAdmin, getAllCarDecorationsAdmin);
router13.get("/admin", authenticateAdmin, getAllCarDecorationsAdmin);
router13.post("/admin", authenticateAdmin, upload.single("image"), createCarDecoration);
router13.post("/", authenticateAdmin, upload.single("image"), createCarDecoration);
router13.put("/admin/:id", authenticateAdmin, upload.single("image"), updateCarDecoration);
router13.put("/:id", authenticateAdmin, upload.single("image"), updateCarDecoration);
router13.patch("/admin/:id/status", authenticateAdmin, toggleCarDecorationStatus);
router13.patch("/:id/toggle-status", authenticateAdmin, toggleCarDecorationStatus);
router13.patch("/:id/status", authenticateAdmin, toggleCarDecorationStatus);
router13.delete("/admin/:id", authenticateAdmin, deleteCarDecoration);
router13.delete("/:id", authenticateAdmin, deleteCarDecoration);
var carDecorationRoutes_default = router13;

// src/routes/index.ts
var router14 = Router14();
router14.use("/auth", authRoutes_default);
router14.use("/products", productRoutes_default);
router14.use("/categories", categoryRoutes_default);
router14.use("/services", serviceRoutes_default);
router14.use("/gallery", galleryRoutes_default);
router14.use("/enquiries", enquiryRoutes_default);
router14.use("/bookings", bookingRoutes_default);
router14.use("/reviews", reviewRoutes_default);
router14.use("/offers", offerRoutes_default);
router14.use("/settings", settingsRoutes_default);
router14.use("/upload", uploadRoutes_default);
router14.use("/locations", locationRoutes_default);
router14.use("/car-decorations", carDecorationRoutes_default);
var routes_default = router14;

// src/server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
dotenv2.config({ path: path.resolve(__dirname, "../.env") });
dotenv2.config({ path: path.resolve(process.cwd(), "backend/.env") });
dotenv2.config({ path: path.resolve(process.cwd(), ".env") });
dotenv2.config();
var app = express();
var PORT = process.env.PORT || 5e3;
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`[HTTP] ${req.method} ${req.originalUrl || req.url} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});
var allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.CORS_ORIGIN || ""
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
var isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
var uploadDir = isServerless ? path.join(os.tmpdir(), "uploads") : path.resolve(__dirname, "../uploads");
app.use("/uploads", express.static(uploadDir));
var isServerlessRuntime = Boolean(
  process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT || process.env.NODE_ENV === "production"
);
app.get("/api/ping", (_req, res) => res.json({ status: "pong", time: (/* @__PURE__ */ new Date()).toISOString() }));
app.get("/ping", (_req, res) => res.json({ status: "pong", time: (/* @__PURE__ */ new Date()).toISOString() }));
var handleDiag = async (_req, res) => {
  let dbStatus = "untested";
  let carCount = 0;
  let dbError = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
    carCount = await prisma.carDecorationPost.count();
  } catch (err) {
    dbStatus = "disconnected";
    dbError = err.message || String(err);
  }
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    env: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      isServerlessRuntime,
      vercel: Boolean(process.env.VERCEL)
    },
    database: {
      status: dbStatus,
      carDecorationPostsCount: carCount,
      error: dbError
    }
  });
};
app.get("/api/diag", handleDiag);
app.get("/diag", handleDiag);
var handleHealth = async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    console.error("Health Check DB Error:", err);
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: err.message
    });
  }
};
app.get("/api/health", handleHealth);
app.get("/health", handleHealth);
app.use("/api", routes_default);
app.use("/", routes_default);
process.on("uncaughtException", (err) => {
  console.error("Process Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("Process Unhandled Rejection:", reason);
});
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});
app.use((err, _req, res, _next) => {
  console.error("Unhandled Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});
if (!isServerlessRuntime) {
  const server = app.listen(PORT, () => {
    console.log(`\u{1F338} Kamlesh Ful Bhandar Backend API listening on port ${PORT}`);
    console.log(`\u{1F4E1} Health Check: http://localhost:${PORT}/api/health`);
  });
  process.on("SIGINT", async () => {
    await prisma.$disconnect();
    server.close(() => {
      console.log("Server stopped.");
      process.exit(0);
    });
  });
}
var server_default = app;
export {
  server_default as default
};
