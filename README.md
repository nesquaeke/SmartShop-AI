# SmartShop AI 🛒✨

**Inteligentny asystent zakupowy z AI dla polskich sklepów**

> Znajdź najlepsze oferty, optymalizuj zakupy i oszczędzaj pieniądze dzięki sztucznej inteligencji!

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-brightgreen)](https://nesquaeke.github.io/SmartShop-AI/)
[![API Status](https://img.shields.io/badge/API-Online-success)](https://smartshop-ai-backend-production.up.railway.app/health)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🌟 Co to jest SmartShop AI?

SmartShop AI to nowoczesna aplikacja webowa, która revolutionizuje sposób robienia zakupów w Polsce. Wykorzystując sztuczną inteligencję i web scraping, aplikacja:

- 🔍 **Wyszukuje** najlepsze ceny w różnych sklepach
- 🛍️ **Optymalizuje** Twoją listę zakupów
- 💰 **Oszczędza** Twoje pieniądze
- 🏪 **Porównuje** oferty z Biedronki, LIDL, Auchan i innych
- 🤖 **Rekomenduje** produkty na podstawie Twoich preferencji

## 🚀 Demo na Żywo

### 🌐 [Otwórz SmartShop AI](https://nesquaeke.github.io/SmartShop-AI/)

**Testuj już teraz!** Aplikacja działa w przeglądarce bez instalacji.

## ✨ Główne Funkcje

### 🔍 **Inteligentne Wyszukiwanie**
- Wyszukiwanie produktów w czasie rzeczywistym
- Filtrowanie po kategoriach i sklepach
- Porównywanie cen między różnymi sieciami

### 🛒 **Zarządzanie Listą Zakupów**
- Dodawanie produktów do listy jednym kliknięciem
- Automatyczne obliczanie całkowitego kosztu
- Zarządzanie ilościami i usuwanie produktów

### 🤖 **Optymalizacja AI**
- Algorytmy AI optymalizują Twoją listę zakupów
- Rekomendacje najlepszych kombinacji sklepów
- Predykcja maksymalnych oszczędności

### 🏪 **Obsługiwane Sklepy**
- **Biedronka** 🛒 (3000+ lokalizacji)
- **LIDL** 🏪 (800+ lokalizacji)
- **Auchan** 🏬 (90+ lokalizacji)
- **Carrefour** 🛍️ (90+ lokalizacji)
- **Netto** 🥬 (400+ lokalizacji)
- **Żabka** 🐸 (8000+ lokalizacji)

## 🛠️ Technologie

### Frontend
- **HTML5/CSS3** + **Tailwind CSS** - Nowoczesny, responsywny design
- **Vanilla JavaScript** - Szybka, wydajna logika aplikacji
- **Progressive Web App** - Działa jak natywna aplikacja

### Backend
- **Node.js** + **Express** - Wysokowydajny serwer API
- **TypeScript** - Bezpieczny, typowany kod
- **Puppeteer** - Web scraping w czasie rzeczywistym
- **SQLite** + **Prisma** - Szybka baza danych

### AI Engine
- **Python** + **Flask** - Inteligentne algorytmy optymalizacji
- **Machine Learning** - Rekomendacje i predykcje

## 🚀 Szybki Start dla Deweloperów

### Wymagania
```bash
Node.js >= 16.0.0
Python >= 3.8
Git
```

### 1. Klonowanie i instalacja
```bash
git clone https://github.com/nesquaeke/SmartShop-AI.git
cd SmartShop-AI
npm install
```

### 2. Uruchomienie w trybie development
```bash
# Uruchom wszystkie serwisy jednocześnie
npm run dev

# Aplikacja będzie dostępna na:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# AI Engine: http://localhost:8000
```

### 3. Lub uruchom osobno
```bash
npm run dev:frontend  # Frontend na porcie 3000
npm run dev:backend   # Backend na porcie 3001
npm run dev:ai        # AI Engine na porcie 8000
```

## 🏗️ Architektura Systemu

```
🌐 Frontend (Vanilla JS + Tailwind)
    ↓ API Calls
🔧 Backend (Node.js + Express)
    ↓ Data Processing
🤖 AI Engine (Python + Flask)
    ↓ ML Algorithms
🕷️ Web Scrapers (Puppeteer)
    ↓ Data Collection
🏪 Sklepy Online (LIDL, Biedronka, etc.)
```

## 📊 Przykłady Użycia

### Wyszukiwanie Produktu
```javascript
// Wyszukaj "mleko" w aplikacji
const response = await fetch('/api/products/search?q=mleko');
const data = await response.json();
// Zwraca produkty z różnych sklepów z cenami
```

### Optymalizacja Listy Zakupów
```javascript
// Optymalizuj listę zakupów za pomocą AI
const optimizedList = await fetch('/api/ai/optimize', {
    method: 'POST',
    body: JSON.stringify({ shopping_list: myList })
});
// AI znajdzie najlepszą kombinację sklepów
```

## 🌐 Deployment

### Automatyczne Wdrożenie
- **Frontend**: GitHub Pages - [Live Demo](https://nesquaeke.github.io/SmartShop-AI/)
- **Backend**: Railway - [API Health](https://smartshop-ai-backend-production.up.railway.app/health)
- **CI/CD**: GitHub Actions automatycznie wdraża zmiany

### Status Serwisów
- ✅ Frontend: Online
- ✅ Backend API: Online  
- ✅ AI Engine: Online
- ✅ Web Scrapers: Active

## 📱 Responsywność

Aplikacja jest w pełni responsywna i działa na:
- 💻 **Desktop** - Pełna funkcjonalność
- 📱 **Mobile** - Zoptymalizowany dla dotykowych ekranów
- 📟 **Tablet** - Adaptacyjny layout

## 🔒 Bezpieczeństwo

- 🛡️ **HTTPS** w produkcji
- 🚫 **XSS Protection** w frontend
- ✅ **Input Validation** dla wszystkich API
- 🔐 **CORS** zabezpieczenia
- 📊 **Rate Limiting** dla API

## 📈 Performance

- ⚡ **Cache** produktów (30 min)
- 🗜️ **Compression** zasobów
- 📦 **Lazy Loading** obrazów
- 🚀 **< 1s** First Contentful Paint

## 🤝 Współpraca

Chcesz pomóc? Świetnie! 

1. **Fork** repozytorium
2. Stwórz **branch**: `git checkout -b feature/nowa-funkcja`
3. **Commit**: `git commit -m 'Dodaj nową funkcję'`
4. **Push**: `git push origin feature/nowa-funkcja`
5. Stwórz **Pull Request**

### Co możesz dodać?
- 🏪 Nowe sklepy (scraper)
- 🤖 Lepsze algorytmy AI
- 🎨 Ulepszenia UI/UX
- 🧪 Testy automatyczne
- 📚 Dokumentację

## 📋 Roadmap

### Najbliższe aktualizacje:
- [ ] 📱 Aplikacja mobilna (React Native)
- [ ] 🔔 Powiadomienia o promocjach
- [ ] 🗺️ Mapa najbliższych sklepów
- [ ] 👥 System użytkowników
- [ ] 📊 Analytics i statystyki
- [ ] 🛒 Integracja z koszami online

## 📞 Support

- 🐛 **Błędy**: [GitHub Issues](https://github.com/nesquaeke/SmartShop-AI/issues)
- 💬 **Dyskusje**: [GitHub Discussions](https://github.com/nesquaeke/SmartShop-AI/discussions)
- 📧 **Email**: support@smartshop-ai.com

## 📄 Licencja

MIT License - zobacz [LICENSE](LICENSE) dla szczegółów.

## ⭐ Podziękowania

- 🎨 **Tailwind CSS** za piękny framework
- 🛒 **Polskie sklepy** za inspirację
- 👥 **Open Source Community** za narzędzia
- ❤️ **Testerzy** za feedback

---

### 🛒 **SmartShop AI - Twój inteligentny asystent zakupowy!**

**[👉 Testuj już teraz!](https://nesquaeke.github.io/SmartShop-AI/) 👈**

---

*Made with ❤️ in Poland 🇵🇱* 