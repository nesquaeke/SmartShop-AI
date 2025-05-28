#!/usr/bin/env python3
"""
SmartShop AI - Simple AI Engine Demo
Basic AI functionality without heavy dependencies
"""

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import socket
from datetime import datetime
import random

class SmartShopAIHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/':
            self._handle_health()
        elif parsed_path.path == '/analytics/market-trends':
            self._handle_market_trends()
        else:
            self._handle_404()
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8')) if content_length > 0 else {}
        except:
            data = {}
        
        if parsed_path.path == '/optimize-basket':
            self._handle_optimize_basket(data)
        elif parsed_path.path == '/predict-prices':
            self._handle_predict_prices(data)
        elif parsed_path.path == '/recommendations':
            self._handle_recommendations(data)
        else:
            self._handle_404()
    
    def _handle_health(self):
        response = {
            "service": "SmartShop AI Engine (Simple)",
            "status": "healthy",
            "version": "1.0.0-simple",
            "timestamp": datetime.now().isoformat()
        }
        self._send_json_response(response)
    
    def _handle_optimize_basket(self, data):
        items = data.get('items', [])
        budget = data.get('budget')
        preferred_stores = data.get('preferred_stores', [])
        
        # Mock optimization logic
        optimized_items = []
        total_cost = 0.0
        store_counts = {"LIDL": 0, "Biedronka": 0, "Auchan": 0}
        
        for item in items:
            # Simple optimization: choose cheapest option
            stores = ["LIDL", "Biedronka", "Auchan"]
            prices = [3.49, 3.99, 4.19]  # Example prices
            
            best_store = stores[0]
            best_price = prices[0]
            
            if preferred_stores and any(store in preferred_stores for store in stores):
                # Prefer user's preferred stores
                for i, store in enumerate(stores):
                    if store in preferred_stores:
                        best_store = store
                        best_price = prices[i]
                        break
            
            item_cost = best_price * item.get('quantity', 1)
            total_cost += item_cost
            store_counts[best_store] += item.get('quantity', 1)
            
            optimized_items.append({
                "product_id": item.get('product_id'),
                "product_name": f"Product {item.get('product_id')}",
                "quantity": item.get('quantity', 1),
                "store": best_store,
                "unit_price": best_price,
                "total_price": item_cost,
                "discount": random.uniform(0.5, 2.0),
                "savings": random.uniform(0.2, 1.0)
            })
        
        total_savings = sum(item["savings"] for item in optimized_items)
        
        recommendations = [
            "🤖 AI optimizasyonu tamamlandı!",
            f"💰 Toplam {total_savings:.2f} PLN tasarruf",
            "🎯 En uygun mağaza kombinasyonu seçildi"
        ]
        
        if budget and total_cost > budget:
            recommendations.append(f"⚠️ Bütçe aşımı: {total_cost - budget:.2f} PLN")
        
        response = {
            "optimized_list": optimized_items,
            "total_cost": round(total_cost, 2),
            "savings": round(total_savings, 2),
            "store_distribution": store_counts,
            "recommendations": recommendations
        }
        
        self._send_json_response(response)
    
    def _handle_predict_prices(self, data):
        if isinstance(data, list):
            product_ids = data
        else:
            product_ids = data.get('product_ids', [])
        
        predictions = []
        for product_id in product_ids[:5]:  # Limit to 5 predictions
            base_price = 3.49 + random.uniform(-1, 1)
            trend_factor = random.uniform(-0.1, 0.1)
            predicted_price = base_price * (1 + trend_factor)
            
            if trend_factor > 0.05:
                trend = "rising"
                buy_time = "Şimdi satın alın - fiyat artışı bekleniyor"
            elif trend_factor < -0.05:
                trend = "falling"
                buy_time = "Birkaç gün bekleyin - fiyat düşüşü devam edebilir"
            else:
                trend = "stable"
                buy_time = "Stabil fiyat - istediğiniz zaman alabilirsiniz"
            
            predictions.append({
                "product_id": product_id,
                "predicted_price": round(predicted_price, 2),
                "confidence": round(random.uniform(0.7, 0.95), 2),
                "trend": trend,
                "best_buy_time": buy_time
            })
        
        response = {"predictions": predictions}
        self._send_json_response(response)
    
    def _handle_recommendations(self, data):
        categories = data.get('categories', [])
        max_price = data.get('max_price', 50.0)
        brands = data.get('brands', [])
        
        # Mock recommendations
        recommendations = [
            {
                "product_id": "1",
                "name": "Mleko UHT 3.2% 1L Łaciate",
                "category": "Nabiał",
                "brand": "Łaciate",
                "best_price": 3.49,
                "best_store": "LIDL",
                "discount": 0.7,
                "rating": 4.8,
                "score": 0.92,
                "reason": "Öneriliyor: yüksek kullanıcı puanı, 0.7 PLN indirim"
            },
            {
                "product_id": "13",
                "name": "Kawa Mielona 250g Jacobs",
                "category": "Napoje",
                "brand": "Jacobs",
                "best_price": 14.99,
                "best_store": "LIDL",
                "discount": 3.0,
                "rating": 4.7,
                "score": 0.88,
                "reason": "Öneriliyor: 3.0 PLN indirim, yüksek kullanıcı puanı"
            }
        ]
        
        # Filter by user preferences
        if categories:
            recommendations = [r for r in recommendations if r["category"] in categories]
        
        if max_price:
            recommendations = [r for r in recommendations if r["best_price"] <= max_price]
        
        response = {"recommendations": recommendations}
        self._send_json_response(response)
    
    def _handle_market_trends(self):
        trends = {
            "trends": {
                "top_categories": ["Nabiał", "Pieczywo", "Napoje"],
                "price_changes": {
                    "week": round(random.uniform(-3, 2), 1),
                    "month": round(random.uniform(-1, 3), 1)
                },
                "best_stores": {
                    "LIDL": "En iyi discount oranları",
                    "Biedronka": "Geniş ürün yelpazesi",
                    "Auchan": "Premium markalar"
                },
                "seasonal_insights": "Kış sezonunda sıcak içeceklerde %15 artış bekleniyor"
            }
        }
        self._send_json_response(trends)
    
    def _handle_404(self):
        self.send_response(404)
        self._set_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        response = {"error": "Not found", "path": self.path}
        self.wfile.write(json.dumps(response).encode())
    
    def _send_json_response(self, data):
        self.send_response(200)
        self._set_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def main():
    port = 8000
    
    # Check if port is already in use
    if is_port_in_use(port):
        print(f"❌ Port {port} is already in use")
        print("🔄 Trying port 8001...")
        port = 8001
        
        if is_port_in_use(port):
            print(f"❌ Port {port} is also in use")
            print("Please stop other services or use a different port")
            return
    
    server = HTTPServer(('localhost', port), SmartShopAIHandler)
    
    print("🤖 SmartShop AI Engine (Simple) starting...")
    print(f"🚀 Server running on http://localhost:{port}")
    print("📊 Available endpoints:")
    print("   GET  /                     - Health check")
    print("   POST /optimize-basket      - Basket optimization")
    print("   POST /predict-prices       - Price predictions")
    print("   POST /recommendations      - Product recommendations")
    print("   GET  /analytics/market-trends - Market trends")
    print("\n✨ AI Engine ready to serve requests!")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down AI Engine...")
        server.shutdown()

if __name__ == "__main__":
    main() 