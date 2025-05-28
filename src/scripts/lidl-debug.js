const puppeteer = require('puppeteer');
const fs = require('fs');

async function debugLidlPage() {
  console.log('🔍 LIDL SAYFA DEBUG BAŞLIYOR...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false, // Debug için browser'ı görülebilir yap
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('📍 LIDL gıda sayfasına gidiliyor...');
    await page.goto('https://www.lidl.pl/c/zywnosc-i-napoje/s10068374', { 
      waitUntil: 'networkidle2',
      timeout: 20000 
    });
    
    // Çerezleri kabul et
    try {
      await page.waitForSelector('button[id*="accept"], button[class*="accept"], #onetrust-accept-btn-handler', { timeout: 5000 });
      const acceptButton = await page.$('button[id*="accept"], button[class*="accept"], #onetrust-accept-btn-handler');
      if (acceptButton) {
        await acceptButton.click();
        console.log('🍪 Çerezler kabul edildi');
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('🍪 Çerez butonu bulunamadı');
    }
    
    // Sayfanın tam yüklenmesini bekle
    await page.waitForTimeout(5000);
    
    // Sayfanın HTML'sini dosyaya kaydet
    const html = await page.content();
    fs.writeFileSync('lidl-debug.html', html);
    console.log('📄 HTML dosyaya kaydedildi: lidl-debug.html');
    
    // Sayfa yapısını analiz et
    const analysis = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const elementCounts = {};
      
      allElements.forEach(el => {
        const tag = el.tagName.toLowerCase();
        elementCounts[tag] = (elementCounts[tag] || 0) + 1;
      });
      
      // Fiyat içeren elementleri ara
      const priceElements = Array.from(allElements).filter(el => {
        const text = el.textContent || '';
        return text.match(/\d+[,\.]\d{2}\s*(zł|PLN)/i);
      });
      
      // Ürün adı benzeri elementleri ara
      const productElements = Array.from(allElements).filter(el => {
        const text = el.textContent || '';
        return text.match(/mleko|chleb|masło|jajka|ser|jogurt|ryż|makaron/i);
      });
      
      // Class'ları topla
      const classes = [];
      allElements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          el.className.split(' ').forEach(cls => {
            if (cls && !classes.includes(cls)) {
              classes.push(cls);
            }
          });
        }
      });
      
      return {
        elementCounts,
        priceElementsCount: priceElements.length,
        productElementsCount: productElements.length,
        totalClasses: classes.length,
        commonClasses: classes.filter(cls => 
          cls.includes('product') || 
          cls.includes('item') || 
          cls.includes('card') || 
          cls.includes('tile') ||
          cls.includes('grid')
        ),
        samplePriceTexts: priceElements.slice(0, 5).map(el => el.textContent.trim()),
        sampleProductTexts: productElements.slice(0, 5).map(el => el.textContent.trim())
      };
    });
    
    console.log('\n📊 SAYFA ANALİZİ:');
    console.log('Element sayıları:', analysis.elementCounts);
    console.log('Fiyat içeren elementler:', analysis.priceElementsCount);
    console.log('Ürün adı içeren elementler:', analysis.productElementsCount);
    console.log('Toplam CSS class:', analysis.totalClasses);
    console.log('Ürün benzeri class\'lar:', analysis.commonClasses);
    
    if (analysis.samplePriceTexts.length > 0) {
      console.log('\n💰 Örnek fiyat metinleri:');
      analysis.samplePriceTexts.forEach((text, i) => {
        console.log(`${i+1}. ${text.substring(0, 100)}`);
      });
    }
    
    if (analysis.sampleProductTexts.length > 0) {
      console.log('\n🛒 Örnek ürün metinleri:');
      analysis.sampleProductTexts.forEach((text, i) => {
        console.log(`${i+1}. ${text.substring(0, 100)}`);
      });
    }
    
    // 10 saniye daha bekle (manuel inceleme için)
    console.log('\n⏳ 10 saniye bekleniyor (browser\'da manuel inceleme yapabilirsiniz)...');
    await page.waitForTimeout(10000);
    
    return {
      success: true,
      analysis: analysis,
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

// Debug çalıştır
debugLidlPage()
  .then(result => {
    console.log('\n🎯 DEBUG SONUCU:');
    console.log('Başarı:', result.success);
    
    if (result.success) {
      console.log('✅ Sayfa başarıyla analiz edildi!');
      console.log('📄 HTML dosyası: lidl-debug.html');
    } else {
      console.log('❌ Hata:', result.error);
    }
  })
  .catch(error => {
    console.error('💥 KRITIK HATA:', error);
  }); 