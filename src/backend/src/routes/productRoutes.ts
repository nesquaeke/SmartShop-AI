import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Tüm ürünleri getir
router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                prices: {
                    include: {
                        store: true
                    }
                }
            }
        });

        // Ürün verilerini frontend'in beklediği formata dönüştür
        const formattedProducts = products.map(product => {
            const prices = product.prices.map(price => ({
                store: price.store.name,
                price: price.price,
                isLowest: price.isLowest,
                difference: price.difference,
                savings: price.savings,
                promotion: price.promotion
            }));

            // En düşük fiyatı bul
            const lowestPrice = Math.min(...prices.map(p => p.price));
            const maxSavings = Math.max(...prices.map(p => p.savings || 0));
            const savingsPercentage = Math.round((maxSavings / lowestPrice) * 100);

            return {
                id: product.id,
                name: product.name,
                description: product.description,
                image: product.image,
                rating: product.rating,
                reviewCount: product.reviewCount,
                storeCount: prices.length,
                isBestPrice: prices.some(p => p.isLowest),
                priceTrend: product.priceTrend,
                priceTrendIcon: product.priceTrendIcon,
                priceTrendText: product.priceTrendText,
                prices,
                maxSavings,
                savingsPercentage
            };
        });

        res.json(formattedProducts);
    } catch (error) {
        console.error('Ürünler getirilirken hata oluştu:', error);
        res.status(500).json({ error: 'Ürünler getirilirken bir hata oluştu' });
    }
});

// Ürün ara
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ error: 'Arama terimi gerekli' });
        }

        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: q as string, mode: 'insensitive' } },
                    { description: { contains: q as string, mode: 'insensitive' } }
                ]
            },
            include: {
                prices: {
                    include: {
                        store: true
                    }
                }
            }
        });

        // Ürün verilerini frontend'in beklediği formata dönüştür
        const formattedProducts = products.map(product => {
            const prices = product.prices.map(price => ({
                store: price.store.name,
                price: price.price,
                isLowest: price.isLowest,
                difference: price.difference,
                savings: price.savings,
                promotion: price.promotion
            }));

            // En düşük fiyatı bul
            const lowestPrice = Math.min(...prices.map(p => p.price));
            const maxSavings = Math.max(...prices.map(p => p.savings || 0));
            const savingsPercentage = Math.round((maxSavings / lowestPrice) * 100);

            return {
                id: product.id,
                name: product.name,
                description: product.description,
                image: product.image,
                rating: product.rating,
                reviewCount: product.reviewCount,
                storeCount: prices.length,
                isBestPrice: prices.some(p => p.isLowest),
                priceTrend: product.priceTrend,
                priceTrendIcon: product.priceTrendIcon,
                priceTrendText: product.priceTrendText,
                prices,
                maxSavings,
                savingsPercentage
            };
        });

        res.json(formattedProducts);
    } catch (error) {
        console.error('Ürün araması sırasında hata oluştu:', error);
        res.status(500).json({ error: 'Ürün araması sırasında bir hata oluştu' });
    }
});

export default router; 