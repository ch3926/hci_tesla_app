import heapq
from .utils import calculate_distance
from models.predict import ConsumptionPredictor

class EnergyAwareRouter:
    def __init__(self):
        self.predictor = ConsumptionPredictor()
    
    def find_optimal_route(self, graph, start, end, battery_capacity):
        heap = [(0, 0, start, [])]
        visited = {}
        
        while heap:
            current_dist, energy_used, node, path = heapq.heappop(heap)
            
            if node == end:
                return path + [node]
            
            if node in visited and visited[node] <= energy_used:
                continue
                
            visited[node] = energy_used
            
            for neighbor, edge_data in graph[node].items():
                distance = calculate_distance(node, neighbor)
                consumption = self.predictor.predict(edge_data["conditions"])
                energy_needed = distance * consumption
                
                # Check if we can reach neighbor
                if energy_used + energy_needed <= battery_capacity:
                    heapq.heappush(heap, (
                        current_dist + distance,
                        energy_used + energy_needed,
                        neighbor,
                        path + [node]
                    ))
                
                # Check if we can charge at current node
                if edge_data["has_charger"]:
                    heapq.heappush(heap, (
                        current_dist + distance + 0.5,  # Charging penalty
                        0,  # Reset energy
                        neighbor,
                        path + [node, "(charge)"]
                    ))
        
        return None  # No path found