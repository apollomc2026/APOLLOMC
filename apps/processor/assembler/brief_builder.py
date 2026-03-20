"""Brief builder — generates the customer-facing mission brief summary."""

from typing import Any


def build_mission_brief(
    mission: dict[str, Any],
    deliverable_type: dict[str, Any],
    style_template: dict[str, Any],
    intake_data: dict[str, str],
    uploaded_files: list[dict[str, Any]],
    sections: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Builds the mission brief shown to the customer for approval.
    This is the last gate before execution begins.
    """
    return {
        "deliverable": {
            "label": deliverable_type["label"],
            "description": deliverable_type.get("description", ""),
        },
        "style": {
            "label": style_template["label"],
            "description": style_template.get("description", ""),
        },
        "sections": [
            {"key": s["key"], "label": s["label"]}
            for s in sections
        ],
        "estimated_pages": {
            "min": deliverable_type.get("estimated_pages_min"),
            "max": deliverable_type.get("estimated_pages_max"),
        },
        "estimated_minutes": deliverable_type.get("estimated_minutes"),
        "files_received": [
            {
                "name": f["original_name"],
                "extraction_status": f.get("extraction_status", "pending"),
            }
            for f in uploaded_files
        ],
        "inputs_summary": intake_data,
        "price_cents": deliverable_type.get("base_price_cents", 0),
    }
