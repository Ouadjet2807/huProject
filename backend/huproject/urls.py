from django.urls import path, include
from .views import *
from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView

router = routers.DefaultRouter()
router.register(r'treatments', TreatmentViewSet, 'treatment')
router.register(r'healthcare_professionals', HealthcareProfessionalViewSet, 'healthcare-professionals')
router.register(r'agenda_item_categories', AgendaItemCategoryViewSet, 'agenda-items-categories')
router.register(r'agenda_items', AgendaItemViewSet, 'agenda-items')
router.register(r'agendas', AgendaViewSet, 'agenda')
router.register(r'caregivers', CaregiverViewSet, 'caregiver')
router.register(r'recipients', RecipientViewSet, 'recipient')
router.register(r'spaces', SpaceViewSet, 'space')
router.register(r'space_memberships', SpaceMembershipViewSet, 'space-membership')
router.register(r'invitations', InvitationViewSet, 'invitation')
router.register(r'todo_lists', TodoListViewSet, 'todo-lists')

urlpatterns = [
    path("register/", UserRegistrationAPIView.as_view(), name="register-user"),
    path("login/", UserLoginAPIView.as_view(), name="login-user"),
    path("logout/", UserLogoutAPIView.as_view(), name="logout-user"),
    path("update_user/<str:id>/", UserUpdateAPIView.as_view(), name="update-user"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path('user/', UserInfoAPIView.as_view(), name="user-info"),
    path('user/<str:id>/', UserInfoAPIView.as_view()),
    path('invitations/validate/', validate_invitation),
    path('invitations/accept_invite/', accept_invitation),
    path('', include(router.urls))
]

