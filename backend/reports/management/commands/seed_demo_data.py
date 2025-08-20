from django.core.management.base import BaseCommand
from accounts.models import CustomUser
from reports.models import Issue, FlagReport

class Command(BaseCommand):
    help = 'Seed the database with demo data for testing'

    def handle(self, *args, **kwargs):
        consumer1, _ = CustomUser.objects.get_or_create(
    username='consumer1',
    defaults={'password': 'pass123', 'role': 'consumer'}
)

consumer2, _ = CustomUser.objects.get_or_create(
    username='consumer2',
    defaults={'password': 'pass123', 'role': 'consumer'}
)

provider1, _ = CustomUser.objects.get_or_create(
    username='provider1',
    defaults={'password': 'pass123', 'role': 'provider'}
)


issue1 = Issue.objects.create(
            title='Broken Streetlight near Park',
            description='The streetlight near Green Park is broken and makes the area unsafe at night.',
            category='lighting',
            priority='medium',
            status='pending',
            location='Green Park',
            reported_by=consumer1,
        )

issue2 = Issue.objects.create(
            title='Overflowing Garbage Bin',
            description='Garbage bin overflowing for 3 days. Needs urgent attention.',
            category='garbage',
            priority='urgent',
            status='under_review',
            location='Sector 22 Market',
            reported_by=consumer2,
            assigned_to=provider1,
        )

issue3 = Issue.objects.create(
            title='Duplicate Garbage Complaint',
            description='This seems to be a duplicate of an earlier garbage issue.',
            category='garbage',
            priority='low',
            status='pending',
            location='Sector 22 Market',
            reported_by=consumer1,
        )

FlagReport.objects.create(
            issue=issue3,
            reported_by=consumer2,
            reason='duplicate',
            comment='Duplicate of the previous garbage complaint.',
        )

FlagReport.objects.create(
            issue=issue1,
            reported_by=consumer2,
            reason='inappropriate',
            comment='This seems like a fake report. No such light in the mentioned area.',
        )

self.stdout.write(self.style.SUCCESS('✅ Demo data seeded successfully.'))
