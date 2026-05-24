"""Flood segmentation inference module."""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

import numpy as np
import torch
from PIL import Image

from floodnav.models import get_device, load_unet_model, load_improved_model

if TYPE_CHECKING:
    from torch import nn

# ImageNet normalization stats (used by improved model)
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


class FloodSegmenter:
    """Flood probability estimation from aerial images.

    This class loads a pretrained UNet model and performs inference
    to produce flood probability maps from RGB aerial images.

    Attributes:
        model: The loaded UNet model.
        device: The device (CPU/GPU) used for inference.
        img_size: The image size used for inference (default 256).
    """

    def __init__(
        self,
        model_path: Path | str,
        device: torch.device | None = None,
        img_size: int = 256,
    ) -> None:
        """Initialize the flood segmenter.

        Args:
            model_path: Path to the pretrained model weights.
            device: Device for inference. If None, auto-selects best device.
            img_size: Image size for model input (images are resized to this).

        Raises:
            FileNotFoundError: If model weights file does not exist.
        """
        self.device = device if device is not None else get_device()
        self.img_size = img_size
        self.model: nn.Module = load_unet_model(model_path, self.device)

    def _preprocess(self, image: np.ndarray) -> torch.Tensor:
        """Preprocess image for model input.

        Args:
            image: RGB image array (H, W, 3), values 0-255.

        Returns:
            Preprocessed tensor (1, 3, img_size, img_size), values 0-1.

        Raises:
            ValueError: If image has invalid shape or dimensions.
        """
        if image.ndim != 3 or image.shape[2] != 3:
            raise ValueError(
                f"Expected RGB image with shape (H, W, 3), got {image.shape}"
            )

        if image.shape[0] < 64 or image.shape[1] < 64:
            raise ValueError(
                f"Image too small: {image.shape[:2]}. Minimum size is 64x64."
            )

        # Convert to PIL for resizing
        pil_image = Image.fromarray(image.astype(np.uint8))
        pil_image = pil_image.resize(
            (self.img_size, self.img_size), Image.Resampling.BILINEAR
        )

        # Convert to tensor
        image_np = np.array(pil_image, dtype=np.float32) / 255.0
        image_tensor = torch.from_numpy(image_np).permute(2, 0, 1).unsqueeze(0)

        return image_tensor

    def predict(self, image: np.ndarray) -> np.ndarray:
        """Run flood segmentation inference.

        Args:
            image: RGB image array (H, W, 3), values 0-255.

        Returns:
            Flood probability map (img_size, img_size), values 0.0-1.0.
            The output is at the model's internal resolution (img_size x img_size).

        Raises:
            ValueError: If image has invalid format.
        """
        # Preprocess
        image_tensor = self._preprocess(image)
        image_tensor = image_tensor.to(self.device)

        # Inference
        with torch.no_grad():
            logits = self.model(image_tensor)
            confidence = torch.sigmoid(logits).squeeze().cpu().numpy()

        # Ensure output is in [0, 1] range (should already be due to sigmoid)
        confidence = np.clip(confidence, 0.0, 1.0)

        return np.asarray(confidence)

    def predict_with_resize(
        self,
        image: np.ndarray,
        output_size: tuple[int, int] | None = None,
    ) -> np.ndarray:
        """Run inference and optionally resize output to match original image.

        Args:
            image: RGB image array (H, W, 3), values 0-255.
            output_size: If provided, resize output to (H, W). If None, returns
                        at model resolution (img_size x img_size).

        Returns:
            Flood probability map, values 0.0-1.0.
        """
        confidence = self.predict(image)

        if output_size is not None:
            # Resize to requested size
            from PIL import Image as PILImage

            conf_pil = PILImage.fromarray((confidence * 255).astype(np.uint8))
            conf_pil = conf_pil.resize(
                (output_size[1], output_size[0]), PILImage.Resampling.BILINEAR
            )
            confidence = np.array(conf_pil, dtype=np.float32) / 255.0

        return confidence


class ImprovedFloodSegmenter:
    """Improved flood segmenter with TTA and ImageNet normalization.

    This class loads the improved model trained with heavy augmentation
    and supports Test-Time Augmentation (TTA) for better accuracy.

    Attributes:
        model: The loaded UNet model with EfficientNet encoder.
        device: The device (CPU/GPU) used for inference.
        img_size: The image size used for inference (default 384).
        use_tta: Whether to use Test-Time Augmentation.
    """

    def __init__(
        self,
        model_path: Path | str,
        device: torch.device | None = None,
        img_size: int = 384,
        use_tta: bool = False,
    ) -> None:
        """Initialize the improved flood segmenter.

        Args:
            model_path: Path to the pretrained model weights (checkpoint format).
            device: Device for inference. If None, auto-selects best device.
            img_size: Image size for model input (images are resized to this).
            use_tta: Whether to use Test-Time Augmentation (slower but more accurate).

        Raises:
            FileNotFoundError: If model weights file does not exist.
        """
        self.device = device if device is not None else get_device()
        self.img_size = img_size
        self.use_tta = use_tta

        # Load improved model (handles checkpoint format)
        self.model, self.config = load_improved_model(model_path, self.device)

        # Update img_size from config if available
        if "img_size" in self.config:
            self.img_size = self.config["img_size"]

    def _preprocess(self, image: np.ndarray) -> torch.Tensor:
        """Preprocess image with ImageNet normalization.

        Args:
            image: RGB image array (H, W, 3), values 0-255.

        Returns:
            Preprocessed tensor (1, 3, img_size, img_size), normalized.
        """
        if image.ndim != 3 or image.shape[2] != 3:
            raise ValueError(
                f"Expected RGB image with shape (H, W, 3), got {image.shape}"
            )

        if image.shape[0] < 64 or image.shape[1] < 64:
            raise ValueError(
                f"Image too small: {image.shape[:2]}. Minimum size is 64x64."
            )

        # Resize
        pil_image = Image.fromarray(image.astype(np.uint8))
        pil_image = pil_image.resize(
            (self.img_size, self.img_size), Image.Resampling.BILINEAR
        )

        # Normalize with ImageNet stats
        image_np = np.array(pil_image, dtype=np.float32) / 255.0
        image_np = (image_np - IMAGENET_MEAN) / IMAGENET_STD

        # Convert to tensor
        image_tensor = torch.from_numpy(image_np).permute(2, 0, 1).unsqueeze(0)

        return image_tensor

    def _preprocess_with_transform(
        self,
        image: np.ndarray,
        flip_h: bool = False,
        flip_v: bool = False,
        rotate90: int = 0,
    ) -> torch.Tensor:
        """Preprocess with optional augmentation for TTA."""
        if image.ndim != 3 or image.shape[2] != 3:
            raise ValueError(
                f"Expected RGB image with shape (H, W, 3), got {image.shape}"
            )

        # Apply augmentations to original image
        img = image.copy()
        if flip_h:
            img = np.fliplr(img).copy()
        if flip_v:
            img = np.flipud(img).copy()
        if rotate90 > 0:
            img = np.rot90(img, k=rotate90).copy()

        return self._preprocess(img)

    def _inverse_transform(
        self,
        pred: np.ndarray,
        flip_h: bool = False,
        flip_v: bool = False,
        rotate90: int = 0,
    ) -> np.ndarray:
        """Inverse augmentation transform on prediction."""
        result = pred.copy()

        # Reverse operations in opposite order
        if rotate90 > 0:
            result = np.rot90(result, k=-rotate90)
        if flip_v:
            result = np.flipud(result).copy()
        if flip_h:
            result = np.fliplr(result).copy()

        return result

    def predict(self, image: np.ndarray) -> np.ndarray:
        """Run flood segmentation inference with optional TTA.

        Args:
            image: RGB image array (H, W, 3), values 0-255.

        Returns:
            Flood probability map (img_size, img_size), values 0.0-1.0.
        """
        if not self.use_tta:
            return self._predict_single(image)

        # TTA: multiple augmented predictions
        predictions = []

        # Original
        predictions.append(self._predict_single(image))

        # Horizontal flip
        pred_hflip = self._predict_with_aug(image, flip_h=True)
        predictions.append(pred_hflip)

        # Vertical flip
        pred_vflip = self._predict_with_aug(image, flip_v=True)
        predictions.append(pred_vflip)

        # Rotate 90
        pred_rot90 = self._predict_with_aug(image, rotate90=1)
        predictions.append(pred_rot90)

        # Average predictions
        final_pred = np.mean(predictions, axis=0)

        return np.clip(final_pred, 0.0, 1.0)

    def _predict_single(self, image: np.ndarray) -> np.ndarray:
        """Single prediction without augmentation."""
        image_tensor = self._preprocess(image)
        image_tensor = image_tensor.to(self.device)

        with torch.no_grad():
            logits = self.model(image_tensor)
            confidence = torch.sigmoid(logits).squeeze().cpu().numpy()

        return np.clip(confidence, 0.0, 1.0)

    def _predict_with_aug(
        self,
        image: np.ndarray,
        flip_h: bool = False,
        flip_v: bool = False,
        rotate90: int = 0,
    ) -> np.ndarray:
        """Predict with augmentation and inverse transform."""
        image_tensor = self._preprocess_with_transform(
            image, flip_h=flip_h, flip_v=flip_v, rotate90=rotate90
        )
        image_tensor = image_tensor.to(self.device)

        with torch.no_grad():
            logits = self.model(image_tensor)
            confidence = torch.sigmoid(logits).squeeze().cpu().numpy()

        # Inverse transform
        confidence = self._inverse_transform(
            confidence, flip_h=flip_h, flip_v=flip_v, rotate90=rotate90
        )

        return np.clip(confidence, 0.0, 1.0)

    def predict_with_resize(
        self,
        image: np.ndarray,
        output_size: tuple[int, int] | None = None,
    ) -> np.ndarray:
        """Run inference and optionally resize output to match original image.

        Args:
            image: RGB image array (H, W, 3), values 0-255.
            output_size: If provided, resize output to (H, W). If None, returns
                        at model resolution (img_size x img_size).

        Returns:
            Flood probability map, values 0.0-1.0.
        """
        confidence = self.predict(image)

        if output_size is not None:
            conf_pil = Image.fromarray((confidence * 255).astype(np.uint8))
            conf_pil = conf_pil.resize(
                (output_size[1], output_size[0]), Image.Resampling.BILINEAR
            )
            confidence = np.array(conf_pil, dtype=np.float32) / 255.0

        return confidence
