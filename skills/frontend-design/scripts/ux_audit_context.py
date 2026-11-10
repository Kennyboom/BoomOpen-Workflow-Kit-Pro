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
    has_long_text: bool
    has_form: bool
    complex_elements: int
    has_hero: bool
    issues: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    passed_count: int = 0

    @classmethod
    def from_content(cls, content: str, filename: str) -> "UXFileContext":
        return cls(
            content=content,
            filename=filename,
            has_long_text=bool(re.search(r'<p|<div.*class=.*text|article|<span.*text', content, re.IGNORECASE)),
            has_form=bool(re.search(r'<form|<input|password|credit|card|payment', content, re.IGNORECASE)),
            complex_elements=len(re.findall(r'<input|<select|<textarea|<option', content, re.IGNORECASE)),
            has_hero=bool(re.search(r'hero|<h1|banner', content, re.IGNORECASE)),
        )
