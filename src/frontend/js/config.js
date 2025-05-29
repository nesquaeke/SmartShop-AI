// API Configuration - Simplified and optimized
const CONFIG = {
    // Environment detection
    IS_LOCAL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    IS_GITHUB_PAGES: window.location.hostname === 'nesquaeke.github.io',
    
    // API endpoints
    API_BASE_URL: null, // Will be set dynamically
    
    // Path configuration
    BASE_PATH: null, // Will be set dynamically
    
    // Initialize configuration
    init() {
        // Set API URL based on environment
        this.API_BASE_URL = this.IS_LOCAL 
            ? 'http://localhost:3001/api' 
            : 'https://smartshop-ai-backend-production.up.railway.app/api';
        
        // Set base path for assets
        this.BASE_PATH = this.IS_LOCAL ? './' : '/SmartShop-AI/';
        
        console.log(`🔧 Environment: ${this.IS_LOCAL ? 'Local' : 'Production'}`);
        console.log(`🌐 API URL: ${this.API_BASE_URL}`);
        console.log(`📁 Base Path: ${this.BASE_PATH}`);
    },
    
    // Get full asset path
    getAssetPath(path) {
        return this.BASE_PATH + path.replace(/^\.?\/?/, '');
    },
    
    // API endpoints
    ENDPOINTS: {
        PRODUCTS: '/products',
        SEARCH: '/products/search',
        RECOMMENDATIONS: '/recommendations',
        OPTIMIZE: '/ai/optimize',
        HEALTH: '/health'
    }
};

// Initialize configuration immediately
CONFIG.init();

// API helper functions - Simplified with better error handling
window.API = {
    async request(endpoint, options = {}) {
        const url = CONFIG.API_BASE_URL + endpoint;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            
            // Return fallback data for critical endpoints
            if (endpoint.includes('/products')) {
                return this.getFallbackProducts();
            }
            
            throw error;
        }
    },
    
    async get(endpoint, params = {}) {
        const url = new URL(CONFIG.API_BASE_URL + endpoint);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        return this.request(endpoint, { method: 'GET' });
    },
    
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // Fallback data when API is unavailable
    getFallbackProducts() {
        return {
            products: [
                {
                    id: '1',
                    name: 'Chleb pszenny',
                    price: 2.49,
                    store: 'Biedronka',
                    category: 'Pieczywo',
                    description: 'Świeży chleb pszenny'
                },
                {
                    id: '2',
                    name: 'Mleko 3.2%',
                    price: 3.29,
                    store: 'LIDL',
                    category: 'Nabiał',
                    description: 'Mleko świeże 1L'
                },
                {
                    id: '3',
                    name: 'Kurczak filet',
                    price: 12.99,
                    store: 'Auchan',
                    category: 'Mięso',
                    description: 'Filet z kurczaka 1kg'
                }
            ],
            total: 3,
            message: 'Używane są dane demonstracyjne - backend niedostępny'
        };
    }
};

// Global configuration access
window.CONFIG = CONFIG; 