from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


from .models import Repuesto, Categoria, Subcategoria, Vehiculo, Pedido
from .serializers import (
    RepuestoSerializer,
    CategoriaSerializer,
    SubcategoriaSerializer,
    VehiculoSerializer,
    PedidoSerializer,
)
from .services.vin_service import MockBuscadorVehiculo

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({"error": "Debe proporcionar correo y contraseña."}, status=status.HTTP_400_BAD_REQUEST)

    # Buscamos al usuario por su email (Django usa 'username' por defecto, pero mapeamos el email)
    from django.contrib.auth.models import User
    try:
        user_obj = User.objects.get(email=email)
        username = user_obj.username
    except User.DoesNotExist:
        return Response({"error": "Credenciales inválidas."}, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(username=username, password=password)

    if user is not None:
        return Response({
            "mensaje": "Login exitoso",
            "is_staff": user.is_staff,
            "username": user.username,
            "email": user.email
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Contraseña incorrecta."}, status=status.HTTP_401_UNAUTHORIZED)


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


class SubcategoriaViewSet(viewsets.ModelViewSet):
    queryset = Subcategoria.objects.all()
    serializer_class = SubcategoriaSerializer


class VehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.all().order_by('marca', 'modelo', 'anio_inicio')
    serializer_class = VehiculoSerializer

class RepuestoViewSet(viewsets.ModelViewSet):
    queryset = Repuesto.objects.all().order_by('-id')
    serializer_class = RepuestoSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return []
        return [IsAdminUser()]


class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer


class BuscarVehiculoAPIView(APIView):
    """
    Endpoint para buscar vehículos por Patente o VIN utilizando el Patrón Adaptador.
    """
    def get(self, request):
        # Capturamos el parámetro 'q' de la URL (ej: /api/buscar-vehiculo/?q=ABCD12)
        identificador = request.query_params.get('q', '').strip()

        if not identificador:
            return Response(
                {"error": "Debe proporcionar una patente o VIN en el parámetro 'q'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Patrón adaptador instanciado
        buscador = MockBuscadorVehiculo()
        resultado = buscador.buscar(identificador)

        if resultado:
            return Response(resultado, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Vehículo no encontrado en los registros."},
                status=status.HTTP_404_NOT_FOUND
            )