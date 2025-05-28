import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/scraper/run - Trigger price scraping
router.post('/run', async (req: Request, res: Response) => {
  try {
    const { stores = ['LIDL', 'Biedronka', 'Auchan'], categories = ['all'] } = req.body;
    
    // Mock scraping results
    const scrapingResults = {
      timestamp: new Date().toISOString(),
      stores: stores,
      categories: categories,
      totalProductsScraped: 1247,
      newPrices: 892,
      updatedPrices: 355,
      results: [
        {
          store: 'LIDL',
          status: 'success',
          productsScraped: 423,
          newPrices: 298,
          updatedPrices: 125,
          duration: 45
        },
        {
          store: 'Biedronka',
          status: 'success',
          productsScraped: 456,
          newPrices: 321,
          updatedPrices: 135,
          duration: 52
        },
        {
          store: 'Auchan',
          status: 'success',
          productsScraped: 368,
          newPrices: 273,
          updatedPrices: 95,
          duration: 38
        }
      ]
    };
    
    res.json({
      success: true,
      data: scrapingResults,
      message: 'Price scraping completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error running price scraper',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/scraper/status - Get scraping status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = {
      isRunning: false,
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      nextScheduledRun: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      totalProductsInDatabase: 4832,
      lastUpdateCounts: {
        LIDL: 423,
        Biedronka: 456,
        Auchan: 368
      }
    };
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting scraper status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as scraperRouter }; 