"""Cost map generation for flood-aware path planning."""

from __future__ import annotations

import numpy as np


def create_cost_map(
    flood_map: np.ndarray,
    base_cost: float = 1.0,
    flood_weight: float = 10.0,
) -> np.ndarray:
    """Create 2D cost map from flood probability.
    
    Higher flood probability results in higher traversal cost.
    The cost formula is: cost = base_cost + flood_probability * flood_weight
    
    Args:
        flood_map: Flood probability map (H, W), values 0.0-1.0.
        base_cost: Minimum traversal cost for non-flooded areas.
        flood_weight: Multiplier for flood cost contribution.
        
    Returns:
        Cost map (H, W) with values >= base_cost.
        
    Raises:
        ValueError: If base_cost or flood_weight is negative.
    """
    if base_cost < 0:
        raise ValueError(f"base_cost must be >= 0, got {base_cost}")
    if flood_weight < 0:
        raise ValueError(f"flood_weight must be >= 0, got {flood_weight}")
    
    # Cost = base_cost + flood_probability * flood_weight
    # This ensures higher flood probability = higher traversal cost
    cost_map = base_cost + flood_map * flood_weight
    
    return cost_map.astype(np.float32)
