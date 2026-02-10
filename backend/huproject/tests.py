from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import *
import json

User = get_user_model()

class UserModelTest(TestCase):
    def setUp(self):

        invited_default = json.dumps({
            "invited": False,
            "invited_by": None,
            "role": 1
        })


        self.user = User.objects.create(username="johnDoe", last_name="Doe", first_name="John", email="johndoe@test.fr", password='secret', invited=invited_default)
        return super().setUp()

    def test_user_created(self):

        invited_default = json.dumps({
            "invited": False,
            "invited_by": None,
            "role": 1
        })
        user = User.objects.get(email="johndoe@test.fr")

        self.assertEqual(user.username, "johnDoe")
        self.assertEqual(user.email, "johndoe@test.fr")
        self.assertEqual(user.last_name, "Doe")
        self.assertEqual(user.first_name, "John")
        self.assertEqual(user.invited, invited_default)


class CaregiverModelTest(TestCase):

    def test_caregiver_created(self):

        invited_default = json.dumps({
            "invited": False,
            "invited_by": None,
            "role": 1
        })
         
        user = User.objects.create(username="johnDoe", last_name="Doe", first_name="John", email="johndoe@test.fr", password='secret', invited=invited_default)
        caregiver = Caregiver.objects.get(user=user)

        self.assertEqual(caregiver.first_name, "John")
        self.assertEqual(caregiver.last_name, "Doe")
        self.assertEqual(caregiver.user.email, "johndoe@test.fr")
        self.assertEqual(caregiver.access_level, 1)


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