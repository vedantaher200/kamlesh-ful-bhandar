# 🌸 Kamlesh Ful Bhandar — Full-Stack Digital Flower & Decoration Platform

> **Flower Shop • Flower Decoration • Wedding Decoration • Event Decoration**  
> **Location:** Ganpati Mandir Jawal, Pawan Nagar, Nashik, Maharashtra, India  
> **Phone Numbers:** 9921972936 / 8208672409  
> **Serving:** Nashik and surrounding celebration venues

---

## 🌟 1. Project Overview

**Kamlesh Ful Bhandar** is a production-ready, full-stack digital business platform built to empower local florists and wedding decorators in **Nashik, Maharashtra**.

Unlike static websites or templates, this is a **database-backed, full-stack system** where the business owner can:
1. **Dynamically add real products** (Wedding Haars, Varmalas, Car Decors, Bouquets, Loose Flowers) with real images, descriptions, prices, and stock statuses.
2. **Update prices dynamically** (e.g. ₹8,000 → ₹7,500) and have the customer website immediately reflect the change without code edits.
3. **Toggle availability** (`Available`, `Out of Stock`, `Hidden`) in real-time.
4. **Manage wedding & celebration dates** on an interactive calendar and block conflicting dates.
5. **Receive and manage customer enquiries** with direct WhatsApp and click-to-call actions.
6. **Moderate customer reviews** before they appear on the live site.
7. **Publish seasonal & festive promotional banners**.
8. **Upload real photos** to the live portfolio gallery with automatic Cloudinary and local storage fallback.

---

## 🏗️ 2. Architecture & Tech Stack

```text
Customer Website (React 18 + Vite + TypeScript)
        ↓  (API Proxy / REST calls)
Backend REST API (Node.js + Express + TypeScript)
        ↓  (Prisma ORM)
PostgreSQL Database (Local & Cloud Supported)
        ↓
Image Storage (Cloudinary + Local Disk Fallback)
        ↓
Admin Dashboard (Protected JWT Authentication)
```

- **Frontend:** React 18, Vite 6, TypeScript, React Router v6, Lucide React, Modern CSS Design Tokens.
- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM, JWT, bcryptjs, Multer.
- **Database:** PostgreSQL (with relational schema for Users, Products, Categories, Services, Gallery, Bookings, Enquiries, Reviews, Offers, Settings).
- **Storage:** Cloudinary integration with seamless local disk fallback storage (`/uploads`).
- **Authentication:** Salted bcrypt password hashing + JWT bearer tokens + Role-based middleware.

---

## 📁 3. Project Structure

```text
flower-website/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL relational schema
│   │   └── seed.ts                # Database seed script with admin & catalog
│   ├── src/
│   │   ├── config/
│   │   │   ├── prisma.ts          # Prisma Client singleton
│   │   │   └── cloudinary.ts      # Cloudinary uploader config
│   │   ├── controllers/           # Products, Services, Auth, Bookings, Enquiries, etc.
│   │   ├── middleware/            # JWT authentication & Multer upload validation
│   │   ├── routes/                # Express API routes
│   │   └── server.ts              # Server entry point & CORS
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, Footer, StickyMobileBar, LightboxModal, etc.
│   │   ├── context/               # AuthContext for admin session
│   │   ├── pages/
│   │   │   ├── Home.tsx           # Customer homepage with dynamic API products
│   │   │   ├── Products.tsx       # Live catalogue with search & filters
│   │   │   ├── ProductDetail.tsx  # Product details with WhatsApp ordering
│   │   │   ├── Services.tsx       # Decoration services
│   │   │   ├── Gallery.tsx        # Filterable photo portfolio
│   │   │   ├── Bookings.tsx       # Date availability & booking form
│   │   │   ├── About.tsx          # About business & customer review form
│   │   │   ├── Contact.tsx        # Nashik address & Google Maps embed
│   │   │   └── admin/
│   │   │       ├── AdminLogin.tsx      # Admin authentication
│   │   │       ├── AdminLayout.tsx     # Sidebar & header layout
│   │   │       ├── AdminDashboard.tsx  # Real-time KPIs & enquiries
│   │   │       ├── AdminProducts.tsx   # Real product CRUD & price updates
│   │   │       ├── AdminServices.tsx   # Service management
│   │   │       ├── AdminGallery.tsx    # Live image upload to gallery
│   │   │       ├── AdminBookings.tsx   # Calendar date blocking & bookings
│   │   │       ├── AdminEnquiries.tsx  # Customer inquiry moderation
│   │   │       ├── AdminOffers.tsx     # Seasonal offers banner
│   │   │       ├── AdminReviews.tsx    # Customer review approval
│   │   │       └── AdminSettings.tsx   # Nashik contact numbers & address
│   │   ├── services/api.ts        # Typed API client
│   │   ├── types/index.ts         # TypeScript models
│   │   ├── styles/                # CSS design system
│   │   ├── App.tsx                # App routing
│   │   └── main.tsx               # Mounting point
│   ├── index.html                 # SEO meta & Schema JSON-LD
│   ├── tsconfig.json
│   ├── vite.config.ts             # Vite dev server + API proxy
│   └── package.json
│
├── package.json                   # Root unified run scripts
├── vercel.json                    # Vercel deployment rewrite rules
└── README.md
```

---

## 🔐 4. Admin Credentials

Default Administrator Account created during database seed:

- **Admin Login URL:** `http://localhost:3000/admin/login`
- **Email:** `admin@kamleshfulbhandar.com`
- **Password:** `Admin@123`

*(Password is securely hashed in PostgreSQL using bcrypt with 10 salt rounds).*

---

## 💻 5. How to Run Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL service running locally or accessible via URL

### Step 1: Configure Backend Environment
Check `backend/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:admin@localhost:5432/kamlesh_ful_bhandar?schema=public"
JWT_SECRET="kamlesh_super_secret_jwt_key_2026_nashik"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"

# Optional Cloudinary (Local storage fallback is active automatically if left empty)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### Step 2: Database Setup & Seeding
```bash
# Push database schema to PostgreSQL
npm run prisma:push

# Seed initial admin user and floral catalogue
npm run prisma:seed
```

### Step 3: Run the Application
In terminal 1 (Backend API):
```bash
npm run dev:backend
# API starts at http://localhost:5000
```

In terminal 2 (Frontend Client):
```bash
npm run dev:frontend
# Client starts at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌸 6. Real-Time Product Management in Action

To test the critical requirement where the owner adds products dynamically without writing code:

1. Open `http://localhost:3000/admin/login` and log in with:
   - `admin@kamleshfulbhandar.com`
   - `Admin@123`
2. Navigate to **Products** → Click **"Add New Product"**.
3. Enter:
   - **Name:** `Royal Rose & Orchid Varmala`
   - **Category:** `Haar & Mala`
   - **Price:** `7500`
   - **Image:** Upload a photo from your computer or paste an image URL
   - **Availability:** `Available`
   - **Featured:** Check the box
4. Click **"Save Product"**.
5. The product is immediately inserted into PostgreSQL.
6. Open `http://localhost:3000/products` or the homepage: the new product is immediately visible with the exact price and image.
7. Change the price to `₹7,000` in the admin panel: refresh the customer website and it immediately reflects `₹7,000`.

---

## 🚀 7. Production Deployment

### Frontend (Vercel)
1. Push this repository to GitHub or GitLab.
2. In [Vercel](https://vercel.com), create a New Project and select this repo.
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In Environment Variables:
   - Set `VITE_API_URL` to your production backend URL (e.g. `https://api.kamleshfulbhandar.com`).
5. Deploy.

### Backend (Render, Railway, or VPS)
1. In Render or Railway, create a new Web Service pointing to the `backend/` directory.
2. Build Command: `npm install && npx prisma generate && npm run build`
3. Start Command: `npm start`
4. Set Environment Variables:
   - `DATABASE_URL`: Your production PostgreSQL connection string (Supabase, Neon, or Render Postgres).
   - `JWT_SECRET`: A long random secret.
   - `CORS_ORIGIN`: Your deployed Vercel frontend URL.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Your Cloudinary account keys.
