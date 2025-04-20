from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from typing import Optional
import re

from app.core.config import settings, ROUTE_TO_OPERATION_MAP
from app.services.api_key_service import validate_api_key

class WebUIDetectionMiddleware(BaseHTTPMiddleware):
    """
    Middleware to detect if the request is coming from the web UI or a programmatic client.
    This is used to decide whether to bypass API key validation.
    """
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next):
        # Check if the request is from a browser-like client
        is_web_ui = self.is_web_ui_request(request)
        
        # Add this information to the request state
        request.state.is_web_ui = is_web_ui
        
        # Continue with the request
        response = await call_next(request)
        return response
    
    def is_web_ui_request(self, request: Request) -> bool:
        """
        Determine if the request is coming from a web browser (web UI).
        """
        user_agent = request.headers.get('user-agent', '')
        accept_header = request.headers.get('accept', '')
        referer = request.headers.get('referer', '')
        
        # Check if it comes from a browser based on user agent
        is_browser = any(pattern in user_agent for pattern in settings.BROWSER_USER_AGENT_PATTERNS)
        
        # Check if it accepts HTML
        accepts_html = 'text/html' in accept_header
        
        # Check if referred from our own site
        own_site_referer = settings.PROJECT_NAME.lower() in referer.lower() or 'scanpro' in referer.lower()
        
        # Consider it a web UI request if it comes from a browser and either accepts HTML or is referred from our site
        return is_browser and (accepts_html or own_site_referer)


class APIKeyMiddleware(BaseHTTPMiddleware):
    """
    Middleware for API key validation. Determines if a route requires an API key,
    and validates it if required.
    """
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next):
        # Check if the route should be excluded from API key validation
        path = request.url.path
        
        # Quick pass for excluded routes
        for excluded_route in settings.EXCLUDED_ROUTES:
            if path.startswith(excluded_route):
                return await call_next(request)
        
        # Check if this is an API route that needs authentication
        requires_api_key = False
        operation_type = ''
        
        for api_route in settings.API_ROUTES:
            if path.startswith(api_route):
                requires_api_key = True
                
                # Determine operation type for this route
                for route_pattern, operation in ROUTE_TO_OPERATION_MAP.items():
                    if path.startswith(route_pattern):
                        operation_type = operation
                        break
                
                # If no specific mapping is found, use the last part of the path
                if not operation_type:
                    path_parts = path.split('/')
                    operation_type = path_parts[-1] if path_parts else ''
                
                break
        
        if not requires_api_key:
            # Not an API route that needs validation
            return await call_next(request)
        
        # Skip API key validation for requests from the web UI
        if request.state.is_web_ui:
            return await call_next(request)
        
        # For programmatic API access, check API key
        api_key = request.headers.get('x-api-key') or request.query_params.get('api_key')
        
        if not api_key:
            return HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key is required"
            )
        
        # Validate the API key
        validation = await validate_api_key(api_key, operation_type)
        
        if not validation['valid']:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=validation['error'] or "Invalid API key"
            )
        
        # Add operation type and API key info to request state
        request.state.operation_type = operation_type
        request.state.api_key = api_key
        request.state.user_id = validation.get('userId')
        
        # Continue with the request
        response = await call_next(request)
        return response