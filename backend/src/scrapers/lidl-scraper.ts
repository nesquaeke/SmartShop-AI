import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';
import { BaseScraperService } from './base-scraper';
import { ScrapedProduct, ScrapingResult } from '../types/scraper.types';

export class LidlScraperService extends BaseScraperService {
  private readonly baseUrl = 'https://www.lidl.pl';
  private readonly catalogUrl = 'https://www.lidl.pl/q/szukaj';
  
  constructor() {
    super('LIDL');
  }

  async scrapeProducts(searchQuery?: string): Promise<ScrapingResult> {
    const startTime = Date.now();
    const results: ScrapedProduct[] = [];
    let errors: string[] = [];

    try {
      logger.info(`Starting LIDL scraping${searchQuery ? ` for query: ${searchQuery}` : ''}`);

      // Get product categories first
      const categories = await this.getProductCategories();
      
      for (const category of categories) {
        try {
          const categoryProducts = await this.scrapeCategoryProducts(category);
          results.push(...categoryProducts);
          
          // Rate limiting - respectful scraping
          await this.delay(1000);
        } catch (error) {
          const errorMsg = `Failed to scrape category ${category}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      logger.info(`LIDL scraping completed. Found ${results.length} products in ${duration}ms`);

      return {
        store: 'LIDL',
        productsFound: results.length,
        products: results,
        duration,
        errors,
        success: true,
        timestamp: new Date(),
      };

    } catch (error) {
      const errorMsg = `LIDL scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMsg);
      
      return {
        store: 'LIDL',
        productsFound: 0,
        products: [],
        duration: Date.now() - startTime,
        errors: [errorMsg],
        success: false,
        timestamp: new Date(),
      };
    }
  }

  private async getProductCategories(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/s/produkty`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const categories: string[] = [];

      // Extract category links
      $('.category-tile a, .navigation-category a').each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.startsWith('/c/')) {
          categories.push(href);
        }
      });

      return categories.slice(0, 10); // Limit to first 10 categories
    } catch (error) {
      logger.error('Failed to fetch LIDL categories:', error);
      return ['/c/spozywcze', '/c/napoje', '/c/mrozonowarstwa']; // Fallback categories
    }
  }

  private async scrapeCategoryProducts(categoryPath: string): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];
    const url = `${this.baseUrl}${categoryPath}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Extract products from the page
      $('.product-tile, .product-item, .product-card').each((_, element) => {
        try {
          const product = this.extractProductData($, element);
          if (product) {
            products.push(product);
          }
        } catch (error) {
          logger.debug('Failed to extract product data:', error);
        }
      });

      // Handle pagination
      const nextPageUrl = $('.pagination .next, .pagination .page-next').attr('href');
      if (nextPageUrl && products.length > 0) {
        // For now, limit to first page to avoid overwhelming the server
        logger.debug(`Next page available: ${nextPageUrl}`);
      }

    } catch (error) {
      logger.error(`Failed to scrape LIDL category ${categoryPath}:`, error);
    }

    return products;
  }

  private extractProductData($: cheerio.CheerioAPI, element: cheerio.Element): ScrapedProduct | null {
    try {
      const $element = $(element);
      
      // Extract basic product information
      const name = $element.find('.product-name, .product-title, h3, h4').first().text().trim();
      const priceText = $element.find('.price, .product-price, .current-price').first().text().trim();
      const originalPriceText = $element.find('.old-price, .original-price, .crossed-price').first().text().trim();
      const imageUrl = $element.find('img').first().attr('src') || $element.find('img').first().attr('data-src');
      const productUrl = $element.find('a').first().attr('href');
      
      if (!name || !priceText) {
        return null;
      }

      // Parse price
      const price = this.parsePrice(priceText);
      const originalPrice = originalPriceText ? this.parsePrice(originalPriceText) : null;
      
      if (price === null) {
        return null;
      }

      // Extract additional details
      const brand = this.extractBrand(name);
      const category = this.extractCategory($);
      const weight = this.extractWeight(name);
      const isOnSale = originalPrice !== null && originalPrice > price;

      // Calculate discount
      let discountPercent = 0;
      let discountAmount = 0;
      if (isOnSale && originalPrice) {
        discountAmount = originalPrice - price;
        discountPercent = (discountAmount / originalPrice) * 100;
      }

      const product: ScrapedProduct = {
        name: name,
        price: price,
        originalPrice: originalPrice,
        currency: 'PLN',
        store: 'LIDL',
        category: category,
        brand: brand,
        imageUrl: imageUrl ? this.normalizeImageUrl(imageUrl) : undefined,
        productUrl: productUrl ? this.normalizeProductUrl(productUrl) : undefined,
        isOnSale: isOnSale,
        discountPercent: discountPercent,
        discountAmount: discountAmount,
        weight: weight,
        inStock: true, // Assume in stock if listed
        scrapedAt: new Date(),
        barcode: this.extractBarcode($element),
        description: this.extractDescription($element),
      };

      return product;
    } catch (error) {
      logger.debug('Error extracting product data:', error);
      return null;
    }
  }

  private parsePrice(priceText: string): number | null {
    try {
      // Remove currency symbols and normalize
      const cleanPrice = priceText
        .replace(/[^\d,.-]/g, '')
        .replace(',', '.')
        .trim();
      
      const price = parseFloat(cleanPrice);
      return isNaN(price) ? null : price;
    } catch {
      return null;
    }
  }

  private extractBrand(productName: string): string | undefined {
    // List of common brands in Polish supermarkets
    const brands = [
      'Pilos', 'Freshona', 'Vitasia', 'Bellasan', 'Dulano', 'Freeway',
      'Krügemann', 'Milbona', 'Alesto', 'Favorina', 'Gelatelli', 'Belbake',
      'Coca-Cola', 'Pepsi', 'Nestlé', 'Danone', 'Activia', 'Bakoma',
      'Żywiec', 'Tyskie', 'Okocim', 'Harnaś', 'Żubrówka', 'Wyborowa'
    ];

    const upperName = productName.toUpperCase();
    for (const brand of brands) {
      if (upperName.includes(brand.toUpperCase())) {
        return brand;
      }
    }
    return undefined;
  }

  private extractCategory($: cheerio.CheerioAPI): string {
    // Try to extract category from breadcrumbs or page structure
    const breadcrumb = $('.breadcrumb, .breadcrumbs').text().trim();
    if (breadcrumb) {
      const parts = breadcrumb.split('/').map(p => p.trim()).filter(p => p.length > 0);
      return parts[parts.length - 1] || 'Produkty spożywcze';
    }
    
    const pageTitle = $('h1, .page-title').text().trim();
    return pageTitle || 'Produkty spożywcze';
  }

  private extractWeight(name: string): string | undefined {
    // Regular expressions for Polish weight/volume patterns
    const patterns = [
      /(\d+(?:[.,]\d+)?)\s*kg/i,
      /(\d+(?:[.,]\d+)?)\s*g/i,
      /(\d+(?:[.,]\d+)?)\s*l/i,
      /(\d+(?:[.,]\d+)?)\s*ml/i,
      /(\d+)\s*szt/i,
      /(\d+)\s*x\s*(\d+(?:[.,]\d+)?)\s*(g|ml|kg|l)/i,
    ];

    for (const pattern of patterns) {
      const match = name.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return undefined;
  }

  private extractBarcode($element: cheerio.Cheerio<cheerio.Element>): string | undefined {
    // Look for barcode in data attributes or hidden elements
    const barcode = $element.find('[data-barcode], .barcode').first().text().trim();
    return barcode || undefined;
  }

  private extractDescription($element: cheerio.Cheerio<cheerio.Element>): string | undefined {
    const description = $element.find('.product-description, .description').first().text().trim();
    return description || undefined;
  }

  private normalizeImageUrl(imageUrl: string): string {
    if (imageUrl.startsWith('//')) {
      return `https:${imageUrl}`;
    }
    if (imageUrl.startsWith('/')) {
      return `${this.baseUrl}${imageUrl}`;
    }
    return imageUrl;
  }

  private normalizeProductUrl(productUrl: string): string {
    if (productUrl.startsWith('/')) {
      return `${this.baseUrl}${productUrl}`;
    }
    return productUrl;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 