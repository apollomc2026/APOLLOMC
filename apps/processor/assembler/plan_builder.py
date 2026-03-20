"""Plan builder — assembles PLAN.md from mission data, intake, and style rules."""

from datetime import datetime, timezone
from typing import Any


def build_plan_md(
    mission: dict[str, Any],
    deliverable_type: dict[str, Any],
    style_template_content: str,
    intake_data: dict[str, str],
    extracted_files: list[dict[str, Any]],
    brand_rules: dict[str, Any] | None,
) -> str:
    """
    Assembles the PLAN.md that the execution engine follows.
    This is the source of truth for a build mission.
    """
    sections = deliverable_type.get("sections", [])
    mission_id = mission["id"]
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    plan = f"""# APOLLO BUILD MISSION
**Mission ID:** {mission_id}
**Deliverable:** {deliverable_type['label']}
**Customer:** {mission.get('company_name', 'Not specified')}
**Date:** {now}

---

## EXECUTION DIRECTIVE
Read every section of this plan before writing anything.
Execute sections in the order listed.
Write each completed section to: staging/{mission_id}/[section_key].json
Do not stop until all sections are complete and compiled.
Kickoff command: read CLAUDE.md and PLAN.md then execute full build start to finish.

---

## STYLE RULES
{style_template_content}

"""

    if brand_rules:
        plan += f"""
## BRAND RULES (from uploaded brand guide)
- Primary color: {brand_rules.get('primary_color', 'not specified')}
- Secondary colors: {', '.join(brand_rules.get('secondary_colors', []) or [])}
- Heading font: {brand_rules.get('heading_font', 'not specified')}
- Body font: {brand_rules.get('body_font', 'not specified')}
- Tone: {', '.join(brand_rules.get('tone_keywords', []) or [])}
- Formatting notes: {brand_rules.get('formatting_notes', 'none')}

"""

    plan += "## CUSTOMER INPUTS\n"
    for key, value in intake_data.items():
        plan += f"- **{key}:** {value}\n"

    if extracted_files:
        plan += "\n## REFERENCE DOCUMENTS\n"
        for f in extracted_files:
            plan += f"\n### {f['original_name']}\n"
            extracted = f.get("extracted_json", {})
            if isinstance(extracted, dict):
                text = extracted.get("text", "")
                plan += f"Extracted text:\n{text[:4000]}\n"
                tables = extracted.get("tables", [])
                if tables:
                    plan += f"Tables detected: {len(tables)}\n"

    plan += "\n## SECTIONS TO BUILD\n"
    plan += "Build each section completely before moving to the next.\n"
    plan += "After completing each section, write output to staging.\n\n"

    for i, section in enumerate(sections, 1):
        plan += f"""### Section {i}: {section['label']} [{section['key']}]
**Required:** {section.get('required', True)}
**Estimated length:** {section.get('min_words', 100)}\u2013{section.get('max_words', 500)} words
**Instructions:** {section.get('instructions', 'Write professionally and completely.')}
**Checkpoint:** Write completed section to staging/{mission_id}/{section['key']}.json before continuing.

"""

    est_min = deliverable_type.get("estimated_pages_min", "?")
    est_max = deliverable_type.get("estimated_pages_max", "?")

    plan += f"""## COMPILE
After all sections are complete:
1. Assemble sections in order into final document
2. Apply style rules throughout
3. Verify page count matches estimate ({est_min}\u2013{est_max} pages)
4. Write final output to outputs/{mission_id}/v1/
5. Signal completion by writing outputs/{mission_id}/v1/COMPLETE

## QUALITY GATE
The quality gate will run automatically after COMPLETE signal.
If it fails, you will receive a retry instruction with specific feedback.
"""

    return plan
