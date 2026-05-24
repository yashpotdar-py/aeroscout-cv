"""A* pathfinding algorithm for flood-aware navigation."""

from __future__ import annotations

import heapq
import math

import numpy as np


def _heuristic(a: tuple[int, int], b: tuple[int, int]) -> float:
    """Euclidean distance heuristic for A*.
    
    Args:
        a: First position (x, y).
        b: Second position (x, y).
        
    Returns:
        Euclidean distance between positions.
    """
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)


# 8-directional movement offsets
_NEIGHBORS = [
    (-1, -1), (-1, 0), (-1, 1),
    (0, -1),          (0, 1),
    (1, -1),  (1, 0), (1, 1),
]


def astar(
    cost_map: np.ndarray,
    start: tuple[int, int],
    goal: tuple[int, int],
) -> tuple[list[tuple[int, int]], float]:
    """A* pathfinding on cost map.
    
    Finds the optimal path from start to goal on a 2D cost map using
    8-directional movement. Diagonal movements cost sqrt(2) times the
    cell cost.
    
    Args:
        cost_map: 2D cost map (H, W) where each cell contains traversal cost.
        start: Start position (x, y) in pixel coordinates.
        goal: Goal position (x, y) in pixel coordinates.
        
    Returns:
        Tuple of (path, total_cost) where:
        - path: List of (x, y) positions from start to goal (inclusive).
                Empty list if no path found.
        - total_cost: Total path cost. float('inf') if no path found.
        
    Note:
        Coordinates are (x, y) where x is column and y is row.
        The cost_map is indexed as cost_map[y, x].
    """
    h, w = cost_map.shape
    
    # Validate bounds
    if not (0 <= start[0] < w and 0 <= start[1] < h):
        return [], float("inf")
    if not (0 <= goal[0] < w and 0 <= goal[1] < h):
        return [], float("inf")
    
    # Handle trivial case
    if start == goal:
        return [start], 0.0
    
    # Priority queue: (f_score, counter, position)
    # Counter is used to break ties in a consistent way
    counter = 0
    open_set: list[tuple[float, int, tuple[int, int]]] = [(0.0, counter, start)]
    
    # Track where we came from for path reconstruction
    came_from: dict[tuple[int, int], tuple[int, int]] = {}
    
    # g_score[pos] = cost of cheapest path from start to pos
    g_score: dict[tuple[int, int], float] = {start: 0.0}
    
    # Closed set to avoid revisiting
    closed: set[tuple[int, int]] = set()
    
    while open_set:
        _, _, current = heapq.heappop(open_set)
        
        # Skip if already processed
        if current in closed:
            continue
        closed.add(current)
        
        # Check if we reached the goal
        if current == goal:
            # Reconstruct path
            path = [current]
            while current in came_from:
                current = came_from[current]
                path.append(current)
            path.reverse()
            return path, g_score[goal]
        
        # Explore neighbors
        for dx, dy in _NEIGHBORS:
            nx, ny = current[0] + dx, current[1] + dy
            
            # Check bounds
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            
            neighbor = (nx, ny)
            
            # Skip if already processed
            if neighbor in closed:
                continue
            
            # Movement cost: diagonal costs sqrt(2) more
            move_cost = math.sqrt(dx ** 2 + dy ** 2)
            cell_cost = float(cost_map[ny, nx])
            tentative_g = g_score[current] + move_cost * cell_cost
            
            # Check if this is a better path
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score = tentative_g + _heuristic(neighbor, goal)
                counter += 1
                heapq.heappush(open_set, (f_score, counter, neighbor))
    
    # No path found
    return [], float("inf")


def is_path_connected(path: list[tuple[int, int]]) -> bool:
    """Check if a path is connected (each consecutive pair is adjacent).
    
    Args:
        path: List of (x, y) positions.
        
    Returns:
        True if path is connected (8-directional adjacency), False otherwise.
    """
    if len(path) <= 1:
        return True
    
    for i in range(len(path) - 1):
        x1, y1 = path[i]
        x2, y2 = path[i + 1]
        
        # Check 8-directional adjacency
        dx = abs(x2 - x1)
        dy = abs(y2 - y1)
        
        if dx > 1 or dy > 1:
            return False
    
    return True
