from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import *
import json

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'last_name', 'first_name', 'email')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'last_name', 'first_name', 'password', 'confirm_password', 'invited')
        extra_kwargs = {'password': {"write_only": True}}

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Les mots de passes ne correspondent pas")
        password = attrs.get("password", "")

        if(len(password) < 8):
            raise serializers.ValidationError("Le mot de passe doit contenir au moins 8 caractères")

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("confirm_password")

        return CustomUser.objects.create_user(password=password, **validated_data)


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Email/Mot de passe incorrect")

class UserUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()


    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'last_name', 'first_name')

    def validate(self, attrs):
        current_user = CustomUser.objects.get(id=self.initial_data['id'])

        if attrs["email"] != current_user.email and CustomUser.objects.filter(email=attrs["email"]):
            raise serializers.ValidationError("Adresse email déjà utilisée, veuillez en choisir une autre")
        if attrs["username"] != current_user.username and CustomUser.objects.filter(username=attrs["username"]):
            raise serializers.ValidationError("Ce nom d'utilisateur n'est pas disponible")

        return attrs

    def update(self, instance): 
            instance.update()
            return instance

class CaregiverSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    id = serializers.CharField()

    class Meta:
        model = Caregiver
        fields = ('id', 'gender', 'first_name', 'last_name', 'birth_date', 'user', 'access_level')
        read_only_fields = ('id', 'user')

    def update(self, instance, validated_data):

        instance = super().update(instance, validated_data)

        return instance

class HealthcareProfessionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthcareProfessional
        fields = ('id','name','specialty','contact','notes', 'space')

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
        fields = ('id','name','dosage', 'cis_code', 'medication_format', 'quantity', 'frequency','start_date','end_date','prescribed_by','prescribed_by_id','notes', 'space', 'created_at')


class ArchivedTreatmentSerializer(serializers.ModelSerializer):
    treatment = serializers.PrimaryKeyRelatedField(queryset=Treatment.objects.all())
    class Meta:
        model = ArchivedTreatment
        fields = ('id', 'name', 'space', 'treatment')


class RecipientSerializer(serializers.ModelSerializer):
    id = serializers.CharField()
    space_id = serializers.UUIDField()
    medical_info = serializers.JSONField(required=False)
    treatments = TreatmentSerializer(many=True)
    healthcare_professionals = HealthcareProfessionalSerializer(many=True)

    class Meta:
        model = Recipient
        fields = ('id', 'gender', 'first_name', 'last_name', 'birth_date', 'medical_info', 'space_id', 'treatments','healthcare_professionals')
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
        treatments = validated_data.pop('treatments', [])
        professionals = validated_data.pop('healthcare_professionals', [])
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
        treatments = validated_data.pop('treatments', None)
        professionals = validated_data.pop('healthcare_professionals', None)
        instance = super().update(instance, validated_data)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if caregivers is not None:
            instance.caregivers.set(caregivers)
        if treatments is not None:
            instance.treatments.set(treatments)
        if professionals is not None:
            instance.healthcare_professionals.set(professionals)
        return instance

class SpaceSerializer(serializers.ModelSerializer):
    caregivers = CaregiverSerializer(many=True, read_only=True)
    recipients = RecipientSerializer(many=True, read_only=True)
    created_by =  CustomUserSerializer(read_only=True)

    class Meta:
        model = Space
        fields = ['id', 'name', 'description', 'created_by', 'caregivers', 'recipients', 'created_at', 'updated_at']

class SpaceMembershipSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(many=False, read_only=True)
    space = SpaceSerializer(many=False, read_only=True)

    class Meta:
        model = SpaceMembership
        fields = ['id', 'user', 'space', 'role', 'created_at']


class InvitationSerializer(serializers.ModelSerializer):
    space =  serializers.PrimaryKeyRelatedField(queryset=Space.objects.all())
    sender = CustomUserSerializer(read_only=True)

    class Meta:
        model = Invitation
        fields = ['email', 'space', 'role', 'token', 'created_at', 'expires_at', 'accepted', 'sender']


class AgendaSerializer(serializers.ModelSerializer):
    space = serializers.PrimaryKeyRelatedField(queryset=Space.objects.all())

    class Meta:
        model = Agenda
        fields = ['id', 'space']
        read_only_fields = ['id','space']



class AgendaItemCategorySerializer(serializers.ModelSerializer):
    agenda = AgendaSerializer(read_only=True)
    # agenda_id = serializers.PrimaryKeyRelatedField(queryset=Agenda.objects.all(), source='agenda', write_only=True)

    class Meta: 
        model = AgendaItemCategory
        fields = ['id', 'agenda', 'name', 'color']
        read_only_fields = ['id', 'agenda']

class AgendaItemSerializer(serializers.ModelSerializer):
    agenda = AgendaSerializer(read_only=True)
    agenda_id = serializers.PrimaryKeyRelatedField(queryset=Agenda.objects.all(), source='agenda', write_only=True)
    created_by_id = serializers.UUIDField(write_only=True)
    created_by = CustomUserSerializer(read_only=True)
    caregivers = CaregiverSerializer(many=True)
    recipients = RecipientSerializer(many=True)
    category = AgendaItemCategorySerializer(read_only=True)

    class Meta:
        model = AgendaItem
        fields = ['id', 'agenda', 'agenda_id', 'category', 'private', 'title', 'description', 'created_at', 'start_date','end_date', 'created_by', 'created_by_id', 'caregivers', 'recipients']
        read_only_fields = ['id', 'agenda', 'created_at']

    def create(self, validated_data):
        print(validated_data)
        caregivers_data = validated_data.pop('caregivers', None)
        recipients_data = validated_data.pop('recipients', None)

        agenda_item = AgendaItem.objects.create(**validated_data)

        for recipient in recipients_data:
            agenda_item.recipients.add(recipient['id'])

        for caregiver in caregivers_data:
            agenda_item.participants.add(caregiver['id'])

        return agenda_item

    def update(self, instance, validated_data):
        caregivers_data = validated_data.pop('caregivers')
        recipients_data = validated_data.pop('recipients')

        caregivers = []
        recipients = []

        for caregiver in caregivers_data:
            caregivers.append(caregiver['id'])

        for recipient in recipients_data:
            recipients.append(recipient['id'])

        instance = instance = super().update(instance, validated_data)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        if recipients is not None:
            instance.recipients.set(recipients)

        if caregivers is not None:
            instance.participants.set(caregivers)

        return instance


class TodoListSerializer(serializers.ModelSerializer):
    space = serializers.PrimaryKeyRelatedField(queryset=Space.objects.all())
    created_by_id = serializers.UUIDField(write_only=True)
    created_by = CustomUserSerializer(read_only=True)
    completed_by = CustomUserSerializer(read_only=True, allow_null=True)

    class Meta:
        model = TodoList
        fields = ['id', 'space', 'frequency', 'completed', 'completed_by', 'title', 'updated_at', 'created_at', 'created_by', 'created_by_id']
        read_only_fields = ['id', 'space', 'created_at']



class GrocerySerializer(serializers.ModelSerializer):
    space = serializers.PrimaryKeyRelatedField(queryset=Space.objects.all())
    created_by = CustomUserSerializer(read_only=True)
    recipient = RecipientSerializer()

    class Meta:
        model = TodoList
        fields = ['id', 'space', 'recipient', 'content', 'updated_at', 'created_at', 'created_by']
        read_only_fields = ['id', 'space', 'recipient', 'created_at']
