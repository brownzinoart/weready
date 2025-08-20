"""
JWT Token Management System
===========================
Handles JWT token creation, validation, and refresh for WeReady authentication.
"""

import os
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from jose import JWTError
import secrets
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-key-change-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))

class JWTHandler:
    """JWT token management for WeReady authentication"""
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Create JWT access token
        
        Args:
            data: Data to encode in token (user_id, email, etc.)
            expires_delta: Custom expiration time
            
        Returns:
            JWT access token string
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        """
        Create JWT refresh token
        
        Args:
            data: Data to encode in token (user_id primarily)
            
        Returns:
            JWT refresh token string
        """
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh",
            "jti": secrets.token_urlsafe(32)  # Unique token ID for revocation
        })
        
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Verify and decode JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token payload or None if invalid
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # Check if token is expired
            exp = payload.get("exp")
            if exp and datetime.utcfromtimestamp(exp) < datetime.utcnow():
                return None
            
            return payload
        except JWTError:
            return None
        except Exception:
            return None
    
    @staticmethod
    def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Verify access token specifically
        
        Args:
            token: JWT access token string
            
        Returns:
            Decoded token payload or None if invalid
        """
        payload = JWTHandler.verify_token(token)
        
        if payload and payload.get("type") == "access":
            return payload
        
        return None
    
    @staticmethod
    def verify_refresh_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Verify refresh token specifically
        
        Args:
            token: JWT refresh token string
            
        Returns:
            Decoded token payload or None if invalid
        """
        payload = JWTHandler.verify_token(token)
        
        if payload and payload.get("type") == "refresh":
            return payload
        
        return None
    
    @staticmethod
    def create_token_pair(user_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Create both access and refresh tokens
        
        Args:
            user_data: User data to encode (id, email, role, etc.)
            
        Returns:
            Dictionary with access_token and refresh_token
        """
        # Create access token with full user data
        access_token = JWTHandler.create_access_token(user_data)
        
        # Create refresh token with minimal data
        refresh_data = {
            "user_id": user_data.get("user_id"),
            "email": user_data.get("email")
        }
        refresh_token = JWTHandler.create_refresh_token(refresh_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # seconds
        }
    
    @staticmethod
    def refresh_access_token(refresh_token: str, user_data: Dict[str, Any]) -> Optional[Dict[str, str]]:
        """
        Create new access token from refresh token
        
        Args:
            refresh_token: Valid refresh token
            user_data: Updated user data for new access token
            
        Returns:
            New token pair or None if refresh token invalid
        """
        payload = JWTHandler.verify_refresh_token(refresh_token)
        
        if not payload:
            return None
        
        # Verify user_id matches
        if payload.get("user_id") != user_data.get("user_id"):
            return None
        
        # Create new token pair
        return JWTHandler.create_token_pair(user_data)
    
    @staticmethod
    def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Extract user data from access token
        
        Args:
            token: JWT access token
            
        Returns:
            User data dictionary or None if invalid
        """
        payload = JWTHandler.verify_access_token(token)
        
        if not payload:
            return None
        
        return {
            "user_id": payload.get("user_id"),
            "email": payload.get("email"),
            "role": payload.get("role"),
            "subscription_tier": payload.get("subscription_tier"),
            "username": payload.get("username"),
            "full_name": payload.get("full_name")
        }

# Create global instance
jwt_handler = JWTHandler()

# Convenience functions
def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create access token"""
    return jwt_handler.create_access_token(data, expires_delta)

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create refresh token"""
    return jwt_handler.create_refresh_token(data)

def verify_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify refresh token"""
    return jwt_handler.verify_refresh_token(token)

def create_token_pair(user_data: Dict[str, Any]) -> Dict[str, str]:
    """Create access and refresh token pair"""
    return jwt_handler.create_token_pair(user_data)

def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify access token"""
    return jwt_handler.verify_access_token(token)

def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """Get user data from token"""
    return jwt_handler.get_user_from_token(token)

def refresh_tokens(refresh_token: str, user_data: Dict[str, Any]) -> Optional[Dict[str, str]]:
    """Refresh token pair"""
    return jwt_handler.refresh_access_token(refresh_token, user_data)

# Security
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from JWT token"""
    token = credentials.credentials
    user_data = verify_access_token(token)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    # Get user from database
    user = db.query(User).filter(User.id == user_data["user_id"]).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user