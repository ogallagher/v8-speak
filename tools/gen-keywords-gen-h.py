#!/usr/bin/env python3
# Copyright 2018 the V8 project authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

import argparse
import math
import os
from pathlib import Path
import re
import subprocess
import sys


DIALECT_CONFIG = {
    "js-eng": {
        "input_path": "src/parsing/keywords/keywords-eng.txt",
        "output_path": "src/parsing/keywords-eng-gen.h",
        "generator": "gperf",
        "class_name": "PerfectKeywordHash",
        "header_guard": "V8_PARSING_KEYWORDS_ENG_GEN_H_",
    },
    "js-spa": {
        "input_path": "src/parsing/keywords/keywords-spa.txt",
        "output_path": "src/parsing/keywords-spa-gen.h",
        "generator": "simple",
        "class_name": "JsSpaKeywordHash",
        "header_guard": "V8_PARSING_KEYWORDS_SPA_GEN_H_",
    },
}

# TODO(leszeks): Trimming seems to regress performance, investigate.
TRIM_CHAR_TABLE = False


def next_power_of_2(x):
  return 1 if x == 0 else 2**int(math.ceil(math.log(x, 2)))


def call_with_input(cmd, input_string=""):
  p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
  stdout, _ = p.communicate(input_string)
  retcode = p.wait()
  if retcode != 0:
    raise subprocess.CalledProcessError(retcode, cmd)
  return stdout


def checked_sub(pattern, sub, out, count=1, flags=0):
  out, n = re.subn(pattern, sub, out, flags=flags)
  if n != count:
    raise Exception("Didn't get exactly %d replacement(s) for pattern: %s" %
                    (count, pattern))
  return out


def change_sizet_to_int(out):
  return checked_sub(r'\bsize_t\b', 'int', out, count=4)


def drop_line_directives(out):
  return re.sub(r'^#\s*line .*$\n', '', out, flags=re.MULTILINE)


def trim_and_dcheck_char_table(out):
  reads_re = re.compile(
      r'asso_values\[static_cast<unsigned char>\(str\[(\d+)\]\)\]')

  dchecks = []
  for str_read in reads_re.finditer(out):
    dchecks.append("DCHECK_LT(str[%d], 128);" % int(str_read.group(1)))

  if TRIM_CHAR_TABLE:
    out = checked_sub(
        r'static const unsigned char asso_values\[\]\s*=\s*\{(\s*\d+\s*,){96}',
        "".join(dchecks) + r'static const unsigned char asso_values[32] = {',
        out,
        flags=re.MULTILINE)
    out = checked_sub(
        reads_re.pattern,
        r'asso_values[static_cast<unsigned char>(str[(\1)]&31)]',
        out,
        count=len(dchecks),
        flags=re.MULTILINE)
  else:
    out = checked_sub(
        r'static const unsigned char asso_values\[\]\s*=\s*\{',
        "".join(dchecks) + r'static const unsigned char asso_values[128] = {',
        out,
        flags=re.MULTILINE)

  return out


def use_isinrange(out):
  return checked_sub(r'if \(len <= MAX_WORD_LENGTH && len >= MIN_WORD_LENGTH\)',
                     r'if (base::IsInRange(len, MIN_WORD_LENGTH, '
                     r'MAX_WORD_LENGTH))',
                     out)


def pad_tables(out):
  max_hash_value = int(re.search(r'MAX_HASH_VALUE\s*=\s*(\d+)', out).group(1))
  old_table_length = max_hash_value + 1
  new_table_length = next_power_of_2(old_table_length)
  table_padding_len = new_table_length - old_table_length

  single_lengthtable_entry = r'\d+'
  out = checked_sub(
      r"""
      static\ const\ unsigned\ char\ kPerfectKeywordLengthTable\[\]\s*=\s*\{
        (
          \s*%(single_lengthtable_entry)s\s*
          (?:,\s*%(single_lengthtable_entry)s\s*)*
        )
      \}
    """ % {'single_lengthtable_entry': single_lengthtable_entry},
      r'static const unsigned char kPerfectKeywordLengthTable[%d] = { \1 %s }'
      % (new_table_length, "".join([',0'] * table_padding_len)),
      out,
      flags=re.MULTILINE | re.VERBOSE)

  single_wordlist_entry = r"""
      (?:\#line\ \d+\ ".*"$\s*)?
      \{\s*"[a-z]*"\s*,\s*Token::[A-Z_]+\}
    """
  out = checked_sub(
      r"""
      static\ const\ struct\ PerfectKeywordHashTableEntry\ kPerfectKeywordHashTable\[\]\s*=\s*\{
        (
          \s*%(single_wordlist_entry)s\s*
          (?:,\s*%(single_wordlist_entry)s\s*)*
        )
      \}
    """ % {'single_wordlist_entry': single_wordlist_entry},
      r'static const struct PerfectKeywordHashTableEntry kPerfectKeywordHashTable[%d] = {\1 %s }'
      % (new_table_length,
         "".join([',{"",Token::IDENTIFIER}'] * table_padding_len)),
      out,
      flags=re.MULTILINE | re.VERBOSE)

  out = checked_sub(r'Hash\s*\(\s*str,\s*len\s*\)',
                    r'Hash(str, len)&0x%x' % (new_table_length - 1), out)
  out = checked_sub(
      r'if \(key <= MAX_HASH_VALUE\)',
      r'DCHECK_LT(key, arraysize(kPerfectKeywordLengthTable));DCHECK_LT(key, arraysize(kPerfectKeywordHashTable));',
      out)

  return out


def return_token(out):
  out = checked_sub(
      r'const\s*struct\s*PerfectKeywordHashTableEntry\s*\*\s*((?:PerfectKeywordHash::)?GetToken)',
      r'inline Token::Value \1',
      out,
      count=2)
  out = checked_sub(r'return &kPerfectKeywordHashTable\[key\];',
                    r'return kPerfectKeywordHashTable[key].value;', out)
  out = checked_sub(r'return 0;', r'return Token::IDENTIFIER;', out)
  return out


def memcmp_to_while(out):
  return checked_sub(
      re.escape("if (*str == *s && !memcmp (str + 1, s + 1, len - 1))") + r"\s*"
      + re.escape("return kPerfectKeywordHashTable[key].value;"),
      """
      while(*s!=0) {
        if (*s++ != *str++) return Token::IDENTIFIER;
      }
      return kPerfectKeywordHashTable[key].value;
      """,
      out,
      flags=re.MULTILINE)


def trim_character_set_warning(out):
  return out.replace(
      '"gperf generated tables don\'t work with this execution character set. Please report a bug to <bug-gperf@gnu.org>."',
      '"gperf generated tables don\'t work with this execution character set."\\\n// If you see this error, please report a bug to <bug-gperf@gnu.org>.')


def wrap_namespace(out, *, script_name, header_guard):
  return f"""// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This file is automatically generated by {script_name} and should not
// be modified manually.

#ifndef {header_guard}
#define {header_guard}

#include "src/parsing/token.h"

namespace v8 {{
namespace internal {{

{out}

}}  // namespace internal
}}  // namespace v8

#endif  // {header_guard}
"""


def generate_js_eng(root_dir, config):
  out = subprocess.check_output(["gperf", "-m100", config["input_path"]],
                                cwd=root_dir)
  out = change_sizet_to_int(out)
  out = drop_line_directives(out)
  out = trim_and_dcheck_char_table(out)
  out = use_isinrange(out)
  out = pad_tables(out)
  out = return_token(out)
  out = memcmp_to_while(out)
  out = wrap_namespace(out.decode("utf-8"),
                       script_name="gen-keywords-gen-h.py",
                       header_guard=config["header_guard"])
  out = trim_character_set_warning(out)
  clang_format_path = os.path.join(root_dir, 'third_party/depot_tools/clang-format')
  return call_with_input([clang_format_path], out).decode("utf-8")


def read_entries(input_path):
  entries = []
  for raw_line in Path(input_path).read_text(encoding="utf-8").splitlines():
    line = raw_line.strip()
    if not line or line.startswith("#"):
      continue
    keyword, token = [part.strip() for part in line.split(",", 1)]
    entries.append((keyword, token))
  return entries


def generate_simple(config):
  lines = [
      "// Copyright 2026 the V8 project authors. All rights reserved.",
      "// Use of this source code is governed by a BSD-style license that can be",
      "// found in the LICENSE file.",
      "",
      "// This file is automatically generated by gen-keywords-gen-h.py and",
      "// should not be modified manually.",
      "",
      f"#ifndef {config['header_guard']}",
      f"#define {config['header_guard']}",
      "",
      "#include <cstring>",
      "",
      '#include "src/parsing/token.h"',
      "",
      "namespace v8 {",
      "namespace internal {",
      "",
      f"class {config['class_name']} {{",
      " public:",
      "  static inline Token::Value GetToken(const char* str, int len) {",
      "    switch (len) {",
  ]

  lengths = {}
  for keyword, token in read_entries(config["input_path"]):
    lengths.setdefault(len(keyword), []).append((keyword, token))

  for length in sorted(lengths):
    cases = lengths[length]
    lines.append(f"      case {length}:")
    for index, (keyword, token) in enumerate(cases):
      prefix = "        return " if index == 0 else "            : "
      comparator = f"std::strncmp(str, \"{keyword}\", len) == 0"
      lines.append(f"{prefix}{comparator} ? {token}")
    lines.append("                                                        : Token::IDENTIFIER;")

  lines.extend([
      "      default:",
      "        return Token::IDENTIFIER;",
      "    }",
      "  }",
      "};",
      "",
      "}  // namespace internal",
      "}  // namespace v8",
      "",
      f"#endif  // {config['header_guard']}",
      "",
  ])
  return "\n".join(lines)


def generate_for_dialect(root_dir, dialect):
  config = DIALECT_CONFIG[dialect]
  if config["generator"] == "gperf":
    return generate_js_eng(root_dir, config)
  return generate_simple(config)


def parse_args():
  parser = argparse.ArgumentParser()
  parser.add_argument("--dialect",
                      nargs="+",
                      default=["js-eng"],
                      choices=sorted(DIALECT_CONFIG.keys()))
  return parser.parse_args()


def main():
  try:
    args = parse_args()
    script_dir = os.path.dirname(sys.argv[0])
    root_dir = os.path.join(script_dir, '..')

    for dialect in args.dialect:
      config = DIALECT_CONFIG[dialect]
      output_path = os.path.join(root_dir, config["output_path"])
      output = generate_for_dialect(root_dir, dialect)
      with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output)
    return 0

  except subprocess.CalledProcessError as e:
    sys.stderr.write("Error calling '{}'\n".format(" ".join(e.cmd)))
    return e.returncode


if __name__ == '__main__':
  sys.exit(main())
