"""
Password Utilities
==================
Password validation, strength checking, and security utilities for WeReady authentication.
"""

import re
from typing import Dict, List, Tuple
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class PasswordValidator:
    """Password validation and strength checking"""
    
    MIN_LENGTH = 8
    MAX_LENGTH = 128
    
    @staticmethod
    def validate_password(password: str) -> Tuple[bool, List[str]]:
        """
        Validate password strength and return issues
        
        Args:
            password: Password to validate
            
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        issues = []
        
        # Length check
        if len(password) < PasswordValidator.MIN_LENGTH:
            issues.append(f"Password must be at least {PasswordValidator.MIN_LENGTH} characters long")
        
        if len(password) > PasswordValidator.MAX_LENGTH:
            issues.append(f"Password must be no more than {PasswordValidator.MAX_LENGTH} characters long")
        
        # Character type checks
        if not re.search(r'[a-z]', password):
            issues.append("Password must contain at least one lowercase letter")
        
        if not re.search(r'[A-Z]', password):
            issues.append("Password must contain at least one uppercase letter")
        
        if not re.search(r'\d', password):
            issues.append("Password must contain at least one number")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            issues.append("Password must contain at least one special character")
        
        # Common password checks
        common_passwords = [
            'password', '123456', '123456789', 'qwerty', 'abc123', 'monkey',
            'letmein', 'dragon', '111111', 'baseball', 'iloveyou', 'trustno1',
            'sunshine', 'master', '123123', 'welcome', 'shadow', 'ashley',
            'football', 'jesus', 'michael', 'ninja', 'mustang', 'password1'
        ]
        
        if password.lower() in common_passwords:
            issues.append("Password is too common, please choose a more unique password")
        
        return len(issues) == 0, issues
    
    @staticmethod
    def get_password_strength(password: str) -> Dict[str, any]:
        """
        Get detailed password strength analysis
        
        Args:
            password: Password to analyze
            
        Returns:
            Dictionary with strength score and analysis
        """
        score = 0
        feedback = []
        
        # Length scoring
        if len(password) >= 8:
            score += 1
        if len(password) >= 12:
            score += 1
        if len(password) >= 16:
            score += 1
        
        # Character diversity
        if re.search(r'[a-z]', password):
            score += 1
        if re.search(r'[A-Z]', password):
            score += 1
        if re.search(r'\d', password):
            score += 1
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 1
        
        # Pattern checks
        if not re.search(r'(.)\1{2,}', password):  # No repeated characters
            score += 1
        if not re.search(r'(012|123|234|345|456|567|678|789|890)', password):  # No sequential numbers
            score += 1
        
        # Strength levels
        if score <= 3:
            strength = "weak"
            feedback.append("Consider using a longer password with mixed case, numbers, and symbols")
        elif score <= 6:
            strength = "medium"
            feedback.append("Good password! Consider making it longer for extra security")
        else:
            strength = "strong"
            feedback.append("Excellent password strength!")
        
        return {
            "score": score,
            "max_score": 9,
            "strength": strength,
            "feedback": feedback
        }


def hash_password(password: str) -> str:
    """
    Hash password using passlib/bcrypt
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """
    Verify password against hash
    
    Args:
        password: Plain text password
        hashed: Hashed password
        
    Returns:
        True if password matches hash
    """
    try:
        return pwd_context.verify(password, hashed)
    except Exception:
        return False


def generate_secure_token(length: int = 32) -> str:
    """
    Generate cryptographically secure random token
    
    Args:
        length: Length of token in bytes
        
    Returns:
        Hex-encoded random token
    """
    import secrets
    return secrets.token_hex(length)


def validate_email(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email address to validate
        
    Returns:
        True if email format is valid
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def sanitize_username(email: str) -> str:
    """
    Generate a clean username from email
    
    Args:
        email: Email address
        
    Returns:
        Sanitized username
    """
    username = email.split('@')[0]
    # Remove special characters, keep only alphanumeric and underscore
    username = re.sub(r'[^a-zA-Z0-9_]', '', username)
    return username.lower()[:50]  # Limit length


# Password validation instance
password_validator = PasswordValidator()