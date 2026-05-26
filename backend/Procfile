web: python manage.py migrate && gunicorn tbc.wsgi
worker: celery -A tbc worker --loglevel=info