import logging
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
import time
import json

from .models import *

logger = logging.getLogger(__name__)
User = get_user_model()

@receiver(post_save, sender=Invitation)
def send_invitation(sender, instance, created, **kwargs):
    """
    Send an email to the invited user.
    """

    address = instance.email
    message = "Vous avez été invité(e) à rejoindre un espace aidant, suivez le lien ci-dessous pour vous inscrire. http://localhost:3000/invite/" + instance.token

    if instance.accepted:
        return

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
def create_caregiver_agenda(sender, instance, created, **kwargs):
    """
    Create an Agenda when a new Space is created and link the space to it.
    """
    if not created:
        return

    try:
        agenda = Agenda.objects.create(
            space=instance 
        )
        logger.info(f"Space created for space {instance!s}: agenda id={agenda.id}")
    except Exception as e:
        logger.exception(f"Failed to create Agenda for space {instance!s}: {e}")

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

        if(user.invited):
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

