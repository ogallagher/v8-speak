// Copyright 2026 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load('test/mjsunit/speak/dialect-case.js');

function allKeywordsAsPropertiesSource(dialect) {
  const kw = (token) => keywordForToken(dialect, token);
  return `
${kw('FUNCTION')} keywordBagSize() {
  ${kw('CONST')} keywordBag = {
${renderDialectKeywordProperties(dialect)}
  };
  ${kw('RETURN')} Object.keys(keywordBag).length;
}
keywordBagSize();
`;
}

function syntaxSweepSource(dialect) {
  const kw = (token) => keywordForToken(dialect, token);
  return `
${kw('FUNCTION')} syntaxSweep() {
  ${kw('ASYNC')} ${kw('FUNCTION')} asyncValue() {
    ${kw('AWAIT')} 0;
    ${kw('RETURN')} 5;
  }
  ${kw('FUNCTION')}* yieldedValue() {
    ${kw('YIELD')} 3;
  }
  ${kw('CLASS')} Base {
    constructor() { ${kw('THIS')}.base = 4; }
    value() { ${kw('RETURN')} ${kw('THIS')}.base; }
  }
  ${kw('CLASS')} Derived ${kw('EXTENDS')} Base {
    ${kw('STATIC')} make() { ${kw('RETURN')} ${kw('NEW')} Derived(); }
    constructor() { ${kw('SUPER')}(); ${kw('THIS')}.extra = 2; }
    ${kw('GET')} total() { ${kw('RETURN')} ${kw('THIS')}.base + ${kw('THIS')}.extra; }
    ${kw('SET')} total(value) { ${kw('THIS')}.extra = value - ${kw('THIS')}.base; }
  }
  ${kw('VAR')} loopSum = 0;
  ${kw('DO')} {
    loopSum = loopSum + 1;
    ${kw('IF')} (loopSum < 2) ${kw('CONTINUE')};
  } ${kw('WHILE')} (${kw('FALSE_LITERAL')});
  ${kw('FOR')} (${kw('VAR')} i = 0; i < 3; i++) {
    ${kw('IF')} (i === 2) ${kw('BREAK')};
    loopSum = loopSum + i;
  }
  ${kw('CONST')} derived = Derived.make();
  ${kw('LET')} caught = 0;
  ${kw('TRY')} {
    ${kw('THROW')} yieldedValue().next().value;
  } ${kw('CATCH')} (error) {
    caught = error;
  } ${kw('FINALLY')} {
    ${kw('DEBUGGER')};
  }
  ${kw('CONST')} control = (() => {
    ${kw('SWITCH')} (derived.total) {
      ${kw('CASE')} 6:
        ${kw('RETURN')} 1;
      ${kw('DEFAULT')}:
        ${kw('RETURN')} 0;
    }
  })();
  ${kw('CONST')} withResult = (() => {
    ${kw('WITH')} ({value: 7}) {
      ${kw('RETURN')} value;
    }
  })();
  ${kw('CONST')} booleans = ${kw('TRUE_LITERAL')} && !${kw('FALSE_LITERAL')};
  ${kw('CONST')} inResult = 'value' ${kw('IN')} {value: 1} ? 1 : 0;
  ${kw('CONST')} instanceResult = derived ${kw('INSTANCEOF')} Base ? 1 : 0;
  ${kw('CONST')} deleted = {value: 1};
  ${kw('CONST')} deleteResult = ${kw('DELETE')} deleted.value;
  ${kw('CONST')} typeResult = ${kw('TYPEOF')} ${kw('NULL_LITERAL')};
  ${kw('CONST')} voidResult = ${kw('VOID')} 0;
  ${kw('RETURN')} loopSum + caught + control + withResult + inResult +
      instanceResult + (deleteResult ? 1 : 0) + (booleans ? 1 : 0) +
      (typeResult === 'object' ? 1 : 0) + (voidResult === undefined ? 1 : 0);
}
syntaxSweep();
`;
}

for (const dialect of kSpeakDialects) {
  assertDialectResult(keywordCount(dialect), dialect,
                      allKeywordsAsPropertiesSource(dialect));
  assertDialectResult(19, dialect, syntaxSweepSource(dialect));
}

assertTemplateResultsForDialects([
  {
    expected: 3,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} countToThree() {
  ${_var} total = 0;
  ${_while} (total < 3) {
    total = total + 1;
  }
  ${_return} total;
}
countToThree();
`,
  },
  {
    expected: 1,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} truthyBranch() {
  ${_if} (${_true}) {
    ${_return} 1;
  } ${_else} {
    ${_return} 0;
  }
}
truthyBranch();
`,
  },
  {
    expected: 4,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} falseLiteralBranch() {
  ${_var} value = ${_false};
  ${_if} (value) {
    ${_return} 0;
  } ${_else} {
    ${_return} 4;
  }
}
falseLiteralBranch();
`,
  },
  {
    expected: 'object',
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} nullType() {
  ${_var} value = ${_null};
  ${_return} typeof value;
}
nullType();
`,
  },
  {
    expected: 9,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} caughtThrow() {
  ${_try} {
    ${_throw} 9;
  } catch (value) {
    ${_return} value;
  }
}
caughtThrow();
`,
  },
]);

assertDialectSyntaxErrors([
  {
    dialect: 'js-spa',
    source: `
funcion broken() {
  while (true) {
    devuelve 1;
  }
}
broken();
`,
  },
  {
    dialect: 'js-spa',
    source: `
function broken() {
  mientras (true) {
    return 1;
  }
}
broken();
`,
  },
]);

assertTemplateSyntaxErrorsForDialects([
  {
    dialects: ['js-spa'],
    template: `
function mismatchedKeywordSet() {
  ${_while} (true) {
    return 1;
  }
}
mismatchedKeywordSet();
`,
  },
  {
    dialects: ['js-eng'],
    template: `
funcion mismatchedKeywordSet() {
  ${_while} (true) {
    devuelve 1;
  }
}
mismatchedKeywordSet();
`,
  },
]);
