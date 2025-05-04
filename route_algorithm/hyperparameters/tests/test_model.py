import pytest
from models.predict import ConsumptionPredictor
from data.data_loader import load_dataset

def test_model_loading():
    predictor = ConsumptionPredictor()
    assert predictor.model is not None
    assert predictor.scaler is not None

def test_data_loading():
    df = load_dataset()
    assert not df.empty
    assert "consumption" in df.columns

def test_prediction():
    predictor = ConsumptionPredictor()
    sample_input = [20, 10, 150, 0, 80, 2.5]
    prediction = predictor.predict(sample_input)
    assert 0.1 < prediction < 0.5