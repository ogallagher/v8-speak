// Copyright 2026 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const kDialectKeywordFiles = Object.freeze({
  'js-eng': 'src/parsing/keywords/keywords-eng.txt',
  'js-spa': 'src/parsing/keywords/keywords-spa.txt',
});

const kTemplateKeywordTokens = Object.freeze({
  ELSE: 'Token::ELSE',
  FALSE: 'Token::FALSE_LITERAL',
  FUNCTION: 'Token::FUNCTION',
  IF: 'Token::IF',
  NULL: 'Token::NULL_LITERAL',
  RETURN: 'Token::RETURN',
  THROW: 'Token::THROW',
  TRUE: 'Token::TRUE_LITERAL',
  TRY: 'Token::TRY',
  VAR: 'Token::VAR',
  WHILE: 'Token::WHILE',
});

function loadDialectKeywordEntries(dialect) {
  const keywordFile = kDialectKeywordFiles[dialect];
  assertTrue(keywordFile !== undefined, `Unknown test dialect: ${dialect}`);

  const entries = [];
  for (const line of read(keywordFile).split('\n')) {
    const match = line.trim().match(/^([a-z]+),\s*(Token::[A-Z_]+)$/);
    if (match === null) continue;
    entries.push(Object.freeze({keyword: match[1], token: match[2]}));
  }
  return Object.freeze(entries);
}

const kDialectKeywordEntries = Object.freeze(
    Object.fromEntries(
        Object.keys(kDialectKeywordFiles)
            .map((dialect) => [dialect, loadDialectKeywordEntries(dialect)])));

function keywordForToken(dialect, token) {
  const tokenName = token.startsWith('Token::') ? token : `Token::${token}`;
  const entry =
      kDialectKeywordEntries[dialect].find((candidate) => candidate.token === tokenName);
  assertTrue(entry !== undefined, `Missing ${tokenName} for ${dialect}`);
  return entry.keyword;
}

function keywordCount(dialect) {
  return kDialectKeywordEntries[dialect].length;
}

function renderDialectKeywordProperties(dialect) {
  return kDialectKeywordEntries[dialect]
      .map(({keyword}, index) => `    ${keyword}: ${index},`)
      .join('\n');
}

function loadDialectKeywordSet(dialect) {
  const wantedTokens = new Set(Object.values(kTemplateKeywordTokens));
  const keywords = {};
  for (const {keyword, token} of kDialectKeywordEntries[dialect]) {
    if (!wantedTokens.has(token)) continue;
    keywords[token] = keyword;
  }

  const renderedKeywords = {};
  for (const [placeholder, token] of Object.entries(kTemplateKeywordTokens)) {
    assertTrue(
        keywords[token] !== undefined,
        `Missing ${token} in ${keywordFile} for ${dialect}`);
    renderedKeywords[placeholder] = keywords[token];
  }
  return Object.freeze(renderedKeywords);
}

const kDialectKeywordSets = Object.freeze(
    Object.fromEntries(
        Object.keys(kDialectKeywordFiles)
            .map((dialect) => [dialect, loadDialectKeywordSet(dialect)])));

const kSpeakDialects = Object.freeze(Object.keys(kDialectKeywordFiles));

const _else = '__ELSE__';
const _false = '__FALSE__';
const _function = '__FUNCTION__';
const _if = '__IF__';
const _null = '__NULL__';
const _return = '__RETURN__';
const _throw = '__THROW__';
const _true = '__TRUE__';
const _try = '__TRY__';
const _var = '__VAR__';
const _while = '__WHILE__';

function evalWithDialect(dialect, source) {
  return eval(`\n//# sourceDialect=${dialect}\n${source}`);
}

function renderDialectSource(dialect, template) {
  const keywords = kDialectKeywordSets[dialect];
  assertTrue(keywords !== undefined, `Unknown test dialect: ${dialect}`);
  return template.replaceAll(
      /__([A-Z_]+)__/g, (match, placeholder) => keywords[placeholder] ?? match);
}

function assertDialectResult(expected, dialect, source) {
  assertEquals(expected, evalWithDialect(dialect, source));
}

function assertDialectTemplateResult(expected, dialect, template) {
  assertDialectResult(expected, dialect, renderDialectSource(dialect, template));
}

function assertDialectSyntaxError(dialect, source) {
  assertThrows(
      `eval('\\n//# sourceDialect=${dialect}\\n${
          source.replaceAll("\\", "\\\\").replaceAll("'", "\\'")
                .replaceAll("\n", "\\n")}')`,
      SyntaxError);
}

function assertDialectTemplateSyntaxError(dialect, template) {
  assertDialectSyntaxError(dialect, renderDialectSource(dialect, template));
}

function assertDialectResults(cases) {
  for (const testCase of cases) {
    assertDialectResult(testCase.expected, testCase.dialect, testCase.source);
  }
}

function assertDialectSyntaxErrors(cases) {
  for (const testCase of cases) {
    assertDialectSyntaxError(testCase.dialect, testCase.source);
  }
}

function assertTemplateResultsForDialects(cases, defaultDialects = kSpeakDialects) {
  for (const testCase of cases) {
    const dialects = testCase.dialects ?? defaultDialects;
    for (const dialect of dialects) {
      assertDialectTemplateResult(testCase.expected, dialect, testCase.template);
    }
  }
}

function assertTemplateSyntaxErrorsForDialects(
    cases, defaultDialects = kSpeakDialects) {
  for (const testCase of cases) {
    const dialects = testCase.dialects ?? defaultDialects;
    for (const dialect of dialects) {
      assertDialectTemplateSyntaxError(dialect, testCase.template);
    }
  }
}
