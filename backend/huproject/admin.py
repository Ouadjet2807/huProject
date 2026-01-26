from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
from .forms import CustomUserChangeForm, CustomUserCreationForm

# Register your models here.

@admin.register(TodoList)
class TodoListAdmin(admin.ModelAdmin):
    list_display = ('id', 'space')
    search_fields = ('space',)
    
@admin.register(TodoListItem)
class TodoListAdmin(admin.ModelAdmin):
    list_display = ('id', 'todo_list', 'created_by', 'created_at', 'completed')
    search_fields = ('todo_list', 'title', 'created_by')

@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'medication_format', 'start_date', 'end_date', 'dosage', 'frequency', 'created_at')
    search_fields = ('name', 'medication_format', 'start_date', 'end_date', 'dosage', 'frequency', 'created_at')

@admin.register(ArchivedTreatment)
class ArchivedTreatmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'archived_at')
    search_fields = ('name', 'archived_at',)

@admin.register(HealthcareProfessional)
class HealthcareProfessionalAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'specialty', 'created_at')
    search_fields = ('name', 'specialty', 'created_at')

@admin.register(AgendaItemCategory)
class AgendaItemCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'agenda', 'name')
    search_fields = ('agenda', 'name')

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
    list_display = ('id', 'username', 'email', 'first_name', 'last_name', 'invited')
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser


@admin.register(Space)
class SpaceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_by')
    search_fields = ('id', 'space')

@admin.register(SpaceMembership)
class TodoListAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'space', 'role')
    search_fields = ('user', 'space', 'role')


@admin.register(Invitation)
class TodoListAdmin(admin.ModelAdmin):
    list_display = ('token', 'space', 'email', 'role', 'created_at', 'expires_at', 'sender')
    search_fields = ('token', 'space', 'role')

