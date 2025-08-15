import asyncio
from app.core.hallucination_detector import HallucinationDetector

class TestHallucinationDetector:
    """Test suite for Tree-sitter based hallucination detection"""
    
    def setup_method(self):
        """Setup detector for each test"""
        self.detector = HallucinationDetector()
    
    # PYTHON TEST CASES
    
    async def test_python_hallucinated_packages(self):
        """Test detection of known hallucinated Python packages"""
        test_code = """
import super_ai_helper
from quantum_processor import quantize
import amazing_ml_toolkit
from neural_magic import optimize
import requests  # This is real
import numpy as np  # This is real
"""
        result = await self.detector.detect(test_code, "python")
        
        # Should detect the fake packages
        expected_hallucinated = {"super_ai_helper", "quantum_processor", "amazing_ml_toolkit", "neural_magic"}
        actual_hallucinated = set(result.hallucinated_packages)
        
        # Check that fake packages are detected
        assert expected_hallucinated.issubset(actual_hallucinated), f"Missing hallucinated packages: {expected_hallucinated - actual_hallucinated}"
        
        # Check that real packages are NOT flagged
        assert "requests" not in actual_hallucinated, "requests should not be flagged as hallucinated"
        assert "numpy" not in actual_hallucinated, "numpy should not be flagged as hallucinated"
        
        # Confidence should be high for Tree-sitter parsing
        assert result.confidence > 0.8, f"Confidence too low: {result.confidence}"
        assert result.details["parsing_method"] == "tree_sitter"
    
    async def test_python_complex_imports(self):
        """Test complex Python import patterns"""
        test_code = """
# Various import patterns that should work with Tree-sitter
import os
import sys, json
from pathlib import Path
from collections import defaultdict, Counter
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
import tensorflow as tf

# These are hallucinated
import quantum_neural_net
from super_ai_helper import magic_function
from deepmind_secret import solve_everything
import openai_v5  # OpenAI doesn't have v5 yet

# Multiline imports
from really_long_package_name import (
    function_one,
    function_two,
    function_three
)

# Import with alias
import some_fake_package as sfp
"""
        result = await self.detector.detect(test_code, "python")
        
        # Should detect hallucinated packages
        hallucinated = set(result.hallucinated_packages)
        expected_fake = {"quantum_neural_net", "super_ai_helper", "deepmind_secret", "openai_v5", "some_fake_package"}
        
        assert expected_fake.issubset(hallucinated), f"Missing fake packages: {expected_fake - hallucinated}"
        
        # Should NOT flag real packages
        real_packages = {"os", "sys", "json", "pathlib", "collections", "numpy", "pandas", "sklearn", "tensorflow"}
        flagged_real = real_packages.intersection(hallucinated)
        assert len(flagged_real) == 0, f"Real packages incorrectly flagged: {flagged_real}"
    
    async def test_python_relative_imports(self):
        """Test that relative imports are ignored"""
        test_code = """
from . import utils
from ..models import BaseModel
from ...config import settings
import super_ai_helper  # This should be detected
"""
        result = await self.detector.detect(test_code, "python")
        
        # Should only detect the absolute fake import
        assert "super_ai_helper" in result.hallucinated_packages
        
        # Should not try to validate relative imports
        relative_imports = [pkg for pkg in result.details["packages_found"] if pkg.startswith('.')]
        assert len(relative_imports) == 0, "Relative imports should not be included in package list"
    
    # JAVASCRIPT TEST CASES
    
    async def test_javascript_hallucinated_packages(self):
        """Test detection of known hallucinated JavaScript packages"""
        test_code = """
const superAiHelper = require('super_ai_helper');
import { quantize } from 'quantum_processor';
const amazingTool = require('amazing-ml-toolkit');
import neuralMagic from 'neural-magic';

// These are real packages
const express = require('express');
import React from 'react';
import axios from 'axios';
"""
        result = await self.detector.detect(test_code, "javascript")
        
        # Should detect fake packages
        expected_fake = {"super_ai_helper", "quantum_processor", "amazing-ml-toolkit", "neural-magic"}
        actual_hallucinated = set(result.hallucinated_packages)
        
        assert expected_fake.issubset(actual_hallucinated), f"Missing fake packages: {expected_fake - actual_hallucinated}"
        
        # Should NOT flag real packages
        assert "express" not in actual_hallucinated
        assert "react" not in actual_hallucinated
        assert "axios" not in actual_hallucinated
    
    async def test_javascript_complex_imports(self):
        """Test complex JavaScript import patterns"""
        test_code = """
// ES6 imports
import React, { useState, useEffect } from 'react';
import { Button, Input } from 'antd';
import axios from 'axios';

// CommonJS requires
const express = require('express');
const { Pool } = require('pg');

// Scoped packages (real)
import { createClient } from '@supabase/supabase-js';
const stripe = require('@stripe/stripe-js');

// Scoped packages (fake)
import { aiMagic } from '@openai/secret-sauce';
const quantumLib = require('@google/quantum-computer');

// Fake packages
import superAI from 'super-ai-v2';
const mindReader = require('mind-reader-pro');

// Relative imports (should be ignored)
import './styles.css';
const utils = require('../utils');
"""
        result = await self.detector.detect(test_code, "javascript")
        
        hallucinated = set(result.hallucinated_packages)
        
        # Should detect fake packages
        expected_fake = {"@openai/secret-sauce", "@google/quantum-computer", "super-ai-v2", "mind-reader-pro"}
        assert expected_fake.issubset(hallucinated), f"Missing fake packages: {expected_fake - hallucinated}"
        
        # Should NOT flag real packages
        real_packages = {"react", "antd", "axios", "express", "pg", "@supabase/supabase-js", "@stripe/stripe-js"}
        flagged_real = real_packages.intersection(hallucinated)
        assert len(flagged_real) == 0, f"Real packages incorrectly flagged: {flagged_real}"
    
    async def test_mixed_language_accuracy(self):
        """Test accuracy across both languages"""
        python_code = """
import requests
import numpy
import super_ai_helper
import quantum_processor
"""
        
        js_code = """
const express = require('express');
import React from 'react';
const fakeLib = require('super_ai_helper');
import { quantum } from 'quantum_processor';
"""
        
        py_result = await self.detector.detect(python_code, "python")
        js_result = await self.detector.detect(js_code, "javascript")
        
        # Python results
        assert "super_ai_helper" in py_result.hallucinated_packages
        assert "quantum_processor" in py_result.hallucinated_packages
        assert "requests" not in py_result.hallucinated_packages
        assert "numpy" not in py_result.hallucinated_packages
        
        # JavaScript results  
        assert "super_ai_helper" in js_result.hallucinated_packages
        assert "quantum_processor" in js_result.hallucinated_packages
        assert "express" not in js_result.hallucinated_packages
        assert "react" not in js_result.hallucinated_packages
        
        # Both should have high confidence with Tree-sitter
        assert py_result.confidence > 0.8
        assert js_result.confidence > 0.8
    
    async def test_accuracy_target(self):
        """Test that we achieve 80%+ accuracy on a comprehensive test"""
        test_cases = [
            # (code, language, expected_hallucinated_count, total_packages)
            ("import numpy\nimport super_ai_helper", "python", 1, 2),
            ("const express = require('express');\nconst fake = require('quantum_lib');", "javascript", 1, 2),
            ("from quantum_processor import magic\nimport requests", "python", 1, 2),
            ("import React from 'react';\nimport { ai } from 'neural-magic';", "javascript", 1, 2),
        ]
        
        total_correct = 0
        total_predictions = 0
        
        for code, language, expected_hallucinated, total_packages in test_cases:
            result = await self.detector.detect(code, language)
            actual_hallucinated = len(result.hallucinated_packages)
            
            if actual_hallucinated == expected_hallucinated:
                total_correct += total_packages
            else:
                # Partial credit for partially correct results
                total_correct += max(0, total_packages - abs(actual_hallucinated - expected_hallucinated))
            
            total_predictions += total_packages
        
        accuracy = total_correct / total_predictions
        print(f"Overall accuracy: {accuracy:.2%}")
        
        # Target: 80%+ accuracy
        assert accuracy >= 0.8, f"Accuracy {accuracy:.2%} below 80% target"

# Performance test
async def test_performance():
    """Test that detection is reasonably fast"""
    import time
    detector = HallucinationDetector()
    
    large_code = """
import numpy
import pandas
import requests
import super_ai_helper
from quantum_processor import magic
import tensorflow
import scikit_learn
import amazing_ml_toolkit
""" * 100  # Large code sample
    
    start_time = time.time()
    result = await detector.detect(large_code, "python")
    end_time = time.time()
    
    processing_time = end_time - start_time
    print(f"Processing time for large code: {processing_time:.2f}s")
    
    # Should complete within reasonable time (adjust as needed)
    assert processing_time < 5.0, f"Processing too slow: {processing_time:.2f}s"

# Run all tests
async def run_all_tests():
    """Run the complete test suite"""
    test_instance = TestHallucinationDetector()
    
    print("🚀 Starting WeReady Hallucination Detection Tests...")
    print("=" * 60)
    
    tests = [
        ("Python Hallucinated Packages", test_instance.test_python_hallucinated_packages),
        ("Python Complex Imports", test_instance.test_python_complex_imports),
        ("Python Relative Imports", test_instance.test_python_relative_imports),
        ("JavaScript Hallucinated Packages", test_instance.test_javascript_hallucinated_packages),
        ("JavaScript Complex Imports", test_instance.test_javascript_complex_imports),
        ("Mixed Language Accuracy", test_instance.test_mixed_language_accuracy),
        ("80% Accuracy Target", test_instance.test_accuracy_target),
        ("Performance Test", test_performance),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            test_instance.setup_method()
            await test_func()
            print(f"✅ {test_name}")
            passed += 1
        except Exception as e:
            print(f"❌ {test_name}: {e}")
            failed += 1
    
    print("=" * 60)
    print(f"Tests completed: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 ALL TESTS PASSED! WeReady hallucination detection is ready to ship!")
        print("🚀 This is your 20% market advantage - first-mover on AI code validation!")
    else:
        print("⚠️  Some tests failed. Fix them before shipping.")
    
    return failed == 0

if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    exit(0 if success else 1)