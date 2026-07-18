import os
import pickle
import json
from datetime import datetime
from app.config import settings

class ModelLoader:
    def __init__(self):
        self.model = None
        self.feature_importance = {}
        self.model_info = {}
        self.load_all()

    def load_all(self):
        # Load model binary
        if os.path.exists(settings.MODEL_PATH):
            try:
                with open(settings.MODEL_PATH, "rb") as f:
                    self.model = pickle.load(f)
            except Exception as e:
                print(f"Error loading model: {e}")
                self.model = None

        # Load feature importance
        importance_path = "model/feature_importance.json"
        if os.path.exists(importance_path):
            try:
                with open(importance_path, "r", encoding="utf-8") as f:
                    self.feature_importance = json.load(f)
            except Exception as e:
                print(f"Error loading feature importance: {e}")

        # Load model info metadata
        model_info_path = "model/model_info.json"
        if os.path.exists(model_info_path):
            try:
                with open(model_info_path, "r", encoding="utf-8") as f:
                    self.model_info = json.load(f)
            except Exception as e:
                print(f"Error loading model info: {e}")
        else:
            # Fallback nếu chưa chạy cập nhật train.py sinh file model_info.json
            self.model_info = {
                "version": "1.0.0",
                "algorithm": "LightGBM",
                "trainedAt": datetime.now().strftime("%Y-%m-%d"),
                "features": [
                    'income', 'age', 'salary_account', 'email_open_count', 'email_click_count',
                    'website_visit_count', 'loan_inquiry_count', 'branch_visit_count', 'call_count',
                    'has_saving', 'has_credit_card', 'has_insurance'
                ],
                "performance": {
                    "aucRoc": 0.8493,
                    "precision": 0.8620,
                    "recall": 0.7507,
                    "f1Score": 0.8025
                }
            }

model_loader = ModelLoader()
