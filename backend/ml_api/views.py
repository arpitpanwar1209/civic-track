# backend/ml_api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import joblib, os
from django.conf import settings

MODEL_DIR = os.path.join(settings.BASE_DIR, "ml_models")
MODEL_PATH = os.path.join(MODEL_DIR, "issue_category_model.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")

class PredictCategoryView(APIView):
    """
    Predict category of an issue description using the trained ML model.
    """

    def post(self, request):
        description = request.data.get("description", "")
        if not description:
            return Response({"error": "No description provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            model = joblib.load(MODEL_PATH)
            vectorizer = joblib.load(VECTORIZER_PATH)
        except Exception as e:
            return Response({"error": f"Model load failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            X_vec = vectorizer.transform([description])
            pred = model.predict(X_vec)[0]
            return Response({"predicted_category": pred}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Prediction failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
