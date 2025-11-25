from django.http import JsonResponse

# -------------------------------------------------
# Health Check (Used for testing + deployment ping)
# -------------------------------------------------
def health_check(request):
    return JsonResponse({
        "status": "ok",
        "service": "CivicTrack API",
        "message": "Backend is running"
    })
