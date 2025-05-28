import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { scraperRouter } from './routes/scraper';
import { productsRouter } from './routes/products';
import { pricesRouter } from './routes/prices';
import { shoppingListRouter } from './routes/shopping-list';
import { aiRouter } from './routes/ai';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SmartShop AI Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/scraper', scraperRouter);
app.use('/api/products', productsRouter);
app.use('/api/prices', pricesRouter);
app.use('/api/shopping-list', shoppingListRouter);
app.use('/api/ai', aiRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SmartShop AI Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app; 