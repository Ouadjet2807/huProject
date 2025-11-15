from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
from .forms import CustomUserChangeForm, CustomUserCreationForm

# Register your models here.

@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'number_of_pills', 'medication_format', 'start_date', 'end_date', 'dosage', 'frequency', 'created_at')
    search_fields = ('name', 'number_of_pills', 'medication_format', 'start_date', 'end_date', 'dosage', 'frequency', 'created_at')

@admin.register(HealthcareProfessional)
class HealthcareProfessionalAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'specialty', 'created_at')
    search_fields = ('name', 'specialty', 'created_at')

@admin.register(AgendaItem)
class AgendaItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'start_date', 'end_date', 'created_at', 'created_by', 'private')
    search_fields = ('title', 'start_date', 'end_date', 'created_at', 'created_by', 'private')

@admin.register(Agenda)
class AgendaAdmin(admin.ModelAdmin):
    list_display = ('id', 'space')
    search_fields = ('space',)


@admin.register(Caregiver)
class CaregiverAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'user', 'access_level')
    search_fields = ('first_name', 'last_name', 'user__username')
    list_filter = ('access_level',)


@admin.register(Recipient)
class RecipientAdmin(admin.ModelAdmin):
    list_display = ('id', 'space', 'first_name', 'last_name',)
    search_fields = ('first_name', 'last_name')
    filter_horizontal = ('caregivers',)  

@admin.register(CustomUser)
class CustomAdminUser(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser



admin.site.register(Space)
