from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from .models import *
from .serializers import *


class UserRegistrationAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh": str(token),
                          "access": str(token.access_token)}

        return Response(data, status= status.HTTP_201_CREATED)


class UserLoginAPIView(GenericAPIView):
    permission_classes= (AllowAny,)
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        serializer = CustomUserSerializer(user)
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh": str(token),
                          "access": str(token.access_token)}

        return Response(data, status=status.HTTP_200_OK)


class UserLogoutAPIView(GenericAPIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class UserInfoAPIView(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CustomUserSerializer

    def get_object(self):
        return self.request.user

class IsAuthenticatedCaregiver(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request.user, 'caregiver')

    def has_object_permission(self, request, view, obj):
        # default object permission: user must be in at least one space with object
        if isinstance(obj, Recipient):
            return obj.spaces.filter(caregivers__user=request.user).exists()
        if isinstance(obj, Space):
            return obj.caregivers.filter(user=request.user).exists()
        return False


class CaregiverViewSet(viewsets.ModelViewSet):
    """
    List / retrieve / create / update caregivers. Usually only admin or superusers create caregivers,
    but we keep this generic for now.
    """
    queryset = Caregiver.objects.all().select_related('user')
    serializer_class = CaregiverSerializer
    permission_classes = [permissions.IsAuthenticated] 
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'user__username']
    ordering_fields = ['first_name', 'last_name']

    def get_queryset(self):
        user = self.request.user
        if not user or not hasattr(user, 'caregiver'):
            return Caregiver.objects.none()
        caregiver = user.caregiver
        return Caregiver.objects.filter(space__in=caregiver.spaces.all()).select_related('space')

    # If you want caregivers to be created automatically from user signups, override perform_create:
    def perform_create(self, serializer):
        # optionally create caregiver linked to request.user
        if hasattr(self.request.user, 'caregiver'):
            # prevent creating duplicate for same user
            raise ValidationError("Caregiver already exists for this user.")
        serializer.save(user=self.request.user)


class IsCaregiverAndMember(permissions.BasePermission):
    """
    Allow only authenticated users who have a Caregiver profile and are member of the space.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'caregiver'))

    def has_object_permission(self, request, view, obj):
        # not used for list/create; used for detail operations if desired
        caregiver = getattr(request.user, 'caregiver', None)
        return caregiver and obj.space.caregivers.filter(pk=caregiver.pk).exists()

class RecipientViewSet(viewsets.ModelViewSet):
    queryset = Recipient.objects.all()
    serializer_class = RecipientSerializer
    permission_classes = [IsCaregiverAndMember]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if not user or not hasattr(user, 'caregiver'):
            return Recipient.objects.none()
        caregiver = user.caregiver
        return Recipient.objects.filter(space__in=caregiver.spaces.all()).select_related('space')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # serializer.validate_space_id returned a Space instance
        space = serializer.validated_data.pop('space_id')
        caregiver = request.user.caregiver

        # permission: the caregiver must be member of the space, OR be the creator of that space
        if not space.caregivers.filter(pk=caregiver.pk).exists():
            return Response({'detail': "You are not a member of that space."},
                            status=status.HTTP_403_FORBIDDEN)

        # create Recipient; we fill inherited Person fields via serializer
        recipient = Recipient.objects.create(space=space, **serializer.validated_data)
        recipient.caregivers.add(caregiver) if hasattr(recipient, 'caregivers') else None
        out_serializer = self.get_serializer(recipient)
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)
    
class AgendaViewSet(viewsets.ModelViewSet):
    queryset = Agenda.objects.all()
    serializer_class = AgendaSerializer
    permission_classes = [IsCaregiverAndMember] 
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['space']
    ordering_fields = ['space']

    def get_queryset(self):
        user = self.request.user
        if not user or not hasattr(user, "caregiver"):
            return Agenda.objects.none()
        caregiver = user.caregiver
        return Agenda.objects.filter(space__caregivers=caregiver).select_related('space',)

    def perform_create(self, serializer):
        serializer.save() 


class AgendaItemViewSet(viewsets.ModelViewSet):
    serializer_class = AgendaItemSerializer
    lookup_field = 'id'
    queryset = AgendaItem.objects.all()
    permission_classes = [permissions.IsAuthenticated] 
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['agenda', 'title', 'start_date', 'end_date', 'created_by', 'participants', 'recipients']
    ordering_fields = ['start_date', 'end_date']

    def get_queryset(self):
        user = self.request.user

        if not user or not hasattr(user, 'caregiver'):
            return AgendaItem.objects.none()
        
        caregiver = user.caregiver

        qs = AgendaItem.objects.filter(agenda__space__caregivers=caregiver)

        qs = qs.select_related('agenda', 'created_by').order_by('start_date')

        space_id = self.request.query_params.get('space_id')
        if space_id:
            qs = qs.filter(agenda__space__id=space_id)

        agenda_id = self.request.query_params.get('agenda_id')
        if agenda_id:
            qs = qs.filter(agenda__id=agenda_id)

        start_after = self.request.query_params.get('start_after') 
        start_before = self.request.query_params.get('start_before')
        if start_after:
            qs = qs.filter(start__gte=start_after)
        if start_before:
            qs = qs.filter(start__lte=start_before)

        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save() 



class SpaceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Spaces:
    - list/retrieve spaces the request.user (caregiver) belongs to
    - create a space and auto-add the creator as caregiver
    - custom actions to add/remove recipients, invite caregivers
    """
    serializer_class = SpaceSerializer
    permission_classes = [IsCaregiverAndMember]
    lookup_field = "id"  # UUIDField; DRF accepts uuid string in URL

    # -------------------------
    # Queryset selection
    # -------------------------
    def get_queryset(self):
        """
        Return only spaces that the current caregiver belongs to.
        This prevents caregivers from seeing spaces they aren't members of.
        """
        user = self.request.user
        if not user or not hasattr(user, "caregiver"):
            return Space.objects.none()
        return user.caregiver.spaces.all().prefetch_related("recipients", "caregivers")

    # -------------------------
    # Creation / update hooks
    # -------------------------
    def perform_create(self, serializer):
        """
        Called when POST /spaces/ is used. Save Space, and add the creating caregiver
        to its caregivers M2M.
        """
        space = serializer.save()
        caregiver = self.request.user.caregiver
        space.caregivers.add(caregiver)
        space.save()

    def perform_update(self, serializer):
        """
        Default update, but could enforce extra rules (e.g. only owners can rename).
        For now, just save.
        """
        serializer.save()

    # -------------------------
    # Custom actions
    # -------------------------
    @action(detail=True, methods=["post"], url_path="add-recipient")
    def add_recipient(self, request, id=None):
        """
        POST /spaces/{id}/add-recipient/
        Body: {"recipient_id": "<uuid>"}
        Adds an existing Recipient to this space (if the requesting caregiver is a member).
        """
        space = self.get_object()
        recipient_id = request.data.get("recipient_id")
        if not recipient_id:
            return Response({"detail": "recipient_id required"}, status=status.HTTP_400_BAD_REQUEST)

        recipient = get_object_or_404(Recipient, id=recipient_id)

        # permission: ensure request.user's caregiver is part of the space
        if not space.caregivers.filter(user=request.user).exists():
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        space.recipients.add(recipient)
        return Response({"detail": "recipient added"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="remove-recipient")
    def remove_recipient(self, request, id=None):
        """
        POST /spaces/{id}/remove-recipient/
        Body: {"recipient_id": "<uuid>"}
        Removes a recipient from the space.
        """
        space = self.get_object()
        recipient_id = request.data.get("recipient_id")
        recipient = get_object_or_404(Recipient, id=recipient_id)

        if not space.caregivers.filter(user=request.user).exists():
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        space.recipients.remove(recipient)
        return Response({"detail": "recipient removed"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="invite-caregiver")
    def invite_caregiver(self, request, id=None):
        """
        POST /spaces/{id}/invite-caregiver/
        Body: {"email": "invitee@example.com"}
        Creates a simple invitation flow: in a production app you'd email a token.
        Here we'll just return a token-like UUID or simulate acceptance logic.
        """
        import uuid
        space = self.get_object()
        if not space.caregivers.filter(user=request.user).exists():
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get("email")
        if not email:
            return Response({"detail": "email required"}, status=status.HTTP_400_BAD_REQUEST)

        # For now we simulate an invite token. In production: persist invite + send email.
        token = str(uuid.uuid4())
        # TODO: save Invitation(space=space, email=email, token=token, expires_at=...) and email token.
        return Response({"invite_token": token}, status=status.HTTP_201_CREATED)
    


class TreatmentViewSet(viewsets.ModelViewSet):
    serializer_class = TreatmentSerializer
    lookup_field = 'id'
    queryset = Treatment.objects.all()
    permission_classes = [permissions.IsAuthenticated] 
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'number_of_pills', 'medication_format', 'start_date', 'end_date']
    ordering_fields = ['name', 'number_of_pills', 'medication_format', 'start_date', 'end_date']

    def get_queryset(self):
        user = self.request.user

        if not user or not hasattr(user, 'caregiver'):
            return Treatment.objects.none()
        
        caregiver = user.caregiver

        return Treatment.objects.filter(space__in=caregiver.spaces.all()).select_related('space')

    def perform_create(self, serializer):
        serializer.save() 



class HealthcareProfessionalViewSet(viewsets.ModelViewSet):
    serializer_class = HealthcareProfessionalSerializer
    lookup_field = 'id'
    queryset = HealthcareProfessional.objects.all()
    permission_classes = [permissions.IsAuthenticated] 
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'speciality']
    ordering_fields = ['name', 'speciality']

    def get_queryset(self):
        user = self.request.user

        if not user or not hasattr(user, 'caregiver'):
            return HealthcareProfessional.objects.none()
        
        caregiver = user.caregiver

        return HealthcareProfessional.objects.filter(space__in=caregiver.spaces.all()).select_related('space')

    def perform_create(self, serializer):
        serializer.save() 
