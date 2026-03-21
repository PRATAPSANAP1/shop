# 🏬 3D Shop Management System

> An immersive, full-stack shop management platform with real-time 3D visualization, AI-powered customer analytics, smart inventory tracking, and a public customer search portal.

[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/3D%20Engine-Three.js-000000.svg)](https://threejs.org/)

---

## 📁 Full Project Structure

```
Shop/
├── backend/                        # Node.js + Express + TypeScript API
│   ├── config/
│   │   └── db.ts                   # MongoDB connection via Mongoose
│   ├── controllers/
│   │   ├── authController.ts       # Register, Login, Logout, Profile, /me
│   │   ├── dashboardController.ts  # Aggregated stats (products, value, expiry, stock)
│   │   ├── doorController.ts       # CRUD for shop doors (entry/exit)
│   │   ├── notificationController.ts # Get, mark-read, mark-all-read alerts
│   │   ├── productController.ts    # CRUD + QR scan + low-stock notifications
│   │   ├── rackController.ts       # CRUD for racks with live status computation
│   │   ├── shopConfigController.ts # Shop floor dimensions + public shop list
│   │   └── shopController.ts       # Room builder config (width/depth/height/walls)
│   ├── middleware/
│   │   └── auth.ts                 # JWT cookie validation + DB token check
│   ├── models/
│   │   ├── User.ts                 # name, email, password, shopName, token
│   │   ├── Product.ts              # productName, category, price, qty, expiry, rackId, qrCode, shelf/column, minStock
│   │   ├── Rack.ts                 # rackName, position(X/Y/Z), rotation, width, height, shelves, columns, color
│   │   ├── Door.ts                 # shopId, doorType(entry/exit), position, rotation, width, height
│   │   ├── Notification.ts         # shopId, productId, type(lowStock/expiring/outOfStock), message, isRead
│   │   ├── ShopConfig.ts           # shopId, width, depth (floor plan dimensions)
│   │   ├── SmartStoreDataset.ts    # shopId, zoneTraffic, trafficOverTime, dwellTimes, rackPerformance, movementMatrix, aiInsights
│   │   └── Shop.ts                 # shopId, roomWidth/Depth/Height, walls[], entry/exitPosition
│   ├── routes/
│   │   ├── auth.ts                 # /api/auth — register, login, logout, /me, profile
│   │   ├── products.ts             # /api/products — CRUD + scan
│   │   ├── racks.ts                # /api/racks — CRUD
│   │   ├── doors.ts                # /api/doors — CRUD + public
│   │   ├── dashboard.ts            # /api/dashboard/stats
│   │   ├── notifications.ts        # /api/notifications — get, mark-read
│   │   ├── shopConfig.ts           # /api/shop-config — save/get config + public list
│   │   ├── shop.ts                 # /api/shop — room builder data
│   │   ├── public.ts               # /api/public — no-auth customer endpoints
│   │   └── smartstore.ts           # /api/smartstore — Python AI bridge endpoints
│   ├── smartstore/                 # Python AI analytics engine
│   │   ├── agents/
│   │   │   └── retail_agent.py     # AI retail decision agent
│   │   ├── analytics/
│   │   │   ├── dwell_time_analysis.py    # How long customers stay per zone
│   │   │   ├── heatmap_generator.py      # Visual heatmap of customer movement
│   │   │   ├── path_visualization.py     # Customer path drawing
│   │   │   └── zone_analysis.py          # Zone-by-zone traffic breakdown
│   │   ├── dashboard/
│   │   │   ├── analytics_dashboard.py    # Analytics data aggregator
│   │   │   └── shopkeeper_dashboard.py   # Shopkeeper-facing summary
│   │   ├── detection/
│   │   │   └── customer_detection.py     # YOLOv8-based person detection
│   │   ├── models/
│   │   │   └── yolov8_model.py           # YOLOv8 model loader/wrapper
│   │   ├── prediction/
│   │   │   └── movement_prediction.py    # Next-zone movement predictor
│   │   ├── recommendation/
│   │   │   └── product_placement_ai.py   # AI product placement suggestions
│   │   ├── tracking/
│   │   │   └── customer_tracking.py      # Multi-customer tracking logic
│   │   ├── utils/
│   │   │   ├── config.py                 # Zone/camera configuration
│   │   │   ├── generate_dummy_video.py   # Test video generator
│   │   │   └── helpers.py                # Shared utility functions
│   │   ├── data/
│   │   │   ├── videos/                   # Input video files for processing
│   │   │   └── store_data.db             # SQLite store for tracking data
│   │   ├── main.py                       # SmartStore pipeline entry point
│   │   ├── smartstore_bridge.py          # JSON bridge called by Node.js routes
│   │   └── requirements.txt              # Python dependencies (ultralytics, opencv, etc.)
│   ├── .env                        # PORT, MONGODB_URI, JWT_SECRET
│   ├── server.ts                   # Express app entry — CORS, cookie-parser, routes
│   └── tsconfig.json
│
├── frontend/                       # React 18 + TypeScript SPA
│   ├── public/
│   │   ├── index.html              # React root HTML
│   │   └── smartstore/             # Legacy SmartStore static HTML UI
│   │       ├── index.html
│   │       ├── features.html
│   │       ├── about.html
│   │       ├── script.js
│   │       └── style.css
│   └── src/
│       ├── services/
│       │   └── api.js              # Axios instance (withCredentials), all API calls
│       ├── components/
│       │   ├── ShopBuilder.tsx     # Admin 3D shop floor editor (drag racks/doors)
│       │   └── ShopView3D.tsx      # Admin 3D shop viewer with rack/product details
│       ├── pages/
│       │   ├── Login.tsx           # Admin login + register (dark glassmorphism)
│       │   ├── Dashboard.tsx       # Stats cards + monthly chart + product modals
│       │   ├── Products.tsx        # Product CRUD + QR PDF export + search/filter
│       │   ├── Racks.tsx           # Rack CRUD + color/orientation/position config
│       │   ├── Scanner.tsx         # Live camera QR scanner (jsQR) + stock update
│       │   ├── Notifications.tsx   # Low-stock/expiry alerts with mark-read
│       │   ├── Profile.tsx         # Admin profile update (shop name, email, password)
│       │   ├── CustomerSearch.tsx  # Public 3D store explorer + product finder
│       │   └── SmartStore.tsx      # AI analytics dashboard (traffic, heatmap, predict)
│       ├── App.tsx                 # Router, Layout, auth guard, toast system, sidebar
│       ├── index.css               # Global dark theme, glassmorphism, responsive CSS
│       └── index.tsx               # React DOM entry point
└── README.md
```

---

## 🔗 Frontend ↔ Backend Feature Connections

### 🔐 Authentication
| Frontend | API Call | Backend |
|---|---|---|
| `Login.tsx` — submit form | `POST /api/auth/login` | `authController.login` → bcrypt verify → save token to `User.token` → set `httpOnly` cookie |
| `Login.tsx` — register form | `POST /api/auth/register` | `authController.register` → hash password → save user + token → set cookie |
| `App.tsx` — `PublicRoute` / `Layout` auth check | `GET /api/auth/me` | `authController.getMe` → reads cookie → validates token against DB |
| Sidebar logout button | `POST /api/auth/logout` | `authController.logout` → sets `User.token = null` → clears cookie |
| `Profile.tsx` — load data | `GET /api/auth/profile` | `authController.getProfile` → returns user (no password/token) |
| `Profile.tsx` — save changes | `PUT /api/auth/profile` | `authController.updateProfile` → updates shopName, email, optional new password |

**Auth Flow:** Token is generated on login/register → stored in `User.token` field in MongoDB → sent to browser as `httpOnly` cookie. Every protected request reads the cookie, verifies JWT signature, then checks the token matches what's in the DB (so logout truly invalidates the session).

---

### 📦 Products
| Frontend | API Call | Backend |
|---|---|---|
| `Products.tsx` — load list | `GET /api/products` | `productController.getProducts` → finds by `shopId`, populates `rackId` |
| `Products.tsx` — add product | `POST /api/products` | `productController.createProduct` → generates hex `qrCode` → auto-creates low-stock notification if qty < minStock |
| `Products.tsx` — edit product | `PUT /api/products/:id` | `productController.updateProduct` → upserts low-stock notification if needed |
| `Products.tsx` — delete product | `DELETE /api/products/:id` | `productController.deleteProduct` |
| `Products.tsx` — QR PDF export | client-side only | `qrcode` lib → `jsPDF` → downloads PDF |
| `Scanner.tsx` — scan & deduct | `POST /api/products/scan` | `productController.scanProduct` → finds by `qrCode` → decrements qty → triggers notification |
| `Dashboard.tsx` — product modals | `GET /api/products` | same as above, filtered client-side |

---

### 🗄️ Racks
| Frontend | API Call | Backend |
|---|---|---|
| `Racks.tsx` — load list | `GET /api/racks` | `rackController.getRacks` → fetches racks + computes `status` (normal/lowStock/expiring) per rack by checking its products |
| `Racks.tsx` — add rack | `POST /api/racks` | `rackController.createRack` → saves position, dimensions, color, orientation |
| `Racks.tsx` — edit rack | `PUT /api/racks/:id` | `rackController.updateRack` |
| `Racks.tsx` — delete rack | `DELETE /api/racks/:id` | `rackController.deleteRack` |
| `ShopBuilder.tsx` — 3D placement | `GET/POST /api/racks` | same controllers, positions updated via drag in 3D canvas |
| `ShopView3D.tsx` — 3D viewer | `GET /api/racks` + `GET /api/products/rack/:id` | loads all racks then fetches products per rack |

---

### 🚪 Doors
| Frontend | API Call | Backend |
|---|---|---|
| `ShopBuilder.tsx` — add door | `POST /api/doors` | `doorController.createDoor` → saves type, position, rotation, size |
| `ShopBuilder.tsx` — load doors | `GET /api/doors` | `doorController.getDoors` → filtered by `shopId` |
| `ShopBuilder.tsx` — delete door | `DELETE /api/doors/:id` | `doorController.deleteDoor` |
| `ShopView3D.tsx` — render doors | `GET /api/doors` | same, renders entry (green) / exit (red) in 3D |
| `CustomerSearch.tsx` — public view | `GET /api/doors/public/:shopName` | `doorController.getPublicDoors` → looks up user by shopName, returns their doors |

---

### 🏗️ Shop Configuration
| Frontend | API Call | Backend |
|---|---|---|
| `ShopBuilder.tsx` — save floor size | `POST /api/shop-config` | `shopConfigController.saveShopConfig` → upserts width/depth for shopId |
| `ShopBuilder.tsx` — load floor size | `GET /api/shop-config` | `shopConfigController.getShopConfig` |
| `ShopView3D.tsx` — floor dimensions | `GET /api/shop-config` | same |
| `CustomerSearch.tsx` — public floor | `GET /api/shop-config/public/:shopName` | `shopConfigController.getPublicShopConfig` → resolves shopName → returns config |
| `CustomerSearch.tsx` — shop dropdown | `GET /api/shop-config/public/shops/list` | `shopConfigController.listPublicShops` → returns all shopNames |

---

### 📊 Dashboard
| Frontend | API Call | Backend |
|---|---|---|
| `Dashboard.tsx` — stat cards | `GET /api/dashboard/stats` | `dashboardController.getDashboardStats` → counts total products, total value, expiring soon (7 days), low stock, monthly breakdown |

---

### 🔔 Notifications
| Frontend | API Call | Backend |
|---|---|---|
| `Notifications.tsx` — load | `GET /api/notifications` | `notificationController.getNotifications` → sorted by date, populates product |
| `Notifications.tsx` — mark one read | `PUT /api/notifications/:id/read` | `notificationController.markAsRead` |
| `Notifications.tsx` — mark all read | `PUT /api/notifications/read-all` | `notificationController.markAllAsRead` |
| Auto-triggered | — | Created automatically by `productController` when qty < minStockLevel on create/update/scan |

---

### 🔍 Customer Search (Public — No Auth)
| Frontend | API Call | Backend |
|---|---|---|
| `CustomerSearch.tsx` — shop list dropdown | `GET /api/shop-config/public/shops/list` | Returns all registered shop names |
| `CustomerSearch.tsx` — enter shop | `GET /api/shop-config/public/:shopName` | Resolves shopName → returns floor config |
| `CustomerSearch.tsx` — load racks | `GET /api/public/racks/:shopName` | Returns racks for that shop |
| `CustomerSearch.tsx` — load products per rack | `GET /api/public/products/rack/:rackId` | Returns products in that rack |
| `CustomerSearch.tsx` — search product | `GET /api/public/search?query=&shopName=` | Regex search on productName, filtered by shop's racks, populates rackId |
| `CustomerSearch.tsx` — load doors | `GET /api/doors/public/:shopName` | Returns entry/exit doors for 3D rendering |

---

### 📷 QR Scanner
| Frontend | API Call | Backend |
|---|---|---|
| `Scanner.tsx` — open camera | browser `getUserMedia` | Accesses device camera (no backend) |
| `Scanner.tsx` — scan frame | `jsQR` library (client-side) | Decodes QR from video frames in real-time using `requestAnimationFrame` |
| `Scanner.tsx` — submit scan | `POST /api/products/scan` | Finds product by `qrCode`, decrements quantity, triggers low-stock notification |

---

### 🤖 SmartStore AI Analytics
| Frontend | API Call | Backend |
|---|---|---|
| `SmartStore.tsx` — dashboard data | `GET /api/smartstore/dashboard-data` | `smartstore.ts` → checks for `SmartStoreDataset` → if none, **dynamically generates** synthetic data based on actual `Rack` and `Product` DB records → saves to MongoDB |
| `SmartStore.tsx` — refresh | `GET /api/smartstore/dashboard-data?refresh=true` | Forces regeneration of analytics based on current 3D layout and inventory |
| `SmartStore.tsx` — predict next zone | `GET /api/smartstore/predict?zone=X` | First checks `SmartStoreDataset.movementMatrix` → falls back to Python bridge |
| `SmartStore.tsx` — heatmap | `GET /api/smartstore/heatmap` | Node spawns `python smartstore_bridge.py heatmap` → returns base64 image |

**Bridge & Generation Pattern:** The system uses a hybrid approach. It prioritizes a high-performance **Mongoose-backed Dataset** (generated from your real 3D shop geometry and inventory) for the dashboard UI, while still providing a bridge to the **Python AI engine** for complex spatial analytics like heatmap generation and real-time movement trajectory analysis.

---

### 🏠 3D Home Page (Admin Landing)
| Frontend | Route | Component |
|---|---|---|
| Landing Page | `/admin/home` | `ShopView3D.tsx` — Immersive 3D overview of the entire shop with product overlays and rack status |
| Dashboard | `/admin/dashboard` | `Dashboard.tsx` — Analytical overview (Revenue, Expiry, Low Stock charts) |

---

## 🛡️ Authentication Architecture

```
Browser                    Express Server              MongoDB
  │                              │                        │
  │── POST /api/auth/login ──────►│                        │
  │                              │── findOne({ email }) ──►│
  │                              │◄── user ───────────────│
  │                              │── bcrypt.compare()      │
  │                              │── jwt.sign()            │
  │                              │── user.token = jwt ────►│ (saved to DB)
  │◄── Set-Cookie: shop_token ───│                        │
  │                              │                        │
  │── GET /api/dashboard ────────►│                        │
  │   (cookie sent automatically) │── read cookie          │
  │                              │── jwt.verify()          │
  │                              │── findOne({_id, token})►│ (validates against DB)
  │                              │◄── user ───────────────│
  │◄── dashboard data ───────────│                        │
  │                              │                        │
  │── POST /api/auth/logout ─────►│                        │
  │                              │── user.token = null ───►│ (invalidated in DB)
  │                              │── clearCookie()         │
  │◄── 200 OK ───────────────────│                        │
```

---

## 🗄️ MongoDB Collections

| Collection | Key Fields | Purpose |
|---|---|---|
| `users` | name, email, password, shopName, token | Admin accounts + active session token |
| `products` | productName, category, price, quantity, expiryDate, rackId, shopId, qrCode, shelfNumber, columnNumber, minStockLevel | Inventory items |
| `racks` | rackName, positionX/Y/Z, rotation, width, height, shelves, columns, color, shopId | 3D rack placements |
| `doors` | doorType, positionX/Z, rotation, width, height, shopId | Entry/exit door placements |
| `notifications` | type, message, isRead, productId, shopId | Auto-generated stock/expiry alerts |
| `shopconfigs` | width, depth, shopId | Shop floor dimensions |
| `smartstoredatasets` | zoneTraffic, trafficOverTime, dwellTimes, rackPerformance, movementMatrix, aiInsights, shopId | Persistent AI analytics dataset |
| `shops` | roomWidth/Depth/Height, walls[], shopId | Room builder configuration |

---

## 🌐 Complete API Reference

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | | Create account, set session cookie |
| POST | `/login` | | Login, set session cookie |
| POST | `/logout` |  | Clear token from DB + cookie |
| GET | `/me` |  | Check if session is valid |
| GET | `/profile` |  | Get profile data |
| PUT | `/profile` |  | Update shopName, email, password |

### Products — `/api/products`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` |  | All products for this shop |
| POST | `/` |  | Create product (auto-generates QR code) |
| PUT | `/:id` |  | Update product |
| DELETE | `/:id` |  | Delete product |
| GET | `/rack/:rackId` |  | Products in a specific rack |
| POST | `/scan` |  | Scan QR → deduct quantity |

### Racks — `/api/racks`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` |  | All racks with computed status |
| POST | `/` |  | Create rack |
| PUT | `/:id` |  | Update rack |
| DELETE | `/:id` |  | Delete rack |

### Doors — `/api/doors`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` |  | All doors for this shop |
| POST | `/` |  | Create door |
| DELETE | `/:id` |  | Delete door |
| GET | `/public/:shopName` | | Public door data by shop name |

### Shop Config — `/api/shop-config`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` |  | Get floor dimensions |
| POST | `/` |  | Save floor dimensions |
| GET | `/public/shops/list` | | List all shop names |
| GET | `/public/:shopName` | | Get floor config by shop name |

### Dashboard — `/api/dashboard`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` |  | Total products, value, expiring, low stock, monthly data |

### Notifications — `/api/notifications`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` |  | All notifications (sorted newest first) |
| PUT | `/:id/read` |  | Mark one as read |
| PUT | `/read-all` |  | Mark all as read |

### Public (No Auth) — `/api/public`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/search?query=&shopName=` | | Search products by name in a shop |
| GET | `/racks/:shopName` | | All racks for a shop |
| GET | `/products/rack/:rackId` | | Products in a rack |
| GET | `/shop` | | Shop room config |

### SmartStore AI — `/api/smartstore`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard-data` |  | Create/Fetch the shop's AI dataset (Dynamic Generation) |
| GET | `/predict?zone=X` |  | Predict next movement (Dataset -> Python fallback) |
| GET | `/heatmap` |  | Get base64 spatial heatmap image |
| GET | `/zones` |  | List analytical zones from bridge |

---

##  Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v16+
- [MongoDB](https://www.mongodb.com/) running on `localhost:27017`
- [Python](https://www.python.org/) 3.8+ (for SmartStore AI only)

### Backend Setup
```bash
cd backend
npm install
```

Create `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shopdb
JWT_SECRET=your_strong_secret_key_here
NODE_ENV=development
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

### SmartStore AI Setup (Optional)
```bash
cd backend/smartstore
pip install -r requirements.txt
python main.py   # run the processing pipeline first
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| `@react-three/fiber` + `@react-three/drei` | 3D rendering (Three.js for React) |
| React Router DOM v6 | Client-side routing |
| Axios (`withCredentials`) | HTTP client with cookie support |
| Framer Motion | Animations and transitions |
| Recharts | Dashboard charts |
| jsQR | Real-time QR code decoding from camera |
| qrcode + jsPDF | QR code generation and PDF export |
| Lucide React | Icon library |
| Vanilla CSS | Dark glassmorphism theme, responsive layout |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database and ODM |
| JWT + bcryptjs | Authentication and password hashing |
| cookie-parser | httpOnly session cookie handling |
| cors | Cross-origin with credentials |
| Python + YOLOv8 | AI customer detection and tracking |
| OpenCV | Video frame processing |
| SQLite | SmartStore tracking data storage |

---

## 🔮 Future Enhancements
- [ ] Multiple store support with centralized admin
- [ ] POS system integration for real-time sales tracking
- [ ] VR mode for virtual walk-throughs
- [ ] AI-driven product placement optimization
- [ ] Live camera feed integration for SmartStore
- [ ] Push notifications for low-stock alerts
