"""
User Model and Database Schema
==============================
Comprehensive user model supporting OAuth providers and profile enrichment.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Enum, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from enum import Enum as PyEnum
import json
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

Base = declarative_base()

class UserRole(PyEnum):
    DEVELOPER = "developer"
    FOUNDER = "founder"
    INVESTOR = "investor"
    OTHER = "other"

class SubscriptionTier(PyEnum):
    FREE = "free"
    HACKER = "hacker"  # Free tier after trial
    FOUNDER = "founder"  # $29/month
    STARTUP = "startup"  # $99/month
    ENTERPRISE = "enterprise"  # Custom pricing

class OAuthProvider(PyEnum):
    GITHUB = "github"
    GITLAB = "gitlab"
    BITBUCKET = "bitbucket"
    GOOGLE = "google"
    LINKEDIN = "linkedin"
    MICROSOFT = "microsoft"
    ANGELLIST = "angellist"
    PRODUCTHUNT = "producthunt"

class User(Base):
    """User model with comprehensive profile and OAuth support"""
    
    __tablename__ = "users"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=True)
    
    # Authentication
    password_hash = Column(String(255), nullable=True)  # Nullable for OAuth-only users
    
    # Basic profile
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    
    # Company/Organization
    company = Column(String(255), nullable=True)
    position = Column(String(255), nullable=True)
    
    # WeReady-specific profile
    role = Column(Enum(UserRole), nullable=True)
    subscription_tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    
    # Trial and subscription tracking
    trial_started = Column(DateTime(timezone=True), nullable=True)
    trial_ends = Column(DateTime(timezone=True), nullable=True)
    trial_used = Column(Boolean, default=False)
    subscription_started = Column(DateTime(timezone=True), nullable=True)
    subscription_ends = Column(DateTime(timezone=True), nullable=True)
    stripe_customer_id = Column(String(100), nullable=True)
    stripe_subscription_id = Column(String(100), nullable=True)
    
    # Interests and preferences
    interests = Column(JSON, nullable=True)  # ["ai", "startup", "funding"]
    preferred_sources = Column(JSON, nullable=True)  # ["government", "academic", "github"]
    
    # OAuth providers
    oauth_providers = Column(JSON, nullable=True)  # {"github": {"id": "123", "username": "user"}}
    
    # GitHub-specific data (primary for developers)
    github_id = Column(String(50), nullable=True, index=True)
    github_username = Column(String(100), nullable=True)
    github_profile = Column(JSON, nullable=True)
    
    # Google-specific data
    google_id = Column(String(50), nullable=True, index=True)
    google_profile = Column(JSON, nullable=True)
    
    # LinkedIn-specific data
    linkedin_id = Column(String(50), nullable=True, index=True)
    linkedin_profile = Column(JSON, nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    email_verified = Column(Boolean, default=False)
    
    # Usage metrics
    weready_score = Column(Float, nullable=True)
    last_score_update = Column(DateTime(timezone=True), nullable=True)
    total_scans = Column(Integer, default=0)
    total_queries = Column(Integer, default=0)
    free_analyses_used = Column(Integer, default=0)  # Track free tier usage
    last_analysis_date = Column(DateTime(timezone=True), nullable=True)
    
    # Guest tracking
    guest_session_id = Column(String(100), nullable=True, index=True)  # For pre-signup analysis tracking
    
    # Onboarding
    onboarding_completed = Column(Boolean, default=False)
    onboarding_step = Column(String(50), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert user object to dictionary"""
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "full_name": self.full_name,
            "avatar_url": self.avatar_url,
            "bio": self.bio,
            "company": self.company,
            "position": self.position,
            "role": self.role.value if self.role else None,
            "subscription_tier": self.subscription_tier.value if self.subscription_tier else None,
            "interests": self.interests,
            "preferred_sources": self.preferred_sources,
            "oauth_providers": self.oauth_providers,
            "github_username": self.github_username,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "email_verified": self.email_verified,
            "weready_score": self.weready_score,
            "last_score_update": self.last_score_update.isoformat() if self.last_score_update else None,
            "total_scans": self.total_scans,
            "total_queries": self.total_queries,
            "onboarding_completed": self.onboarding_completed,
            "onboarding_step": self.onboarding_step,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }
    
    def add_oauth_provider(self, provider: OAuthProvider, provider_data: Dict[str, Any]):
        """Add OAuth provider data to user"""
        if not self.oauth_providers:
            self.oauth_providers = {}
        
        self.oauth_providers[provider.value] = provider_data
        
        # Update provider-specific fields
        if provider == OAuthProvider.GITHUB:
            self.github_id = provider_data.get("id")
            self.github_username = provider_data.get("login")
            self.github_profile = provider_data
        elif provider == OAuthProvider.GOOGLE:
            self.google_id = provider_data.get("id")
            self.google_profile = provider_data
        elif provider == OAuthProvider.LINKEDIN:
            self.linkedin_id = provider_data.get("id")
            self.linkedin_profile = provider_data
    
    def get_primary_avatar(self) -> Optional[str]:
        """Get the best available avatar URL"""
        if self.avatar_url:
            return self.avatar_url
        
        if self.github_profile and self.github_profile.get("avatar_url"):
            return self.github_profile["avatar_url"]
        
        if self.google_profile and self.google_profile.get("picture"):
            return self.google_profile["picture"]
        
        if self.linkedin_profile and self.linkedin_profile.get("pictureUrl"):
            return self.linkedin_profile["pictureUrl"]
        
        return None
    
    def get_display_name(self) -> str:
        """Get the best available display name"""
        if self.full_name:
            return self.full_name
        
        if self.username:
            return self.username
        
        if self.github_username:
            return self.github_username
        
        if self.email:
            return self.email.split("@")[0]
        
        return f"User {self.id}"
    
    def is_trial_active(self) -> bool:
        """Check if user's trial is currently active"""
        if not self.trial_started or not self.trial_ends:
            return False
        return datetime.now() < self.trial_ends
    
    def is_subscription_active(self) -> bool:
        """Check if user has active subscription"""
        if not self.subscription_started:
            return False
        if not self.subscription_ends:  # Lifetime or ongoing subscription
            return True
        return datetime.now() < self.subscription_ends
    
    def can_analyze(self) -> bool:
        """Check if user can perform analysis based on tier and usage"""
        if self.is_trial_active() or self.is_subscription_active():
            return True
        
        # Free tier limits
        if self.subscription_tier == SubscriptionTier.HACKER:
            return self.free_analyses_used < 1  # 1 per month
        
        return False
    
    def start_trial(self) -> Dict[str, Any]:
        """Start 7-day trial for user"""
        from datetime import datetime, timedelta
        
        if self.trial_used:
            return {"success": False, "error": "Trial already used"}
        
        self.trial_started = datetime.now()
        self.trial_ends = datetime.now() + timedelta(days=7)
        self.trial_used = True
        self.subscription_tier = SubscriptionTier.FOUNDER  # Full access during trial
        
        return {
            "success": True,
            "trial_ends": self.trial_ends.isoformat(),
            "message": "7-day trial started"
        }
    
    def get_subscription_status(self) -> Dict[str, Any]:
        """Get current subscription status"""
        if self.is_trial_active():
            days_left = (self.trial_ends - datetime.now()).days
            return {
                "status": "trial",
                "tier": "founder",
                "days_left": days_left,
                "trial_ends": self.trial_ends.isoformat()
            }
        
        if self.is_subscription_active():
            return {
                "status": "active",
                "tier": self.subscription_tier.value,
                "subscription_ends": self.subscription_ends.isoformat() if self.subscription_ends else None
            }
        
        return {
            "status": "free",
            "tier": self.subscription_tier.value,
            "analyses_remaining": max(0, 1 - self.free_analyses_used) if self.subscription_tier == SubscriptionTier.HACKER else 0
        }
    
    def set_password(self, password: str) -> None:
        """Hash and set password for user"""
        self.password_hash = pwd_context.hash(password)
    
    def verify_password(self, password: str) -> bool:
        """Verify password against stored hash"""
        if not self.password_hash:
            return False
        return pwd_context.verify(password, self.password_hash)
    
    def has_password(self) -> bool:
        """Check if user has a password set (not OAuth-only)"""
        return self.password_hash is not None
    
    @classmethod
    def create_from_email_password(cls, email: str, password: str, full_name: str = None) -> 'User':
        """Create user with email/password authentication"""
        user = cls(
            email=email,
            full_name=full_name or email.split('@')[0],
            subscription_tier=SubscriptionTier.FREE,
            email_verified=False  # Will need email verification
        )
        user.set_password(password)
        
        # Start trial automatically
        user.trial_started = datetime.now()
        user.trial_ends = datetime.now() + timedelta(days=7)
        user.trial_used = True
        user.subscription_tier = SubscriptionTier.FOUNDER  # Full access during trial
        
        return user

class UserSession(Base):
    """User session management for JWT tokens"""
    
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    session_token = Column(String(500), unique=True, index=True, nullable=False)
    refresh_token = Column(String(500), unique=True, index=True, nullable=False)
    
    # Session metadata
    device_info = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    last_accessed = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Status
    is_active = Column(Boolean, default=True)
    is_revoked = Column(Boolean, default=False)

class UserActivity(Base):
    """Track user activities for analytics and personalization"""
    
    __tablename__ = "user_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    
    # Activity details
    activity_type = Column(String(100), nullable=False)  # "login", "scan", "query", "score_update"
    activity_data = Column(JSON, nullable=True)
    
    # Context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())