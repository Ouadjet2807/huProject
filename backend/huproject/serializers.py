from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import *
import json
from datetime import timedelta

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
    can_edit = serializers.BooleanField(read_only=True)

    class Meta:
        model = Caregiver
        fields = ('id', 'gender', 'first_name', 'last_name', 'birth_date', 'user', 'access_level', 'can_edit')
        read_only_fields = ('id', 'user', 'can_edit')

    def update(self, instance, validated_data):

        instance = super().update(instance, validated_data)

        return instance

class HealthcareProfessionalSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)

    class Meta:
        model = HealthcareProfessional
        fields = ('id','name','specialty','contact','notes', 'space')
        read_only_fields = ('id',)



class TreatmentSerializer(serializers.ModelSerializer):
    prescribed_by = HealthcareProfessionalSerializer(read_only=True)
    prescribed_by_id = serializers.PrimaryKeyRelatedField(
        queryset=HealthcareProfessional.objects.all(),
        source='prescribed_by',
        write_only=True,
        required=False
    )
    registered_by = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        required=True
    )
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Treatment
        fields = ('id','name','dosage', 'cis_code', 'medication_format', 'quantity', 'frequency','start_date','end_date','prescribed_by','prescribed_by_id', 'prescribed_to', 'registered_by', 'notes', 'space', 'created_at', 'is_expired')
        read_only_fields = ['id', 'created_at', 'is_expired']


    def create(self, validated_data):
        prescribed_to = validated_data.pop('prescribed_to')

        treatement = Treatment.objects.create(**validated_data)

        for recipient in prescribed_to:
            treatement.prescribed_to.add(recipient)

        return treatement


class RecipientSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    space = serializers.PrimaryKeyRelatedField(queryset=Space.objects.all())
    medical_info = serializers.JSONField(required=False)
    treatments = TreatmentSerializer(many=True, read_only=True)
    healthcare_professionals = HealthcareProfessionalSerializer(many=True)

    class Meta:
        model = Recipient
        fields = ('id', 'gender', 'first_name', 'last_name', 'birth_date', 'medical_info', 'space', 'treatments','healthcare_professionals')
        read_only_fields = ('id',)


    def validate_space_id(self, value):
        # ensure space exists
        try:
            return Space.objects.get(id=value)
        except Space.DoesNotExist:
            raise serializers.ValidationError("Space not found")

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
            professionals_ids = []
            for p in professionals:
                print(p)
                professionals_ids.append(p['id'])
            instance.healthcare_professionals.set(professionals_ids)
        return instance


class InvitationSerializer(serializers.ModelSerializer):
    space =  serializers.PrimaryKeyRelatedField(queryset=Space.objects.all())
    sender = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())

    class Meta:
        model = Invitation
        fields = ['email', 'space', 'role', 'token', 'accepted', 'sender']

    def create(self, validated_data):
        now = timezone.now()
        expires_at = now + timedelta(days=1)
        validated_data["expires_at"] = expires_at

        invitiation = Invitation.objects.create(**validated_data)

        return invitiation

class AgendaItemCategorySerializer(serializers.ModelSerializer):
    agenda =  serializers.PrimaryKeyRelatedField(queryset=Agenda.objects.all())

    class Meta: 
        model = AgendaItemCategory
        fields = ['id', 'agenda', 'name', 'color']
        read_only_fields = ['id', 'agenda']

    def validate(self, data):
        validated_data = data

        return validated_data

    def create(self, validated_data):
        category = AgendaItemCategory.objects.create(**validated_data)

        return category


class AgendaItemSerializer(serializers.ModelSerializer):
    title = serializers.CharField()
    created_by = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    caregivers = CaregiverSerializer(many=True)
    recipients = RecipientSerializer(many=True)
    category = serializers.PrimaryKeyRelatedField(queryset=AgendaItemCategory.objects.all(), allow_null=True)

    class Meta:
        model = AgendaItem
        fields = ['id', 'agenda', 'category', 'private', 'title', 'description', 'created_at', 'start_date','end_date', 'created_by', 'caregivers', 'recipients']
        read_only_fields = ['id', 'created_at', 'created_by']

    def create(self, validated_data):

        print(validated_data)

        caregivers_data = validated_data.pop('caregivers', None)
        recipients_data = validated_data.pop('recipients', None)

        agenda_item = AgendaItem.objects.create(**validated_data)

        for recipient in recipients_data:
            agenda_item.recipients.add(recipient['id'])

        for caregiver in caregivers_data:
            agenda_item.caregivers.add(caregiver['id'])

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
            instance.caregivers.set(caregivers)

        return instance


class AgendaSerializer(serializers.ModelSerializer):
    items = AgendaItemSerializer(many=True, source="agenda_item")
    categories = AgendaItemCategorySerializer(many=True, source="agenda_category")

    class Meta:
        model = Agenda
        fields = ['id', 'space', 'items', 'categories']
        read_only_fields = ['id','space']


class TodoListItemSerializer(serializers.ModelSerializer):
    todo_list = serializers.PrimaryKeyRelatedField(queryset=TodoList.objects.all())
    created_by = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    completed_by = CustomUserSerializer(read_only=True, allow_null=True)

    class Meta:
        model = TodoListItem
        fields = ['id', 'todo_list', 'frequency', 'completed', 'completed_by', 'title', 'updated_at', 'created_at', 'created_by']
        read_only_fields = ['id', 'space']

class TodoListSerializer(serializers.ModelSerializer):
    space = serializers.PrimaryKeyRelatedField(queryset=Space.objects.all())
    items = TodoListItemSerializer(many=True, source="item_todo")

    class Meta:
        model = TodoList
        fields = ['id', 'space', 'items']
        read_only_fields = ['id', 'space']

class SpaceSerializer(serializers.ModelSerializer):
    caregivers = CaregiverSerializer(many=True, read_only=True)
    recipients = RecipientSerializer(many=True, read_only=True)
    created_by =  CustomUserSerializer(read_only=True)
    agenda = AgendaSerializer(read_only=True, source="agenda_space")
    todos = TodoListSerializer(read_only=True, source="todo_space")

    class Meta:
        model = Space
        fields = ['id', 'name', 'description', 'created_by', 'caregivers', 'recipients', 'created_at', 'updated_at', 'agenda', 'todos']
        read_only_fields = ['id',]

class SpaceMembershipSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(many=False, read_only=True)
    space = SpaceSerializer(many=False, read_only=True)

    class Meta:
        model = SpaceMembership
        fields = ['id', 'user', 'space', 'role', 'created_at']


class GrocerySerializer(serializers.ModelSerializer):
    space = serializers.PrimaryKeyRelatedField(queryset=Space.objects.all())
    created_by = CustomUserSerializer(read_only=True)
    recipient = RecipientSerializer()

    class Meta:
        model = TodoList
        fields = ['id', 'space', 'recipient', 'content', 'updated_at', 'created_at', 'created_by']
        read_only_fields = ['id', 'space', 'recipient', 'created_at']
