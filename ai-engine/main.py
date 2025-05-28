"""
SmartShop AI - AI Engine Main Application
"""

import logging
import os
from contextlib import asynccontextmanager
from typing import Any, Dict

import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import RedirectResponse
from prometheus_client import make_asgi_app
import structlog

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.api import api_router
from app.services.ml_service import MLService
from app.services.recommendation_engine import RecommendationEngine
from app.services.price_predictor import PricePredictor
from app.services.optimization_service import OptimizationService
from app.middleware.metrics import add_prometheus_middleware

# Initialize structured logging
setup_logging()
logger = structlog.get_logger(__name__)

# Settings
settings = get_settings()

# ML Services initialization
ml_service = MLService()
recommendation_engine = RecommendationEngine()
price_predictor = PricePredictor()
optimization_service = OptimizationService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown."""
    logger.info("Starting SmartShop AI Engine...")
    
    try:
        # Initialize ML models
        await ml_service.initialize()
        await recommendation_engine.load_models()
        await price_predictor.load_models()
        await optimization_service.initialize()
        
        logger.info("AI Engine initialized successfully")
        yield
        
    except Exception as e:
        logger.error(f"Failed to initialize AI Engine: {e}")
        raise
    finally:
        logger.info("Shutting down SmartShop AI Engine...")
        await ml_service.cleanup()


# Create FastAPI application
app = FastAPI(
    title="SmartShop AI Engine",
    description="AI-powered price prediction, recommendation, and optimization engine for SmartShop",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)

# Add Prometheus metrics
add_prometheus_middleware(app)

# Mount Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/", response_class=RedirectResponse)
async def root():
    """Redirect root to docs."""
    return RedirectResponse(url="/docs")


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint."""
    try:
        # Check ML services status
        ml_status = await ml_service.health_check()
        recommendation_status = await recommendation_engine.health_check()
        prediction_status = await price_predictor.health_check()
        optimization_status = await optimization_service.health_check()
        
        all_healthy = all([
            ml_status["status"] == "healthy",
            recommendation_status["status"] == "healthy",
            prediction_status["status"] == "healthy",
            optimization_status["status"] == "healthy",
        ])
        
        return {
            "status": "healthy" if all_healthy else "degraded",
            "version": "1.0.0",
            "environment": settings.ENVIRONMENT,
            "services": {
                "ml_service": ml_status,
                "recommendation_engine": recommendation_status,
                "price_predictor": prediction_status,
                "optimization_service": optimization_status,
            },
            "timestamp": ml_service.get_current_timestamp(),
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")


@app.get("/info")
async def info() -> Dict[str, Any]:
    """Service information endpoint."""
    return {
        "name": "SmartShop AI Engine",
        "version": "1.0.0",
        "description": "AI-powered price prediction and optimization engine",
        "features": [
            "Price Prediction",
            "Recommendation Engine",
            "Shopping List Optimization",
            "Savings Calculation",
            "Market Analysis",
            "User Behavior Analysis"
        ],
        "supported_stores": [
            "LIDL",
            "Biedronka",
            "Auchan",
            "Ceneo",
            "Allegro"
        ],
        "models": {
            "price_prediction": "Prophet + XGBoost Ensemble",
            "recommendations": "Collaborative Filtering + Content-Based",
            "optimization": "Genetic Algorithm + Linear Programming",
            "classification": "Random Forest + SVM"
        }
    }


# Dependency to get ML services
def get_ml_service() -> MLService:
    return ml_service


def get_recommendation_engine() -> RecommendationEngine:
    return recommendation_engine


def get_price_predictor() -> PricePredictor:
    return price_predictor


def get_optimization_service() -> OptimizationService:
    return optimization_service


if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning",
        access_log=settings.DEBUG,
    ) 