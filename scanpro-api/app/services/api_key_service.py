from typing import Dict, Optional, Any, List
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.database import get_async_session
from app.db.models import ApiKey, User, Subscription, UsageStats

async def validate_api_key(api_key: str, operation: str) -> Dict[str, Any]:
    """
    Validate an API key and check if it has permission for the requested operation.
    
    Args:
        api_key: The API key to validate
        operation: The operation to check permission for
        
    Returns:
        Dictionary with validation results including:
        - valid: Boolean indicating if the key is valid
        - error: Error message if the key is invalid
        - userId: User ID associated with the key if valid
        - tier: Subscription tier of the user if valid
    """
    try:
        async with get_async_session() as session:
            # Look up the API key
            db_key = await session.get(ApiKey, api_key)
            
            if not db_key:
                return {"valid": False, "error": "Invalid API key"}
            
            # Check if key is expired
            if db_key.expires_at and db_key.expires_at < datetime.now():
                return {"valid": False, "error": "API key has expired"}
            
            # Check if the API key has permission for the requested operation
            if operation not in db_key.permissions and '*' not in db_key.permissions:
                return {
                    "valid": False, 
                    "error": f"This API key does not have permission to perform the '{operation}' operation"
                }
            
            # Get subscription tier
            user = await session.get(User, db_key.user_id)
            subscription = await session.get(Subscription, user.id)
            tier = subscription.tier if subscription else "free"
            
            # Update last used timestamp for the API key
            db_key.last_used = datetime.now()
            await session.commit()
            
            # Check monthly usage limit
            first_day_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Query total usage for the month
            result = await session.execute(
                "SELECT SUM(count) FROM usage_stats WHERE user_id = :user_id AND date >= :start_date",
                {"user_id": user.id, "start_date": first_day_of_month}
            )
            total_usage = result.scalar() or 0
            
            usage_limit = settings.USAGE_LIMITS.get(tier, settings.USAGE_LIMITS["free"])
            
            if total_usage >= usage_limit:
                return {
                    "valid": False,
                    "error": f"Monthly usage limit of {usage_limit} operations reached for your {tier} plan",
                }
            
            # Track usage statistics (non-blocking)
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Check if there's an existing record for today and this operation
            result = await session.execute(
                """
                SELECT id FROM usage_stats 
                WHERE user_id = :user_id AND operation = :operation AND date = :date
                """,
                {"user_id": user.id, "operation": operation, "date": today}
            )
            
            usage_id = result.scalar()
            
            if usage_id:
                # Update existing record
                await session.execute(
                    """
                    UPDATE usage_stats SET count = count + 1
                    WHERE id = :id
                    """,
                    {"id": usage_id}
                )
            else:
                # Create new record
                new_usage = UsageStats(
                    user_id=user.id,
                    operation=operation,
                    count=1,
                    date=today
                )
                session.add(new_usage)
            
            await session.commit()
            
            return {
                "valid": True,
                "userId": str(user.id),
                "tier": tier
            }
    except Exception as e:
        print(f"Error validating API key: {e}")
        return {"valid": False, "error": "Error validating API key"}

async def generate_api_key(user_id: str, name: str, permissions: List[str]) -> Dict[str, Any]:
    """
    Generate a new API key for a user.
    
    Args:
        user_id: User ID to generate the key for
        name: Name for the key
        permissions: List of operations this key can perform
        
    Returns:
        Dictionary with the generated key details
    """
    try:
        async with get_async_session() as session:
            # Get the user
            user = await session.get(User, user_id)
            if not user:
                return {"success": False, "error": "User not found"}
            
            # Check subscription limits on number of keys
            subscription = await session.get(Subscription, user.id)
            tier = subscription.tier if subscription else "free"
            
            # Get key limits based on tier
            key_limits = {
                "free": 1,
                "basic": 3,
                "pro": 10,
                "enterprise": 50
            }
            
            key_limit = key_limits.get(tier, key_limits["free"])
            
            # Count existing keys
            result = await session.execute(
                "SELECT COUNT(*) FROM api_keys WHERE user_id = :user_id",
                {"user_id": user.id}
            )
            current_key_count = result.scalar() or 0
            
            if current_key_count >= key_limit:
                return {
                    "success": False,
                    "error": f"Your {tier} plan allows a maximum of {key_limit} API keys"
                }
            
            # Validate permissions
            validated_permissions = []
            
            # If permissions are provided, validate each one
            if permissions:
                # Filter to only include valid operations
                validated_permissions = [perm for perm in permissions 
                                        if perm in settings.API_OPERATIONS or perm == '*']
                
                # If wildcard permission is included, just use that
                if '*' in permissions:
                    validated_permissions = ['*']
            
            # If no valid permissions were provided, use defaults based on subscription tier
            if not validated_permissions:
                if tier == "enterprise":
                    validated_permissions = ['*']  # All permissions
                elif tier == "pro":
                    validated_permissions = settings.API_OPERATIONS  # All specific operations
                elif tier == "basic":
                    # Standard operations for basic tier
                    validated_permissions = [
                        'convert', 'compress', 'merge', 'split', 
                        'protect', 'unlock'
                    ]
                else:  # free tier
                    # Limited operations for free tier
                    validated_permissions = ['convert', 'compress', 'merge', 'split']
            
            # Generate the key
            key = f"sk_{uuid.uuid4().hex}"
            
            # Create new API key
            new_key = ApiKey(
                key=key,
                user_id=user.id,
                name=name or "API Key",
                permissions=validated_permissions,
                created_at=datetime.now()
            )
            
            session.add(new_key)
            await session.commit()
            
            return {
                "success": True,
                "key": {
                    "id": str(new_key.id),
                    "key": key,
                    "name": new_key.name,
                    "permissions": new_key.permissions,
                    "created_at": new_key.created_at.isoformat(),
                }
            }
    except Exception as e:
        print(f"Error generating API key: {e}")
        return {"success": False, "error": "Failed to create API key"}

async def track_api_usage(user_id: str, operation: str) -> bool:
    """
    Track API usage for a user.
    
    Args:
        user_id: User ID to track usage for
        operation: Operation being performed
        
    Returns:
        Boolean indicating if the tracking was successful
    """
    try:
        async with get_async_session() as session:
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Check if there's an existing record for today and this operation
            result = await session.execute(
                """
                SELECT id FROM usage_stats 
                WHERE user_id = :user_id AND operation = :operation AND date = :date
                """,
                {"user_id": user_id, "operation": operation, "date": today}
            )
            
            usage_id = result.scalar()
            
            if usage_id:
                # Update existing record
                await session.execute(
                    """
                    UPDATE usage_stats SET count = count + 1
                    WHERE id = :id
                    """,
                    {"id": usage_id}
                )
            else:
                # Create new record
                new_usage = UsageStats(
                    user_id=user_id,
                    operation=operation,
                    count=1,
                    date=today
                )
                session.add(new_usage)
            
            await session.commit()
            return True
    except Exception as e:
        print(f"Error tracking API usage: {e}")
        return False