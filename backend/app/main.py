import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.services.metrics import CollectionError


def create_app() -> FastAPI:
    app = FastAPI(title="SystemPulse")
    configured = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    origins = [origin.strip() for origin in configured.split(",") if origin.strip()]
    if "*" in origins:
        raise ValueError("CORS_ORIGINS requires explicit origins")
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET"])

    @app.exception_handler(CollectionError)
    async def unavailable(request: Request, exc: CollectionError) -> JSONResponse:
        return JSONResponse(status_code=503, content={"detail": str(exc)})

    app.include_router(router)
    return app


app = create_app()
