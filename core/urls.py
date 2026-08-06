from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tickets/', include('tickets.urls')),
    path('users/', include('users.urls')),

    # APIs
    path('api/', include('core.urls_api')),

    # Redirect
    path('', RedirectView.as_view(
        pattern_name="users:login",
        permanent=False
    ))
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)