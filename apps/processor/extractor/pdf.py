"""PDF extraction module — extracts text, tables, and metadata from PDF files."""

import io
from typing import Any

import pdfplumber


def extract_pdf(file_bytes: bytes) -> dict[str, Any]:
    """
    Extract structured content from a PDF file.

    Returns:
        dict with keys: text, tables, pages, metadata
    """
    result: dict[str, Any] = {
        "text": "",
        "tables": [],
        "pages": 0,
        "metadata": {},
    }

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        result["pages"] = len(pdf.pages)
        result["metadata"] = pdf.metadata or {}

        full_text: list[str] = []
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text.append(text)

            tables = page.extract_tables()
            for table in tables:
                result["tables"].append({
                    "page": page.page_number,
                    "data": table,
                })

        result["text"] = "\n\n".join(full_text)

    return result
