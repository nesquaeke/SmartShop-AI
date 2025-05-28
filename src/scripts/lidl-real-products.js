const puppeteer = require('puppeteer');

async function getLidlRealProducts() {
  console.log('🛒 LIDL GERÇEK ÜRÜN ÇEKİMİ BAŞLIYOR...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    // Direkt gıda kategorisine git
    console.log('📍 LIDL Gıda kategorisine gidiliyor...');
    await page.goto('https://www.lidl.pl/c/zywnosc-i-napoje/s10068374', { 
      waitUntil: 'networkidle2',
      timeout: 15000 
    });
    
    console.log('✅ Gıda sayfası yüklendi!');
    
    // Sayfada mevcut elementleri kontrol et
    const pageInfo = await page.evaluate(() => {
      const title = document.title;
      const h1 = document.querySelector('h1')?.textContent || 'H1 bulunamadı';
      
      // Ürün kartları aramak için farklı seçiciler dene
      const possibleSelectors = [
        '.product-grid-box',
        '.product-card',
        '.product-item', 
        '.product',
        '.item',
        '.tile',
        '[data-product]',
        '.offer',
        '.product-tile',
        '.grid-item'
      ];
      
      let foundElements = [];
      possibleSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          foundElements.push({
            selector: selector,
            count: elements.length,
            sample: elements[0]?.outerHTML?.substring(0, 200) + '...'
          });
        }
      });
      
      // Genel div'lerde ürün benzeri yapıları ara
      const allDivs = document.querySelectorAll('div');
      let productLikeDivs = 0;
      
      allDivs.forEach(div => {
        const text = div.textContent?.toLowerCase() || '';
        if ((text.includes('zł') || text.includes('pln')) && 
            (text.includes('kg') || text.includes('szt') || text.includes('ml'))) {
          productLikeDivs++;
        }
      });
      
      return {
        title,
        h1,
        foundElements,
        productLikeDivs,
        totalDivs: allDivs.length
      };
    });
    
    console.log('📊 Sayfa bilgileri:');
    console.log('Title:', pageInfo.title);
    console.log('H1:', pageInfo.h1);
    console.log('Toplam div:', pageInfo.totalDivs);
    console.log('Ürün benzeri divler:', pageInfo.productLikeDivs);
    
    console.log('\n🔍 Bulunan element tipleri:');
    pageInfo.foundElements.forEach(element => {
      console.log(`${element.selector}: ${element.count} adet`);
    });
    
    // En umut verici seçiciyi kullan
    const bestSelector = pageInfo.foundElements.length > 0 ? 
      pageInfo.foundElements[0].selector : 'div';
    
    console.log(`\n🎯 En iyi seçici: ${bestSelector}`);
    
    // Ürünleri çek
    const products = await page.evaluate((selector) => {
      const elements = document.querySelectorAll(selector);
      const products = [];
      
      elements.forEach((element, index) => {
        try {
          const text = element.textContent || '';
          
          // Fiyat ara (zł, PLN, decimal numbers)
          const priceMatch = text.match(/(\d+[,\.]\d{2})\s*(zł|PLN)/i);
          
          // Ürün adı ara (büyük harf ile başlayan kelimeler)
          const nameMatch = text.match(/([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż\s\d]+)/);
          
          if (priceMatch && nameMatch) {
            const price = parseFloat(priceMatch[1].replace(',', '.'));
            const name = nameMatch[1].trim().substring(0, 50);
            
            if (price > 0 && price < 1000 && name.length > 3) {
              products.push({
                name: name,
                price: price,
                fullText: text.substring(0, 100),
                index: index
              });
            }
          }
        } catch (e) {
          // Hata varsa bu elementi atla
        }
      });
      
      return products.slice(0, 10); // İlk 10 ürün
    }, bestSelector);
    
    console.log('\n🎯 Bulunan ürünler:');
    products.forEach((product, i) => {
      console.log(`${i+1}. ${product.name} - ${product.price} zł`);
    });
    
    return {
      success: true,
      products: products,
      count: products.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ HATA:', error.message);
    return { 
      success: false, 
      error: error.message,
      products: [],
      timestamp: new Date().toISOString()
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Test çalıştır
getLidlRealProducts()
  .then(result => {
    console.log('\n🎯 SONUÇ:');
    console.log(`Başarı: ${result.success}`);
    console.log(`Ürün sayısı: ${result.count}`);
    
    if (result.success && result.products.length > 0) {
      console.log('\n🎉 BAŞARILI! Gerçek LIDL ürünleri bulundu!');
      console.log('İlk 5 ürün:');
      result.products.slice(0, 5).forEach((p, i) => {
        console.log(`${i+1}. ${p.name} - ${p.price} zł`);
      });
    } else {
      console.log('\n⚠️ Ürün bulunamadı veya hata oluştu.');
    }
  })
  .catch(error => {
    console.error('\n💥 KRITIK HATA:', error);
  }); 