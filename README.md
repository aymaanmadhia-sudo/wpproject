# ProofPocket — Personal Ownership Vault

> A college project built on the **MERN Stack** (MongoDB Atlas, Express.js, React + Vite, Node.js) for tracking valuable possessions, proof-of-ownership receipts, real-time warranty statuses, and maintenance/repair history.

---

## 1. Project Overview

ProofPocket addresses a universal consumer problem: losing track of purchase invoices, forgetting warranty expiration deadlines, and having no central record of repair costs for electronics, appliances, and valuables.

ProofPocket provides:
- **Ownership Inventory**: Structured records of purchases with serial numbers, retailer details, and cost metrics.
- **Proof-of-Purchase Storage**: Direct receipt and invoice document upload (JPEG, PNG, WEBP, and PDF) with inline preview and download.
- **Real-Time Warranty Calculations**: Dynamic computation against the current date, bucketing items into *Expired*, *Expiring within 7 Days (Urgent)*, *Expiring within 30 Days*, and *Active Coverage*.
- **Repair History Log**: Per-item maintenance log tracking service center, issue diagnosed, cost, and notes.
- **Total Cost of Ownership**: Real-time aggregation of purchase price + all lifetime repairs.
- **Multi-Tenant Ownership Isolation**: Strictly scoped queries ensuring users can only read, update, or delete their own possessions.

---

## 2. Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19 + Vite | Fast HMR, component-driven UI |
| **Styling** | Tailwind CSS v4 | Warm off-white surfaces, dark charcoal typography, restrained emerald accent |
| **Icons** | Lucide React | Clean, minimalist SVG iconography |
| **Routing** | React Router v7 | Client-side routing with public/protected guards |
| **Backend** | Node.js + Express.js | Modular RESTful API with route controllers & middleware |
| **Database** | MongoDB Atlas via Mongoose | Cloud-hosted document store with compound indexes |
| **Auth** | JWT + bcryptjs | Salted password hashing (cost factor 10) and bearer token authentication |
| **File Storage** | Multer | Disk storage with MIME verification and 8MB limit (extensible to S3/Cloudinary) |

---

## 3. Project Structure

```text
WP-project/
├── .env.example              # Root environment configuration template
├── package.json              # Root scripts (concurrently runs client & server)
├── README.md                 # Project documentation & viva guide
├── server/
│   ├── .env.example          # Server environment template
│   ├── package.json          # Express dependencies
│   ├── server.js             # Express app entry & static file server
│   ├── test-suite.js         # Core unit test verification
│   ├── config/
│   │   └── db.js             # Mongoose connection with diagnostic states & masking
│   ├── models/
│   │   ├── User.js           # User schema & bcrypt pre-save hook
│   │   ├── Item.js           # Item schema with receipt metadata & indexes
│   │   └── Repair.js         # Maintenance & service history schema
│   ├── middleware/
│   │   ├── auth.js           # JWT verification & database liveness check
│   │   ├── upload.js         # Multer disk upload with MIME type filtering
│   │   └── errorHandler.js   # Centralized error response formatter
│   ├── routes/
│   │   ├── auth.js           # /api/auth (register, login, me)
│   │   ├── items.js          # /api/items (CRUD, search, filter, sort)
│   │   ├── repairs.js        # /api/repairs (item repair history)
│   │   ├── dashboard.js      # /api/dashboard/stats (real-time MongoDB figures)
│   │   ├── reminders.js      # /api/reminders (dynamic date groupings)
│   │   └── health.js         # /api/health (DB status & diagnostics)
│   └── uploads/              # Storage directory for uploaded receipts
└── client/
    ├── index.html            # App HTML shell
    ├── package.json          # React, Vite, Tailwind dependencies
    ├── vite.config.js        # Vite config with proxy to backend port 5000
    └── src/
        ├── App.jsx           # Application routes & auth guards
        ├── main.jsx          # React DOM entry
        ├── index.css         # Tailwind v4 configuration & theme tokens
        ├── context/
        │   └── AuthContext.jsx # Auth state, user token & DB health monitoring
        ├── services/
        │   └── api.js        # Centralized HTTP client
        ├── components/
        │   ├── Layout.jsx    # Top navigation, mobile drawer & footer
        │   ├── StatusBanner.jsx # Real-time MongoDB connection banner
        │   ├── WarrantyBadge.jsx # Dynamic calculation & badge renderer
        │   ├── ReceiptModal.jsx  # Receipt image/PDF viewer & downloader
        │   ├── RepairModal.jsx   # Add repair log modal
        │   ├── DeleteModal.jsx   # Confirmation dialog
        │   └── EmptyState.jsx    # Clean empty states
        └── pages/
            ├── Dashboard.jsx # Overview statistics, 30d alerts, recent items
            ├── ItemsList.jsx # Inventory with search, category/status filter, list/grid
            ├── ItemForm.jsx  # Add and Edit item with receipt upload
            ├── ItemDetail.jsx# Full specs, receipt, repair history
            ├── Reminders.jsx # 5 dynamic warranty groups
            ├── Login.jsx     # User authentication
            └── Register.jsx  # Account registration
```

---

## 4. Setup and Installation

### Step 1: Install Dependencies
Run the install command from the root directory:
```bash
npm run install:all
```
*(Or install in root, `server/`, and `client/` individually)*

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in the root (or in `server/`):
```bash
cp .env.example .env
```

Open `.env` and fill in your MongoDB Atlas connection URI:
```env
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@<cluster-address>.mongodb.net/proofpocket?retryWrites=true&w=majority
DB_NAME=proofpocket
PORT=5050
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Step 3: MongoDB Atlas Quick Setup
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (M0).
3. Under **Security > Database Access**:
   - Create a database user (e.g. `vault_user`). Note the password.
   - Assign the **Read and write to any database** built-in role.
4. Under **Security > Network Access**:
   - Click **Add IP Address**.
   - For local development, choose **Allow Access from Anywhere (`0.0.0.0/0`)** or add your current IP address.
5. Under **Deployment > Database**:
   - Click **Connect** &gt; **Drivers** (Node.js).
   - Copy the connection string into your `.env` file under `MONGODB_URI`.
   - Replace `<db_password>` with your database user password and specify `/proofpocket` before the query parameters.

### Step 4: Run the Application
Start both the backend server and frontend client concurrently:
```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5050
- **API Health**: http://localhost:5050/api/health

---

## 5. REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new account (`name`, `email`, `password`) | No |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Yes |

### Items (`/api/items`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/items` | List items with `search`, `category`, `status`, `sort` | Yes |
| `POST` | `/api/items` | Register new item (supports multipart form file upload) | Yes |
| `GET` | `/api/items/:id` | Fetch single item with associated repair logs | Yes |
| `PUT` | `/api/items/:id` | Update item details or replace/remove receipt | Yes |
| `DELETE` | `/api/items/:id` | Delete item, associated repairs, and disk receipt | Yes |

### Repairs & Maintenance (`/api/repairs`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/repairs/item/:itemId` | Get repair history for specific item | Yes |
| `POST` | `/api/repairs/item/:itemId` | Log a repair (`repairDate`, `issue`, `repairShop`, `cost`, `notes`) | Yes |
| `DELETE` | `/api/repairs/:id` | Remove a repair record | Yes |

### Dashboard & Analytics (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Aggregated metrics: total items, active warranties, 30-day expirations, vault valuation | Yes |

### Warranty Reminders (`/api/reminders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/reminders` | Dynamic grouping into Expired, Expiring in 7 Days, Expiring in 30 Days, Active Beyond 30 Days, No Warranty | Yes |

---

## 6. Receipt Storage Architecture & Deployment

### Local Development Flow
- Uploaded receipts are saved to `server/uploads/` with unique sanitized filenames (`receipt-<basename>-<timestamp>-<random>.<ext>`).
- Files are statically served by Express under the `/uploads` route.
- When an item is updated or deleted, ProofPocket cleans up the previous file from disk to avoid orphaned storage.

### Production Deployment Considerations
In serverless or ephemeral container hosting (e.g. Render free tier, Vercel, Heroku, AWS Lambda):
- Ephemeral containers wipe the local filesystem on restart or redeployment.
- **Production Solution**: Switch the Multer storage engine to **AWS S3** (`multer-s3`) or **Cloudinary** (`multer-storage-cloudinary`). The `receipt` schema already stores a generic `url`, `filename`, and metadata, making the transition seamless without requiring database migration.

---

## 7. Viva & Defense Q&A Guide

**Q: Why calculate warranty statuses dynamically instead of storing an "active/expired" flag in MongoDB?**
> Storing a static string like `"active"` creates stale data as time passes. A warranty active today might expire tomorrow. ProofPocket stores the immutable `warrantyExpiry` timestamp and evaluates status relative to `new Date()` at query time.

**Q: How do you guarantee one user cannot view or delete another user's items?**
> Every item and repair document has an indexed `userId` field referencing the owner. All Express route handlers extract the verified `req.user._id` from the decrypted JWT payload and scope database queries by `userId: req.user._id`. The client-supplied user ID is never trusted.

**Q: What happens if MongoDB Atlas connection drops or is misconfigured?**
> Instead of silently falling back to mock data or crashing the process, the database manager monitors connection events and reports diagnostic statuses through the `/api/health` endpoint. The frontend immediately renders an actionable connection banner with step-by-step remediation instructions.
# WP-project
