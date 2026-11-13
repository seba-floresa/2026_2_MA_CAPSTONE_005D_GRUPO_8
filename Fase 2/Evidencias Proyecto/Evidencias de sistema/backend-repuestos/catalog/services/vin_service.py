import json
import os
from django.conf import settings

class BuscadorVehiculoAdapter:
    """Interfaz base para buscar vehículos por Patente o VIN."""
    def buscar(self, identificador: str) -> dict:
        raise NotImplementedError("El método buscar debe ser implementado.")

class MockBuscadorVehiculo(BuscadorVehiculoAdapter):
    """Implementación falsa que busca en el JSON local."""
    def buscar(self, identificador: str) -> dict:
        json_path = os.path.join(settings.BASE_DIR, 'mock_vehiculos.json')
        # Limpiamos la entrada: mayúsculas y sin guiones
        identificador_limpio = identificador.upper().replace("-", "")
        
        try:
            with open(json_path, 'r', encoding='utf-8') as file:
                vehiculos = json.load(file)
                # Buscamos coincidencia exacta en patente o vin
                for v in vehiculos:
                    if v.get('patente') == identificador_limpio or v.get('vin') == identificador_limpio:
                        return v
        except FileNotFoundError:
            pass
            
        return None

class ApiExternaBuscadorVehiculo(BuscadorVehiculoAdapter):
    """Implementación futura para API de pago."""
    def buscar(self, identificador: str) -> dict:
        # Lógica futura con requests.get()
        pass