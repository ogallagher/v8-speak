// Copyright 2026 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const kDialectKeywordFiles = Object.freeze({
  'js-eng': 'src/parsing/keywords/keywords-eng.txt',
  'js-spa': 'src/parsing/keywords/keywords-spa.txt',
});

const kDialectPseudoKeywordFiles = Object.freeze({
  'js-eng': 'src/parsing/pseudokeywords/pseudokeywords-eng.txt',
  'js-spa': 'src/parsing/pseudokeywords/pseudokeywords-spa.txt',
});

const kTemplateKeywordSpecs = Object.freeze({
  ASYNC: Object.freeze({token: 'Token::ASYNC'}),
  AWAIT: Object.freeze({token: 'Token::AWAIT'}),
  BREAK: Object.freeze({token: 'Token::BREAK'}),
  CASE: Object.freeze({token: 'Token::CASE'}),
  CATCH: Object.freeze({token: 'Token::CATCH'}),
  CLASS: Object.freeze({token: 'Token::CLASS'}),
  CONST: Object.freeze({token: 'Token::CONST'}),
  CONTINUE: Object.freeze({token: 'Token::CONTINUE'}),
  DEBUGGER: Object.freeze({token: 'Token::DEBUGGER'}),
  DEFAULT: Object.freeze({token: 'Token::DEFAULT'}),
  DELETE: Object.freeze({token: 'Token::DELETE'}),
  DO: Object.freeze({token: 'Token::DO'}),
  ELSE: Object.freeze({token: 'Token::ELSE'}),
  ENUM: Object.freeze({token: 'Token::ENUM'}),
  EXPORT: Object.freeze({token: 'Token::EXPORT'}),
  EXTENDS: Object.freeze({token: 'Token::EXTENDS'}),
  FALSE: Object.freeze({token: 'Token::FALSE_LITERAL'}),
  FINALLY: Object.freeze({token: 'Token::FINALLY'}),
  FOR: Object.freeze({token: 'Token::FOR'}),
  FUNCTION: Object.freeze({token: 'Token::FUNCTION'}),
  GET: Object.freeze({token: 'Token::GET'}),
  IF: Object.freeze({token: 'Token::IF'}),
  IMPLEMENTS: Object.freeze({keyword: 'implements'}),
  IMPORT: Object.freeze({token: 'Token::IMPORT'}),
  IN: Object.freeze({token: 'Token::IN'}),
  INSTANCEOF: Object.freeze({token: 'Token::INSTANCEOF'}),
  INTERFACE: Object.freeze({keyword: 'interface'}),
  LET: Object.freeze({token: 'Token::LET'}),
  NEW: Object.freeze({token: 'Token::NEW'}),
  NULL: Object.freeze({token: 'Token::NULL_LITERAL'}),
  PACKAGE: Object.freeze({keyword: 'package'}),
  PRIVATE: Object.freeze({keyword: 'private'}),
  PROTECTED: Object.freeze({keyword: 'protected'}),
  PUBLIC: Object.freeze({keyword: 'public'}),
  RETURN: Object.freeze({token: 'Token::RETURN'}),
  SET: Object.freeze({token: 'Token::SET'}),
  STATIC: Object.freeze({token: 'Token::STATIC'}),
  SUPER: Object.freeze({token: 'Token::SUPER'}),
  SWITCH: Object.freeze({token: 'Token::SWITCH'}),
  THIS: Object.freeze({token: 'Token::THIS'}),
  THROW: Object.freeze({token: 'Token::THROW'}),
  TRUE: Object.freeze({token: 'Token::TRUE_LITERAL'}),
  TRY: Object.freeze({token: 'Token::TRY'}),
  TYPEOF: Object.freeze({token: 'Token::TYPEOF'}),
  VAR: Object.freeze({token: 'Token::VAR'}),
  VOID: Object.freeze({token: 'Token::VOID'}),
  WHILE: Object.freeze({token: 'Token::WHILE'}),
  WITH: Object.freeze({token: 'Token::WITH'}),
  YIELD: Object.freeze({token: 'Token::YIELD'}),
});

const kTemplatePseudoKeywordSpecs = Object.freeze({
  ARGUMENTS: Object.freeze({name: 'PseudoKeywordName::kArguments'}),
  AS: Object.freeze({name: 'PseudoKeywordName::kAs'}),
  CONSTRUCTOR: Object.freeze({name: 'PseudoKeywordName::kConstructor'}),
  EVAL: Object.freeze({name: 'PseudoKeywordName::kEval'}),
  FROM: Object.freeze({name: 'PseudoKeywordName::kFrom'}),
  META: Object.freeze({name: 'PseudoKeywordName::kMeta'}),
  OF: Object.freeze({name: 'PseudoKeywordName::kOf'}),
  PROTO: Object.freeze({name: 'PseudoKeywordName::kProto'}),
  TARGET: Object.freeze({name: 'PseudoKeywordName::kTarget'}),
});

function loadDialectEntries(dialect, fileMap, valuePattern) {
  const inputFile = fileMap[dialect];
  assertTrue(inputFile !== undefined, `Unknown test dialect: ${dialect}`);
  const entries = [];
  for (const line of read(inputFile).split('\n')) {
    const match = line.trim().match(
        new RegExp(`^([^,\\s]+),\\s*(${valuePattern})$`));
    if (match === null) continue;
    entries.push(Object.freeze({spelling: match[1], value: match[2]}));
  }
  return Object.freeze(entries);
}

const kDialectKeywordEntries = Object.freeze(
    Object.fromEntries(
        Object.keys(kDialectKeywordFiles)
            .map((dialect) => [dialect,
                               loadDialectEntries(
                                   dialect, kDialectKeywordFiles,
                                   'Token::[A-Z_]+')])));

const kDialectPseudoKeywordEntries = Object.freeze(
    Object.fromEntries(
        Object.keys(kDialectPseudoKeywordFiles)
            .map((dialect) => [dialect,
                               loadDialectEntries(
                                   dialect, kDialectPseudoKeywordFiles,
                                   'PseudoKeywordName::k[A-Za-z]+')])));

function keywordForToken(dialect, token) {
  const tokenName = token.startsWith('Token::') ? token : `Token::${token}`;
  const entry =
      kDialectKeywordEntries[dialect].find((candidate) => candidate.value === tokenName);
  assertTrue(entry !== undefined, `Missing ${tokenName} for ${dialect}`);
  return entry.spelling;
}

function keywordForExactSpelling(dialect, spelling) {
  const entry = kDialectKeywordEntries[dialect]
                    .find((candidate) => candidate.spelling === spelling);
  assertTrue(entry !== undefined, `Missing keyword ${spelling} for ${dialect}`);
  return entry.spelling;
}

function pseudoKeywordForName(dialect, name) {
  const entry =
      kDialectPseudoKeywordEntries[dialect].find((candidate) => candidate.value === name);
  assertTrue(entry !== undefined, `Missing pseudokeyword ${name} for ${dialect}`);
  return entry.spelling;
}

function keywordCount(dialect) {
  return kDialectKeywordEntries[dialect].length;
}

function renderDialectKeywordProperties(dialect) {
  return kDialectKeywordEntries[dialect]
      .map(({spelling}, index) => `    ${spelling}: ${index},`)
      .join('\n');
}

function resolveTemplateKeyword(dialect, placeholder) {
  const spec = kTemplateKeywordSpecs[placeholder];
  assertTrue(spec !== undefined, `Unknown template placeholder ${placeholder}`);
  if (spec.keyword !== undefined) {
    return keywordForExactSpelling(dialect, spec.keyword);
  }
  assertTrue(spec.token !== undefined, `Missing keyword spec for ${placeholder}`);
  return keywordForToken(dialect, spec.token);
}

function resolveTemplatePseudoKeyword(dialect, placeholder) {
  const spec = kTemplatePseudoKeywordSpecs[placeholder];
  assertTrue(spec !== undefined, `Unknown pseudokeyword placeholder ${placeholder}`);
  assertTrue(spec.name !== undefined,
             `Missing pseudokeyword spec for ${placeholder}`);
  return pseudoKeywordForName(dialect, spec.name);
}

const kSpeakDialects = Object.freeze(Object.keys(kDialectKeywordFiles));

const _async = '__ASYNC__';
const _await = '__AWAIT__';
const _break = '__BREAK__';
const _case = '__CASE__';
const _catch = '__CATCH__';
const _class = '__CLASS__';
const _const = '__CONST__';
const _continue = '__CONTINUE__';
const _debugger = '__DEBUGGER__';
const _default = '__DEFAULT__';
const _delete = '__DELETE__';
const _do = '__DO__';
const _else = '__ELSE__';
const _enum = '__ENUM__';
const _export = '__EXPORT__';
const _extends = '__EXTENDS__';
const _false = '__FALSE__';
const _finally = '__FINALLY__';
const _for = '__FOR__';
const _function = '__FUNCTION__';
const _get = '__GET__';
const _if = '__IF__';
const _implements = '__IMPLEMENTS__';
const _import = '__IMPORT__';
const _in = '__IN__';
const _instanceof = '__INSTANCEOF__';
const _interface = '__INTERFACE__';
const _let = '__LET__';
const _new = '__NEW__';
const _null = '__NULL__';
const _package = '__PACKAGE__';
const _private = '__PRIVATE__';
const _protected = '__PROTECTED__';
const _public = '__PUBLIC__';
const _return = '__RETURN__';
const _set = '__SET__';
const _static = '__STATIC__';
const _super = '__SUPER__';
const _switch = '__SWITCH__';
const _this = '__THIS__';
const _throw = '__THROW__';
const _true = '__TRUE__';
const _try = '__TRY__';
const _typeof = '__TYPEOF__';
const _var = '__VAR__';
const _void = '__VOID__';
const _while = '__WHILE__';
const _with = '__WITH__';
const _yield = '__YIELD__';
const _arguments = '__ARGUMENTS__';
const _as_name = '__AS__';
const _constructor_name = '__CONSTRUCTOR__';
const _eval = '__EVAL__';
const _from = '__FROM__';
const _meta = '__META__';
const _of = '__OF__';
const _proto = '__PROTO__';
const _target = '__TARGET__';

function evalWithDialect(dialect, source) {
  return eval(`\n//# sourceDialect=${dialect}\n${source}`);
}

function renderDialectSource(dialect, template) {
  assertTrue(kDialectKeywordFiles[dialect] !== undefined,
             `Unknown test dialect: ${dialect}`);
  return template.replaceAll(
      /__([A-Z_]+)__/g,
      (match, placeholder) => {
        if (kTemplateKeywordSpecs[placeholder] !== undefined) {
          return resolveTemplateKeyword(dialect, placeholder);
        }
        return resolveTemplatePseudoKeyword(dialect, placeholder);
      });
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
