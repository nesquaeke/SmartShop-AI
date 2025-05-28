# 🛒 SmartShop AI - Intelligent Price Comparison Platform

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Overview

SmartShop AI is an intelligent price comparison platform designed for the Polish market. It automatically scrapes prices from major retailers (LIDL, Biedronka, Auchan), provides AI-powered shopping recommendations, and optimizes shopping routes to maximize savings.

## 🏗️ Project Structure

```
SmartshopAi/
├── src/
│   ├── frontend/           # Frontend Application
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── styles/         # CSS and styling files
│   │   ├── assets/         # Static assets
│   │   ├── utils/          # Frontend utilities
│   │   ├── index.html      # Main application
│   │   └── package.json    # Frontend dependencies
│   │
│   ├── backend/            # Backend API Server
│   │   ├── src/
│   │   │   ├── routes/     # API route handlers
│   │   │   ├── models/     # Database models
│   │   │   ├── services/   # Business logic
│   │   │   ├── utils/      # Backend utilities
│   │   │   ├── config/     # Configuration files
│   │   │   └── server.ts   # Main server file
│   │   ├── prisma/         # Database schema
│   │   ├── dist/           # Compiled JavaScript
│   │   └── package.json    # Backend dependencies
│   │
│   ├── shared/             # Shared types and utilities
│   │   ├── types/          # TypeScript type definitions
│   │   ├── constants/      # Shared constants
│   │   └── utils/          # Shared utility functions
│   │
│   ├── docs/               # Documentation
│   │   ├── ARCHITECTURE.md # System architecture
│   │   └── DEPLOY.md       # Deployment guide
│   │
│   └── scripts/            # Utility scripts
│       ├── lidl-real-products.js
│       ├── test-lidl.js
│       └── test-lidl-simple.js
│
├── .git/                   # Git repository
├── .gitignore             # Git ignore file
├── package.json           # Root package.json (monorepo)
├── docker-compose.yml     # Docker configuration
└── README.md             # This file
```

## ✨ Features

### 🎯 Core Features
- **Real-time Price Scraping**: Automated price collection from major Polish retailers
- **Intelligent Recommendations**: AI-powered shopping suggestions
- **Route Optimization**: Smart shopping route planning
- **Multi-language Support**: Polish and English interface
- **Price Alerts**: Notifications when products reach target prices
- **Shopping Lists**: Organized shopping list management

### 🛍️ Supported Stores
- **LIDL** - Real-time scraping implemented
- **Biedronka** - Coming soon
- **Auchan** - Coming soon

### 🌐 Frontend Features
- Modern responsive design with Tailwind CSS
- Real-time data updates
- Interactive charts and analytics
- Floating animations and glassmorphism UI
- Progressive Web App (PWA) ready

### ⚡ Backend Features
- RESTful API with Express.js
- TypeScript for type safety
- Prisma ORM for database management
- Web scraping with Puppeteer/Playwright
- Rate limiting and security middlewares

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm 7+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/SmartshopAi.git
   cd SmartshopAi
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install:all
   ```

3. **Set up the database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🔧 Available Scripts

### Root Level Commands
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm run start` - Start both applications in production mode
- `npm run install:all` - Install dependencies for all packages
- `npm run clean` - Clean all node_modules and build artifacts

### Frontend Commands
- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production

### Backend Commands
- `npm run dev:backend` - Start backend development server
- `npm run build:backend` - Build backend for production
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Testing & Quality
- `npm run lint` - Run ESLint on backend code
- `npm run test` - Run test suite

## 🐳 Docker Support

Build and run with Docker:

```bash
npm run docker:build
npm run docker:run
```

## 📊 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get specific product
- `GET /api/products/search?q={query}` - Search products

### Shopping Lists
- `GET /api/shopping-list` - Get shopping lists
- `POST /api/shopping-list` - Create new shopping list
- `POST /api/shopping-list/:id/optimize` - Optimize shopping route

### AI Recommendations
- `POST /api/ai/recommendations` - Get AI recommendations
- `GET /api/ai/predictions` - Get price predictions

### Price Scraping
- `POST /api/scraper/run` - Trigger price scraping
- `GET /api/scraper/status` - Get scraping status

### Price Alerts
- `GET /api/prices/alerts` - Get price alerts
- `POST /api/prices/alerts` - Create price alert

## 🌍 Multi-language Support

The application supports:
- **Polish** (Default) - Full UI translation
- **English** - Complete interface localization

Language preference is automatically saved and restored.

## 🔒 Security Features

- CORS protection
- Helmet security headers
- Rate limiting
- Input validation with Joi
- Authentication ready (JWT)

## 📈 Performance

- **Frontend**: Optimized with modern bundling
- **Backend**: Efficient API responses with caching
- **Database**: Optimized queries with Prisma
- **Scraping**: Concurrent processing with queue management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Price data from LIDL, Biedronka, and Auchan
- Built with modern web technologies
- Inspired by smart shopping solutions

## 📞 Support

For support, email support@smartshop-ai.com or create an issue in the GitHub repository.

---

**SmartShop AI** - Making smart shopping accessible to everyone! 🛒✨ 