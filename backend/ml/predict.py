import os
import joblib
from django.conf import settings

# Paths to model files
MODEL_PATH = os.path.join(settings.BASE_DIR, "ml", "issue_model.pkl")
VEC_PATH = os.path.join(settings.BASE_DIR, "ml", "issue_vectorizer.pkl")

# Load model + vectorizer once
model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VEC_PATH)


def predict_issue_category(description: str) -> str:
    """
    Predict issue category using trained ML model.
    Returns one of: road, garbage, water, electricity, other
    """

    if not description:
        return "other"

    X = vectorizer.transform([description])
    prediction = model.predict(X)[0]
    return prediction
