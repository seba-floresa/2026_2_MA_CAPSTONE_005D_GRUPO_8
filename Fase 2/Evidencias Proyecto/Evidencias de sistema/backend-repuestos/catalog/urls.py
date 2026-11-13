from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RepuestoViewSet,
    CategoriaViewSet,
    SubcategoriaViewSet,
    VehiculoViewSet,
    PedidoViewSet,
    BuscarVehiculoAPIView,
    login_api_view,
)

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'subcategorias', SubcategoriaViewSet)
router.register(r'vehiculos', VehiculoViewSet)
router.register(r'repuestos', RepuestoViewSet)
router.register(r'pedidos', PedidoViewSet)

urlpatterns = [
    # Rutas automáticas del CRUD
    path('', include(router.urls)),
    # Ruta personalizada para la búsqueda de patentes/VIN
    path('buscar-vehiculo/', BuscarVehiculoAPIView.as_view(), name='buscar-vehiculo'),
    path('login/', login_api_view, name='api-login'),
]