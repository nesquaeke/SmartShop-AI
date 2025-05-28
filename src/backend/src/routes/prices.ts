import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/prices/compare/:productId - Compare prices for a product
router.get('/compare/:productId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    
    // Mock price comparison data
    const mockPriceData: { [key: string]: any } = {
      '1': {
        productId: '1',
        productName: 'Mleko UHT 3.2% 1L',
        prices: [
          { 
            store: 'LIDL', 
            price: 3.49, 
            isLowest: true, 
            discount: 0.7,
            lastUpdated: new Date().toISOString(),
            inStock: true
          },
          { 
            store: 'Biedronka', 
            price: 3.99, 
            isLowest: false, 
            discount: 0.2,
            lastUpdated: new Date().toISOString(),
            inStock: true,
            promotion: 'Promocja do 15.12'
          },
          { 
            store: 'Auchan', 
            price: 4.19, 
            isLowest: false, 
            discount: 0,
            lastUpdated: new Date().toISOString(),
            inStock: true,
            availability: 'online'
          }
        ],
        priceHistory: [
          { date: '2024-01-10', LIDL: 3.59, Biedronka: 4.09, Auchan: 4.29 },
          { date: '2024-01-11', LIDL: 3.55, Biedronka: 4.05, Auchan: 4.25 },
          { date: '2024-01-12', LIDL: 3.52, Biedronka: 4.02, Auchan: 4.22 },
          { date: '2024-01-13', LIDL: 3.49, Biedronka: 3.99, Auchan: 4.19 }
        ],
        trend: 'decreasing',
        maxSavings: 0.7,
        avgPrice: 3.89
      },
      '2': {
        productId: '2',
        productName: 'Chleb Żytni 500g',
        prices: [
          { 
            store: 'Biedronka', 
            price: 2.89, 
            isLowest: true, 
            discount: 0.6,
            lastUpdated: new Date().toISOString(),
            inStock: true
          },
          { 
            store: 'LIDL', 
            price: 3.19, 
            isLowest: false, 
            discount: 0.3,
            lastUpdated: new Date().toISOString(),
            inStock: true
          },
          { 
            store: 'Auchan', 
            price: 3.49, 
            isLowest: false, 
            discount: 0,
            lastUpdated: new Date().toISOString(),
            inStock: true
          }
        ],
        trend: 'stable',
        maxSavings: 0.6,
        avgPrice: 3.19
      }
    };
    
    const priceData = productId ? mockPriceData[productId] : undefined;
    
    if (!priceData) {
      res.status(404).json({
        success: false,
        message: 'Price data not found for this product'
      });
      return;
    }
    
    res.json({
      success: true,
      data: priceData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching price comparison',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/prices/history/:productId - Get price history for a product
router.get('/history/:productId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { days = 30 } = req.query;
    
    // Mock price history data
    const history = Array.from({ length: Number(days) }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      return {
        date: date.toISOString().split('T')[0],
        LIDL: 3.49 + (Math.random() - 0.5) * 0.2,
        Biedronka: 3.99 + (Math.random() - 0.5) * 0.3,
        Auchan: 4.19 + (Math.random() - 0.5) * 0.25
      };
    }).reverse();
    
    res.json({
      success: true,
      data: {
        productId,
        history,
        period: `${days} days`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching price history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/prices/alerts - Get price alerts
router.get('/alerts', async (req: Request, res: Response): Promise<void> => {
  try {
    const alerts = [
      {
        id: '1',
        productId: '1',
        productName: 'Mleko UHT 3.2% 1L',
        targetPrice: 3.30,
        currentPrice: 3.49,
        store: 'LIDL',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        productId: '3',
        productName: 'Masło Extra 200g',
        targetPrice: 4.80,
        currentPrice: 4.99,
        store: 'Auchan',
        status: 'triggered',
        triggeredAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching price alerts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as pricesRouter }; 