from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import *

User = get_user_model()



# Create your tests here.
class CaregiverModelTest(TestCase):
    def setUp(self):
        # Create a user and caregiver
        user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass")
        caregiver = Caregiver.objects.create(user=user, access_level=1)
        # Create a space
        space = Space.objects.create(name="Test Space", created_by=user)
        space.caregivers.add(caregiver)
        # Create a recipient
        self.caregiver = Caregiver.objects.create(
            username="testuser", 
            first_name="Jane",
            last_name="Doe",
            user=user
        )
        space.caregivers.add(self.caregiver)

    def test_caregiver_created(self):
        self.assertEqual(self.caregiver.first_name, "Jane")
        self.assertEqual(self.caregiver.user.email, "test@example.com")


class CaregiverAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@example.com", password="testpass")
        self.caregiver = Caregiver.objects.create(user=self.user, access_level=1)
        self.client.login(email="test@example.com", password="testpass")  # Optional for token auth
        self.url = reverse('recipients')  # Adjust according to your urls.py

    def test_get_recipients_requires_auth(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_recipient(self):
        data = {
            "first_name": "John",
            "last_name": "Doe",
            # add other required fields
        }
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['first_name'], "John")