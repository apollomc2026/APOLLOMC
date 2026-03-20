"""Preview renderer — generates degraded preview images from production PDFs."""

import io
from typing import Any

from PIL import Image, ImageDraw, ImageFont


def generate_preview(
    pdf_bytes: bytes,
    watermark_text: str = "APOLLO MC PREVIEW",
    max_pages: int = 2,
) -> bytes:
    """
    Generate a degraded preview JPEG from a production PDF.

    - Renders first 2 pages only
    - Downsamples to 72 DPI (production is 300 DPI)
    - Applies semi-transparent diagonal watermark
    - Returns JPEG bytes for S3 upload to previews/ prefix

    Args:
        pdf_bytes: Production PDF file bytes
        watermark_text: Text to overlay as watermark
        max_pages: Maximum pages to include in preview

    Returns:
        JPEG bytes of the degraded preview
    """
    # Create a placeholder preview image
    # In full implementation, use pdf2image to render PDF pages
    width, height = 612, 792  # Letter size at 72 DPI
    preview = Image.new("RGB", (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(preview)

    # Draw page content placeholder
    draw.rectangle([36, 36, width - 36, height - 36], outline=(200, 200, 200), width=1)
    draw.text((width // 2 - 60, height // 2 - 10), "Preview", fill=(180, 180, 180))

    # Apply diagonal watermark
    _apply_watermark(preview, draw, watermark_text)

    # Save as JPEG at reduced quality
    buffer = io.BytesIO()
    preview.save(buffer, format="JPEG", quality=60)
    return buffer.getvalue()


def _apply_watermark(
    image: Image.Image,
    draw: ImageDraw.Draw,
    text: str,
) -> None:
    """Apply a semi-transparent diagonal watermark across the image."""
    width, height = image.size

    # Create watermark overlay
    overlay = Image.new("RGBA", (width, height), (255, 255, 255, 0))
    overlay_draw = ImageDraw.Draw(overlay)

    # Draw watermark text at multiple positions diagonally
    try:
        font = ImageFont.truetype("arial.ttf", 36)
    except (OSError, IOError):
        font = ImageFont.load_default()

    for y_offset in range(-height, height * 2, 120):
        for x_offset in range(-width, width * 2, 300):
            overlay_draw.text(
                (x_offset, y_offset),
                text,
                fill=(200, 200, 200, 80),
                font=font,
            )

    # Rotate and composite
    rotated = overlay.rotate(45, expand=False, center=(width // 2, height // 2))
    image.paste(Image.alpha_composite(image.convert("RGBA"), rotated).convert("RGB"))
