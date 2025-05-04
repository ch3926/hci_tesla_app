import xgboost as xgb
import joblib
import numpy as np
from config import constants

class ConsumptionPredictor:
    def __init__(self):
        self.model = xgb.Booster()
        self.model.load_model(constants.DATA_PATHS["model_output"])
        self.scaler = joblib.load("models/scaler.pkl")
    
    def predict(self, input_data):
        """Predict consumption for given input"""
        scaled_data = self.scaler.transform(np.array([input_data]))
        dmatrix = xgb.DMatrix(scaled_data)
        return self.model.predict(dmatrix)[0]