"""
OAuth Authentication Routes
===========================
Handle GitHub and other OAuth provider authentication, plus email/password auth.
"""

from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import uuid
from datetime import datetime, timedelta

from app.database.connection import get_db
from app.models.user import User, SubscriptionTier
from app.auth.jwt_handler import create_access_token, create_refresh_token, create_token_pair
from app.auth.password_utils import password_validator, validate_email, sanitize_username

router = APIRouter()

# OAuth configuration
oauth = OAuth()

# GitHub OAuth
oauth.register(
    name='github',
    client_id=os.getenv('GITHUB_CLIENT_ID', 'your_github_client_id'),
    client_secret=os.getenv('GITHUB_CLIENT_SECRET', 'your_github_client_secret'),
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    api_base_url='https://api.github.com/',
    client_kwargs={
        'scope': 'user:email'
    }
)

# Google OAuth
oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID', 'your_google_client_id'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET', 'your_google_client_secret'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# LinkedIn OAuth
oauth.register(
    name='linkedin',
    client_id=os.getenv('LINKEDIN_CLIENT_ID', 'your_linkedin_client_id'),
    client_secret=os.getenv('LINKEDIN_CLIENT_SECRET', 'your_linkedin_client_secret'),
    server_metadata_url='https://www.linkedin.com/oauth/v2',
    client_kwargs={
        'scope': 'r_liteprofile r_emailaddress'
    }
)

class OAuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict
    is_new_user: bool
    trial_days_remaining: int

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: dict
    is_new_user: bool = False
    trial_days_remaining: int = 0

@router.get("/auth/{provider}")
async def oauth_login(provider: str, request: Request):
    """Initiate OAuth login with the specified provider"""
    
    if provider not in ['github', 'google', 'linkedin']:
        raise HTTPException(status_code=400, detail="Unsupported OAuth provider")
    
    client = oauth.create_client(provider)
    if not client:
        raise HTTPException(status_code=500, detail=f"OAuth client for {provider} not configured")
    
    # Store the analysis_id in session if provided for post-signup linking
    analysis_id = request.query_params.get('analysis_id')
    if analysis_id:
        request.session['analysis_id'] = analysis_id
    
    # Redirect URI for the callback
    redirect_uri = f"{os.getenv('BASE_URL', 'http://localhost:8000')}/api/auth/{provider}/callback"
    
    return await client.authorize_redirect(request, redirect_uri)

@router.get("/auth/{provider}/callback")
async def oauth_callback(provider: str, request: Request, db: Session = Depends(get_db)):
    """Handle OAuth callback and create/login user"""
    
    if provider not in ['github', 'google', 'linkedin']:
        raise HTTPException(status_code=400, detail="Unsupported OAuth provider")
    
    try:
        client = oauth.create_client(provider)
        token = await client.authorize_access_token(request)
        
        # Get user info from the provider
        if provider == 'github':
            user_info = await get_github_user_info(client, token)
        elif provider == 'google':
            user_info = await get_google_user_info(client, token)
        elif provider == 'linkedin':
            user_info = await get_linkedin_user_info(client, token)
        else:
            raise HTTPException(status_code=400, detail="Unsupported provider")
        
        # Find or create user
        user = db.query(User).filter(User.email == user_info['email']).first()
        is_new_user = False
        
        if not user:
            # Create new user
            is_new_user = True
            user = User(
                email=user_info['email'],
                full_name=user_info['name'],
                avatar_url=user_info.get('avatar_url'),
                username=user_info.get('username'),
                subscription_tier=SubscriptionTier.FREE,
                trial_started=datetime.utcnow(),
                trial_ends=datetime.utcnow() + timedelta(days=7)
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Add OAuth provider information
            from app.models.user import OAuthProvider
            provider_enum = getattr(OAuthProvider, provider.upper())
            user.add_oauth_provider(provider_enum, {
                'id': str(user_info['id']),
                'username': user_info.get('username'),
                'avatar_url': user_info.get('avatar_url')
            })
            db.commit()
            
            # Link any pending free analysis to this user
            analysis_id = request.session.get('analysis_id')
            if analysis_id:
                from app.models.analysis import Analysis
                analysis = db.query(Analysis).filter(
                    Analysis.id == int(analysis_id),
                    Analysis.user_id.is_(None)
                ).first()
                if analysis:
                    analysis.user_id = user.id
                    db.commit()
        else:
            # Update existing user with latest OAuth info
            user.name = user_info['name']
            user.avatar_url = user_info.get('avatar_url')
            user.last_login_at = datetime.utcnow()
            db.commit()
        
        # Generate JWT tokens
        access_token = create_access_token({"sub": user.email, "user_id": user.id})
        refresh_token = create_refresh_token({"sub": user.email, "user_id": user.id})
        
        # Calculate trial days remaining
        trial_days_remaining = 0
        if user.is_trial_active():
            trial_days_remaining = (user.trial_ends - datetime.utcnow()).days
        
        # Redirect to frontend with tokens
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f"{frontend_url}/auth/callback?access_token={access_token}&refresh_token={refresh_token}&is_new_user={is_new_user}&trial_days={trial_days_remaining}"
        
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        print(f"OAuth callback error: {e}")
        # Redirect to frontend with error
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f"{frontend_url}/auth/error?message=Authentication failed"
        return RedirectResponse(url=redirect_url)

async def get_github_user_info(client, token):
    """Get user info from GitHub API"""
    
    # Get user profile
    resp = await client.get('https://api.github.com/user', token=token)
    resp.raise_for_status()
    user_data = resp.json()
    
    # Get user email (might be private)
    email_resp = await client.get('https://api.github.com/user/emails', token=token)
    email_resp.raise_for_status()
    emails = email_resp.json()
    
    # Find primary email
    primary_email = None
    for email in emails:
        if email.get('primary', False):
            primary_email = email['email']
            break
    
    if not primary_email and emails:
        primary_email = emails[0]['email']
    
    return {
        'id': user_data['id'],
        'name': user_data.get('name') or user_data.get('login'),
        'email': primary_email or user_data.get('email'),
        'avatar_url': user_data.get('avatar_url'),
        'username': user_data.get('login')
    }

async def get_google_user_info(client, token):
    """Get user info from Google API"""
    
    resp = await client.get('https://www.googleapis.com/oauth2/v2/userinfo', token=token)
    resp.raise_for_status()
    user_data = resp.json()
    
    return {
        'id': user_data['id'],
        'name': user_data.get('name'),
        'email': user_data.get('email'),
        'avatar_url': user_data.get('picture'),
        'username': user_data.get('email')
    }

async def get_linkedin_user_info(client, token):
    """Get user info from LinkedIn API"""
    
    # Get profile info
    profile_resp = await client.get(
        'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))',
        token=token
    )
    profile_resp.raise_for_status()
    profile_data = profile_resp.json()
    
    # Get email
    email_resp = await client.get(
        'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
        token=token
    )
    email_resp.raise_for_status()
    email_data = email_resp.json()
    
    # Extract email
    email = None
    if email_data.get('elements'):
        email = email_data['elements'][0]['handle~']['emailAddress']
    
    # Extract name
    first_name = profile_data.get('firstName', {}).get('localized', {}).get('en_US', '')
    last_name = profile_data.get('lastName', {}).get('localized', {}).get('en_US', '')
    name = f"{first_name} {last_name}".strip()
    
    # Extract avatar
    avatar_url = None
    picture_data = profile_data.get('profilePicture', {}).get('displayImage~', {})
    if picture_data.get('elements'):
        avatar_url = picture_data['elements'][0]['identifiers'][0]['identifier']
    
    return {
        'id': profile_data['id'],
        'name': name,
        'email': email,
        'avatar_url': avatar_url,
        'username': email
    }

@router.post("/auth/refresh")
async def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    
    try:
        from app.auth.jwt_handler import verify_refresh_token
        payload = verify_refresh_token(refresh_token)
        
        user_id = payload.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Generate new access token
        access_token = create_access_token({"sub": user.email, "user_id": user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.get("/auth/me")
async def get_current_user(request: Request, db: Session = Depends(get_db)):
    """Get current user info from JWT token"""
    
    try:
        from app.auth.jwt_handler import verify_access_token
        
        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="No valid authorization header")
        
        token = auth_header.split(" ")[1]
        payload = verify_access_token(token)
        
        user_id = payload.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        trial_days_remaining = 0
        if user.is_trial_active():
            trial_days_remaining = (user.trial_ends - datetime.utcnow()).days
        
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "avatar_url": user.avatar_url,
            "subscription_tier": user.subscription_tier.value,
            "trial_days_remaining": trial_days_remaining,
            "is_trial_active": user.is_trial_active(),
            "created_at": user.created_at.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/auth/logout")
async def logout():
    """Logout user (client should discard tokens)"""
    return {"message": "Logged out successfully"}

@router.post("/auth/signup", response_model=AuthResponse)
async def signup(signup_data: SignupRequest, db: Session = Depends(get_db)):
    """Create new user account with email and password"""
    
    # Validate email format
    if not validate_email(signup_data.email):
        raise HTTPException(
            status_code=400,
            detail="Invalid email format"
        )
    
    # Validate password strength
    is_valid, issues = password_validator.validate_password(signup_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail=f"Password validation failed: {', '.join(issues)}"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == signup_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Account with this email already exists"
        )
    
    try:
        # Create new user
        user = User.create_from_email_password(
            email=signup_data.email,
            password=signup_data.password,
            full_name=signup_data.full_name
        )
        
        # Generate username from email
        user.username = sanitize_username(signup_data.email)
        
        # Save to database
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create JWT tokens
        token_data = {
            "user_id": user.id,
            "email": user.email,
            "subscription_tier": user.subscription_tier.value,
            "username": user.username,
            "full_name": user.full_name
        }
        
        tokens = create_token_pair(token_data)
        
        # Calculate trial days remaining
        trial_days_remaining = 0
        if user.is_trial_active():
            trial_days_remaining = (user.trial_ends - datetime.now()).days
        
        return AuthResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type=tokens["token_type"],
            expires_in=tokens["expires_in"],
            user={
                "id": user.id,
                "email": user.email,
                "name": user.full_name,
                "username": user.username,
                "avatar_url": user.avatar_url,
                "subscription_tier": user.subscription_tier.value,
                "is_trial_active": user.is_trial_active(),
                "trial_days_remaining": trial_days_remaining,
                "created_at": user.created_at.isoformat()
            },
            is_new_user=True,
            trial_days_remaining=trial_days_remaining
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create account: {str(e)}"
        )

@router.post("/auth/login", response_model=AuthResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login user with email and password"""
    
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Check if user has a password (not OAuth-only)
    if not user.has_password():
        raise HTTPException(
            status_code=400,
            detail="This account was created with social login. Please use the 'Sign in with...' button."
        )
    
    # Verify password
    if not user.verify_password(login_data.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is deactivated. Please contact support."
        )
    
    try:
        # Update last login time
        user.last_login = datetime.now()
        db.commit()
        
        # Create JWT tokens
        token_data = {
            "user_id": user.id,
            "email": user.email,
            "subscription_tier": user.subscription_tier.value,
            "username": user.username,
            "full_name": user.full_name
        }
        
        tokens = create_token_pair(token_data)
        
        # Calculate trial days remaining
        trial_days_remaining = 0
        if user.is_trial_active():
            trial_days_remaining = (user.trial_ends - datetime.now()).days
        
        return AuthResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type=tokens["token_type"],
            expires_in=tokens["expires_in"],
            user={
                "id": user.id,
                "email": user.email,
                "name": user.full_name,
                "username": user.username,
                "avatar_url": user.avatar_url,
                "subscription_tier": user.subscription_tier.value,
                "is_trial_active": user.is_trial_active(),
                "trial_days_remaining": trial_days_remaining,
                "last_login": user.last_login.isoformat() if user.last_login else None
            },
            is_new_user=False,
            trial_days_remaining=trial_days_remaining
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        )