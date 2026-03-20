"""Tests for the plan builder module."""

import pytest
from assembler.plan_builder import build_plan_md
from assembler.brief_builder import build_mission_brief


def test_build_plan_md_basic():
    """Test that build_plan_md generates a valid plan."""
    mission = {
        "id": "test-mission-001",
        "company_name": "Test Corp",
    }
    deliverable_type = {
        "label": "Legal Memorandum",
        "estimated_pages_min": 4,
        "estimated_pages_max": 8,
        "sections": [
            {
                "key": "issue_statement",
                "label": "Issue Statement",
                "min_words": 100,
                "max_words": 300,
                "required": True,
            },
            {
                "key": "analysis",
                "label": "Analysis",
                "min_words": 500,
                "max_words": 1500,
                "required": True,
            },
        ],
    }
    style_content = "# Legal Classic Style\nUse Times New Roman."
    intake_data = {
        "client_name": "Acme Inc",
        "legal_issue": "Contract dispute",
    }

    result = build_plan_md(
        mission=mission,
        deliverable_type=deliverable_type,
        style_template_content=style_content,
        intake_data=intake_data,
        extracted_files=[],
        brand_rules=None,
    )

    assert "test-mission-001" in result
    assert "Legal Memorandum" in result
    assert "Issue Statement" in result
    assert "Analysis" in result
    assert "Acme Inc" in result
    assert "EXECUTION DIRECTIVE" in result
    assert "STYLE RULES" in result


def test_build_plan_md_with_brand_rules():
    """Test that brand rules are included when provided."""
    mission = {"id": "test-002", "company_name": "Brand Co"}
    deliverable_type = {"label": "Test Doc", "sections": [], "estimated_pages_min": 1, "estimated_pages_max": 2}

    brand_rules = {
        "primary_color": "#FF0000",
        "secondary_colors": ["#00FF00"],
        "heading_font": "Helvetica",
        "body_font": "Arial",
        "tone_keywords": ["professional", "bold"],
        "formatting_notes": "Use bold headers",
    }

    result = build_plan_md(
        mission=mission,
        deliverable_type=deliverable_type,
        style_template_content="# Style",
        intake_data={},
        extracted_files=[],
        brand_rules=brand_rules,
    )

    assert "BRAND RULES" in result
    assert "#FF0000" in result
    assert "Helvetica" in result


def test_build_mission_brief():
    """Test that build_mission_brief returns correct structure."""
    brief = build_mission_brief(
        mission={"id": "test-003"},
        deliverable_type={
            "label": "Pitch Deck",
            "description": "Investor pitch",
            "estimated_pages_min": 12,
            "estimated_pages_max": 20,
            "estimated_minutes": 9,
            "base_price_cents": 7500,
        },
        style_template={"label": "Startup Bold", "description": "Bold style"},
        intake_data={"company_name": "StartupX"},
        uploaded_files=[
            {"original_name": "financials.xlsx", "extraction_status": "complete"}
        ],
        sections=[
            {"key": "cover", "label": "Cover Slide"},
            {"key": "problem", "label": "Problem Statement"},
        ],
    )

    assert brief["deliverable"]["label"] == "Pitch Deck"
    assert brief["price_cents"] == 7500
    assert len(brief["sections"]) == 2
    assert brief["estimated_pages"]["min"] == 12
    assert len(brief["files_received"]) == 1
