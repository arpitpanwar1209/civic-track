# backend/ml_api/urls.py
from django.urls import path
from .views import PredictCategoryView

urlpatterns = [
    path("predict/", PredictCategoryView.as_view(), name="predict_category"),
]
