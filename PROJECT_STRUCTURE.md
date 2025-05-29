# SmartShop AI - Project Structure 📁

This document provides a comprehensive overview of the project structure and organization.

## 📂 Root Structure

```
SmartShop-AI/
├── 📁 src/                     # Source code
├── 📁 docs/                    # Documentation
├── 📁 tests/                   # Test files
├── 📁 .github/                 # GitHub workflows
├── 📄 package.json             # Root dependencies & scripts
├── 📄 README.md               # Main documentation
├── 📄 PROJECT_STRUCTURE.md    # This file
├── 📄 DEPLOYMENT.md           # Deployment guide
└── 📄 .gitignore              # Git ignore rules
```

## 🎨 Frontend Structure (`src/frontend/`)

```
src/frontend/
├── 📄 index.html              # Main application page
├── 📄 package.json            # Frontend dependencies
├── 📁 pages/                  # Additional pages
│   └── 📄 smartshop-pro.html  # Pro version page
├── 📁 styles/                 # Stylesheets
│   ├── 📄 main.css            # Main styles
│   └── 📄 dark-mode.css       # Dark theme
├── 📁 js/                     # JavaScript modules
│   ├── 📄 config.js           # Configuration & API setup
│   └── 📄 app.js              # Main application logic
└── 📁 assets/                 # Static assets
    └── 📄 logo.png            # Application logo
```

### Frontend Key Files

#### `index.html` - Main Application
- Entry point for the application
- Contains all UI structure
- Responsive design with Tailwind CSS
- Dynamic asset loading

#### `js/config.js` - Configuration Module
- Environment detection (localhost vs production)
- API endpoint configuration  
- Path management for assets
- API helper functions with error handling

#### `js/app.js` - Main Application Logic
- SmartShopApp class for application state
- Event handlers and UI interactions
- Product management and shopping list
- Search and filter functionality

## 🔧 Backend Structure (`src/backend/`)

```
src/backend/
├── 📄 package.json            # Backend dependencies
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 prisma/                 # Database schema
│   └── 📄 schema.prisma       # Prisma schema
├── 📁 src/                    # Source code
│   ├── 📄 server.ts           # Express server setup
│   ├── 📁 routes/             # API endpoints
│   │   ├── 📄 products.ts     # Product CRUD operations
│   │   ├── 📄 ai.ts           # AI optimization endpoints
│   │   └── 📄 health.ts       # Health check endpoint
│   ├── 📁 scrapers/           # Web scraping modules
│   │   └── 📄 lidl-scraper.ts # LIDL website scraper
│   ├── 📁 middleware/         # Express middleware
│   │   └── 📄 cors.ts         # CORS configuration
│   └── 📁 models/             # Data models
│       └── 📄 Product.ts      # Product model
└── 📄 dev.db                  # SQLite database (development)
```

### Backend Key Files

#### `server.ts` - Main Server
- Express application setup
- Middleware configuration
- Route registration
- Error handling

#### `routes/products.ts` - Product API
- GET `/products` - All products
- GET `/products/search` - Search functionality  
- GET `/products/:id` - Single product
- POST `/products/refresh` - Cache refresh
- Caching system (30-minute duration)
- Fallback data for reliability

#### `scrapers/lidl-scraper.ts` - Web Scraping
- Puppeteer-based scraping
- LIDL website data extraction
- Error handling and timeouts
- Product normalization

## 🤖 AI Engine Structure (`src/ai-engine/`)

```
src/ai-engine/
├── 📄 simple_ai.py           # Main AI server
├── 📄 requirements.txt       # Python dependencies
├── 📁 models/                # ML models and algorithms
│   ├── 📄 optimizer.py       # Shopping list optimization
│   └── 📄 recommender.py     # Product recommendations
└── 📁 utils/                 # Utility functions
    └── 📄 helpers.py         # Helper functions
```

### AI Engine Key Files

#### `simple_ai.py` - Flask AI Server
- REST API for AI operations
- Shopping list optimization
- Product recommendations
- Price prediction algorithms

## 📚 Documentation (`docs/`)

```
docs/
├── 📄 API.md                 # API documentation
├── 📄 DEPLOYMENT.md          # Deployment guide
├── 📄 DEVELOPMENT.md         # Development setup
└── 📄 ARCHITECTURE.md        # System architecture
```

## 🧪 Testing Structure (`tests/`)

```
tests/
├── 📁 frontend/              # Frontend tests
│   ├── 📁 unit/              # Unit tests
│   └── 📁 integration/       # Integration tests
├── 📁 backend/               # Backend tests
│   ├── 📁 unit/              # Unit tests  
│   └── 📁 api/               # API tests
└── 📁 e2e/                   # End-to-end tests
```

## ⚙️ Configuration Files

### Root Level
- **`package.json`** - Main project configuration, scripts
- **`.gitignore`** - Git ignore patterns
- **`tsconfig.json`** - Global TypeScript config

### Frontend
- **`package.json`** - Frontend dependencies
- **Live-server** configuration in scripts

### Backend  
- **`package.json`** - Backend dependencies & scripts
- **`tsconfig.json`** - TypeScript compilation settings
- **`prisma/schema.prisma`** - Database schema

### AI Engine
- **`requirements.txt`** - Python dependencies
- **Flask** configuration in main file

## 🚀 Deployment Structure

### GitHub Actions (`.github/workflows/`)
```
.github/workflows/
└── 📄 deploy.yml             # Automated deployment
```

### Deployment Targets
- **Frontend**: GitHub Pages (`gh-pages` branch)
- **Backend**: Railway (automatic from main branch)
- **AI Engine**: Railway or similar Python hosting

## 🔄 Data Flow

```
Browser → Frontend (JS) → Backend API → Database
                      ↓
                   AI Engine → Optimization
                      ↓  
               Web Scrapers → External Sites
```

## 📦 Package Management

### NPM Workspaces (Root)
```json
{
  "workspaces": [
    "src/frontend",
    "src/backend"
  ]
}
```

### Dependencies Distribution
- **Root**: Development tools, scripts
- **Frontend**: Client-side libraries
- **Backend**: Server libraries, database
- **AI Engine**: Python ML libraries

## 🔧 Build Process

### Development
1. `npm run dev` - Start all services
2. Frontend: Live-server on port 3000
3. Backend: ts-node-dev on port 3001  
4. AI Engine: Flask on port 8000

### Production
1. `npm run build` - Build all components
2. Frontend: Static files generation
3. Backend: TypeScript compilation
4. AI Engine: Production server setup

## 🌐 Environment Configuration

### Local Development
- API: `http://localhost:3001/api`
- Frontend: `http://localhost:3000`
- Assets: `./assets/`

### Production
- API: `https://smartshop-ai-backend-production.up.railway.app/api`
- Frontend: `https://nesquaeke.github.io/SmartShop-AI/`
- Assets: `/SmartShop-AI/assets/`

## 📊 Performance Considerations

### Caching Strategy
- **Products**: 30-minute cache in backend
- **Static Assets**: Browser cache headers
- **API Responses**: Response compression

### Bundle Optimization
- **CSS**: Tailwind CSS purging
- **JS**: Module bundling for production
- **Images**: Optimized formats and sizes

## 🔒 Security Structure

### Frontend Security
- XSS protection through proper escaping
- HTTPS enforcement in production
- Secure API communication

### Backend Security
- CORS configuration
- Input validation
- Rate limiting middleware
- Environment variable protection

## 📱 Responsive Design

### Breakpoints (Tailwind CSS)
- **sm**: 640px+ (mobile landscape)
- **md**: 768px+ (tablet)
- **lg**: 1024px+ (desktop)
- **xl**: 1280px+ (large desktop)

### Component Responsiveness
- Grid layouts adapt to screen size
- Navigation responsive behavior
- Touch-friendly interactions on mobile

---

This structure ensures:
- **Maintainability**: Clear separation of concerns
- **Scalability**: Modular architecture  
- **Developer Experience**: Logical organization
- **Performance**: Optimized loading and caching
- **Security**: Proper isolation and validation 