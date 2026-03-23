# 🏬 3D Shop Management System

A full-stack shop management platform with real-time 3D visualization, AI-powered customer analytics, smart inventory tracking, and a public customer search portal.

**Live Frontend:** https://shop-b68ik862x-pratap-sanaps-projects.vercel.app  
**Backend API:** https://shop-2luf.onrender.com  
**GitHub:** https://github.com/PRATAPSANAP1/shop (branch: `main`)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript (`// @ts-nocheck`), React Router v6 |
| 3D Engine | `@react-three/fiber` + `@react-three/drei` (Three.js) |
| Animations | Framer Motion |
| Charts | Recharts (Line, Bar, Area, Pie, Radar) |
| QR | `jsQR` (scan), `qrcode` + `jsPDF` (generate/export) |
| Icons | Lucide React |
| HTTP | Axios (`withCredentials: true`) |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs + httpOnly cookies |
| AI Engine | Python + YOLOv8 + OpenCV (optional bridge) |
| Hosting | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
Shop/
├── backend/
│   ├── config/db.ts                  # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.ts         # Register, Login, Logout, Me, Profile
│   │   ├── dashboardController.ts    # Stats aggregation
│   │   ├── doorController.ts         # Door CRUD + public endpoint
│   │   ├── notificationController.ts # Get, mark-read, mark-all-read
│   │   ├── productController.ts      # Product CRUD + QR scan
│   │   ├── rackController.ts         # Rack CRUD + live status
│   │   └── shopConfigController.ts   # Floor dimensions + public shop list
│   ├── middleware/auth.ts             # JWT cookie validation
│   ├── models/                        # Mongoose schemas
│   ├── routes/                        # Express routers
│   ├── smartstore/                    # Python AI analytics engine
│   ├── server.ts                      # Express entry point
│   └── .env                           # Environment variables
│
└── frontend/
    └── src/
        ├── services/api.js            # Axios instance + all API calls
        ├── components/
        │   ├── ShopBuilder.tsx        # 3D shop floor editor
        │   └── ShopView3D.tsx         # 3D shop viewer
        ├── pages/
        │   ├── Login.tsx              # Login + Register
        │   ├── Dashboard.tsx          # Stats + charts
        │   ├── Products.tsx           # Product CRUD + QR export
        │   ├── Racks.tsx              # Rack management
        │   ├── Scanner.tsx            # Live QR scanner
        │   ├── Notifications.tsx      # Stock/expiry alerts
        │   ├── Profile.tsx            # Admin profile settings
        │   ├── CustomerSearch.tsx     # Public 3D store explorer
        │   └── SmartStore.tsx         # AI analytics dashboard
        └── App.tsx                    # Router + AuthContext + Layout
```

---

## 🔐 Feature 1 — Authentication

### How it works

**Registration (`POST /api/auth/register`):**
1. User fills name, email, password, shop name, mobile on `Login.tsx`
2. Backend validates all fields are present, checks email is not already taken
3. Password is hashed with `bcrypt` (10 salt rounds)
4. A JWT token is signed with `userId` and `expiresIn: 7d`
5. Token is saved to `user.token` field in MongoDB (so logout can truly invalidate it)
6. Token is sent to browser as an `httpOnly` cookie (`shop_token`) with `sameSite: none` + `secure: true` for cross-origin support (Vercel → Render)
7. Frontend calls `setIsAuth(true)` on `AuthContext` immediately, then navigates to `/admin/home`

**Login (`POST /api/auth/login`):**
- Same flow as register but finds existing user and runs `bcrypt.compare()` on the password

**Session Check (`GET /api/auth/me`):**
- Called once on app startup by `AuthProvider` in `App.tsx`
- Reads `shop_token` cookie → verifies JWT signature → queries MongoDB for `{ _id, token }` match
- If both match, user is authenticated. If token was cleared (logout), the DB check fails even with a valid JWT

**Logout (`POST /api/auth/logout`):**
- Sets `user.token = null` in MongoDB (invalidates the session server-side)
- Clears the `shop_token` cookie

**Auth Guard Architecture:**
```
App.tsx
└── AuthProvider (calls getMe once on startup)
    ├── PublicRoute (/admin/login) — redirects to /admin/home if already authed
    └── Layout (/admin/*) — redirects to /admin/login if not authed
```
- `AuthContext` is shared globally so after login, `setIsAuth(true)` is called immediately — `Layout` never needs to re-call `getMe()` after a fresh login, preventing redirect loops

**Axios Interceptor:**
- 401 responses auto-redirect to `/admin/login` EXCEPT for `/auth/me`, `/auth/login`, `/auth/register` — these are expected to return 401 in normal flow

---

## 📦 Feature 2 — Product Inventory

### How it works

**Viewing Products (`GET /api/products`):**
- `Products.tsx` loads all products for the logged-in shop
- Products are displayed as cards in a responsive grid (1–5 columns based on screen width)
- Each card shows: name, category, price, quantity (red if below min stock), rack location

**Search & Filter:**
- Client-side filtering by product name (text search) and category (pill buttons)
- Categories are dynamically extracted from the loaded product list

**Adding a Product (`POST /api/products`):**
- Form fields: name, category, price, quantity, min stock level, rack assignment, shelf number, expiry date, brand, size
- Backend auto-generates a unique hex `qrCode` using `crypto.randomBytes(16)`
- If `quantity < minStockLevel`, a `lowStock` notification is automatically created in MongoDB

**Editing a Product (`PUT /api/products/:id`):**
- Pre-fills the form with existing product data
- On save, if quantity is still below min stock, a notification is upserted

**Deleting a Product (`DELETE /api/products/:id`):**
- Confirms with `window.confirm` before deleting
- Scoped to `shopId` so admins can only delete their own products

**QR Code PDF Export (client-side only):**
- Uses `qrcode` library to generate a QR image from the product's `qrCode` hex string
- Uses `jsPDF` to create a PDF with product name, category, price, and the QR image
- Downloads as `{productName}_QR.pdf` — no backend call needed

---

## 🗄️ Feature 3 — Rack Management

### How it works

**Viewing Racks (`GET /api/racks`):**
- `Racks.tsx` loads all racks for the shop
- Backend computes a live `status` for each rack by checking its products:
  - `lowStock` — any product has `quantity < 10`
  - `expiring` — any product expires within 7 days
  - `normal` — all products are fine
- Status is returned alongside rack data (not stored in DB, computed on every request)

**Creating a Rack (`POST /api/racks`):**
- Fields: rack name, 3D position (X/Y/Z), rotation (degrees), width, height, shelves, columns, color
- Position and rotation are used directly by the 3D canvas in `ShopBuilder.tsx` and `ShopView3D.tsx`

**Editing / Deleting:**
- Standard CRUD, all scoped to `shopId`

---

## 🏗️ Feature 4 — 3D Shop Builder

### How it works (`ShopBuilder.tsx`)

The page is split 50/50: left side is the live 3D canvas, right side is the control panel.

**3D Canvas (left):**
- Built with `@react-three/fiber` (React wrapper for Three.js)
- Renders a flat floor plane sized to `shopDimensions.width × shopDimensions.depth`
- Four transparent wall boxes are drawn at the floor edges
- A `gridHelper` overlays the floor for spatial reference
- XYZ axis arrows (`AxisArrows` component) show orientation
- All saved racks are rendered as `Rack3D` components with shelf planes and product boxes
- When the add/edit form is open, a wireframe yellow preview rack appears at the current form position in real-time
- Doors render as colored boxes: green for entry, red for exit
- `OrbitControls` allows drag-to-rotate, scroll-to-zoom, right-click-to-pan

**Control Panel (right):**

1. **Shop Dimensions** — set width and depth in meters, saved to `ShopConfig` collection via `POST /api/shop-config`

2. **Doors** — add entry/exit doors with sliders for X position, Z position, and rotation. Preview appears live in 3D canvas. Saved to `Door` collection.

3. **Racks** — add/edit racks with sliders for all 3D properties. The rack preview updates in real-time as sliders move. On save, rack is stored in `Rack` collection with full 3D coordinates.

---

## 🏠 Feature 5 — 3D Shop Viewer (Admin Home)

### How it works (`ShopView3D.tsx`)

- Loads at `/admin/home` as the landing page after login
- Fetches all racks, products per rack, shop config, and doors
- Renders the full shop in 3D with detailed `SupermarketRack` components:
  - Each rack shows shelf planes, colored product boxes per shelf/column position
  - Rack name label floats above the rack
  - Products are clickable — clicking opens a detail panel
- Entry doors render green, exit doors render red with labels
- `OrbitControls` with `maxPolarAngle` prevents going below the floor

---

## 🔍 Feature 6 — Customer Search (Public Portal)

### How it works (`CustomerSearch.tsx`)

This page requires **no login** — it's accessible at `/` and `/search`.

**Step 1 — Shop Selection:**
- On load, fetches all registered shop names from `GET /api/shop-config/public/shops/list`
- User types a shop name — autocomplete dropdown filters matching shops
- On "Enter Store", fetches in parallel:
  - Floor config (`GET /api/shop-config/public/:shopName`)
  - Doors (`GET /api/doors/public/:shopName`)
  - Racks (`GET /api/public/racks/:shopName`)
  - Products per rack (`GET /api/public/products/rack/:rackId`) — looped for each rack

**Step 2 — 3D Store Exploration:**
- Full 3D store renders with the shop's actual rack layout and floor dimensions
- Customers can orbit/zoom/pan the 3D view freely
- Each rack shows up to 3 product boxes with name labels

**Step 3 — Product Search:**
- Customer types a product name — live autocomplete filters from loaded products client-side
- On search, calls `GET /api/public/search?query=&shopName=` which does a regex search in MongoDB
- If found: a green banner shows "Found in [Rack Name]", the product's rack glows green with a spotlight beam and a floating label in 3D
- The highlight auto-clears after 20 seconds
- Clicking any product box in 3D opens a bottom sheet with: name, price, category, stock, exact rack + shelf location, brand, size

---

## 📷 Feature 7 — QR Scanner

### How it works (`Scanner.tsx`)

**Camera Access:**
- Calls `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })` to access the rear camera
- Video stream is rendered in a `<video>` element with a green scanning frame overlay

**Real-time QR Decoding:**
- Uses `requestAnimationFrame` loop to continuously capture video frames
- Each frame is drawn to a hidden `<canvas>` element
- `jsQR` library decodes the canvas pixel data looking for QR codes
- When a QR is detected, the camera stops and the QR code value fills the input

**Stock Deduction (`POST /api/products/scan`):**
- Sends `{ qrCode, quantityTaken }` to backend
- Backend finds the product by `qrCode` hex string
- Decrements `product.quantity` by `quantityTaken`
- Adds `quantityTaken × price` to `product.totalRevenue`
- If new quantity is below `minStockLevel`, creates a `lowStock` notification
- Returns updated product — frontend shows remaining stock

---

## 📊 Feature 8 — Dashboard

### How it works (`Dashboard.tsx`)

**Stats Cards (`GET /api/dashboard/stats`):**
Backend aggregates from the `products` collection for the logged-in shop:
- **Total Products** — `products.length`
- **Total Revenue** — sum of `product.totalRevenue` across all products (accumulated from QR scans)
- **Expiring Soon** — products where `expiryDate <= now + 7 days`
- **Low Stock** — products where `quantity < 10`
- **Monthly Data** — groups products by `createdAt` month (YYYY-MM format)

Revenue is formatted intelligently: `₹1,20,000` → `₹1.20L`, `₹1,00,00,000` → `₹1.00Cr`

**Clickable Cards:**
Each stat card opens a modal with a filtered product table:
- Total Products → all products
- Revenue → products sorted by `price × quantity` descending
- Expiring Soon → products expiring within 7 days
- Low Stock → products below their `minStockLevel`

**Monthly Chart:**
- Recharts `LineChart` showing products added per month
- Animated line with spring easing on load

---

## 🔔 Feature 9 — Notifications

### How it works

**Auto-generation (backend):**
Notifications are created automatically by `productController.ts` in three situations:
- Product created with `quantity < minStockLevel`
- Product updated and `quantity < minStockLevel`
- QR scan reduces quantity below `minStockLevel`

Each notification stores: `shopId`, `productId`, `type` (lowStock/expiring/outOfStock), `message`, `isRead`

**Viewing (`GET /api/notifications`):**
- `Notifications.tsx` loads all notifications sorted newest-first
- Unread notifications have a red border and red title
- Unread count shown in the page heading

**Marking Read:**
- "Mark Read" button on individual notification → `PUT /api/notifications/:id/read`
- "Mark All Read" button → `PUT /api/notifications/read-all` (bulk update)
- List reloads after each action

---

## 🤖 Feature 10 — SmartStore AI Analytics

### How it works (`SmartStore.tsx` + `routes/smartstore.ts`)

**Dataset Generation (`GET /api/smartstore/dashboard-data`):**

On first visit, the backend generates a synthetic analytics dataset seeded from the shop's real data:
1. Fetches all `Rack` and `Product` documents for the shop from MongoDB
2. Uses rack names as zone names
3. Generates realistic random data for each zone: visitor counts, avg time spent
4. Builds `rackPerformance` using real product data — `lowStockAlerts` count is real (products below `minStockLevel`)
5. Extracts real product categories for the category sales pie chart
6. Builds a `movementMatrix` (zone → next zone prediction map)
7. Saves the full dataset to `SmartStoreDataset` collection in MongoDB
8. On subsequent visits, returns the saved dataset (no regeneration unless "Refresh Dataset" is clicked)

**Dashboard Charts:**
- Zone Traffic — bar chart of visitors per zone
- Hourly Traffic Trend — area chart from 8 AM to 7 PM
- Dwell Time — donut pie chart of seconds spent per zone
- Category Sales — pie chart of sales share by product category
- Rack Performance — grouped bar chart (sales vs restocks per rack)
- Zone Radar — radar chart comparing traffic, dwell, and sales per zone

**Summary Stats:**
- Total Visitors Today (sum of all zone visitors)
- Avg Dwell Time (average across all zones)
- Busiest Zone (highest visitor count)
- Coldest Zone (lowest visitor count)
- Total Sales Events (sum across all racks)
- Low Stock Alerts (sum of real low-stock counts from rack performance)

**Next-Zone Movement Predictor:**
- User selects a zone from pill buttons
- Clicks "Predict Next Zone"
- Frontend reads `movementMatrix[selectedZone]` from the dataset (no API call needed)
- Shows the predicted next zone with a 900ms fake "AI thinking" delay for UX

**AI Optimization Insights:**
- Pre-generated text insights stored in the dataset
- Seeded with real zone names (e.g. "Traffic Flow around [Rack A]")

**Python Bridge (optional):**
- For heatmap and advanced analytics, Node.js spawns `python smartstore_bridge.py <command>`
- Bridge outputs JSON which is parsed and returned
- Falls back gracefully if Python is not available

---

## 👤 Feature 11 — Admin Profile

### How it works (`Profile.tsx`)

- Loads current profile data on mount via `GET /api/auth/profile`
- Form fields: Shop Name, Email, Mobile Number, New Password (optional)
- On submit, calls `PUT /api/auth/profile`
- Backend updates only the fields that are provided
- Password is re-hashed with bcrypt if a new one is provided
- Leaving password blank keeps the existing password unchanged

---

## 🌐 API Reference

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create account, set session cookie |
| POST | `/login` | No | Login, set session cookie |
| POST | `/logout` | Yes | Clear token from DB + cookie |
| GET | `/me` | Yes | Validate current session |
| GET | `/profile` | Yes | Get profile data |
| PUT | `/profile` | Yes | Update shopName, email, mobile, password |

### Products — `/api/products`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | All products for this shop |
| POST | `/` | Yes | Create product (auto-generates QR code) |
| PUT | `/:id` | Yes | Update product |
| DELETE | `/:id` | Yes | Delete product |
| GET | `/rack/:rackId` | Yes | Products in a specific rack |
| POST | `/scan` | No | Scan QR → deduct quantity + track revenue |

### Racks — `/api/racks`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | All racks with computed live status |
| POST | `/` | Yes | Create rack |
| PUT | `/:id` | Yes | Update rack |
| DELETE | `/:id` | Yes | Delete rack |

### Doors — `/api/doors`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | All doors for this shop |
| POST | `/` | Yes | Create door |
| DELETE | `/:id` | Yes | Delete door |
| GET | `/public/:shopName` | No | Public door data by shop name |

### Shop Config — `/api/shop-config`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | Get floor dimensions |
| POST | `/` | Yes | Save floor dimensions (upsert) |
| GET | `/public/shops/list` | No | List all registered shop names |
| GET | `/public/:shopName` | No | Get floor config by shop name |

### Dashboard — `/api/dashboard`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Yes | Total products, revenue, expiring, low stock, monthly data |

### Notifications — `/api/notifications`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | All notifications sorted newest first |
| PUT | `/:id/read` | Yes | Mark one as read |
| PUT | `/read-all` | Yes | Mark all as read |

### Public (No Auth) — `/api/public`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/search?query=&shopName=` | No | Regex search products by name |
| GET | `/racks/:shopName` | No | All racks for a shop |
| GET | `/products/rack/:rackId` | No | Products in a rack |

### SmartStore AI — `/api/smartstore`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard-data` | Yes | Fetch or generate AI analytics dataset |
| GET | `/predict?zone=X` | Yes | Predict next zone from movement matrix |
| GET | `/heatmap` | Yes | Base64 spatial heatmap (Python bridge) |
| GET | `/zones` | Yes | Zone list from Python bridge |

---

## 🗄️ MongoDB Collections

| Collection | Key Fields |
|---|---|
| `users` | name, email, password (hashed), shopName, mobile, token |
| `products` | productName, category, price, quantity, expiryDate, rackId, shopId, qrCode, shelfNumber, columnNumber, minStockLevel, totalRevenue |
| `racks` | rackName, positionX/Y/Z, rotation, width, height, shelves, columns, color, shopId |
| `doors` | doorType (entry/exit), positionX/Z, rotation, width, height, shopId |
| `notifications` | type, message, isRead, productId, shopId |
| `shopconfigs` | width, depth, shopId |
| `smartstoredatasets` | zoneTraffic, trafficOverTime, dwellTimes, rackPerformance, categorySales, zoneRadar, movementMatrix, aiInsights, shopId |

---

## 🔒 Security Architecture

```
Browser                    Express (Render)            MongoDB Atlas
  │                              │                          │
  │── POST /api/auth/login ──────►│                          │
  │                              │── findOne({ email }) ────►│
  │                              │◄── user ─────────────────│
  │                              │── bcrypt.compare()        │
  │                              │── jwt.sign({ userId })    │
  │                              │── user.token = jwt ──────►│ saved to DB
  │◄── Set-Cookie: shop_token ───│                          │
  │   (httpOnly, secure,         │                          │
  │    sameSite=none)            │                          │
  │                              │                          │
  │── GET /api/dashboard ────────►│                          │
  │   (cookie auto-sent)         │── jwt.verify(cookie)      │
  │                              │── findOne({_id, token}) ─►│ DB token check
  │                              │◄── user ─────────────────│
  │◄── dashboard data ───────────│                          │
  │                              │                          │
  │── POST /api/auth/logout ─────►│                          │
  │                              │── user.token = null ─────►│ invalidated
  │                              │── clearCookie()           │
  │◄── 200 OK ───────────────────│                          │
```

**Key security points:**
- Passwords never stored in plain text (bcrypt, 10 rounds)
- JWT stored in `httpOnly` cookie — not accessible to JavaScript
- Token also stored in DB — logout truly invalidates the session even if JWT hasn't expired
- All product/rack/door/notification endpoints are scoped to `shopId = req.userId` — admins can only access their own data
- CORS allows only `*.vercel.app` origins and explicitly configured `FRONTEND_URL`

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- MongoDB Atlas account (or local MongoDB)
- Python 3.8+ (optional, for SmartStore AI only)

### Backend Setup
```bash
cd backend
npm install
```

Create `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/shopdb
JWT_SECRET=your_strong_secret_here
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

To point at your own backend, edit `src/services/api.js`:
```js
baseURL: 'http://localhost:5000/api'
```

### SmartStore AI Setup (Optional)
```bash
cd backend/smartstore
pip install -r requirements.txt
python main.py
```

---

## 🔮 Future Enhancements
- [ ] Multiple store support with centralized admin
- [ ] POS system integration for real-time sales tracking
- [ ] VR mode for virtual walk-throughs
- [ ] Live camera feed integration for SmartStore
- [ ] Push notifications for low-stock alerts
- [ ] Role-based access (manager, staff, viewer)
