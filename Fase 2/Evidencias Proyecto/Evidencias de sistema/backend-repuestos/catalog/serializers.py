import json
from rest_framework import serializers
from .models import (
    Repuesto,
    Categoria,
    Subcategoria,
    Vehiculo,
    CompatibilidadVehicular,
    Pedido,
)


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'


class SubcategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategoria
        fields = '__all__'


class VehiculoSerializer(serializers.ModelSerializer):
    nombre = serializers.SerializerMethodField()

    class Meta:
        model = Vehiculo
        fields = ['id', 'marca', 'modelo', 'anio', 'motorizacion', 'nombre']

    def get_nombre(self, obj):
        return f"{obj.marca} {obj.modelo} {obj.anio}"


class RepuestoSerializer(serializers.ModelSerializer):
    # Traducción de campos entre Angular (precio, stock) y Django (precio_unitario, stock_disponible)
    precio = serializers.IntegerField(source='precio_unitario')
    stock = serializers.IntegerField(source='stock_disponible')

    # Campos de solo lectura para mostrar nombres y cargar edición en Angular
    categoria_id = serializers.IntegerField(source='categoria.id', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    subcategoria_id = serializers.SerializerMethodField()
    subcategoria_nombre = serializers.SerializerMethodField()
    vehiculos = serializers.SerializerMethodField()
    vehiculos_nombres = serializers.SerializerMethodField()

    class Meta:
        model = Repuesto
        fields = [
            'id',
            'sku',
            'nombre',
            'marca_fabricante',
            'condicion',
            'peso_kg',
            'categoria',
            'categoria_id',
            'categoria_nombre',
            'subcategoria',
            'subcategoria_id',
            'subcategoria_nombre',
            'precio',
            'stock',
            'imagen',
            'activo',
            'vehiculos',
            'vehiculos_nombres',
        ]

    def get_subcategoria_id(self, obj):
        return obj.subcategoria.id if obj.subcategoria else None

    def get_subcategoria_nombre(self, obj):
        return obj.subcategoria.nombre if obj.subcategoria else ''

    def get_vehiculos(self, obj):
        return list(
            CompatibilidadVehicular.objects.filter(repuesto=obj).values_list('vehiculo_id', flat=True)
        )

    def get_vehiculos_nombres(self, obj):
        compatibilidades = CompatibilidadVehicular.objects.filter(repuesto=obj).select_related('vehiculo')
        nombres = []
        for c in compatibilidades:
            v = c.vehiculo
            rango = f"{v.anio_inicio}-{v.anio_fin}" if v.anio_fin else f"{v.anio_inicio}+"
            motor = f"(Motor {v.motorizacion})" if v.motorizacion else ""
            nombres.append(f"{v.marca} {v.modelo} {rango} {motor}".strip())
        return nombres

    def _guardar_compatibilidades(self, repuesto):
        request = self.context.get('request')
        if not request or 'vehiculos' not in request.data:
            return

        vehiculos_raw = request.data.get('vehiculos')
        try:
            ids = json.loads(vehiculos_raw) if isinstance(vehiculos_raw, str) else vehiculos_raw
        except (json.JSONDecodeError, TypeError):
            ids = []

        CompatibilidadVehicular.objects.filter(repuesto=repuesto).delete()
        for v_id in ids:
            vehiculo = Vehiculo.objects.filter(id=v_id).first()
            if vehiculo:
                CompatibilidadVehicular.objects.create(
                    repuesto=repuesto,
                    vehiculo=vehiculo,
                    anio_desde=vehiculo.anio_inicio,
                    # Si anio_fin es nulo, guardamos el mismo anio_inicio (o puedes poner un año genérico como 2050)
                    anio_hasta=vehiculo.anio_fin if vehiculo.anio_fin else vehiculo.anio_inicio,
                )

    def create(self, validated_data):
        repuesto = super().create(validated_data)
        self._guardar_compatibilidades(repuesto)
        return repuesto

    def update(self, instance, validated_data):
        repuesto = super().update(instance, validated_data)
        self._guardar_compatibilidades(repuesto)
        return repuesto


class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = '__all__'


class VehiculoSerializer(serializers.ModelSerializer):
    nombre = serializers.SerializerMethodField()

    class Meta:
        model = Vehiculo
        fields = ['id', 'marca', 'modelo', 'anio_inicio', 'anio_fin', 'motorizacion', 'nombre']

    def get_nombre(self, obj):
        rango = f"{obj.anio_inicio}-{obj.anio_fin}" if obj.anio_fin else f"{obj.anio_inicio}+"
        motor = f"(Motor {obj.motorizacion})" if obj.motorizacion else ""
        return f"{obj.marca} {obj.modelo} {rango} {motor}".strip()