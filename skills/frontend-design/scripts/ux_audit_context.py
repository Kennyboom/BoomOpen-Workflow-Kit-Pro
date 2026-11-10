#!/usr/bin/env python3
"""
Per-file context shared by the ux_audit check modules.

The flags below were computed once at the top of the original single-file
audit and are reused by several check sections.
"""

import re
from dataclasses import dataclass, field
from typing import List


@dataclass
class UXFileContext:
    content: str
    filename: str
    is_stylesheet: bool
    has_long_text: bool
    has_form: bool
    complex_elements: int
    has_hero: bool
    issues: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    passed_count: int = 0

    @classmethod
    def from_content(cls, content: str, filename: str) -> "UXFileContext":
        is_css = filename.lower().endswith(".css")
        return cls(
            content=content,
            filename=filename,
            is_stylesheet=is_css,
            has_long_text=not is_css and bool(
                re.search(r'<p\b|<div[^>]*class(?:Name)?=[^>]*text|<article\b|<span[^>]*text', content, re.IGNORECASE)
            ),
            has_form=not is_css and bool(
                re.search(r'<(?:form|input|select|textarea)\b', content, re.IGNORECASE)
            ),
            complex_elements=0 if is_css else len(
                re.findall(r'<(?:input|select|textarea|option)\b', content, re.IGNORECASE)
            ),
            has_hero=not is_css and bool(re.search(r'hero|<h1\b|banner', content, re.IGNORECASE)),
        )
