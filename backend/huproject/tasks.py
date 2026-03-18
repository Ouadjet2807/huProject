from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from .models import *
import json

def register_notification(message, title, data, path, space, receivers):

    json_data = json.dumps(data)

    for receiver in receivers:
        Notification.objects.create(space=space, title=title, message=message, user=receiver, reference_item=json_data, object_path=path)

@shared_task
def check_treatment_expiration():

    today = timezone.now().date()
    reminder_date = today + timedelta(7)

    treatments = Treatment.everything.all()


    for treatment in treatments:

        data = {
            "type": "treatment",
            "objects": [str(treatment.id)]
            }

        path = f"/recipient/{treatment.prescribed_to.id}/treatments/{str(treatment.id)}"

        space = treatment.space

        if treatment.end_date == reminder_date and not treatment.reminder_sent:

            title = "Un traitement va bientôt expirer"
            message = f"Le traitement {treatment.name} arrive à expiration dans 7 jours"

            register_notification(
                message, title, data, path, space, space.caregivers.all()
            )
            treatment.reminder_sent = True
            treatment.save()
        if treatment.end_date == (today - timedelta(1)) and not treatment.expired_notification_sent:

            title = "Un traitement a expiré"
            message = f"Le traitement {treatment.name} a expiré"

            register_notification(
                message, title, data, path, space, space.caregivers.all()
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

@shared_task
def check_events_reminder():

    events = AgendaItem.objects.all()

    now = timezone.now() + timedelta(hours=1)

    frequency_fr = {
        "minutes": "minute(s)",
        "hours": "heure(s)",
        "days": "jour(s)",
        "weeks": "semaine(s)"
    }

    for event in events:

        if event.reminder_sent or not event.reminder or type(event.reminder) == 'str':
            continue

        reminder_dict = json.loads(event.reminder)

        timedeltaKwargs = {f"{reminder_dict['value'][0]}": reminder_dict["value"][1]}
        reminder_time = event.start_date - timedelta(**timedeltaKwargs)
        print(f"reminder_time: {reminder_time}")
        print(f"start_date: {event.start_date}")
        print(f"now: {now.replace(microsecond=0)}")
        print(now.replace(microsecond=0) == reminder_time)
        if reminder_time == now.replace(microsecond=0):


            title = f"Rappel d'événement"
            message = f'Rappel de votre événement "{event.title}" dans {reminder_dict["value"][1]} {frequency_fr[str(reminder_dict["value"][0])]}'

            data = {
                "type": "event",
                "objects": [str(event.id)]
            }

            path = f"/calendar/{str(event.id)}"

            space = Space.objects.get(agenda_space=event.agenda)

            register_notification(
                message, title, data, path, space, event.caregivers.all()
            )

            event.reminder_sent = True
            event.save()

