#!/usr/bin/env python3
"""
Per-file context shared by the mobile_audit check modules.
Matches real mobile framework imports (React Native, Expo, Flutter, Tauri Mobile)
so static web data files mentioning the string 'react-native' are never misclassified.
"""

import re
from dataclasses import dataclass, field
from typing import List

RN_IMPORT_RE = re.compile(
    r'(?:from|require\s*\()\s*["\'](?:react-native(?:/[-A-Za-z0-9_./]*)?|'
    r'expo(?:-[a-z0-9-]+|/[-A-Za-z0-9_./]*)?|@react-navigation/[-A-Za-z0-9_./]+|'
    r'@shopify/flash-list)["\']'
)
FLUTTER_IMPORT_RE = re.compile(r'import\s+["\']package:flutter/|extends\s+(?:StatelessWidget|StatefulWidget)\b')
TAURI_MOBILE_IMPORT_RE = re.compile(
    r'(?:from|require\s*\()\s*["\']@tauri-apps/plugin-(?:haptics|biometric|barcode-scanner|nfc|geolocation)["\']'
)


@dataclass
class MobileFileContext:
    content: str
    filename: str
    is_react_native: bool
    is_flutter: bool
    is_tauri_mobile: bool = False
    issues: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    passed_count: int = 0

    @property
    def is_mobile(self) -> bool:
        return self.is_react_native or self.is_flutter or self.is_tauri_mobile

    @classmethod
    def from_content(cls, content: str, filename: str) -> "MobileFileContext":
        return cls(
            content=content,
            filename=filename,
            is_react_native=bool(RN_IMPORT_RE.search(content)),
            is_flutter=bool(FLUTTER_IMPORT_RE.search(content)),
            is_tauri_mobile=bool(TAURI_MOBILE_IMPORT_RE.search(content)),
        )
