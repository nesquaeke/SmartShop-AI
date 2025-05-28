const puppeteer = require('puppeteer');

async function testLidlScraping() {
  console.log('🚀 GERÇEK LIDL VERİ ÇEKİMİ BAŞLIYOR...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Görsel olarak görmek için
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // User agent ayarla
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('📍 LIDL Polska sitesine gidiliyor...');
    
    // LIDL Polska ana sayfa
    await page.goto('https://www.lidl.pl', { waitUntil: 'networkidle2' });
    
    console.log('✅ LIDL anasayfası yüklendi!');
    
    // Page title ve URL kontrol
    const title = await page.title();
    const url = await page.url();
    
    console.log(`📄 Page Title: ${title}`);
    console.log(`🔗 Current URL: ${url}`);
    
    // Online alışveriş linkini bul
    console.log('🛒 Online alışveriş bölümü aranıyor...');
    
    // Çerezleri kabul et (varsa)
    try {
      const cookieButton = await page.$('#onetrust-accept-btn-handler');
      if (cookieButton) {
        await cookieButton.click();
        console.log('🍪 Çerezler kabul edildi');
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('🍪 Çerez butonu bulunamadı, devam ediliyor...');
    }
    
    // Sayfa yapısını incele
    const bodyHTML = await page.content();
    console.log(`📊 Sayfa boyutu: ${bodyHTML.length} karakter`);
    
    // Linkler ve önemli elementleri listele
    const links = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a'));
      return allLinks
        .map(link => ({ text: link.textContent?.trim(), href: link.href }))
        .filter(link => link.text && link.text.length > 0)
        .slice(0, 20); // İlk 20 link
    });
    
    console.log('🔗 Bulunan linkler:');
    links.forEach((link, index) => {
      console.log(`${index + 1}. ${link.text} -> ${link.href}`);
    });
    
    // Screenshot al
    await page.screenshot({ path: 'lidl-homepage.png', fullPage: true });
    console.log('📸 Screenshot alındı: lidl-homepage.png');
    
    console.log('✅ LIDL bağlantısı başarılı! Site erişilebilir.');
    
    return {
      success: true,
      title,
      url,
      linksFound: links.length,
      pageSize: bodyHTML.length
    };
    
  } catch (error) {
    console.error('❌ HATA:', error.message);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// Test çalıştır
testLidlScraping()
  .then(result => {
    console.log('\n🎯 TEST SONUCU:');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('💥 TEST BAŞARISIZ:', error);
  }); 