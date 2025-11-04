from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from .models import Caregiver, Recipient, Space
from .serializers import CaregiverSerializer, RecipientSerializer, SpaceSerializer

# Example: a simple permission that requires authentication
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
    permission_classes = [permissions.IsAuthenticated]  # refine as needed
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'user__username']
    ordering_fields = ['first_name', 'last_name']

    # If you want caregivers to be created automatically from user signups, override perform_create:
    def perform_create(self, serializer):
        # optionally create caregiver linked to request.user
        if hasattr(self.request.user, 'caregiver'):
            # prevent creating duplicate for same user
            raise ValidationError("Caregiver already exists for this user.")
        serializer.save(user=self.request.user)


class RecipientViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for recipients. Queryset is filtered to recipients within spaces
    the requesting caregiver belongs to.
    """
    serializer_class = RecipientSerializer
    permission_classes = [IsAuthenticatedCaregiver]
    lookup_field = 'id'  # UUIDField; DRF will accept uuid strings in URL

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'medical_info']
    ordering_fields = ['first_name', 'last_name']

    def get_queryset(self):
        """
        Return recipients that belong to any Space the current caregiver user is a member of.
        We prefetch caregivers and spaces to avoid N+1 queries.
        """
        user = self.request.user
        # if anonymous user, return empty queryset
        if not user.is_authenticated or not hasattr(user, 'caregiver'):
            return Recipient.objects.none()

        caregiver = user.caregiver
        # get all spaces this caregiver is in
        spaces_qs = caregiver.spaces.all()

        # Efficiently fetch recipients that belong to these spaces
        qs = Recipient.objects.filter(spaces__in=spaces_qs).distinct()
        # Prefetch caregivers and spaces for serialization efficiency
        qs = qs.prefetch_related('caregivers', 'spaces')
        return qs

    def perform_create(self, serializer):
        """
        When creating a recipient, optionally attach it to a Space
        supplied in request.data['space_id'] (UUID) or default to first
        space of the caregiver.
        """
        user = self.request.user
        caregiver = user.caregiver
        space_id = self.request.data.get('space_id')

        recipient = serializer.save()  # create recipient first

        # Attach recipient to a space
        if space_id:
            space = get_object_or_404(Space, id=space_id)
            # only allow if caregiver is member of that space
            if not space.caregivers.filter(user=user).exists():
                raise PermissionDenied("You are not allowed to add recipients to this space.")
            space.recipients.add(recipient)
        else:
            # fallback: add to caregiver first space (if any)
            first_space = caregiver.spaces.first()
            if first_space:
                first_space.aides.add(recipient)

        # Optionally add the creating caregiver to recipient.caregivers M2M
        recipient.caregivers.add(caregiver)
        recipient.save()

class IsCaregiver(permissions.BasePermission):
    """Simple permission: user must be authenticated and have a Caregiver profile."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, "caregiver"))


class SpaceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Spaces:
    - list/retrieve spaces the request.user (caregiver) belongs to
    - create a space and auto-add the creator as caregiver
    - custom actions to add/remove recipients, invite caregivers
    """
    serializer_class = SpaceSerializer
    permission_classes = [IsCaregiver]
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
    
    