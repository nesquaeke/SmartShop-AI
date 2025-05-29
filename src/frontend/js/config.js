// API Configuration
const API_CONFIG = {
    // Development için localhost, production için Railway URL
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3001/api' 
        : 'https://smartshop-ai-backend-production.up.railway.app/api',
    
    // API endpoints
    ENDPOINTS: {
        PRODUCTS: '/products',
        SEARCH: '/products/search',
        RECOMMENDATIONS: '/recommendations',
        OPTIMIZE: '/ai/optimize',
        HEALTH: '/health'
    }
};

// Path configuration for GitHub Pages vs localhost
const PATH_CONFIG = {
    BASE_PATH: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? '/' 
        : '/SmartShop-AI/',
    
    getAssetPath(path) {
        return this.BASE_PATH + path.replace(/^\//, '');
    }
};

// API helper fonksiyonları
window.API = {
    async get(endpoint, params = {}) {
        const url = new URL(API_CONFIG.BASE_URL + endpoint);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    },
    
    async post(endpoint, data = {}) {
        const response = await fetch(API_CONFIG.BASE_URL + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }
};

// Global PATH_CONFIG'i window'a ekle
window.PATH_CONFIG = PATH_CONFIG; 