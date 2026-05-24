import logging
import numpy as np

try:
    from floodnav.astar import astar
    from floodnav.cost_map import create_cost_map
except ImportError:
    astar = None
    create_cost_map = None

logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)


def compute_rescue_path(
    flood_map: np.ndarray, drone_pixel: tuple[int, int]
) -> list[list[int]]:
    try:
        if astar is None or create_cost_map is None:
            logger.error("floodnav modules not found.")
            return []

        if flood_map.shape != (256, 256):
            return []

        drone_x = max(0, min(255, int(drone_pixel[0])))
        drone_y = max(0, min(255, int(drone_pixel[1])))
        start = (drone_x, drone_y)

        cost_map = create_cost_map(flood_map, base_cost=1.0, flood_weight=10.0)

        safe_zone_mask = flood_map < 0.3
        safe_ys, safe_xs = np.where(safe_zone_mask)

        if len(safe_ys) == 0:
            return []

        dists = (safe_xs - drone_x) ** 2 + (safe_ys - drone_y) ** 2
        best_idx = int(np.argmin(dists))
        goal = (int(safe_xs[best_idx]), int(safe_ys[best_idx]))

        path, cost = astar(cost_map, start=start, goal=goal)

        if not path or cost == float("inf"):
            return []

        simp = path[::5]
        if simp[-1] != path[-1]:
            simp.append(path[-1])

        return [[int(p[0]), int(p[1])] for p in simp]

    except Exception as e:
        logger.error(f"Path planner err: {e}")
        return []
