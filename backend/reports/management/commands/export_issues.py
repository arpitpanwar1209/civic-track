import csv
from django.core.management.base import BaseCommand
from reports.models import Issue  # adjust if your model path differs

class Command(BaseCommand):
    help = "Export all issues to CSV for machine learning or analysis."

    def handle(self, *args, **kwargs):
        filename = "issues_dataset.csv"

        # Define CSV fields (you can add more like priority, location, etc.)
        fields = ["id", "title", "description", "category", "priority", "status", "created_at"]

        with open(filename, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow(fields)

            for issue in Issue.objects.all():
                writer.writerow([
                    issue.id,
                    issue.title,
                    issue.description,
                    issue.category,
                    issue.priority,
                    issue.status,
                    issue.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                ])

        self.stdout.write(self.style.SUCCESS(f"✅ Exported {Issue.objects.count()} issues to {filename}"))
