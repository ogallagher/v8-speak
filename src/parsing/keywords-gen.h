// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This file is automatically generated by gen-keywords-gen-h.py and should not
// be modified manually.

#ifndef V8_PARSING_KEYWORDS_GEN_H_
#define V8_PARSING_KEYWORDS_GEN_H_

#include "src/parsing/token.h"

namespace v8 {
namespace internal {

/* C++ code produced by gperf version 3.1 */
/* Command-line: gperf -m100 src/parsing/keywords.txt  */
/* Computed positions: -k'1-2' */

#if !(                                                                         \
    (' ' == 32) && ('!' == 33) && ('"' == 34) && ('#' == 35) && ('%' == 37) && \
    ('&' == 38) && ('\'' == 39) && ('(' == 40) && (')' == 41) &&               \
    ('*' == 42) && ('+' == 43) && (',' == 44) && ('-' == 45) && ('.' == 46) && \
    ('/' == 47) && ('0' == 48) && ('1' == 49) && ('2' == 50) && ('3' == 51) && \
    ('4' == 52) && ('5' == 53) && ('6' == 54) && ('7' == 55) && ('8' == 56) && \
    ('9' == 57) && (':' == 58) && (';' == 59) && ('<' == 60) && ('=' == 61) && \
    ('>' == 62) && ('?' == 63) && ('A' == 65) && ('B' == 66) && ('C' == 67) && \
    ('D' == 68) && ('E' == 69) && ('F' == 70) && ('G' == 71) && ('H' == 72) && \
    ('I' == 73) && ('J' == 74) && ('K' == 75) && ('L' == 76) && ('M' == 77) && \
    ('N' == 78) && ('O' == 79) && ('P' == 80) && ('Q' == 81) && ('R' == 82) && \
    ('S' == 83) && ('T' == 84) && ('U' == 85) && ('V' == 86) && ('W' == 87) && \
    ('X' == 88) && ('Y' == 89) && ('Z' == 90) && ('[' == 91) &&                \
    ('\\' == 92) && (']' == 93) && ('^' == 94) && ('_' == 95) &&               \
    ('a' == 97) && ('b' == 98) && ('c' == 99) && ('d' == 100) &&               \
    ('e' == 101) && ('f' == 102) && ('g' == 103) && ('h' == 104) &&            \
    ('i' == 105) && ('j' == 106) && ('k' == 107) && ('l' == 108) &&            \
    ('m' == 109) && ('n' == 110) && ('o' == 111) && ('p' == 112) &&            \
    ('q' == 113) && ('r' == 114) && ('s' == 115) && ('t' == 116) &&            \
    ('u' == 117) && ('v' == 118) && ('w' == 119) && ('x' == 120) &&            \
    ('y' == 121) && ('z' == 122) && ('{' == 123) && ('|' == 124) &&            \
    ('}' == 125) && ('~' == 126))
/* The character set is not based on ISO-646.  */
#error "gperf generated tables don't work with this execution character set."
// If you see this error, please report a bug to <bug-gperf@gnu.org>.
#endif

struct PerfectKeywordHashTableEntry {
  const char* name;
  Token::Value value;
};
enum {
  TOTAL_KEYWORDS = 50,
  MIN_WORD_LENGTH = 2,
  MAX_WORD_LENGTH = 10,
  MIN_HASH_VALUE = 3,
  MAX_HASH_VALUE = 56
};

/* maximum key range = 54, duplicates = 0 */

class PerfectKeywordHash {
 private:
  static inline unsigned int Hash(const char* str, int len);

 public:
  static inline Token::Value GetToken(const char* str, int len);
};

inline unsigned int PerfectKeywordHash::Hash(const char* str, int len) {
  DCHECK_LT(str[1], 128);
  DCHECK_LT(str[0], 128);
  static const unsigned char asso_values[128] = {
      57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57,
      57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57,
      57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57,
      57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57,
      57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57,
      57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57,
      57, 14, 20, 13, 26, 14, 23, 5,  6,  1,  57, 57, 35, 44, 0,  20,
      5,  57, 15, 2,  5,  26, 19, 1,  29, 33, 57, 57, 57, 57, 57, 57};
  return len + asso_values[static_cast<unsigned char>(str[1])] +
         asso_values[static_cast<unsigned char>(str[0])];
}

static const unsigned char kPerfectKeywordLengthTable[64] = {
    0, 0, 0, 2, 0, 2, 4, 4, 0, 6, 9, 10, 5,  6, 0, 4, 5, 3, 4, 3, 5, 5,
    3, 3, 4, 5, 7, 7, 3, 9, 4, 4, 5, 5,  10, 6, 3, 6, 5, 5, 5, 8, 5, 4,
    6, 2, 6, 7, 8, 6, 7, 6, 3, 5, 0, 10, 7,  0, 0, 0, 0, 0, 0, 0};

static const struct PerfectKeywordHashTableEntry kPerfectKeywordHashTable[64] =
    {{"", Token::IDENTIFIER},
     {"", Token::IDENTIFIER},
     {"", Token::IDENTIFIER},
     {"in", Token::IN},
     {"", Token::IDENTIFIER},
     {"si", Token::IF},
     {"with", Token::WITH},
     {"sino", Token::ELSE},
     {"", Token::IDENTIFIER},
     {"switch", Token::SWITCH},
     {"interface", Token::FUTURE_STRICT_RESERVED_WORD},
     {"instanceof", Token::INSTANCEOF},
     {"while", Token::WHILE},
     {"static", Token::STATIC},
     {"", Token::IDENTIFIER},
     {"this", Token::THIS},
     {"throw", Token::THROW},
     {"new", Token::NEW},
     {"enum", Token::ENUM},
     {"set", Token::SET},
     {"await", Token::AWAIT},
     {"async", Token::ASYNC},
     {"get", Token::GET},
     {"try", Token::TRY},
     {"true", Token::TRUE_LITERAL},
     {"hacer", Token::DO},
     {"package", Token::FUTURE_STRICT_RESERVED_WORD},
     {"private", Token::FUTURE_STRICT_RESERVED_WORD},
     {"por", Token::FOR},
     {"protected", Token::FUTURE_STRICT_RESERVED_WORD},
     {"null", Token::NULL_LITERAL},
     {"case", Token::CASE},
     {"catch", Token::CATCH},
     {"super", Token::SUPER},
     {"finalmente", Token::FINALLY},
     {"return", Token::RETURN},
     {"var", Token::VAR},
     {"public", Token::FUTURE_STRICT_RESERVED_WORD},
     {"const", Token::CONST},
     {"yield", Token::YIELD},
     {"break", Token::BREAK},
     {"continue", Token::CONTINUE},
     {"false", Token::FALSE_LITERAL},
     {"void", Token::VOID},
     {"typeof", Token::TYPEOF},
     {"of", Token::OF},
     {"delete", Token::DELETE},
     {"default", Token::DEFAULT},
     {"debugger", Token::DEBUGGER},
     {"export", Token::EXPORT},
     {"extends", Token::EXTENDS},
     {"import", Token::IMPORT},
     {"let", Token::LET},
     {"class", Token::CLASS},
     {"", Token::IDENTIFIER},
     {"implements", Token::FUTURE_STRICT_RESERVED_WORD},
     {"funcion", Token::FUNCTION},
     {"", Token::IDENTIFIER},
     {"", Token::IDENTIFIER},
     {"", Token::IDENTIFIER},
     {"", Token::IDENTIFIER},
     {"", Token::IDENTIFIER},
     {"", Token::IDENTIFIER},
     {"", Token::IDENTIFIER}};

inline Token::Value PerfectKeywordHash::GetToken(const char* str, int len) {
  if (base::IsInRange(len, MIN_WORD_LENGTH, MAX_WORD_LENGTH)) {
    unsigned int key = Hash(str, len) & 0x3f;

    DCHECK_LT(key, arraysize(kPerfectKeywordLengthTable));
    DCHECK_LT(key, arraysize(kPerfectKeywordHashTable));
    if (len == kPerfectKeywordLengthTable[key]) {
      const char* s = kPerfectKeywordHashTable[key].name;

      while (*s != 0) {
        if (*s++ != *str++) return Token::IDENTIFIER;
      }
      return kPerfectKeywordHashTable[key].value;
    }
  }
  return Token::IDENTIFIER;
}

}  // namespace internal
}  // namespace v8

#endif  // V8_PARSING_KEYWORDS_GEN_H_
