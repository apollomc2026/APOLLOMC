"""Brand guide extraction — uses Claude API to parse brand rules from documents."""

import json
from typing import Any

import anthropic


def extract_brand_rules(extracted_content: dict[str, Any]) -> dict[str, Any]:
    """
    Parse brand guide content into structured rules using Claude API.

    Identifies:
    - Primary/secondary colors (hex)
    - Font families (heading, body)
    - Tone keywords
    - Logo usage rules

    Returns:
        brand_rules dict for injection into mission CLAUDE.md
    """
    client = anthropic.Anthropic()

    text_content = extracted_content.get("text", "")[:8000]

    prompt = f"""Analyze this brand guide content and extract structured brand rules.
Return ONLY valid JSON with this exact schema:
{{
  "primary_color": "#hex",
  "secondary_colors": ["#hex"],
  "heading_font": "font name",
  "body_font": "font name",
  "tone_keywords": ["word1", "word2"],
  "logo_usage_rules": ["rule1", "rule2"],
  "formatting_notes": "any specific formatting requirements"
}}

If a field cannot be determined from the content, use null for that field.

Content:
{text_content}"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = response.content[0].text

    # Extract JSON from response
    try:
        json_match = response_text
        if "```" in json_match:
            json_match = json_match.split("```json")[-1].split("```")[0]
        return json.loads(json_match)
    except (json.JSONDecodeError, IndexError):
        return {
            "primary_color": None,
            "secondary_colors": [],
            "heading_font": None,
            "body_font": None,
            "tone_keywords": [],
            "logo_usage_rules": [],
            "formatting_notes": response_text[:500],
        }
