#!/usr/bin/env python3
"""
SmartShop AI - AI Engine
Comprehensive AI-powered shopping optimization system for Polish market
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import uvicorn
import logging
from dataclasses import dataclass
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app initialization
app = FastAPI(
    title="SmartShop AI Engine",
    description="AI-powered shopping optimization for Polish grocery market",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class Product(BaseModel):
    id: str
    name: str
    category: str
    brand: str
    prices: List[Dict[str, Any]]
    rating: float
    availability: int

class ShoppingItem(BaseModel):
    product_id: str
    quantity: int
    max_price: Optional[float] = None

class ShoppingList(BaseModel):
    items: List[ShoppingItem]
    budget: Optional[float] = None
    preferred_stores: Optional[List[str]] = None

class OptimizationResult(BaseModel):
    optimized_list: List[Dict[str, Any]]
    total_cost: float
    savings: float
    store_distribution: Dict[str, int]
    recommendations: List[str]

class PricePrediction(BaseModel):
    product_id: str
    predicted_price: float
    confidence: float
    trend: str  # "rising", "falling", "stable"
    best_buy_time: str

# Mock data for demonstration
MOCK_PRODUCTS = [
    {
        "id": "1",
        "name": "Mleko UHT 3.2% 1L Łaciate",
        "category": "Nabiał",
        "brand": "Łaciate",
        "prices": [
            {"store": "LIDL", "price": 3.49, "discount": 0.7},
            {"store": "Biedronka", "price": 3.99, "discount": 0.2},
            {"store": "Auchan", "price": 4.19, "discount": 0.0}
        ],
        "rating": 4.8,
        "availability": 3
    },
    {
        "id": "2", 
        "name": "Chleb Żytni 500g Kaszubski",
        "category": "Pieczywo",
        "brand": "Kaszubski",
        "prices": [
            {"store": "Biedronka", "price": 2.89, "discount": 0.6},
            {"store": "LIDL", "price": 3.19, "discount": 0.3},
            {"store": "Auchan", "price": 3.49, "discount": 0.0}
        ],
        "rating": 4.6,
        "availability": 3
    },
    {
        "id": "13",
        "name": "Kawa Mielona 250g Jacobs",
        "category": "Napoje", 
        "brand": "Jacobs",
        "prices": [
            {"store": "LIDL", "price": 14.99, "discount": 3.0},
            {"store": "Auchan", "price": 16.99, "discount": 1.0},
            {"store": "Biedronka", "price": 18.99, "discount": 0.0}
        ],
        "rating": 4.7,
        "availability": 3
    }
]

class SmartShopAI:
    """AI Engine for SmartShop optimization algorithms"""
    
    def __init__(self):
        self.products_db = MOCK_PRODUCTS
        self.price_history = self._generate_mock_price_history()
        
    def _generate_mock_price_history(self):
        """Generate mock price history for ML training"""
        history = {}
        for product in self.products_db:
            dates = pd.date_range(
                start=datetime.now() - timedelta(days=90),
                end=datetime.now(),
                freq='D'
            )
            
            base_price = min([p["price"] for p in product["prices"]])
            
            # Generate realistic price fluctuations
            np.random.seed(hash(product["id"]) % 2**32)
            price_changes = np.random.normal(0, 0.05, len(dates))
            prices = base_price * (1 + np.cumsum(price_changes))
            
            history[product["id"]] = {
                "dates": [d.isoformat() for d in dates],
                "prices": prices.tolist()
            }
            
        return history
    
    def optimize_shopping_basket(self, shopping_list: ShoppingList) -> OptimizationResult:
        """
        AI-powered shopping basket optimization
        Finds best store combinations for maximum savings
        """
        try:
            optimized_items = []
            total_cost = 0.0
            store_counts = {"LIDL": 0, "Biedronka": 0, "Auchan": 0}
            
            for item in shopping_list.items:
                # Find product in database
                product = next(
                    (p for p in self.products_db if p["id"] == item.product_id), 
                    None
                )
                
                if not product:
                    continue
                
                # Find best price considering discounts and availability
                best_option = self._find_best_price_option(
                    product, 
                    item.max_price,
                    shopping_list.preferred_stores
                )
                
                if best_option:
                    item_cost = best_option["price"] * item.quantity
                    total_cost += item_cost
                    store_counts[best_option["store"]] += item.quantity
                    
                    optimized_items.append({
                        "product_id": item.product_id,
                        "product_name": product["name"],
                        "quantity": item.quantity,
                        "store": best_option["store"],
                        "unit_price": best_option["price"],
                        "total_price": item_cost,
                        "discount": best_option.get("discount", 0),
                        "savings": best_option.get("discount", 0) * item.quantity
                    })
            
            # Calculate total savings
            total_savings = sum(item["savings"] for item in optimized_items)
            
            # Generate AI recommendations
            recommendations = self._generate_recommendations(
                optimized_items, 
                store_counts, 
                total_cost,
                shopping_list.budget
            )
            
            return OptimizationResult(
                optimized_list=optimized_items,
                total_cost=round(total_cost, 2),
                savings=round(total_savings, 2),
                store_distribution=store_counts,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Optimization error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")
    
    def _find_best_price_option(self, product: Dict, max_price: Optional[float], preferred_stores: Optional[List[str]]):
        """Find the best price option for a product"""
        options = product["prices"].copy()
        
        # Filter by max price if specified
        if max_price:
            options = [opt for opt in options if opt["price"] <= max_price]
        
        # Prefer specified stores
        if preferred_stores:
            preferred_options = [opt for opt in options if opt["store"] in preferred_stores]
            if preferred_options:
                options = preferred_options
        
        # Sort by effective price (price - discount)
        options.sort(key=lambda x: x["price"] - x.get("discount", 0))
        
        return options[0] if options else None
    
    def _generate_recommendations(self, items: List[Dict], store_counts: Dict, total_cost: float, budget: Optional[float]) -> List[str]:
        """Generate AI-powered shopping recommendations"""
        recommendations = []
        
        # Budget analysis
        if budget and total_cost > budget:
            over_budget = total_cost - budget
            recommendations.append(f"⚠️ Budget aşımı: {over_budget:.2f} PLN. Alternatif ürünler öneriliyor.")
        elif budget and total_cost < budget * 0.8:
            remaining = budget - total_cost
            recommendations.append(f"💰 Bütçe içinde: {remaining:.2f} PLN tasarruf!")
        
        # Store optimization
        dominant_store = max(store_counts.items(), key=lambda x: x[1])
        if dominant_store[1] > sum(store_counts.values()) * 0.7:
            recommendations.append(f"🎯 {dominant_store[0]} mağazasında toplu alışveriş önerisi - nakliye tasarrufu!")
        
        # Seasonal recommendations
        current_month = datetime.now().month
        if current_month in [11, 12]:
            recommendations.append("🎄 Kış sezonu: Sıcak içecekler ve konserve ürünlerde indirimler takip ediliyor.")
        elif current_month in [6, 7, 8]:
            recommendations.append("☀️ Yaz sezonu: Mevsimlik meyve ve sebzelerde en uygun fiyatlar.")
        
        # Discount opportunities
        high_discount_items = [item for item in items if item.get("discount", 0) > 1.0]
        if high_discount_items:
            recommendations.append(f"🏷️ {len(high_discount_items)} üründe büyük indirim fırsatı!")
        
        return recommendations
    
    def predict_price_trends(self, product_ids: List[str]) -> List[PricePrediction]:
        """Predict future price trends using historical data"""
        predictions = []
        
        for product_id in product_ids:
            try:
                # Get historical data
                history = self.price_history.get(product_id)
                if not history:
                    continue
                
                prices = np.array(history["prices"])
                
                # Simple trend analysis
                recent_prices = prices[-7:]  # Last 7 days
                older_prices = prices[-14:-7]  # Previous 7 days
                
                recent_avg = np.mean(recent_prices)
                older_avg = np.mean(older_prices)
                
                # Calculate trend
                trend_change = (recent_avg - older_avg) / older_avg
                
                if trend_change > 0.05:
                    trend = "rising"
                    best_buy_time = "Şimdi satın alın - fiyat artışı bekleniyor"
                elif trend_change < -0.05:
                    trend = "falling" 
                    best_buy_time = "Birkaç gün bekleyin - fiyat düşüşü devam edebilir"
                else:
                    trend = "stable"
                    best_buy_time = "Stabil fiyat - istediğiniz zaman alabilirsiniz"
                
                # Predict next price (simple linear extrapolation)
                if len(prices) >= 5:
                    x = np.arange(len(prices[-5:]))
                    y = prices[-5:]
                    slope = np.polyfit(x, y, 1)[0]
                    predicted_price = prices[-1] + slope
                else:
                    predicted_price = prices[-1]
                
                # Confidence based on price volatility
                volatility = np.std(recent_prices) / np.mean(recent_prices)
                confidence = max(0.3, 1.0 - volatility * 10)
                
                predictions.append(PricePrediction(
                    product_id=product_id,
                    predicted_price=round(float(predicted_price), 2),
                    confidence=round(confidence, 2),
                    trend=trend,
                    best_buy_time=best_buy_time
                ))
                
            except Exception as e:
                logger.error(f"Price prediction error for {product_id}: {str(e)}")
                continue
        
        return predictions
    
    def get_personalized_recommendations(self, user_preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized product recommendations"""
        try:
            # Extract user preferences
            preferred_categories = user_preferences.get("categories", [])
            max_price_range = user_preferences.get("max_price", 50.0)
            preferred_brands = user_preferences.get("brands", [])
            
            recommendations = []
            
            for product in self.products_db:
                # Score calculation based on preferences
                score = 0.0
                
                # Category preference
                if product["category"] in preferred_categories:
                    score += 0.4
                
                # Price preference 
                min_price = min([p["price"] for p in product["prices"]])
                if min_price <= max_price_range:
                    score += 0.3 * (1 - min_price / max_price_range)
                
                # Brand preference
                if product["brand"] in preferred_brands:
                    score += 0.2
                
                # Rating influence
                score += 0.1 * (product["rating"] / 5.0)
                
                # Discount influence
                max_discount = max([p.get("discount", 0) for p in product["prices"]])
                if max_discount > 0:
                    score += 0.1
                
                if score > 0.5:  # Threshold for recommendation
                    best_price = min(product["prices"], key=lambda x: x["price"] - x.get("discount", 0))
                    
                    recommendations.append({
                        "product_id": product["id"],
                        "name": product["name"],
                        "category": product["category"],
                        "brand": product["brand"],
                        "best_price": best_price["price"],
                        "best_store": best_price["store"],
                        "discount": best_price.get("discount", 0),
                        "rating": product["rating"],
                        "score": round(score, 2),
                        "reason": self._get_recommendation_reason(product, score, max_discount)
                    })
            
            # Sort by score and return top recommendations
            recommendations.sort(key=lambda x: x["score"], reverse=True)
            return recommendations[:10]
            
        except Exception as e:
            logger.error(f"Recommendation error: {str(e)}")
            return []
    
    def _get_recommendation_reason(self, product: Dict, score: float, discount: float) -> str:
        """Generate explanation for recommendation"""
        reasons = []
        
        if product["rating"] >= 4.5:
            reasons.append("yüksek kullanıcı puanı")
        
        if discount > 1.0:
            reasons.append(f"{discount:.1f} PLN indirim")
        
        if score > 0.8:
            reasons.append("tercihlerinize çok uygun")
        elif score > 0.6:
            reasons.append("tercihlerinize uygun")
        
        return "Öneriliyor: " + ", ".join(reasons) if reasons else "Kaliteli ürün"

# Initialize AI engine
ai_engine = SmartShopAI()

# API Routes
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "SmartShop AI Engine",
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/optimize-basket", response_model=OptimizationResult)
async def optimize_basket(shopping_list: ShoppingList):
    """Optimize shopping basket for maximum savings"""
    logger.info(f"Optimizing basket with {len(shopping_list.items)} items")
    return ai_engine.optimize_shopping_basket(shopping_list)

@app.post("/predict-prices")
async def predict_prices(product_ids: List[str]):
    """Predict future price trends for given products"""
    logger.info(f"Predicting prices for {len(product_ids)} products")
    predictions = ai_engine.predict_price_trends(product_ids)
    return {"predictions": predictions}

@app.post("/recommendations")
async def get_recommendations(user_preferences: Dict[str, Any]):
    """Get personalized product recommendations"""
    logger.info("Generating personalized recommendations")
    recommendations = ai_engine.get_personalized_recommendations(user_preferences)
    return {"recommendations": recommendations}

@app.get("/products")
async def get_products():
    """Get all available products for testing"""
    return {"products": MOCK_PRODUCTS}

@app.get("/analytics/market-trends")
async def get_market_trends():
    """Get market trend analytics"""
    return {
        "trends": {
            "top_categories": ["Nabiał", "Pieczywo", "Napoje"],
            "price_changes": {
                "week": -2.3,  # % change
                "month": +1.8
            },
            "best_stores": {
                "LIDL": "En iyi discount oranları",
                "Biedronka": "Geniş ürün yelpazesi", 
                "Auchan": "Premium markalar"
            },
            "seasonal_insights": "Kış sezonunda sıcak içeceklerde %15 artış"
        }
    }

if __name__ == "__main__":
    logger.info("🤖 SmartShop AI Engine starting...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 