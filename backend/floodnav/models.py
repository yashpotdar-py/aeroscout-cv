"""Model loading utilities for perception module."""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

import torch
import segmentation_models_pytorch as smp

if TYPE_CHECKING:
    from torch import nn


def get_device() -> torch.device:
    """Get the best available device (CUDA if available, else CPU).
    
    Returns:
        torch.device: The selected device.
    """
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def load_unet_model(
    weights_path: Path | str,
    device: torch.device | None = None,
    encoder_name: str = "resnet34",
    in_channels: int = 3,
    classes: int = 1,
) -> nn.Module:
    """Load a pretrained UNet model for segmentation.
    
    Args:
        weights_path: Path to the model weights file (.pth).
        device: Device to load the model on. If None, auto-selects best device.
        encoder_name: Name of the encoder backbone.
        in_channels: Number of input channels (3 for RGB).
        classes: Number of output classes (1 for binary segmentation).
        
    Returns:
        Loaded model in evaluation mode.
        
    Raises:
        FileNotFoundError: If weights file does not exist.
        RuntimeError: If model loading fails.
    """
    weights_path = Path(weights_path)
    if not weights_path.exists():
        raise FileNotFoundError(f"Model weights not found: {weights_path}")
    
    if device is None:
        device = get_device()
    
    # Load weights
    try:
        raw_state = torch.load(weights_path, map_location=device, weights_only=True)
    except Exception as e:
        # Try explicitly without weights_only for checkpoints with numpy scalars (PyTorch 2.6+)
        try:
            raw_state = torch.load(weights_path, map_location=device, weights_only=False)
        except Exception as fallback_e:
            raise RuntimeError(f"Failed to load model weights from {weights_path}: {e}\nFallback error: {fallback_e}") from e

    # Extract model_state_dict if it's a full checkpoint
    if isinstance(raw_state, dict) and 'model_state_dict' in raw_state:
        state_dict = raw_state['model_state_dict']
        if 'config' in raw_state and 'encoder' in raw_state['config']:
            encoder_name = raw_state['config']['encoder']
    else:
        state_dict = raw_state

    # Create model architecture
    model: nn.Module = smp.Unet(
        encoder_name=encoder_name,
        encoder_weights=None,  # No pretrained weights, we load our own
        in_channels=in_channels,
        classes=classes,
    )

    model.load_state_dict(state_dict)
    
    model.to(device)
    model.eval()
    
    return model


def get_default_model_paths() -> dict[str, Path]:
    """Get default paths for model weights.
    
    Returns:
        Dictionary with 'flood' and 'building' keys pointing to model paths.
    """
    # Assume models are in the models/ directory relative to package root
    # This will be resolved at runtime based on installation location
    import floodnav
    package_root = Path(floodnav.__file__).parent.parent.parent.parent
    models_dir = package_root / "models"
    
    return {
        "flood": models_dir / "flood_unet.pth",
        "building": models_dir / "building_unet.pth",
    }


def load_improved_model(
    weights_path: Path | str,
    device: torch.device | None = None,
) -> tuple[nn.Module, dict]:
    """Load an improved model from checkpoint format.
    
    The improved training script saves models as checkpoints with
    config information. This function handles that format.
    
    Args:
        weights_path: Path to the model checkpoint file (.pth).
        device: Device to load the model on. If None, auto-selects best device.
        
    Returns:
        Tuple of (model, config_dict).
        Model is in evaluation mode.
        
    Raises:
        FileNotFoundError: If weights file does not exist.
        RuntimeError: If model loading fails.
    """
    weights_path = Path(weights_path)
    if not weights_path.exists():
        raise FileNotFoundError(f"Model weights not found: {weights_path}")
    
    if device is None:
        device = get_device()
    
    # Load checkpoint
    try:
        checkpoint = torch.load(weights_path, map_location=device, weights_only=False)
    except Exception as e:
        raise RuntimeError(f"Failed to load checkpoint from {weights_path}: {e}") from e
    
    # Check if this is a checkpoint or raw state dict
    if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
        # Checkpoint format from improved training
        state_dict = checkpoint['model_state_dict']
        config = checkpoint.get('config', {})
    else:
        # Raw state dict (legacy format)
        state_dict = checkpoint
        config = {}
    
    # Get model config
    encoder_name = config.get('encoder', 'efficientnet-b2')
    in_channels = config.get('in_channels', 3)
    classes = config.get('classes', 1)
    
    # Create model
    model: nn.Module = smp.Unet(
        encoder_name=encoder_name,
        encoder_weights=None,
        in_channels=in_channels,
        classes=classes,
    )
    
    # Load weights
    try:
        model.load_state_dict(state_dict)
    except Exception as e:
        raise RuntimeError(f"Failed to load model state dict: {e}") from e
    
    model.to(device)
    model.eval()
    
    return model, config
