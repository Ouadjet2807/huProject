from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField
from django.db import models
import uuid

# Create your models here.

class Person(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    birth_date = models.DateField(null=True, blank=True)

    class Meta:
        abstract = True

class Caregiver(Person):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    access_level = models.IntegerField(default=1)


class Recipient(Person):
    medical_info = models.JSONField(blank=True, null=True)
    caregivers = models.ManyToManyField(Caregiver, related_name="care_for")

class Space(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    caregivers = models.ManyToManyField('Caregiver', related_name='spaces')
    recipients = models.ManyToManyField('Recipient', related_name='spaces')

    def __str__(self):
        return self.name
    