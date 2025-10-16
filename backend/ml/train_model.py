import os
import sys
import django
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# ✅ Step 1: Configure Django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)  # Add backend project folder to Python path
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "civictrack.settings")

django.setup()

from reports.models import Issue  # ✅ Import after setup


def train_model():
    print("📊 Fetching issues from database...")
    issues = Issue.objects.all().values("description", "category")
    df = pd.DataFrame(issues)

    if df.empty:
        print("❌ No issues found in the database.")
        return

    # 🧹 Clean data
    df.dropna(subset=["description", "category"], inplace=True)

    X = df["description"]
    y = df["category"]

    print(f"✅ Loaded {len(df)} issues for training")

    # 🔤 Convert text → numerical features
    vectorizer = TfidfVectorizer(stop_words="english", max_features=500)
    X_vec = vectorizer.fit_transform(X)

    # 🎯 Split data
    X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.2, random_state=42)

    # 🌲 Train model
    print("🚀 Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # 🧪 Evaluate
    y_pred = model.predict(X_test)
    print("\n📈 Model Performance:")
    print(classification_report(y_test, y_pred))

    # 💾 Save model & vectorizer
    os.makedirs("ml_models", exist_ok=True)
    joblib.dump(model, os.path.join("ml_models", "issue_category_model.pkl"))
    joblib.dump(vectorizer, os.path.join("ml_models", "tfidf_vectorizer.pkl"))

    print("✅ Model and vectorizer saved in 'ml_models/' folder")


if __name__ == "__main__":
    train_model()
