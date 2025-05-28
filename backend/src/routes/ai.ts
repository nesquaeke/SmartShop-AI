import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/ai/recommendations - Get AI recommendations
router.post('/recommendations', async (req: Request, res: Response) => {
  try {
    const { userId, shoppingHistory, currentList } = req.body;
    
    // Mock AI recommendations
    const recommendations = [
      {
        id: '1',
        type: 'product',
        title: 'Sugerujemy dodać:',
        message: 'Jajka - promocja w LIDL -25%',
        action: 'add_to_list',
        productId: '4',
        discount: 25,
        store: 'LIDL',
        priority: 'high'
      },
      {
        id: '2',
        type: 'route',
        title: 'Optymalna trasa:',
        message: '1. LIDL → 2. Biedronka → 3. Auchan',
        estimatedTime: 25,
        totalSavings: 2.30,
        priority: 'medium'
      },
      {
        id: '3',
        type: 'price_prediction',
        title: 'Prognoza cen:',
        message: 'Cena masła może wzrosnąć o 10% w przyszłym tygodniu',
        action: 'buy_now',
        productId: '3',
        predictedIncrease: 10,
        priority: 'low'
      }
    ];
    
    res.json({
      success: true,
      data: recommendations,
      message: 'AI recommendations generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating AI recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/ai/price-prediction - Get price predictions
router.post('/price-prediction', async (req: Request, res: Response) => {
  try {
    const { productId, timeframe = 7 } = req.body;
    
    // Mock price prediction
    const prediction = {
      productId,
      currentPrice: 3.49,
      predictedPrices: [
        { date: '2024-01-15', price: 3.49, confidence: 95 },
        { date: '2024-01-16', price: 3.52, confidence: 92 },
        { date: '2024-01-17', price: 3.45, confidence: 88 },
        { date: '2024-01-18', price: 3.39, confidence: 85 },
        { date: '2024-01-19', price: 3.42, confidence: 82 },
        { date: '2024-01-20', price: 3.38, confidence: 78 },
        { date: '2024-01-21', price: 3.35, confidence: 75 }
      ],
      trend: 'decreasing',
      recommendation: 'wait',
      potentialSavings: 0.14,
      confidence: 82
    };
    
    res.json({
      success: true,
      data: prediction,
      message: 'Price prediction generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating price prediction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as aiRouter }; 