import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// AI Engine base URL
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// Interface definitions
interface ShoppingItem {
  product_id: string;
  quantity: number;
  max_price?: number;
}

interface ShoppingList {
  items: ShoppingItem[];
  budget?: number;
  preferred_stores?: string[];
}

interface UserPreferences {
  categories?: string[];
  max_price?: number;
  brands?: string[];
  dietary_restrictions?: string[];
}

// POST /api/ai/optimize-basket - Optimize shopping basket
router.post('/optimize-basket', async (req: Request, res: Response) => {
  try {
    const shoppingList: ShoppingList = req.body;
    
    // Validate request
    if (!shoppingList.items || shoppingList.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Shopping list cannot be empty'
      });
    }
    
    // Call AI Engine
    const response = await axios.post(`${AI_ENGINE_URL}/optimize-basket`, shoppingList, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🤖 AI Optimization completed:', response.data);
    
    res.json({
      success: true,
      data: response.data,
      message: 'Shopping basket optimized successfully'
    });
    
  } catch (error) {
    console.error('❌ AI optimization error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          message: 'AI Engine is not available. Please try again later.',
          error: 'Service unavailable'
        });
      }
      
      return res.status(error.response?.status || 500).json({
        success: false,
        message: 'AI optimization failed',
        error: error.response?.data?.detail || error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during optimization',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/ai/predict-prices - Get price predictions
router.post('/predict-prices', async (req: Request, res: Response) => {
  try {
    const { product_ids } = req.body;
    
    if (!product_ids || !Array.isArray(product_ids)) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required'
      });
    }
    
    const response = await axios.post(`${AI_ENGINE_URL}/predict-prices`, product_ids, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🔮 Price predictions generated for', product_ids.length, 'products');
    
    res.json({
      success: true,
      data: response.data,
      message: `Price predictions generated for ${product_ids.length} products`
    });
    
  } catch (error) {
    console.error('❌ Price prediction error:', error);
    
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI Engine is not available',
        error: 'Service unavailable'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Price prediction failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/ai/recommendations - Get personalized recommendations
router.post('/recommendations', async (req: Request, res: Response) => {
  try {
    const userPreferences: UserPreferences = req.body;
    
    const response = await axios.post(`${AI_ENGINE_URL}/recommendations`, userPreferences, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('💡 Personalized recommendations generated');
    
    res.json({
      success: true,
      data: response.data,
      message: 'Personalized recommendations generated'
    });
    
  } catch (error) {
    console.error('❌ Recommendations error:', error);
    
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI Engine is not available',
        error: 'Service unavailable'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Recommendations generation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/ai/market-trends - Get market trend analytics
router.get('/market-trends', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${AI_ENGINE_URL}/analytics/market-trends`, {
      timeout: 10000
    });
    
    console.log('📊 Market trends data retrieved');
    
    res.json({
      success: true,
      data: response.data,
      message: 'Market trends retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Market trends error:', error);
    
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI Engine is not available',
        error: 'Service unavailable'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve market trends',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/ai/health - Check AI Engine health
router.get('/health', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${AI_ENGINE_URL}/`, {
      timeout: 5000
    });
    
    res.json({
      success: true,
      ai_engine: response.data,
      message: 'AI Engine is healthy'
    });
    
  } catch (error) {
    console.error('❌ AI Engine health check failed:', error);
    
    res.status(503).json({
      success: false,
      message: 'AI Engine is not available',
      error: error instanceof Error ? error.message : 'Connection failed'
    });
  }
});

// POST /api/ai/smart-search - AI-powered product search
router.post('/smart-search', async (req: Request, res: Response) => {
  try {
    const { query, filters } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // For now, implement basic search with AI-like scoring
    // In future, this would call AI Engine for semantic search
    const mockResults = {
      query: query,
      results: [
        {
          product_id: "1",
          name: "Mleko UHT 3.2% 1L Łaciate",
          relevance_score: 0.95,
          reason: "Exact match for 'mleko'"
        },
        {
          product_id: "13", 
          name: "Kawa Mielona 250g Jacobs",
          relevance_score: 0.87,
          reason: "Popular product in beverages"
        }
      ],
      suggestions: [
        "Try searching for 'mleko łaciate' for more specific results",
        "Consider alternatives like 'mleko bezlaktozowe'"
      ]
    };
    
    console.log('🔍 Smart search performed for:', query);
    
    res.json({
      success: true,
      data: mockResults,
      message: `Smart search completed for "${query}"`
    });
    
  } catch (error) {
    console.error('❌ Smart search error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Smart search failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as aiRouter }; 