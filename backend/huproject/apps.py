from django.apps import AppConfig


class HuprojectConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'huproject'

    def ready(self):
        import huproject.signals


