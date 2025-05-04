from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

def preprocess_data(df):
    """Preprocess data and return features/target split"""
    X = df.drop("consumption", axis=1)
    y = df["consumption"]
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save scaler
    joblib.dump(scaler, "models/scaler.pkl")
    
    return X_train_scaled, X_test_scaled, y_train, y_test