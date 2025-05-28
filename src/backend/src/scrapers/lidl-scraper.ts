import puppeteer from 'puppeteer';

interface LidlProduct {
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  promotion?: string;
  availability: boolean;
  category: string;
  url: string;
  image?: string;
}

export class LidlScraper {
  private baseUrl = 'https://www.lidl.pl';
  
  async scrapeProducts(): Promise<LidlProduct[]> {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
      
      // Navigate to LIDL online store
      await page.goto(`${this.baseUrl}/c/spozywcze-s1400`, { waitUntil: 'networkidle2' });
      
      // Wait for products to load
      await page.waitForSelector('.product-grid', { timeout: 10000 });
      
      // Extract product data
      const products = await page.evaluate(() => {
        const productElements = document.querySelectorAll('.product-grid-box');
        const extractedProducts: any[] = [];
        
        productElements.forEach((element) => {
          try {
            const nameElement = element.querySelector('.product-title');
            const priceElement = element.querySelector('.price-current');
            const originalPriceElement = element.querySelector('.price-original');
            const imageElement = element.querySelector('img');
            const linkElement = element.querySelector('a');
            
            if (nameElement && priceElement) {
              const name = nameElement.textContent?.trim() || '';
              const priceText = priceElement.textContent?.trim() || '';
              const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));
              
              let originalPrice = undefined;
              let discount = 0;
              
              if (originalPriceElement) {
                const originalPriceText = originalPriceElement.textContent?.trim() || '';
                originalPrice = parseFloat(originalPriceText.replace(/[^\d,]/g, '').replace(',', '.'));
                discount = originalPrice - price;
              }
              
              extractedProducts.push({
                name,
                price,
                originalPrice,
                discount,
                availability: true,
                category: 'Spożywcze',
                url: linkElement?.href || '',
                image: imageElement?.src || ''
              });
            }
          } catch (error) {
            console.error('Error parsing product:', error);
          }
        });
        
        return extractedProducts;
      });
      
      console.log(`✅ LIDL: ${products.length} products scraped successfully`);
      return products;
      
    } catch (error) {
      console.error('❌ LIDL scraping error:', error);
      return [];
    } finally {
      await browser.close();
    }
  }
  
  async scrapeCategory(category: string): Promise<LidlProduct[]> {
    const categoryUrls: { [key: string]: string } = {
      'nabial': '/c/nabial-s1402',
      'pieczywo': '/c/pieczywo-s1401',
      'mieso': '/c/mieso-wedliny-s1403',
      'owoce': '/c/owoce-warzywa-s1404'
    };
    
    const categoryUrl = categoryUrls[category.toLowerCase()];
    if (!categoryUrl) {
      console.log(`❌ Unknown category: ${category}`);
      return [];
    }
    
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
      
      await page.goto(`${this.baseUrl}${categoryUrl}`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.product-grid', { timeout: 10000 });
      
      const products = await page.evaluate((cat) => {
        const productElements = document.querySelectorAll('.product-grid-box');
        const extractedProducts: any[] = [];
        
        productElements.forEach((element) => {
          try {
            const nameElement = element.querySelector('.product-title');
            const priceElement = element.querySelector('.price-current');
            const originalPriceElement = element.querySelector('.price-original');
            const imageElement = element.querySelector('img');
            const linkElement = element.querySelector('a');
            
            if (nameElement && priceElement) {
              const name = nameElement.textContent?.trim() || '';
              const priceText = priceElement.textContent?.trim() || '';
              const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));
              
              let originalPrice = undefined;
              let discount = 0;
              
              if (originalPriceElement) {
                const originalPriceText = originalPriceElement.textContent?.trim() || '';
                originalPrice = parseFloat(originalPriceText.replace(/[^\d,]/g, '').replace(',', '.'));
                discount = originalPrice - price;
              }
              
              extractedProducts.push({
                name,
                price,
                originalPrice,
                discount,
                availability: true,
                category: cat,
                url: linkElement?.href || '',
                image: imageElement?.src || ''
              });
            }
          } catch (error) {
            console.error('Error parsing product:', error);
          }
        });
        
        return extractedProducts;
      }, category);
      
      console.log(`✅ LIDL ${category}: ${products.length} products scraped`);
      return products;
      
    } catch (error) {
      console.error(`❌ LIDL ${category} scraping error:`, error);
      return [];
    } finally {
      await browser.close();
    }
  }
}

export default LidlScraper; 