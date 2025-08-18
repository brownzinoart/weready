#!/usr/bin/env python3
"""
Test script to simulate OAuth user creation and analysis linking
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import SessionLocal
from app.models.user import User, SubscriptionTier
from app.models.analysis import Analysis
from app.auth.jwt_handler import create_token_pair
from datetime import datetime, timedelta
import uuid

def create_test_user():
    """Create a test user to simulate OAuth signup"""
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Create test user (simulating GitHub OAuth)
        user = User(
            email="test@developer.com",
            full_name="Test Developer",
            avatar_url="https://github.com/identicons/test.png",
            github_id="12345",
            github_username="testdev",
            subscription_tier=SubscriptionTier.FREE,
            trial_started=datetime.now(),
            trial_ends=datetime.now() + timedelta(days=7)
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ Created test user: {user.email} (ID: {user.id})")
        print(f"   Trial active: {user.is_trial_active()}")
        print(f"   Trial ends: {user.trial_ends_at}")
        
        # Link the free analysis (ID 4) to this user
        analysis = db.query(Analysis).filter(Analysis.id == 4).first()
        if analysis and analysis.user_id is None:
            analysis.user_id = user.id
            db.commit()
            print(f"✅ Linked analysis {analysis.id} to user {user.email}")
        else:
            print(f"⚠️  Analysis 4 not found or already linked")
        
        # Generate JWT tokens for testing
        token_data = {
            "user_id": user.id,
            "email": user.email,
            "subscription_tier": user.subscription_tier.value
        }
        
        tokens = create_token_pair(token_data)
        print(f"✅ Generated JWT tokens:")
        print(f"   Access Token: {tokens['access_token'][:50]}...")
        print(f"   Refresh Token: {tokens['refresh_token'][:50]}...")
        
        return user, tokens
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        db.rollback()
        return None, None
    finally:
        db.close()

if __name__ == "__main__":
    user, tokens = create_test_user()
    if user:
        print("\n🎉 Test user creation complete!")
        print(f"You can now test the dashboard with user: {user.email}")