import pandas as pd
from config import constants

def load_dataset():
    """Load and return the training dataset"""
    return pd.read_csv(constants.DATA_PATHS["training_data"])

def save_dataset(df, path):
    """Save processed dataset"""
    df.to_csv(path, index=False)