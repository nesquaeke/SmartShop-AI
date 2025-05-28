import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Mock data for immediate functionality
const mockProducts = [
  {
    id: '1',
    name: 'Mleko UHT 3.2% 1L',
    description: 'Łaciate, świeże mleko UHT',
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
    name: 'Chleb Żytni 500g',
    description: 'Tradycyjny chleb żytni',
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
    name: 'Masło Extra 200g',
    description: 'Wysokiej jakości masło',
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
    name: 'Jajka L 10szt',
    description: 'Świeże jajka kurze',
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
    name: 'Ryż Długoziarnisty 1kg',
    description: 'Wysokiej jakości ryż',
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
  }
];

// GET /api/products - Get all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, sort = 'name' } = req.query;
    
    let filteredProducts = [...mockProducts];
    
    // Search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm)
      );
    }
    
    // Category filter
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === (category as string).toLowerCase()
      );
    }
    
    // Sort
    if (sort === 'price') {
      filteredProducts.sort((a, b) => {
        const aLowestPrice = Math.min(...a.prices.map(p => p.price));
        const bLowestPrice = Math.min(...b.prices.map(p => p.price));
        return aLowestPrice - bLowestPrice;
      });
    } else if (sort === 'savings') {
      filteredProducts.sort((a, b) => {
        const aMaxSavings = Math.max(...a.prices.map(p => p.discount));
        const bMaxSavings = Math.max(...b.prices.map(p => p.discount));
        return bMaxSavings - aMaxSavings;
      });
    } else {
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    res.json({
      success: true,
      data: filteredProducts,
      total: filteredProducts.length,
      message: `Found ${filteredProducts.length} products`
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
    const product = mockProducts.find(p => p.id === id);
    
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

// GET /api/products/categories - Get all categories
router.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    const categories = [...new Set(mockProducts.map(p => p.category))];
    
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

export { router as productsRouter }; 