const puppeteer = require('puppeteer');

async function testLidlSimple() {
  console.log('🚀 BASIT LIDL TEST BAŞLIYOR...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true, // Headless mode
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // User agent ayarla
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('📍 LIDL sitesine bağlanılıyor...');
    
    // LIDL ana sayfa (basit sürüm)
    await page.goto('https://www.lidl.pl', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    console.log('✅ LIDL sayfası yüklendi!');
    
    // Temel bilgiler al
    const title = await page.title();
    const url = await page.url();
    
    console.log(`📄 Title: ${title}`);
    console.log(`🔗 URL: ${url}`);
    
    // Online market linkini ara
    const marketLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .filter(link => {
          const text = link.textContent?.toLowerCase() || '';
          const href = link.href?.toLowerCase() || '';
          return text.includes('market') || 
                 text.includes('shop') || 
                 text.includes('zakupy') ||
                 href.includes('/c/') ||
                 href.includes('shop');
        })
        .map(link => ({
          text: link.textContent?.trim(),
          href: link.href
        }))
        .slice(0, 10);
    });
    
    console.log('🛒 Bulunan market linkleri:');
    marketLinks.forEach((link, i) => {
      console.log(`${i+1}. ${link.text} -> ${link.href}`);
    });
    
    // Basit ürün araması deneyelim
    if (marketLinks.length > 0) {
      const shopLink = marketLinks.find(link => 
        link.href.includes('/c/') || 
        link.text?.toLowerCase().includes('shop')
      );
      
      if (shopLink) {
        console.log(`🎯 Shop linkine gidiliyor: ${shopLink.href}`);
        
        try {
          await page.goto(shopLink.href, { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
          });
          
          // Ürün elementlerini ara
          const products = await page.evaluate(() => {
            const productSelectors = [
              '.product', '.item', '.card', 
              '[data-product]', '.product-card',
              '.product-item', '.offer'
            ];
            
            let foundProducts = [];
            
            productSelectors.forEach(selector => {
              const elements = document.querySelectorAll(selector);
              if (elements.length > 0) {
                foundProducts.push({
                  selector: selector,
                  count: elements.length
                });
              }
            });
            
            return foundProducts;
          });
          
          console.log('🎯 Bulunan ürün elementleri:');
          products.forEach(p => {
            console.log(`  ${p.selector}: ${p.count} adet`);
          });
          
        } catch (shopError) {
          console.log('⚠️ Shop sayfası yüklenemedi:', shopError.message);
        }
      }
    }
    
    return {
      success: true,
      title,
      url,
      marketLinksFound: marketLinks.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ HATA:', error.message);
    return { 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Test çalıştır
console.log('🔥 GERÇEK ZAMANLI LIDL VERİ ÇEKİMİ BAŞLIYOR!');
testLidlSimple()
  .then(result => {
    console.log('\n🎯 SONUÇ:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ BAŞARILI! LIDL sitesi erişilebilir ve veri çekilebilir!');
    } else {
      console.log('\n❌ BAŞARISIZ! Bağlantı sorunu var.');
    }
  })
  .catch(error => {
    console.error('\n💥 KRITIK HATA:', error);
  }); 