import logging
from django.conf import settings
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.db import IntegrityError
import time
import json

from .models import *

logger = logging.getLogger(__name__)
User = get_user_model()

@receiver(post_save, sender=Treatment)
def register_treatment_date(sender, instance, created, **kwargs):
    """ Register the treatment in the calendar"""

    if not created:
        return

    target_agenda = Agenda.objects.get(space=instance.space)
    target_category = AgendaItemCategory.objects.get(name="Traitements médicaux")

    title = "Traitement " + (instance.name[:30] + '...') if len(instance.name) > 30 else instance.name
    recipients = Treatment.objects.get(id=instance.id)
    print(recipients.prescribed_to)

    try:
        new_event = AgendaItem.objects.create(
        title=title,
        private=False,
        category=target_category,
        description= "",
        start_date=instance.start_date,
        end_date=instance.end_date,
        created_by=instance.registered_by,
        agenda=target_agenda,
        )


    except Exception as e:
        logger.exception(f"Failed to create Agenda item and Todo for treatment {instance!s}: {e}")

@receiver(post_save, sender=Invitation)
def send_invitation(sender, instance, created, **kwargs):
    """
    Send an email to the invited user.
    """
    if instance.accepted:
        return

    address = instance.email
    message = "Vous avez été invité(e) à rejoindre un espace aidant, suivez le lien ci-dessous pour vous inscrire. http://localhost:3000/invite/" + instance.token


    # try :
    #     send_mail(
    #     "Invitation à rejoindre un espace",
    #     message,
    #     settings.EMAIL_HOST_USER,
    #     [address],
    #     )
    # except Exception as e:
    #     print(e)


@receiver(post_save, sender=Space)
def create_caregiver_agenda_and_todolist(sender, instance, created, **kwargs):
    """
    Create an Agenda when a new Space is created and link the space to it.
    """
    if not created:
        return

    try:
        agenda = Agenda.objects.create(
            space=instance 
        )
        todolist = TodoList.objects.create(
            space=instance 
        )
        logger.info(f"Agenda and Todo created for space {instance!s}: agenda id={agenda.id}, todolist id={todolist.id}")
    except Exception as e:
        logger.exception(f"Failed to create Agenda and Todo for space {instance!s}: {e}")


@receiver(post_delete, sender=SpaceMembership)
def remove_caregiver_from_space(sender, instance, **kwargs):
    """
    Remove the caregiver from the space when its membership is deleted by the admin and create a new space
    """

    caregiver = Caregiver.objects.get(user=instance.user)
    space = Space.objects.get(id=instance.space.id)

    try:
      space.caregivers.remove(caregiver)

      new_space_name = f"{caregiver.first_name or caregiver.user.email}'s Space"
      new_space = Space.objects.create(
                name=new_space_name,
                description="Personal space created automatically",
                created_by=caregiver.user  # ensure created_by FK exists and allows null if needed
            )
      new_space.caregivers.add(caregiver)
      membership = SpaceMembership.objects.create(
        space=new_space,
        user= caregiver.user,
        role = caregiver.access_level
        )
    except Exception as e:
        raise ValidationError("couldn't remove the caregiver")

@receiver(post_save, sender=Caregiver)
def create_caregiver_space(sender, instance, created, **kwargs):
    """
    Create a Space and a Space membership when a new Caregiver is created and link the caregiver to it.
    """
    user = CustomUser.objects.get(id=instance.user.id)
    invitation_info = json.loads(user.invited)

    if not created:
        return

    try:
        space_name = f"{instance.first_name or instance.user.email}'s Space"

        space = {}

        if invitation_info["invited"] and (invitation_info["invited_by"] is not None):
            space = Space.objects.get(created_by=invitation_info["invited_by"])

        else:
            space = Space.objects.create(
                name=space_name,
                description="Personal space created automatically",
                created_by=instance.user  # ensure created_by FK exists and allows null if needed
            )


        # add the caregiver to the M2M after the space exists
        space.caregivers.add(instance)
        membership = SpaceMembership.objects.create(
        space=space,
        user= instance.user,
        role = instance.access_level
        )
        logger.info(f"Space created for caregiver {instance!s}: space id={space.id}")
        logger.info(f"Membership created for space {instance!s}: membership id={membership.id}")
    except Exception as e:
        logger.exception(f"Failed to create Space/membership for caregiver {instance!s}: {e}")



@receiver(pre_save, sender=Caregiver)
def update_membership(sender, instance, **kwargs):

    membership = {}

    if instance.access_level > 3:
        raise IntegrityError("role cannot be greater than 3")

    try:
       membership = SpaceMembership.objects.get(user=instance.user)
    except ObjectDoesNotExist:
        return

    try:
        membership.role = instance.access_level
        membership.save()
    except Exception as e:
        raise ValidationError("Couldn't edit the membership")



@receiver(pre_save, sender=User)
def update_caregiver_profile(sender, instance, **kwargs):
    """
    Update Caregiver object whenever the linked user is edited
    """

    caregiver = {}
    try:
        caregiver = Caregiver.objects.get(user=instance)
    except ObjectDoesNotExist:
        return

    if caregiver.last_name == instance.last_name and caregiver.first_name == instance.first_name:
        return

    if caregiver.last_name != instance.last_name:
        caregiver.last_name = instance.last_name
    if caregiver.first_name != instance.first_name:
        caregiver.first_name = instance.first_name

    try:
        caregiver.save()
    except Exception as e:
        raise ValidationError("Echec de la modification de l'objet Caregiver")

@receiver(post_save, sender=User)
def create_caregiver_profile(sender, instance, created, **kwargs):
    """
    Create a Caregiver when a new User is created.
    We populate first_name/last_name from the user if available to avoid DB errors.
    """

    if not created:
        return

    invitation_info = json.loads(instance.invited)

    try:
        first_name = getattr(instance, 'first_name', '') or ''
        last_name = getattr(instance, 'last_name', '') or ''

        # If fields in Person are required, provide safe fallbacks
        caregiver = Caregiver.objects.create(
            user=instance,
            first_name=first_name,
            last_name=last_name,
            access_level=invitation_info['role']
        )
        logger.info(f"Caregiver created for user {instance!s}: caregiver id={caregiver.id}")
    except Exception as e:
        # Make sure we log the error so you can see why creation failed
        logger.exception(f"Failed to create Caregiver for user {instance!s}: {e}")

