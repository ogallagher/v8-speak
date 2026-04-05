#!/usr/bin/env python3
# Copyright 2026 the V8 project authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

import argparse
import sys

from common import clang_format
from common import read_entries
from common import repo_root_from_script
from common import script_relpath
from common import wrap_header


DIALECT_CONFIG = {
    "js-eng": "src/parsing/pseudokeywords/pseudokeywords-eng.txt",
    "js-spa": "src/parsing/pseudokeywords/pseudokeywords-spa.txt",
}

OUTPUT_PATH = "src/parsing/pseudokeywords-gen.h"
HEADER_GUARD = "V8_PARSING_PSEUDOKEYWORDS_GEN_H_"


def class_name_for_dialect(dialect):
  if dialect == "js-eng":
    return "JsEngPseudoKeywordNameMap"
  if dialect == "js-spa":
    return "JsSpaPseudoKeywordNameMap"
  raise ValueError(f"Unhandled dialect: {dialect}")


def source_dialect_enum_name(dialect):
  if dialect == "js-eng":
    return "SourceDialect::kJsEng"
  if dialect == "js-spa":
    return "SourceDialect::kJsSpa"
  raise ValueError(f"Unhandled dialect: {dialect}")


def validate_and_collect_entries(root_dir):
  dialect_entries = {}
  canonical_enum_values = None

  for dialect, relative_path in DIALECT_CONFIG.items():
    entries = read_entries(root_dir / relative_path)
    enum_values = [enum_value for _, enum_value in entries]
    if len(enum_values) != len(set(enum_values)):
      raise ValueError(f"Duplicate pseudokeyword enum in {relative_path}")
    if canonical_enum_values is None:
      canonical_enum_values = enum_values
    elif enum_values != canonical_enum_values:
                               raise ValueError(
          f"Pseudokeyword enums in {relative_path} do not match canonical order")
    dialect_entries[dialect] = entries

  return canonical_enum_values, dialect_entries


def generate_enum_lines(enum_values):
  lines = ["enum class PseudoKeywordName : uint8_t {"]
  for enum_value in enum_values:
    lines.append(f"  {enum_value.removeprefix('PseudoKeywordName::')},")
  lines.append("};")
  return lines


def generate_dialect_class_lines(dialect, entries):
  lines = [
      f"class {class_name_for_dialect(dialect)} {{",
      " public:",
      "  static inline const char* GetSpelling(PseudoKeywordName name) {",
      "    switch (name) {",
  ]
  for spelling, enum_value in entries:
    lines.append(f"      case {enum_value}:")
    lines.append(f'        return "{spelling}";')
  lines.extend([
      "    }",
      "    UNREACHABLE();",
      "  }",
      "};",
  ])
  return lines


def generate_dispatch_lines():
  lines = [
      "V8_INLINE const char* SourceDialectNameSpelling(SourceDialect source_dialect,",
      "                                                PseudoKeywordName name) {",
      "  switch (source_dialect) {",
  ]
  for dialect in DIALECT_CONFIG:
    lines.append(f"    case {source_dialect_enum_name(dialect)}:")
    lines.append(
        f"      return {class_name_for_dialect(dialect)}::GetSpelling(name);")
  lines.extend([
      "  }",
      "  UNREACHABLE();",
      "}",
      "",
      "V8_INLINE bool AstRawStringEqualsSourceDialectName(",
      "    const AstRawString* identifier, SourceDialect source_dialect,",
      "    PseudoKeywordName name) {",
      "  if (identifier == nullptr) return false;",
      "  return identifier->IsOneByteEqualTo(",
      "      SourceDialectNameSpelling(source_dialect, name));",
      "}",
  ])
  return lines


def generate_header(root_dir):
  enum_values, dialect_entries = validate_and_collect_entries(root_dir)
  lines = []
  lines.extend(generate_enum_lines(enum_values))
  lines.append("")
  for dialect in DIALECT_CONFIG:
    lines.extend(generate_dialect_class_lines(dialect, dialect_entries[dialect]))
    lines.append("")
  lines.extend(generate_dispatch_lines())
  body = "\n".join(lines)
  header = wrap_header(
      body,
      script_name=script_relpath(__file__, root_dir),
      header_guard=HEADER_GUARD,
      includes=[
          "src/ast/ast-value-factory.h",
          "src/base/logging.h",
          "src/parsing/source-dialect.h",
      ])
  return clang_format(root_dir, header)


def parse_args():
  parser = argparse.ArgumentParser()
  parser.add_argument("--check", action="store_true")
  return parser.parse_args()


def main():
  root_dir = repo_root_from_script(__file__)
  output = generate_header(root_dir)
  output_path = root_dir / OUTPUT_PATH

  if parse_args().check:
    return 0 if output_path.read_text(encoding="utf-8") == output else 1

  output_path.write_text(output, encoding="utf-8")
  return 0


if __name__ == "__main__":
  sys.exit(main())
