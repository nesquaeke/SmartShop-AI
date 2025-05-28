import { Router, Request, Response } from 'express';
import LidlScraper from '../scrapers/lidl-scraper';

const router = Router();

// POST /api/scraper/run - Trigger price scraping
router.post('/run', async (req: Request, res: Response) => {
  try {
    const { stores = ['LIDL', 'Biedronka', 'Auchan'], categories = ['all'], realScraping = false } = req.body;
    
    if (realScraping) {
      console.log('🔄 Starting REAL scraping process...');
      
      const results = [];
      let totalProductsScraped = 0;
      let newPrices = 0;
      let updatedPrices = 0;
      
      // Real LIDL scraping
      if (stores.includes('LIDL')) {
        const lidlScraper = new LidlScraper();
        try {
          const lidlProducts = await lidlScraper.scrapeProducts();
          totalProductsScraped += lidlProducts.length;
          newPrices += lidlProducts.length;
          
          results.push({
            store: 'LIDL',
            status: 'success',
            productsScraped: lidlProducts.length,
            newPrices: lidlProducts.length,
            updatedPrices: 0,
            duration: 45,
            products: lidlProducts.slice(0, 10) // Show first 10 products as sample
          });
        } catch (error) {
          results.push({
            store: 'LIDL',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            productsScraped: 0,
            newPrices: 0,
            updatedPrices: 0,
            duration: 0
          });
        }
      }
      
      // Mock data for other stores (Biedronka, Auchan not implemented yet)
      stores.forEach((store: string) => {
        if (store !== 'LIDL') {
          const mockCount = Math.floor(Math.random() * 200) + 300;
          totalProductsScraped += mockCount;
          newPrices += Math.floor(mockCount * 0.7);
          updatedPrices += Math.floor(mockCount * 0.3);
          
          results.push({
            store: store,
            status: 'mock',
            productsScraped: mockCount,
            newPrices: Math.floor(mockCount * 0.7),
            updatedPrices: Math.floor(mockCount * 0.3),
            duration: Math.floor(Math.random() * 30) + 30,
            note: 'Real scraper not implemented yet - using mock data'
          });
        }
      });
      
      const scrapingResults = {
        timestamp: new Date().toISOString(),
        stores: stores,
        categories: categories,
        totalProductsScraped,
        newPrices,
        updatedPrices,
        results,
        isRealScraping: true
      };
      
      res.json({
        success: true,
        data: scrapingResults,
        message: 'Real price scraping completed (LIDL real, others mock)'
      });
      
    } else {
      // Mock scraping results (original behavior)
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
        ],
        isRealScraping: false
      };
      
      res.json({
        success: true,
        data: scrapingResults,
        message: 'Mock price scraping completed successfully'
      });
    }
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
      },
      availableScrapers: {
        LIDL: 'active',
        Biedronka: 'planned',
        Auchan: 'planned'
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

// POST /api/scraper/test-lidl - Test LIDL scraper directly
router.post('/test-lidl', async (req: Request, res: Response) => {
  try {
    console.log('🧪 Testing LIDL scraper...');
    
    const lidlScraper = new LidlScraper();
    const startTime = Date.now();
    
    const products = await lidlScraper.scrapeProducts();
    const duration = Date.now() - startTime;
    
    res.json({
      success: true,
      data: {
        store: 'LIDL',
        productsFound: products.length,
        duration: Math.round(duration / 1000),
        timestamp: new Date().toISOString(),
        sampleProducts: products.slice(0, 5)
      },
      message: `LIDL scraper test completed - found ${products.length} products`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'LIDL scraper test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as scraperRouter }; 