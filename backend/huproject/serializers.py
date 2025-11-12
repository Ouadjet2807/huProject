from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import *


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'last_name', 'first_name', 'email')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'last_name', 'first_name', 'password', 'confirm_password')
        extra_kwargs = {'password': {"write_only": True}}

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Password do not match")
        
        password = attrs.get("password", "")

        if(len(password) < 8):
            raise serializers.ValidationError("Your password must be at least 8 characters")
        
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("confirm_password")

        return CustomUser.objects.create_user(password=password, **validated_data)


class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect credentials")


class CaregiverSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())

    class Meta:
        model = Caregiver
        fields = ('id', 'gender', 'first_name', 'last_name', 'birth_date', 'user', 'access_level')


class HealthcareProfessionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthcareProfessional
        fields = ('id','name','specialty','contact','notes')

class TreatmentSerializer(serializers.ModelSerializer):
    prescribed_by = HealthcareProfessionalSerializer(read_only=True)
    prescribed_by_id = serializers.PrimaryKeyRelatedField(
        queryset=HealthcareProfessional.objects.all(),
        source='prescribed_by',
        write_only=True,
        required=False
    )

    class Meta:
        model = Treatment
        fields = ('id','name','dosage','frequency','start_date','end_date','prescribed_by','prescribed_by_id','notes')


class RecipientSerializer(serializers.ModelSerializer):
    space_id = serializers.UUIDField(write_only=True)
    medical_info = serializers.JSONField(required=False)
    treatments = TreatmentSerializer(many=True, read_only=True)
    treatments_ids = serializers.PrimaryKeyRelatedField(queryset=Treatment.objects.all(), many=True, write_only=True, required=False)
    healthcare_professionals = HealthcareProfessionalSerializer(many=True, read_only=True)
    healthcare_professionals_ids = serializers.PrimaryKeyRelatedField(queryset=HealthcareProfessional.objects.all(), many=True, write_only=True, required=False)

    class Meta:
        model = Recipient
        fields = ('id', 'gender', 'first_name', 'last_name', 'birth_date', 'medical_info', 'space_id', 'treatments','treatments_ids','healthcare_professionals','healthcare_professionals_ids')
        read_only_fields = ('id',)


    def validate_space_id(self, value):
        # ensure space exists
        try:
            return Space.objects.get(id=value)
        except Space.DoesNotExist:
            raise serializers.ValidationError("Space not found")
        
    def create(self, validated_data):
        caregivers = validated_data.pop('caregivers', [])
        recipient = Recipient.objects.create(**validated_data)
        treatments = validated_data.pop('treatments_ids', [])
        professionals = validated_data.pop('professionals_ids', [])
        recipient = super().create(validated_data)
        if treatments:
            recipient.treatments.set(treatments)
        if professionals:
            recipient.professionals.set(professionals)
        if caregivers:
            recipient.caregivers.set(caregivers)
        return recipient

    def update(self, instance, validated_data):
        caregivers = validated_data.pop('caregivers', None)
        treatments = validated_data.pop('treatments_ids', None)
        professionals = validated_data.pop('professionals_ids', None)
        instance = super().update(instance, validated_data)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if caregivers is not None:
            instance.caregivers.set(caregivers)
        if treatments is not None:
            instance.treatments.set(treatments)
        if professionals is not None:
            instance.professionals.set(professionals)
        return instance

class SpaceSerializer(serializers.ModelSerializer):
    caregivers = CaregiverSerializer(many=True, read_only=True)
    recipients = RecipientSerializer(many=True, read_only=True)

    class Meta:
        model = Space
        fields = ['id', 'name', 'description', 'created_by', 'caregivers', 'recipients', 'created_at', 'updated_at']


class SpaceInviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceInvite
        fields = ['id','token','space','email','invited_by','created_at','expires_at','used']
        read_only_fields = ['id','token','invited_by','created_at','used']


class AgendaSerializer(serializers.ModelSerializer):
    space = serializers.PrimaryKeyRelatedField(queryset=Space.objects.all())

    class Meta:
        model = Agenda
        fields = ['id', 'space']
        read_only_fields = ['id','space']


class AgendaItemSerializer(serializers.ModelSerializer):
    agenda = AgendaSerializer(read_only=True)
    agenda_id = serializers.PrimaryKeyRelatedField(queryset=Agenda.objects.all(), source='agenda', write_only=True)

    class Meta:
        model = AgendaItem
        fields = ['id', 'agenda', 'item_type', 'private', 'title', 'description', 'created_at', 'start_date','end_date', 'created_by', 'agenda_id', 'participants', 'recipients']
        read_only_fields = ['id', 'agenda', 'created_at']
