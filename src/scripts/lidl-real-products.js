const puppeteer = require('puppeteer');

async function scrapeLidlProducts() {
  console.log('🔥 GERÇEK LIDL ÜRÜN FİYATLARI ÇEKİLİYOR!');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
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
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('📍 LIDL Gıda kategorisine gidiliyor...');
    
    // Direkt gıda kategorisine git
    await page.goto('https://www.lidl.pl/c/zywnosc-i-napoje/s10068374', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    console.log('✅ Gıda kategorisi yüklendi!');
    
    // Çerezleri kabul et
    try {
      await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
      await page.click('#onetrust-accept-btn-handler');
      console.log('🍪 Çerezler kabul edildi');
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('🍪 Çerez butonu bulunamadı, devam ediliyor...');
    }
    
    // Ürünleri ara
    console.log('🔍 Ürünler aranıyor...');
    
    // Farklı selector'ları dene
    const productData = await page.evaluate(() => {
      // Muhtemel ürün container'ları
      const selectors = [
        '.product',
        '.product-item',
        '.product-card',
        '.item',
        '.article',
        '[data-product]',
        '.grid-item',
        '.product-tile',
        '.offer-tile',
        '.product-box'
      ];
      
      let allProducts = [];
      
      // Her selector için ürün ara
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`Selector ${selector}: ${elements.length} element bulundu`);
        
        elements.forEach((element, index) => {
          try {
            // Ürün adı ara
            const nameSelectors = [
              '.product-title', '.title', '.name', '.product-name',
              'h1', 'h2', 'h3', 'h4', '.heading', '[data-testid*="title"]'
            ];
            
            let productName = '';
            for (let nameSelector of nameSelectors) {
              const nameEl = element.querySelector(nameSelector);
              if (nameEl && nameEl.textContent.trim()) {
                productName = nameEl.textContent.trim();
                break;
              }
            }
            
            // Fiyat ara
            const priceSelectors = [
              '.price', '.cost', '.amount', '.price-current', '.price-value',
              '[data-testid*="price"]', '.currency', '.money'
            ];
            
            let price = '';
            for (let priceSelector of priceSelectors) {
              const priceEl = element.querySelector(priceSelector);
              if (priceEl && priceEl.textContent.trim()) {
                price = priceEl.textContent.trim();
                break;
              }
            }
            
            // Resim ara
            const imgEl = element.querySelector('img');
            const imageUrl = imgEl ? imgEl.src || imgEl.getAttribute('data-src') : '';
            
            if (productName || price) {
              allProducts.push({
                name: productName || 'Ürün adı bulunamadı',
                price: price || 'Fiyat bulunamadı',
                image: imageUrl,
                selector: selector,
                index: index
              });
            }
          } catch (error) {
            console.log('Ürün parse hatası:', error.message);
          }
        });
      });
      
      // Genel page text'inden ürün isimlerini de ara
      const pageText = document.body.textContent || '';
      const polishProducts = [
        'mleko', 'chleb', 'masło', 'jajka', 'ser', 'jogurt',
        'ryż', 'makaron', 'olej', 'cukier', 'mąka', 'herbata',
        'kawa', 'sok', 'woda', 'mięso', 'kurczak', 'wołowina'
      ];
      
      const foundProducts = polishProducts.filter(product => 
        pageText.toLowerCase().includes(product)
      );
      
      return {
        scrapedProducts: allProducts,
        detectedProductWords: foundProducts,
        totalElementsChecked: selectors.reduce((sum, sel) => {
          return sum + document.querySelectorAll(sel).length;
        }, 0),
        pageTitle: document.title,
        pageUrl: window.location.href
      };
    });
    
    console.log(`🎯 Toplam kontrol edilen element: ${productData.totalElementsChecked}`);
    console.log(`📦 Bulunan ürün: ${productData.scrapedProducts.length}`);
    console.log(`🇵🇱 Tespit edilen Lehçe ürün kelimeleri: ${productData.detectedProductWords.join(', ')}`);
    
    // Bulunan ürünleri listele
    if (productData.scrapedProducts.length > 0) {
      console.log('\n🛒 BULUNAN GERÇEK ÜRÜNLER:');
      productData.scrapedProducts.slice(0, 10).forEach((product, i) => {
        console.log(`${i+1}. ${product.name}`);
        console.log(`   💰 Fiyat: ${product.price}`);
        console.log(`   🔍 Selector: ${product.selector}`);
        if (product.image) console.log(`   🖼️ Resim: ${product.image.substring(0, 50)}...`);
        console.log('');
      });
    }
    
    // Alternatif: Sayfa HTML'sinden direct price pattern'larını ara
    const pricePatterns = await page.evaluate(() => {
      const text = document.body.innerHTML;
      const patterns = [
        /(\d+[,\.]\d{2})\s*zł/gi,
        /zł\s*(\d+[,\.]\d{2})/gi,
        /(\d+)\s*zł/gi,
        /price[^>]*>([^<]*\d[^<]*)</gi
      ];
      
      let foundPrices = [];
      patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          foundPrices = foundPrices.concat(matches.slice(0, 5));
        }
      });
      
      return foundPrices;
    });
    
    console.log('\n💰 BULUNAN FİYAT PATTERN\'LARI:');
    pricePatterns.slice(0, 10).forEach((price, i) => {
      console.log(`${i+1}. ${price}`);
    });
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      url: productData.pageUrl,
      title: productData.pageTitle,
      productsFound: productData.scrapedProducts.length,
      pricesFound: pricePatterns.length,
      sampleProducts: productData.scrapedProducts.slice(0, 5),
      samplePrices: pricePatterns.slice(0, 5),
      detectedWords: productData.detectedProductWords
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

// GERÇEK VERİ ÇEKİMİNİ BAŞLAT
console.log('🚀🚀🚀 GERÇEK ZAMANLI LIDL FİYAT VERİSİ ÇEKİLİYOR! 🚀🚀🚀');
scrapeLidlProducts()
  .then(result => {
    console.log('\n🎯 FİNAL SONUÇ:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ BAŞARILI! GERÇEK LIDL VERİLERİ ÇEKİLDİ!');
      console.log(`📊 ${result.productsFound} ürün, ${result.pricesFound} fiyat bulundu!`);
    } else {
      console.log('\n❌ BAŞARISIZ!', result.error);
    }
  })
  .catch(error => {
    console.error('\n💥 KRITIK HATA:', error);
  }); 