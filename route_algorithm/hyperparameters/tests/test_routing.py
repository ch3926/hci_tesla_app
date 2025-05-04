import pytest
from routing.dijkstra import EnergyAwareRouter

def test_route_creation():
    router = EnergyAwareRouter()
    test_graph = {
        (37.7749, -122.4194): {
            (37.3387, -121.8853): {
                "conditions": {"temp": 20, "wind": 10, "load": 150},
                "has_charger": True
            }
        }
    }
    
    route = router.find_optimal_route(
        test_graph,
        start=(37.7749, -122.4194),
        end=(37.3387, -121.8853),
        battery_capacity=75
    )
    
    assert len(route) >= 2