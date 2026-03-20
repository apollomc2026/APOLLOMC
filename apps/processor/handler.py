"""Apollo MC Processor — Lambda entry point.

Routes processor jobs based on event.job_type:
- extract: Run extraction on uploaded file
- assemble: Build PLAN.md from mission data
- watermark: Embed buyer ID in completed output
- preview: Generate degraded preview
"""

import json
import logging
from typing import Any

import boto3

from extractor.pdf import extract_pdf
from extractor.docx import extract_docx
from extractor.xlsx import extract_xlsx
from extractor.brand import extract_brand_rules
from assembler.plan_builder import build_plan_md
from assembler.brief_builder import build_mission_brief
from watermark.steg import embed_buyer_id
from preview.render import generate_preview

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client("s3")
BUCKET = "apollo-outputs-private"


def handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    """Lambda entry point — routes to specific job handlers."""
    job_type = event.get("job_type")
    logger.info(f"Processing job_type={job_type}, mission_id={event.get('mission_id')}")

    handlers = {
        "extract": handle_extraction,
        "assemble": handle_assembly,
        "watermark": handle_watermark,
        "preview": handle_preview,
    }

    if job_type not in handlers:
        raise ValueError(f"Unknown job_type: {job_type}")

    return handlers[job_type](event)


def handle_extraction(event: dict[str, Any]) -> dict[str, Any]:
    """Extract content from an uploaded file in S3."""
    s3_key = event["s3_key"]
    mime_type = event.get("mime_type", "")

    # Download file from S3
    response = s3.get_object(Bucket=BUCKET, Key=s3_key)
    file_bytes = response["Body"].read()

    # Route to appropriate extractor
    if mime_type == "application/pdf" or s3_key.endswith(".pdf"):
        extracted = extract_pdf(file_bytes)
    elif mime_type in (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ) or s3_key.endswith(".docx"):
        extracted = extract_docx(file_bytes)
    elif mime_type in (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ) or s3_key.endswith(".xlsx"):
        extracted = extract_xlsx(file_bytes)
    else:
        return {
            "status": "failed",
            "error": f"Unsupported file type: {mime_type}",
        }

    # Check if this is a brand guide — run brand extraction
    is_brand_guide = event.get("kind") == "brand_guide"
    brand_rules = None
    if is_brand_guide and extracted.get("text"):
        brand_rules = extract_brand_rules(extracted)

    return {
        "status": "complete",
        "extracted_json": extracted,
        "brand_rules": brand_rules,
    }


def handle_assembly(event: dict[str, Any]) -> dict[str, Any]:
    """Build PLAN.md and CLAUDE.md for a mission."""
    mission = event["mission"]
    deliverable_type = event["deliverable_type"]
    style_content = event["style_template_content"]
    intake_data = event.get("intake_data", {})
    extracted_files = event.get("extracted_files", [])
    brand_rules = event.get("brand_rules")

    plan_md = build_plan_md(
        mission=mission,
        deliverable_type=deliverable_type,
        style_template_content=style_content,
        intake_data=intake_data,
        extracted_files=extracted_files,
        brand_rules=brand_rules,
    )

    mission_id = mission["id"]

    # Upload PLAN.md
    plan_key = f"plans/{mission_id}/PLAN.md"
    s3.put_object(
        Bucket=BUCKET,
        Key=plan_key,
        Body=plan_md.encode("utf-8"),
        ContentType="text/markdown",
    )

    # Upload CLAUDE.md (style template)
    claude_key = f"plans/{mission_id}/CLAUDE.md"
    s3.put_object(
        Bucket=BUCKET,
        Key=claude_key,
        Body=style_content.encode("utf-8"),
        ContentType="text/markdown",
    )

    # Build mission brief
    sections = deliverable_type.get("sections", [])
    brief = build_mission_brief(
        mission=mission,
        deliverable_type=deliverable_type,
        style_template=event.get("style_template", {}),
        intake_data=intake_data,
        uploaded_files=extracted_files,
        sections=sections,
    )

    return {
        "status": "complete",
        "plan_s3_key": plan_key,
        "claude_s3_key": claude_key,
        "mission_brief": brief,
    }


def handle_watermark(event: dict[str, Any]) -> dict[str, Any]:
    """Embed buyer ID into a completed output file."""
    s3_key = event["s3_key"]
    buyer_id = event["buyer_id"]
    mission_id = event["mission_id"]

    # Download production file
    response = s3.get_object(Bucket=BUCKET, Key=s3_key)
    file_bytes = response["Body"].read()

    # Embed watermark
    watermarked = embed_buyer_id(file_bytes, buyer_id, mission_id)

    # Upload watermarked version
    watermarked_key = s3_key  # Overwrite in place
    s3.put_object(
        Bucket=BUCKET,
        Key=watermarked_key,
        Body=watermarked,
        ContentType="application/pdf",
    )

    return {
        "status": "complete",
        "watermarked_key": watermarked_key,
    }


def handle_preview(event: dict[str, Any]) -> dict[str, Any]:
    """Generate a degraded preview image from a production file."""
    s3_key = event["s3_key"]
    mission_id = event["mission_id"]

    # Download production file
    response = s3.get_object(Bucket=BUCKET, Key=s3_key)
    file_bytes = response["Body"].read()

    # Generate preview
    preview_bytes = generate_preview(file_bytes)

    # Upload preview
    preview_key = f"previews/{mission_id}/preview.jpg"
    s3.put_object(
        Bucket=BUCKET,
        Key=preview_key,
        Body=preview_bytes,
        ContentType="image/jpeg",
    )

    return {
        "status": "complete",
        "preview_key": preview_key,
    }
