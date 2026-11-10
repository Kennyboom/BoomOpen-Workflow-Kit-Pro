#!/usr/bin/env python3
"""
Per-file context shared by the mobile_audit check modules.
"""

import re
from dataclasses import dataclass, field
from typing import List


@dataclass
class MobileFileContext:
    content: str
    filename: str
    is_react_native: bool
    is_flutter: bool
    issues: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    passed_count: int = 0

    @property
    def is_mobile(self) -> bool:
        return self.is_react_native or self.is_flutter

    @classmethod
    def from_content(cls, content: str, filename: str) -> "MobileFileContext":
        return cls(
            content=content,
            filename=filename,
            is_react_native=bool(re.search(r'react-native|@react-navigation|React\.Native', content)),
            is_flutter=bool(re.search(r'import \'package:flutter|MaterialApp|Widget\.build', content)),
        )
