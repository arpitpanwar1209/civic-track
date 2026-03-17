from geopy.distance import geodesic
from accounts.models import ProviderProfile


def auto_assign_issue(issue):

    if not issue.latitude or not issue.longitude:
        return

    providers = ProviderProfile.objects.filter(
        department=issue.category
    )

    if not providers.exists():
        return

    issue_location = (float(issue.latitude), float(issue.longitude))

    nearest_provider = None
    nearest_distance = 9999

    for provider in providers:

        provider_location = (
            float(provider.latitude),
            float(provider.longitude)
        )

        distance = geodesic(issue_location, provider_location).km

        if distance < nearest_distance:
            nearest_distance = distance
            nearest_provider = provider

    if nearest_provider:

        issue.assigned_provider = nearest_provider.user
        issue.status = "assigned"
        issue.save()