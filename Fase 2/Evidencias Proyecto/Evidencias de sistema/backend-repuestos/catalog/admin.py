from django.contrib import admin
from .models import (
    Usuario, Vehiculo, Categoria, Subcategoria, Repuesto, CompatibilidadVehicular,
    ReglaCrossSelling, Carrito, ItemCarrito, TarifaDespacho, Pedido,
    DetallePedido, TransaccionPago, DocumentoTributario,
    SolicitudEspecial, SesionChatbot, MensajeChatbot, VehiculoCliente
)

# Registramos todos los modelos nuevos en el panel de administrador
admin.site.register(Usuario)
admin.site.register(Vehiculo)
admin.site.register(Categoria)
admin.site.register(Subcategoria)
admin.site.register(Repuesto)
admin.site.register(CompatibilidadVehicular)
admin.site.register(ReglaCrossSelling)
admin.site.register(Carrito)
admin.site.register(ItemCarrito)
admin.site.register(TarifaDespacho)
admin.site.register(Pedido)
admin.site.register(DetallePedido)
admin.site.register(TransaccionPago)
admin.site.register(DocumentoTributario)
admin.site.register(SolicitudEspecial)
admin.site.register(SesionChatbot)
admin.site.register(MensajeChatbot)
admin.site.register(VehiculoCliente)