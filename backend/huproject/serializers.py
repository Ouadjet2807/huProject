from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Caregiver, Recipient, Space

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class CaregiverSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Caregiver
        fields = ('id', 'first_name', 'last_name', 'birth_date', 'user', 'access_level')

class RecipientSerializer(serializers.ModelSerializer):
    caregivers = serializers.PrimaryKeyRelatedField(
        queryset=Caregiver.objects.all(), many=True, required=False
    )
    medical_info = serializers.JSONField(required=False)

    class Meta:
        model = Recipient
        fields = ('id', 'first_name', 'last_name', 'birth_date', 'medical_info', 'caregivers')
        read_only_fields = ('id',)

    def create(self, validated_data):
        caregivers = validated_data.pop('caregivers', [])
        recipient = Recipient.objects.create(**validated_data)
        if caregivers:
            recipient.caregivers.set(caregivers)
        return recipient

    def update(self, instance, validated_data):
        caregivers = validated_data.pop('caregivers', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if caregivers is not None:
            instance.caregivers.set(caregivers)
        return instance

class SpaceSerializer(serializers.ModelSerializer):
    caregivers = CaregiverSerializer(many=True, read_only=True)
    recipients = RecipientSerializer(many=True, read_only=True)

    class Meta:
        model = Space
        fields = ['id', 'name', 'description', 'caregivers', 'recipients', 'created_at', 'updated_at']