from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import *


def register_notification(item, message):
    print("register")
    Notification.objects.create(space=item.space, message=message)

@shared_task
def check_treatment_expiration():

    today = timezone.now().date()
    reminder_date = today + timedelta(7)

    treatments = Treatment.everything.all()


    for treatment in treatments:
        print(f"treatment date : {treatment.end_date}")
        print(f"expiration date : {reminder_date}")
        if treatment.end_date == reminder_date and not treatment.reminder_sent:


            register_notification(
                treatment, f"Le traitement {treatment.name} arrive à expiration dans 7 jours"
            )
            treatment.reminder_sent = True
            treatment.save()
        if treatment.end_date == (today - timedelta(1)) and not treatment.expired_notification_sent:
            register_notification(
                treatment, f"Le traitement {treatment.name} a expiré"
            )

            treatment.expired_notification_sent = True
            treatment.save()

