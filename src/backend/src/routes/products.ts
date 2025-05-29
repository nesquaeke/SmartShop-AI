import express from 'express';
import { PrismaClient } from '@prisma/client';
import { LidlScraper } from '../scrapers/lidl-scraper';

const router = express.Router();
const prisma = new PrismaClient();

// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
let productCache: any = null;
let cacheTimestamp = 0;

// Enhanced mock data for fallback
const MOCK_PRODUCTS = [
    {
        id: '1',
        name: 'Chleb pszenny',
        price: 2.49,
        store: 'Biedronka',
        category: 'Pieczywo',
        description: 'Świeży chleb pszenny, 500g',
        image: 'https://via.placeholder.com/200x150',
        available: true
    },
    {
        id: '2', 
        name: 'Mleko UHT 3.2%',
        price: 3.29,
        store: 'LIDL',
        category: 'Nabiał',
        description: 'Mleko UHT 3.2% tłuszczu, 1L',
        image: 'https://via.placeholder.com/200x150',
        available: true
    },
    {
        id: '3',
        name: 'Filet z kurczaka',
        price: 12.99,
        store: 'Auchan',
        category: 'Mięso',
        description: 'Świeży filet z kurczaka, 1kg',
        image: 'https://via.placeholder.com/200x150',
        available: true
    },
    {
        id: '4',
        name: 'Banany',
        price: 4.99,
        store: 'Biedronka',
        category: 'Owoce',
        description: 'Świeże banany, 1kg',
        image: 'https://via.placeholder.com/200x150',
        available: true
    },
    {
        id: '5',
        name: 'Pomidory',
        price: 6.99,
        store: 'Netto',
        category: 'Warzywa',
        description: 'Świeże pomidory, 1kg',
        image: 'https://via.placeholder.com/200x150',
        available: true
    },
    {
        id: '6',
        name: 'Jogurt naturalny',
        price: 2.79,
        store: 'LIDL',
        category: 'Nabiał',
        description: 'Jogurt naturalny, 400g',
        image: 'https://via.placeholder.com/200x150',
        available: true
    },
    {
        id: '7',
        name: 'Masło extra',
        price: 5.49,
        store: 'Carrefour',
        category: 'Nabiał',
        description: 'Masło extra 82% tłuszczu, 200g',
        image: 'https://via.placeholder.com/200x150',
        available: true
    },
    {
        id: '8',
        name: 'Ryż długoziarnisty',
        price: 3.99,
        store: 'Auchan',
        category: 'Podstawowe',
        description: 'Ryż długoziarnisty, 1kg',
        image: 'https://via.placeholder.com/200x150',
        available: true
    }
];

/**
 * Check if cache is still valid
 */
function isCacheValid(): boolean {
    return productCache && (Date.now() - cacheTimestamp) < CACHE_DURATION;
}

/**
 * Get cached or fresh products
 */
async function getProducts(): Promise<any[]> {
    // Return cached data if valid
    if (isCacheValid()) {
        console.log('📦 Using cached product data');
        return productCache;
    }

    console.log('🔄 Refreshing product data...');
    
    try {
        // Try to get fresh data from scraper with timeout
        const scrapedProducts = await Promise.race([
            getScrapedProducts(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Scraping timeout')), 15000)
            )
        ]) as any[];

        if (scrapedProducts && scrapedProducts.length > 0) {
            productCache = scrapedProducts;
            cacheTimestamp = Date.now();
            console.log(`✅ Successfully loaded ${scrapedProducts.length} products`);
            return productCache;
        }
    } catch (error) {
        console.warn('⚠️ Scraping failed, using fallback data:', (error as Error).message);
    }

    // Use fallback data
    productCache = MOCK_PRODUCTS;
    cacheTimestamp = Date.now();
    console.log('📋 Using fallback product data');
    return productCache;
}

/**
 * Scrape products with improved error handling
 */
async function getScrapedProducts(): Promise<any[]> {
    const scraper = new LidlScraper();
    const products: any[] = [];

    try {
        console.log('🕷️ Starting product scraping...');
        const lidlProducts = await scraper.scrapeProducts();
        
        if (lidlProducts && lidlProducts.length > 0) {
            products.push(...lidlProducts.map((product: any) => ({
                ...product,
                store: 'LIDL',
                available: true
            })));
        }

        // Add some mock products from other stores for variety
        products.push(...MOCK_PRODUCTS.filter(p => p.store !== 'LIDL'));

        return products;
    } catch (error) {
        console.error('❌ Scraping error:', (error as Error).message);
        throw error;
    }
}

/**
 * GET /products - Get all products
 */
router.get('/', async (req, res) => {
    try {
        const products = await getProducts();
        
        res.json({
            success: true,
            products: products,
            total: products.length,
            cached: isCacheValid(),
            message: products === MOCK_PRODUCTS ? 
                'Używane są dane demonstracyjne - scraping niedostępny' : 
                'Produkty załadowane pomyślnie'
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: 'Błąd podczas pobierania produktów',
            products: MOCK_PRODUCTS,
            total: MOCK_PRODUCTS.length
        });
    }
});

/**
 * GET /products/search - Search products
 */
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Brak zapytania wyszukiwania'
            });
        }

        const products = await getProducts();
        const searchTerm = q.toLowerCase().trim();
        
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.store.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );

        res.json({
            success: true,
            products: filteredProducts,
            total: filteredProducts.length,
            query: q,
            message: `Znaleziono ${filteredProducts.length} produktów dla "${q}"`
        });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({
            success: false,
            error: 'Błąd podczas wyszukiwania produktów'
        });
    }
});

/**
 * GET /products/:id - Get single product
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const products = await getProducts();
        
        const product = products.find(p => p.id === id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Produkt nie został znaleziony'
            });
        }

        res.json({
            success: true,
            product: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            error: 'Błąd podczas pobierania produktu'
        });
    }
});

/**
 * POST /products/refresh - Force refresh cache
 */
router.post('/refresh', async (req, res) => {
    try {
        console.log('🔄 Force refreshing product data...');
        
        // Clear cache
        productCache = null;
        cacheTimestamp = 0;
        
        // Get fresh data
        const products = await getProducts();
        
        res.json({
            success: true,
            products: products,
            total: products.length,
            message: 'Cache odświeżony pomyślnie'
        });
    } catch (error) {
        console.error('Error refreshing products:', error);
        res.status(500).json({
            success: false,
            error: 'Błąd podczas odświeżania cache'
        });
    }
});

/**
 * GET /products/categories - Get available categories
 */
router.get('/categories', async (req, res) => {
    try {
        const products = await getProducts();
        const categories = [...new Set(products.map(p => p.category))].sort();
        
        res.json({
            success: true,
            categories: categories,
            total: categories.length
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: 'Błąd podczas pobierania kategorii'
        });
    }
});

/**
 * GET /products/stores - Get available stores
 */
router.get('/stores', async (req, res) => {
    try {
        const products = await getProducts();
        const stores = [...new Set(products.map(p => p.store))].sort();
        
        res.json({
            success: true,
            stores: stores,
            total: stores.length
        });
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({
            success: false,
            error: 'Błąd podczas pobierania sklepów'
        });
    }
});

export default router; 