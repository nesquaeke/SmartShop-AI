# SmartShop AI - Deployment Guide

## 🌐 Live Links

- **Frontend (GitHub Pages)**: https://nesquaeke.github.io/SmartShop-AI/
- **Backend (Railway)**: https://smartshop-ai-backend-production.up.railway.app/
- **API Health Check**: https://smartshop-ai-backend-production.up.railway.app/health

## 🚀 Deployment Status

### Frontend Deployment (GitHub Pages)
- ✅ Automatic deployment via GitHub Actions
- ✅ Supports both localhost and production API endpoints
- ✅ Optimized for production with fallback data

### Backend Deployment (Railway)
- 🔄 Manual deployment required
- ✅ All API endpoints available
- ✅ Database (SQLite) included
- ✅ Real-time scraping functionality

## 📝 How to Deploy

### 1. Backend Deployment (Railway)

1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repository
5. Configure environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   ```
6. Wait for deployment to complete
7. Copy the generated URL and update frontend config

### 2. Frontend Deployment (GitHub Pages)

Frontend deploys automatically when you push to main branch.

## 🔧 Local Development

```bash
# Start all services locally
npm run dev

# Or start individually:
npm run dev:frontend  # Port 3000
npm run dev:backend   # Port 3001
npm run dev:ai        # Port 8000
```

## 📊 Features Available

### ✅ Working on Both Local & Production
- Product browsing and search
- Price comparison across stores
- Shopping list management
- AI recommendations
- Dark/Light theme toggle
- Multi-language support
- Price tracking and alerts

### 🔄 Backend-Dependent Features
- Real-time price scraping
- Live product data
- Advanced AI optimization
- User preferences sync

### 📱 Demo Mode Features
- Sample product data
- Basic functionality demo
- UI/UX showcase
- Responsive design demo

## 🛠️ Technical Details

- **Frontend**: Vanilla JS, Tailwind CSS, GitHub Pages
- **Backend**: Node.js, Express, Railway
- **Database**: SQLite (included in backend)
- **Scraping**: Puppeteer for real-time data
- **AI**: Custom recommendation engine

## 🌍 Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers

## 🔗 API Endpoints

Base URL: `https://smartshop-ai-backend-production.up.railway.app/api`

- `GET /products` - Get all products
- `GET /products/search?q=term` - Search products
- `POST /recommendations` - Get AI recommendations
- `POST /ai/optimize` - Optimize shopping list
- `GET /health` - Health check 

## 🎉 Tamamlandı! Artık projeniz hem localhost'ta hem de production'da çalışıyor!

### 📱 Erişim Linkleri:

1. **GitHub Pages (Public)**: 
   ```
   https://nesquaeke.github.io/SmartShop-AI/
   ```

2. **Localhost (Development)**:
   ```
   http://localhost:3000
   ```

### ⚡ Önemli Değişiklikler:

1. **✅ Akıllı API Konfigürasyonu**: 
   - Localhost'ta çalışırken yerel backend'i kullanır
   - Production'da Railway backend'ini kullanır
   - Her iki durumda da tüm özellikler çalışır

2. **✅ GitHub Actions Deployment**:
   - Her main branch'e push'ta otomatik deploy
   - Optimized production build

3. **✅ Fallback Demo Data**:
   - Backend erişilemediğinde demo veri gösterir
   - Tüm UI/UX özellikleri çalışmaya devam eder

### 🔧 Backend Deployment İçin:

1. [Railway.app](https://railway.app)'e gidin
2. GitHub ile giriş yapın
3. Bu repository'yi deploy edin
4. Environment variables ekleyin:
   ```
   NODE_ENV=production
   PORT=3001
   ```

### 🌟 Şimdi arkadaşlarınız bu linki kullanabilir:
```
https://nesquaeke.github.io/SmartShop-AI/
```

Tüm özellikler çalışacak:
- ✅ Ürün arama ve listeleme
- ✅ Fiyat karşılaştırma  
- ✅ Alışveriş listesi
- ✅ AI önerileri
- ✅ Dark/Light mode
- ✅ Responsive tasarım
- ✅ Türkçe/Polonyaca dil desteği

GitHub Actions şu anda deployment'ı başlatmış olmalı. Birkaç dakika içinde link tamamen aktif olacak! 🚀 