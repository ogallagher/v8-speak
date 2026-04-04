// Copyright 2026 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef V8_PARSING_SOURCE_DIALECT_H_
#define V8_PARSING_SOURCE_DIALECT_H_

#include <cstring>

#include "src/common/globals.h"
#include "src/parsing/token.h"

namespace v8 {
namespace internal {

enum class SourceDialect : uint8_t {
  kJsEng,
  kJsSpa,
};

V8_INLINE bool MatchesSourceDialectString(base::Vector<const uint8_t> value,
                                          const char* expected) {
  size_t expected_length = std::strlen(expected);
  return value.length() == static_cast<int>(expected_length) &&
         std::strncmp(reinterpret_cast<const char*>(value.begin()), expected,
                      expected_length) == 0;
}

V8_INLINE bool TryParseSourceDialect(base::Vector<const uint8_t> value,
                                     SourceDialect* source_dialect) {
  if (MatchesSourceDialectString(value, "js-eng")) {
    *source_dialect = SourceDialect::kJsEng;
    return true;
  }
  if (MatchesSourceDialectString(value, "js-spa")) {
    *source_dialect = SourceDialect::kJsSpa;
    return true;
  }
  return false;
}

V8_INLINE const char* SourceDialectName(SourceDialect source_dialect) {
  switch (source_dialect) {
    case SourceDialect::kJsEng:
      return "js-eng";
    case SourceDialect::kJsSpa:
      return "js-spa";
  }
  UNREACHABLE();
}

}  // namespace internal
}  // namespace v8

#endif  // V8_PARSING_SOURCE_DIALECT_H_
