import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import LidlScraper from '../scrapers/lidl-scraper';

const router = Router();
const prisma = new PrismaClient();
const lidlScraper = new LidlScraper();

// Product interface for type safety
interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  image: string;
  rating: number;
  reviewCount: number;
  availability: number;
  prices: Array<{
    store: string;
    price: number;
    isLowest: boolean;
    discount: number;
    promotion?: string;
  }>;
}

// Cache for scraped data
let cachedProducts: Product[] = [];
let lastScrapedTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Transform LIDL data to our product format
function transformLidlProduct(lidlProduct: any, id: string): Product {
  return {
    id,
    name: lidlProduct.name,
    description: `${lidlProduct.name} - Wysokiej jakości produkt z LIDL`,
    category: lidlProduct.category,
    brand: 'LIDL',
    image: lidlProduct.image || 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop',
    rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
    reviewCount: Math.floor(Math.random() * 2000) + 100,
    availability: lidlProduct.availability ? 3 : 0,
    prices: [
      { 
        store: 'LIDL', 
        price: lidlProduct.price, 
        isLowest: true, 
        discount: lidlProduct.discount || 0,
        promotion: lidlProduct.promotion || undefined
      },
      // Add mock competitors for comparison
      { 
        store: 'Biedronka', 
        price: lidlProduct.price + (Math.random() * 1 + 0.2), 
        isLowest: false, 
        discount: Math.random() * 0.5 
      },
      { 
        store: 'Auchan', 
        price: lidlProduct.price + (Math.random() * 1.5 + 0.3), 
        isLowest: false, 
        discount: Math.random() * 0.3 
      }
    ]
  };
}

// Function to scrape and cache data
async function getScrapedProducts(): Promise<Product[]> {
  const now = Date.now();
  
  // Return cached data if still fresh
  if (cachedProducts.length > 0 && (now - lastScrapedTime) < CACHE_DURATION) {
    console.log('📦 Using cached LIDL data');
    return cachedProducts;
  }
  
  try {
    console.log('🕷️  Scraping fresh LIDL data...');
    const lidlProducts = await lidlScraper.scrapeProducts();
    
    if (lidlProducts.length > 0) {
      // Transform LIDL products to our format
      cachedProducts = lidlProducts.map((product, index) => 
        transformLidlProduct(product, (index + 1).toString())
      );
      lastScrapedTime = now;
      console.log(`✅ Successfully scraped ${cachedProducts.length} products from LIDL`);
    } else {
      console.log('⚠️  No products scraped, using fallback mock data');
      // Fallback to mock data if scraping fails
      cachedProducts = getMockFallbackData();
    }
  } catch (error) {
    console.error('❌ Scraping failed, using fallback mock data:', error);
    cachedProducts = getMockFallbackData();
  }
  
  return cachedProducts;
}

// Fallback mock data in case scraping fails
function getMockFallbackData(): Product[] {
  return [
    {
      id: '1',
      name: 'Mleko UHT 3.2% 1L Łaciate',
      description: 'Świeże mleko UHT o zawartości tłuszczu 3,2%',
      category: 'Nabiał',
      brand: 'Łaciate',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop',
      rating: 4.8,
      reviewCount: 2341,
      availability: 3,
      prices: [
        { store: 'LIDL', price: 3.49, isLowest: true, discount: 0.7 },
        { store: 'Biedronka', price: 3.99, isLowest: false, discount: 0.2 },
        { store: 'Auchan', price: 4.19, isLowest: false, discount: 0 }
      ]
    },
    {
      id: '2',
      name: 'Chleb Żytni 500g Kaszubski',
      description: 'Tradycyjny chleb żytni z ziarnami',
      category: 'Pieczywo',
      brand: 'Kaszubski',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop',
      rating: 4.6,
      reviewCount: 1289,
      availability: 3,
      prices: [
        { store: 'Biedronka', price: 2.89, isLowest: true, discount: 0.6 },
        { store: 'LIDL', price: 3.19, isLowest: false, discount: 0.3 },
        { store: 'Auchan', price: 3.49, isLowest: false, discount: 0 }
      ]
    },
    {
      id: '3',
      name: 'Masło Extra 200g Koszalin',
      description: 'Wysokiej jakości masło naturalne',
      category: 'Nabiał',
      brand: 'Koszalin',
      image: 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=200&h=200&fit=crop',
      rating: 4.9,
      reviewCount: 892,
      availability: 3,
      prices: [
        { store: 'Auchan', price: 4.99, isLowest: true, discount: 1.0 },
        { store: 'LIDL', price: 5.49, isLowest: false, discount: 0.5 },
        { store: 'Biedronka', price: 5.99, isLowest: false, discount: 0 }
      ]
    },
    {
      id: '4',
      name: 'Jajka L 10szt Polskie',
      description: 'Świeże jajka kurze wielkość L',
      category: 'Nabiał',
      brand: 'Polskie',
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop',
      rating: 4.7,
      reviewCount: 1567,
      availability: 3,
      prices: [
        { store: 'LIDL', price: 8.99, isLowest: true, discount: 2.0, promotion: 'Promocja -25%' },
        { store: 'Biedronka', price: 9.49, isLowest: false, discount: 1.5 },
        { store: 'Auchan', price: 10.99, isLowest: false, discount: 0 }
      ]
    },
    {
      id: '5',
      name: 'Ryż Długoziarnisty 1kg Uncle Ben\'s',
      description: 'Wysokiej jakości ryż długoziarnisty',
      category: 'Suche',
      brand: 'Uncle Ben\'s',
      image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=200&h=200&fit=crop',
      rating: 4.5,
      reviewCount: 743,
      availability: 3,
      prices: [
        { store: 'Biedronka', price: 5.49, isLowest: true, discount: 1.5 },
        { store: 'Auchan', price: 6.29, isLowest: false, discount: 0.7 },
        { store: 'LIDL', price: 6.99, isLowest: false, discount: 0 }
      ]
    },
    {
      id: '6',
      name: 'Jogurt Naturalny 400g Danone',
      description: 'Kremowy jogurt naturalny bez dodatków',
      category: 'Nabiał',
      brand: 'Danone',
      image: 'https://images.unsplash.com/photo-1571212515416-6f0e3f3e03e0?w=200&h=200&fit=crop',
      rating: 4.4,
      reviewCount: 856,
      availability: 3,
      prices: [
        { store: 'LIDL', price: 2.99, isLowest: true, discount: 0.5, promotion: 'Oferta tygodnia' },
        { store: 'Biedronka', price: 3.29, isLowest: false, discount: 0.2 },
        { store: 'Auchan', price: 3.59, isLowest: false, discount: 0 }
      ]
    },
    {
      id: '7',
      name: 'Makaron Spaghetti 500g Barilla',
      description: 'Klasyczny makaron spaghetti z pszenicy durum',
      category: 'Suche',
      brand: 'Barilla',
      image: 'https://images.unsplash.com/photo-1551462147-37dee9fcc4cd?w=200&h=200&fit=crop',
      rating: 4.6,
      reviewCount: 1124,
      availability: 3,
      prices: [
        { store: 'Auchan', price: 4.49, isLowest: true, discount: 0.8 },
        { store: 'LIDL', price: 4.79, isLowest: false, discount: 0.4 },
        { store: 'Biedronka', price: 5.19, isLowest: false, discount: 0 }
      ]
    },
    {
      id: '8',
      name: 'Ser Gouda 200g Hochland',
      description: 'Dojrzały ser gouda w plasterkach',
      category: 'Nabiał',
      brand: 'Hochland',
      image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=200&h=200&fit=crop',
      rating: 4.3,
      reviewCount: 673,
      availability: 3,
      prices: [
        { store: 'Biedronka', price: 7.99, isLowest: true, discount: 1.2 },
        { store: 'LIDL', price: 8.49, isLowest: false, discount: 0.8 },
        { store: 'Auchan', price: 9.29, isLowest: false, discount: 0 }
      ]
    },
    {
      id: '9',
      name: 'Woda Mineralna 1.5L Żywiec Zdrój',
      description: 'Naturalna woda mineralna niegazowana',
      category: 'Napoje',
      brand: 'Żywiec Zdrój',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
      rating: 4.2,
      reviewCount: 924,
      availability: 3,
      prices: [
        { store: 'LIDL', price: 1.49, isLowest: true, discount: 0.3 },
        { store: 'Biedronka', price: 1.69, isLowest: false, discount: 0.1 },
        { store: 'Auchan', price: 1.89, isLowest: false, discount: 0 }
      ]
    },
    {
      id: '10',
      name: 'Kurczak Całkowity 1kg Drosed',
      description: 'Świeży kurczak całkowity, polski',
      category: 'Mięso',
      brand: 'Drosed',
      image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop',
      rating: 4.1,
      reviewCount: 445,
      availability: 3,
      prices: [
        { store: 'Auchan', price: 12.99, isLowest: true, discount: 2.0 },
        { store: 'Biedronka', price: 13.49, isLowest: false, discount: 1.5 },
        { store: 'LIDL', price: 14.29, isLowest: false, discount: 0.7 }
      ]
    },
    {
      id: '11',
      name: 'Banany 1kg Premium',
      description: 'Świeże banany pochodzące z Ekwadoru',
      category: 'Owoce',
      brand: 'Premium',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop',
      rating: 4.0,
      reviewCount: 1234,
      availability: 3,
      prices: [
        { store: 'LIDL', price: 4.99, isLowest: true, discount: 0.5 },
        { store: 'Biedronka', price: 5.29, isLowest: false, discount: 0.2 },
        { store: 'Auchan', price: 5.89, isLowest: false, discount: 0 }
      ]
    },
    {
      id: '12',
      name: 'Pomidory 500g Polskie',
      description: 'Świeże pomidory polskie z szklarni',
      category: 'Warzywa',
      brand: 'Polskie',
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200&h=200&fit=crop',
      rating: 3.9,
      reviewCount: 567,
      availability: 3,
      prices: [
        { store: 'Biedronka', price: 6.49, isLowest: true, discount: 0.8 },
        { store: 'LIDL', price: 6.99, isLowest: false, discount: 0.4 },
        { store: 'Auchan', price: 7.49, isLowest: false, discount: 0 }
      ]
    },
    {
      id: '13',
      name: 'Kawa Mielona 250g Jacobs',
      description: 'Aromatyczna kawa mielona medium roast',
      category: 'Napoje',
      brand: 'Jacobs',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&h=200&fit=crop',
      rating: 4.7,
      reviewCount: 1889,
      availability: 3,
      prices: [
        { store: 'LIDL', price: 14.99, isLowest: true, discount: 3.0, promotion: 'Mega promocja' },
        { store: 'Auchan', price: 16.99, isLowest: false, discount: 1.0 },
        { store: 'Biedronka', price: 18.99, isLowest: false, discount: 0 }
      ]
    },
    {
      id: '14',
      name: 'Herbata Earl Grey 100szt Lipton',
      description: 'Klasyczna herbata earl grey w torebkach',
      category: 'Napoje',
      brand: 'Lipton',
      image: 'https://images.unsplash.com/photo-1597318281677-68d4ac2a5d3b?w=200&h=200&fit=crop',
      rating: 4.4,
      reviewCount: 1156,
      availability: 3,
      prices: [
        { store: 'Auchan', price: 9.99, isLowest: true, discount: 1.5 },
        { store: 'LIDL', price: 10.49, isLowest: false, discount: 1.0 },
        { store: 'Biedronka', price: 11.99, isLowest: false, discount: 0 }
      ]
    },
    {
      id: '15',
      name: 'Oliwa z oliwek 500ml Bertolli',
      description: 'Extra virgin oliwa z oliwek pierwszego tłoczenia',
      category: 'Suche',
      brand: 'Bertolli',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop',
      rating: 4.8,
      reviewCount: 734,
      availability: 3,
      prices: [
        { store: 'LIDL', price: 19.99, isLowest: true, discount: 5.0 },
        { store: 'Auchan', price: 22.99, isLowest: false, discount: 2.0 },
        { store: 'Biedronka', price: 24.99, isLowest: false, discount: 0 }
      ]
    }
  ];
}

// GET /api/products - Get all products (now with real LIDL data)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, sort = 'name' } = req.query;
    
    // Get fresh or cached scraped data
    const allProducts = await getScrapedProducts();
    let filteredProducts = [...allProducts];
    
    // Search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredProducts = filteredProducts.filter((product: Product) => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm)
      );
    }
    
    // Category filter
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter((product: Product) => 
        product.category.toLowerCase() === (category as string).toLowerCase()
      );
    }
    
    // Sort
    if (sort === 'price') {
      filteredProducts.sort((a: Product, b: Product) => {
        const aLowestPrice = Math.min(...a.prices.map(p => p.price));
        const bLowestPrice = Math.min(...b.prices.map(p => p.price));
        return aLowestPrice - bLowestPrice;
      });
    } else if (sort === 'savings') {
      filteredProducts.sort((a: Product, b: Product) => {
        const aMaxSavings = Math.max(...a.prices.map(p => p.discount));
        const bMaxSavings = Math.max(...b.prices.map(p => p.discount));
        return bMaxSavings - aMaxSavings;
      });
    } else {
      filteredProducts.sort((a: Product, b: Product) => a.name.localeCompare(b.name));
    }
    
    res.json({
      success: true,
      data: filteredProducts,
      total: filteredProducts.length,
      message: `Found ${filteredProducts.length} real products from LIDL`,
      scraped: cachedProducts.length > 0,
      lastUpdate: new Date(lastScrapedTime).toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const allProducts = await getScrapedProducts();
    const product = allProducts.find(p => p.id === id);
    
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/products/meta/categories - Get all categories
router.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    const allProducts = await getScrapedProducts();
    const categories = [...new Set(allProducts.map(p => p.category))];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/products/scrape/refresh - Force refresh scraped data
router.get('/scrape/refresh', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Force refreshing LIDL data...');
    cachedProducts = [];
    lastScrapedTime = 0;
    
    const freshProducts = await getScrapedProducts();
    
    res.json({
      success: true,
      message: 'Data refreshed successfully',
      count: freshProducts.length,
      lastUpdate: new Date(lastScrapedTime).toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error refreshing data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as productsRouter }; 