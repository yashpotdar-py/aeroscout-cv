import os
import time
import base64
import io
import logging
import threading
import numpy as np
import scipy.ndimage
from PIL import Image

try:
    from floodnav.flood import FloodSegmenter
except ImportError:
    FloodSegmenter = None

# Config
# Model path is configurable via the MODEL_PATH environment variable.
# Default falls back to a relative path inside the backend directory.
MODEL_PATH = os.getenv("MODEL_PATH", "models/flood_unet.pth")
THROTTLE_SEC = 1.5

# State
_segmenter = None
_last_run_ts = 0.0
_cached_result = None
_lock = threading.Lock()
_is_running = False

logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

try:
    if FloodSegmenter is not None:
        _segmenter = FloodSegmenter(model_path=MODEL_PATH, device=None, img_size=256)
    else:
        logger.warning("FloodSegmenter class not found.")
except Exception as e:
    logger.error(f"Load _segmenter fail: {e}")
    _segmenter = None


def run_inference(frame_b64: str) -> dict | None:
    global _last_run_ts, _cached_result, _is_running

    if _segmenter is None:
        return None

    now = time.time()
    with _lock:
        if now - _last_run_ts < THROTTLE_SEC:
            return _cached_result
        if _is_running:
            return _cached_result
        _is_running = True

    try:
        start_ts = time.time()

        # decode -> np
        frame_bytes = base64.b64decode(frame_b64)
        img = Image.open(io.BytesIO(frame_bytes)).convert("RGB")
        img_np = np.array(img, dtype=np.uint8)

        # predict (torch.no_grad inside)
        flood_map = _segmenter.predict(img_np)

        # --- Threshold: raised to 0.68 to reduce false positives on non-flood terrain ---
        THRESHOLD = 0.68
        mask_bool = flood_map > THRESHOLD
        coverage_pct = float(np.mean(mask_bool) * 100)

        # render RGBA mask — only high-confidence pixels, semi-transparent purple
        rgba = np.zeros((256, 256, 4), dtype=np.uint8)
        rgba[mask_bool] = [168, 85, 247, 140]

        # encode mask png
        out_img = Image.fromarray(rgba, "RGBA")
        buf = io.BytesIO()
        out_img.save(buf, format="PNG")
        mask_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

        # render heatmap — only show pixels above 0.45, scale within that range
        # This compresses the visible range so low-confidence noise disappears
        flood_map_clamped = np.clip(flood_map, 0.0, 1.0)
        HEATMAP_LOW = 0.45  # below this → fully transparent
        HEATMAP_HIGH = 1.0

        visible = flood_map_clamped >= HEATMAP_LOW
        # normalise within [HEATMAP_LOW, HEATMAP_HIGH] → [0, 1]
        norm = np.zeros_like(flood_map_clamped)
        norm[visible] = (flood_map_clamped[visible] - HEATMAP_LOW) / (
            HEATMAP_HIGH - HEATMAP_LOW
        )

        # colour ramp: deep blue (low) → orange (mid) → red (high)
        c_low = np.array([20, 60, 200, 180], dtype=np.float32)
        c_mid = np.array([255, 140, 0, 200], dtype=np.float32)
        c_high = np.array([220, 20, 20, 230], dtype=np.float32)

        heatmap_rgba = np.zeros((256, 256, 4), dtype=np.float32)
        mid_mask = visible & (norm < 0.5)
        high_mask = visible & (norm >= 0.5)

        if mid_mask.any():
            t = (norm[mid_mask] / 0.5)[..., np.newaxis]
            heatmap_rgba[mid_mask] = c_low * (1.0 - t) + c_mid * t

        if high_mask.any():
            t = ((norm[high_mask] - 0.5) / 0.5)[..., np.newaxis]
            heatmap_rgba[high_mask] = c_mid * (1.0 - t) + c_high * t

        heatmap_rgba = heatmap_rgba.astype(np.uint8)

        out_heatmap = Image.fromarray(heatmap_rgba, "RGBA")
        buf_hm = io.BytesIO()
        out_heatmap.save(buf_hm, format="PNG")
        flood_heatmap_b64 = base64.b64encode(buf_hm.getvalue()).decode("utf-8")

        # compute centroids
        flood_centroids = []
        labeled_array, num_features = scipy.ndimage.label(mask_bool)
        if num_features > 0:
            areas = np.bincount(labeled_array.ravel())
            valid_labels = []
            for i in range(1, num_features + 1):
                if areas[i] > 80:
                    valid_labels.append((i, areas[i]))

            valid_labels.sort(key=lambda x: x[1], reverse=True)
            top_labels = [vl[0] for vl in valid_labels[:5]]

            for idx in top_labels:
                r, c = scipy.ndimage.center_of_mass(mask_bool, labeled_array, index=idx)
                flood_centroids.append([float(c), float(r)])

        inf_ms = int((time.time() - start_ts) * 1000)

        res = {
            "mask_b64": mask_b64,
            "flood_heatmap_b64": flood_heatmap_b64,
            "flood_centroids": flood_centroids,
            "coverage_pct": coverage_pct,
            "inference_ms": inf_ms,
        }

        with _lock:
            _last_run_ts = now
            _cached_result = res

        return res

    except Exception as e:
        logger.error(f"Inference err: {e}")
        return None
    finally:
        with _lock:
            _is_running = False
