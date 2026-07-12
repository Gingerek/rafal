from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageOps
import pillow_avif  # noqa: F401 - registers AVIF support

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "images"
OUTPUT_DIR = SOURCE_DIR / "responsive"
DATA_FILE = ROOT / "responsive-image-data.js"
WIDTHS = (480, 800, 1200, 1800)
EXTENSIONS = {".jpg", ".jpeg", ".png", ".avif", ".webp"}


def safe_name(path: Path) -> str:
    stem = re.sub(r"[^A-Za-z0-9_-]+", "-", path.stem).strip("-") or "image"
    return f"{stem}-{path.suffix.lower().lstrip('.')}"


def save_variant(image: Image.Image, destination: Path, fmt: str) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    save_image = image
    if fmt == "AVIF":
        save_image.save(destination, "AVIF", quality=66, speed=6)
    else:
        save_image.save(destination, "WEBP", quality=76, method=6)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest: dict[str, dict[str, object]] = {}

    sources = sorted(
        path for path in SOURCE_DIR.iterdir()
        if path.is_file() and path.suffix.lower() in EXTENSIONS
    )

    for source in sources:
        try:
            with Image.open(source) as opened:
                image = ImageOps.exif_transpose(opened)
                has_alpha = image.mode in {"RGBA", "LA"} or "transparency" in image.info
                image = image.convert("RGBA" if has_alpha else "RGB")
                original_width, original_height = image.size
                slug = safe_name(source)
                variants: list[dict[str, object]] = []

                generated_widths = [width for width in WIDTHS if width < original_width]
                if not generated_widths or generated_widths[-1] != min(1800, original_width):
                    generated_widths.append(min(1800, original_width))
                generated_widths = sorted(set(generated_widths))

                for width in generated_widths:
                    height = max(1, round(original_height * width / original_width))
                    resized = image.resize((width, height), Image.Resampling.LANCZOS)
                    avif_path = OUTPUT_DIR / f"{slug}-{width}.avif"
                    webp_path = OUTPUT_DIR / f"{slug}-{width}.webp"
                    save_variant(resized, avif_path, "AVIF")
                    save_variant(resized, webp_path, "WEBP")
                    variants.append({
                        "width": width,
                        "height": height,
                        "avif": avif_path.relative_to(ROOT).as_posix(),
                        "webp": webp_path.relative_to(ROOT).as_posix(),
                    })

                manifest[source.name] = {
                    "width": original_width,
                    "height": original_height,
                    "variants": variants,
                }
        except Exception as exc:
            print(f"Skipping {source.name}: {exc}")

    payload = json.dumps(manifest, ensure_ascii=False, separators=(",", ":"))
    DATA_FILE.write_text(f"window.FOTODISOGNO_IMAGES={payload};\n", encoding="utf-8")
    print(f"Generated responsive variants for {len(manifest)} images")


if __name__ == "__main__":
    main()
