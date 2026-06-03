from celery import shared_task
from django.utils import timezone
from django.db import connection
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from .models import * 
import json


@shared_task
def debug_db():
    print("DATABASES:", settings.DATABASES)
    print("DB NAME:", connection.settings_dict["NAME"])
    print("DB HOST:", connection.settings_dict["HOST"])


def register_notification(message, title, data, path, space, receivers):

    json_data = json.dumps(data)

    for receiver in receivers:
        Notification.objects.create(space=space, title=title, message=message, user=receiver, reference_item=json_data, object_path=path)

@shared_task
def check_treatment_expiration():


    print("check treatments")
    print("blablabla")

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
        if treatment.end_date <= (today - timedelta(1)) and not treatment.expired_notification_sent:

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
    print(TodoListItem.objects.count)

    print(todo_items)

    print("reset todos")

    today = timezone.now()

    frequencies = {
        "daily": today - timedelta(days=1),
        "weekly": today - timedelta(weeks=1),
        "monthly": today - relativedelta(months=1)
    }



    for item in todo_items:

        try:
           item.completed = False
           item.save()
           print("blablabli")
        except Exception as e:
            print(e)
        if not item.completed or item.frequency == "punctual":
          continue

        for key in frequencies:
            if item.frequency == key and item.updated_at <= frequencies[key]:
                item.completed = False
                item.save()

@shared_task
def check_events_reminder():


    print("check events")
    print("blablablou")

    events = AgendaItem.objects.all()

    print(events)

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

