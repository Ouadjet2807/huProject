from django.conf import settings
from django.contrib.auth  import get_user_model
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid
import re


# Create your models here.

class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS=[]

    def __str__(self) -> str:
        return self.email
    
    def _generate_username_candidate(self):
        """Build a base username from first/last name or email local-part."""
        # prefer first initial + last name
        first = (self.first_name or '').strip()
        last = (self.last_name or '').strip()
        if first and last:
            base = f"{first[0].lower()}{last.lower()}"
        else:
            # fallback to email local part
            base = (self.email.split('@')[0]).lower()
            base = re.sub(r'[^a-z0-9._-]', '', base)  # sanitize
            return base

    def save(self, *args, **kwargs):
        """
        Auto-fill username if missing (ensures uniqueness).
        """
        User = get_user_model()
        if not self.username:
            base = self._generate_username_candidate()
            candidate = base
            suffix = 0
            # ensure we don't collide with an existing username
            while User.objects.filter(username=candidate).exclude(pk=self.pk).exists():
                suffix += 1
                candidate = f"{base}{suffix}"
            self.username = candidate
        super().save(*args, **kwargs)


class Person(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(null=True, blank=True)

    class Meta:
        abstract = True

class Caregiver(Person):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    access_level = models.IntegerField(default=1)

class Space(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    caregivers = models.ManyToManyField('Caregiver', related_name='spaces')

    def __str__(self):
        return self.name


class SpaceInvite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    token = models.CharField(max_length=64, unique=True, db_index=True)
    space = models.ForeignKey('Space', on_delete=models.CASCADE, related_name='invites')
    email = models.EmailField()
    invited_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    accepted_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, related_name='accepted_invites', on_delete=models.SET_NULL)
    used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.token:
            import secrets
            self.token = secrets.token_urlsafe(32)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    def is_valid(self):
        return (not self.used) and (self.expires_at is None or timezone.now() < self.expires_at)

class HealthcareProfessional(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    specialty = models.CharField(max_length=150, blank=True)
    contact = models.JSONField(blank=True, null=True) 
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    space = models.ForeignKey(
        Space,
        on_delete=models.CASCADE,
        related_name='hold'
    )

    def __str__(self):
        return f"{self.name} ({self.specialty})" if self.specialty else self.name
    

class Treatment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    dosage = models.CharField(max_length=100, blank=True)
    medication_format = models.CharField(max_length=100, blank=True)
    number_of_pills = models.IntegerField()
    frequency = models.CharField(max_length=100, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    prescribed_by = models.ForeignKey(
        HealthcareProfessional,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='prescribed_treatments'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    space = models.ForeignKey(
        Space,
        on_delete=models.CASCADE,
        related_name='contains'
    )

    def __str__(self):
        return self.name

class Recipient(Person):
    space = models.ForeignKey(Space, related_name='recipients', on_delete=models.CASCADE)
    medical_info = models.JSONField(blank=True, null=True)
    treatments = models.ManyToManyField(Treatment, blank=True, related_name='recipients')
    healthcare_professionals = models.ManyToManyField(HealthcareProfessional, blank=True, related_name='recipients')
    caregivers = models.ManyToManyField(Caregiver, related_name="care_for")

class Agenda(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    space = models.ForeignKey('Space', on_delete=models.CASCADE, related_name='belongs_to')

class AgendaItemCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agenda = models.ForeignKey(Agenda, on_delete=models.CASCADE, related_name='has')

class AgendaItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agenda = models.ForeignKey(Agenda, on_delete=models.CASCADE, related_name='contains')
    private = models.BooleanField(default=False)
    category = models.ForeignKey(AgendaItemCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="items")
    title = models.CharField(max_length=50)
    description = models.CharField()
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    start_date = models.DateField()
    end_date = models.DateField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='creates')
    participants = models.ManyToManyField(Caregiver, related_name='participates')
    recipients = models.ManyToManyField(Recipient, blank=True, related_name='participates')

