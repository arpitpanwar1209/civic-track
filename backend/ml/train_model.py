import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

# Example training data (replace with your large dataset!)
data = [
    ("Huge potholes on the road causing accidents", "road"),
    ("Garbage is piled up near the market", "garbage"),
    ("Water pipeline leakage in sector 14", "water"),
    ("Electric wires are hanging dangerously", "electricity"),
]

df = pd.DataFrame(data, columns=["text", "category"])

# Train Model
vectorizer = TfidfVectorizer(stop_words="english")
X = vectorizer.fit_transform(df["text"])
y = df["category"]

model = LogisticRegression()
model.fit(X, y)

# Save Model + Vectorizer
joblib.dump(vectorizer, "issue_vectorizer.pkl")
joblib.dump(model, "issue_model.pkl")

print("✅ Model trained and saved")
