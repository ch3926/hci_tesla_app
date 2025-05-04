import xgboost as xgb
import json
from data.data_loader import load_dataset
from data.preprocessor import preprocess_data
from config import constants

def train_model():
    # Load data
    df = load_dataset()
    
    # Preprocess
    X_train, X_test, y_train, y_test = preprocess_data(df)
    
    # Load params
    with open("config/model_params.json") as f:
        params = json.load(f)
    
    # Train model
    model = xgb.XGBRegressor(**params)
    model.fit(X_train, y_train,
              eval_set=[(X_test, y_test)],
              early_stopping_rounds=20,
              verbose=True)
    
    # Save model
    model.save_model(constants.DATA_PATHS["model_output"])

if __name__ == "__main__":
    train_model()