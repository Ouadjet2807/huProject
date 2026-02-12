from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.db import IntegrityError
from .models import *
from django.utils import timezone
import json
import math

User = get_user_model()

invited_default = json.dumps({
            "invited": False,
            "invited_by": None,
            "role": 1
})

class UserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="johnDoe", last_name="Doe", first_name="John", email="johndoe@test.fr", password='secret', invited=invited_default)


    def test_user_created(self):

        self.assertEqual(self.user.username, "johnDoe")
        self.assertEqual(self.user.email, "johndoe@test.fr")
        self.assertEqual(self.user.last_name, "Doe")
        self.assertEqual(self.user.first_name, "John")
        self.assertEqual(self.user.invited, invited_default)

class CaregiverModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="johnDoe", last_name="Doe", first_name="John", email="johndoe@test.fr", password='secret', invited=invited_default)
        self.caregiver = Caregiver.objects.get(user=self.user)

    def test_caregiver_created(self):

        self.assertEqual(self.caregiver.first_name, "John")
        self.assertEqual(self.caregiver.last_name, "Doe")
        self.assertEqual(self.caregiver.user.email, "johndoe@test.fr")
        self.assertEqual(self.caregiver.access_level, 1)

    def test_caregiver_can_edit(self):
        self.assertTrue(self.caregiver.can_edit)
        self.caregiver.access_level = 3
        self.assertFalse(self.caregiver.can_edit)

    def test_incorrect_access_level(self):
        """ Test if the access level value is in the correct range"""

        caregiver = Caregiver(user=self.user, first_name=self.user.first_name, last_name=self.user.last_name, access_level=4)
        with self.assertRaises(IntegrityError):
            caregiver.save()

class SpaceModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="johnDoe", last_name="Doe", first_name="John", email="johndoe@test.fr", password='secret', invited=invited_default)
        self.space = Space.objects.get(created_by=self.user)

    def test_space_created(self):
        self.assertEqual(self.space.name, str(self.user.first_name) + "'s Space")

class SpaceMembershipModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="johnDoe", last_name="Doe", first_name="John", email="johndoe@test.fr", password='secret', invited=invited_default)
        self.space = Space.objects.get(created_by=self.user)
        self.membership = SpaceMembership.objects.get(space=self.space)

    def test_membership_info(self):

        caregiver = Caregiver.objects.get(user=self.user)

        self.assertEqual(self.membership.user, self.user)
        self.assertEqual(self.membership.role, caregiver.access_level)

    def test_incorrect_role_number(self):
        """ Test if the role value is in the correct range"""

        membership = SpaceMembership(user=self.user, space=self.space, role=4)
        with self.assertRaises(IntegrityError):
            membership.save()

class RecipientModelTest(TestCase):
    def setUp(self):

        user = User.objects.create(username="johnDoe", last_name="Doe", first_name="John", email="johndoe@test.fr", password='secret', invited=invited_default)
        space = Space.objects.get(created_by=user)
        self.recipient = Recipient.objects.create(space=space, medical_info=None, last_name="Doe", first_name="Jane", birth_date="2000-01-01", gender="F")

    def test_recipient_created(self):

        self.assertEqual(self.recipient.last_name, 'Doe')
        self.assertEqual(self.recipient.first_name, 'Jane')

    def test_recipient_updated(self):

        print(self.recipient)



class InvitationModelTest(TestCase):
    def setUp(self):
        now = timezone.now()
        expires_at = now + timedelta(days=1)
        self.user = User.objects.create(username="johnDoe", last_name="Doe", first_name="John", email="johndoe@test.fr", password='secret', invited=invited_default)
        self.space = Space.objects.get(created_by=self.user)
        self.invitation = Invitation.objects.create(email="janedoe@test.fr", space=self.space, sender=self.user, accepted=False, role=3, expires_at=expires_at)

    def test_invitation_dates(self):

        diff = self.invitation.expires_at - self.invitation.created_at
        diff_in_hours = math.ceil(diff.total_seconds() / (60 * 60))

        self.assertEqual(diff_in_hours, 24)

# class CaregiverAPITest(APITestCase):
#     def setUp(self):
#         self.user = User.objects.create_user(email="test@example.com", password="testpass")
#         self.caregiver = Caregiver.objects.create(user=self.user, access_level=1)
#         self.client.login(email="test@example.com", password="testpass")  # Optional for token auth
#         self.url = reverse('recipients')  # Adjust according to your urls.py

#     def test_get_recipients_requires_auth(self):
#         self.client.logout()
#         response = self.client.get(self.url)
#         self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

#     def test_create_recipient(self):
#         data = {
#             "first_name": "John",
#             "last_name": "Doe",
#             # add other required fields
#         }
#         self.client.force_authenticate(user=self.user)
#         response = self.client.post(self.url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(response.data['first_name'], "John")