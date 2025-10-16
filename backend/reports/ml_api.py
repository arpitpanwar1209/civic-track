# reports/ml_api.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status


@api_view(["POST"])
@permission_classes([AllowAny])  # optional: make it open for now
def predict_category(request):
    """
    API endpoint to predict issue category from text description.
    Example request:
      POST /api/predict-category/
      { "description": "Pothole near the main road causing traffic" }
    """
    description = request.data.get("description", "")

    if not description.strip():
        return Response({"error": "Description is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        predicted = predict_issue_category(description)
        return Response({"predicted_category": predicted}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
