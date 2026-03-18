from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from .models import *
import json

def register_notification(item, message, title):
    space = item.space
    data = {
       "type": "treatment",
       "objects": [str(item.id)]
    }
    json_data = json.dumps(data)
    path = f"/recipient/{item.prescribed_to.id}/treatments/{str(item.id)}"

    for caregiver in space.caregivers.all():
        Notification.objects.create(space=item.space, title=title, message=message, user=caregiver, reference_item=json_data, object_path=path)

@shared_task
def check_treatment_expiration():

    today = timezone.now().date()
    reminder_date = today + timedelta(7)

    treatments = Treatment.everything.all()


    for treatment in treatments:

        if treatment.end_date == reminder_date and not treatment.reminder_sent:

            register_notification(
                treatment, f"Le traitement {treatment.name} arrive à expiration dans 7 jours", "Un traitement va bientôt expirer"
            )
            treatment.reminder_sent = True
            treatment.save()
        if treatment.end_date == (today - timedelta(1)) and not treatment.expired_notification_sent:
            register_notification(
                treatment, f"Le traitement {treatment.name} a expiré", "Un traitement a expiré"
            )

            treatment.expired_notification_sent = True
            treatment.save()


@shared_task
def reset_todos():
    todo_items = TodoListItem.objects.all()

    today = timezone.now()

    frequencies = {
        "daily": today - timedelta(days=1),
        "weekly": today - timedelta(weeks=1),
        "monthly": today - relativedelta(months=1)
    }

    for item in todo_items:
        if not item.completed or item.frequency == "punctual":
          continue

        for key in frequencies:

            if item.frequency == key and item.updated_at < frequencies[key]:
                item.completed = False
                item.save()




