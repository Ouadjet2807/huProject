from django.contrib import admin
from .models import Caregiver, Recipient, Space

# Register your models here.

@admin.register(Caregiver)
class CaregiverAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'user', 'access_level')
    search_fields = ('first_name', 'last_name', 'user__username')
    list_filter = ('access_level',)


@admin.register(Recipient)
class RecipientAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name')
    search_fields = ('first_name', 'last_name')
    filter_horizontal = ('caregivers',)  # nice UX for ManyToMany



admin.site.register(Space)