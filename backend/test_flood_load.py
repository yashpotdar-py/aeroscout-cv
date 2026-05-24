import sys
import os
import time
import traceback
import numpy as np
import torch

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

try:
    from floodnav.flood import FloodSegmenter

    start_time = time.time()
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Device: {device}")
    
    model_path = "C:/Users/yashy/projects/academic/floodnav_system/models/flood_unet.pth"
    
    segmenter = FloodSegmenter(model_path=model_path)
    
    dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    output = segmenter.predict(dummy_frame)
    
    end_time = time.time()
    
    print(f"Output shape: {output.shape}")
    print(f"Output min: {output.min()}, max: {output.max()}")
    print(f"Total time (load+infer): {(end_time - start_time) * 1000:.2f} ms")

except Exception:
    traceback.print_exc()
    sys.exit(1)
