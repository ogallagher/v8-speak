// Copyright 2026 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load('test/mjsunit/speak/dialect-case.js');

assertTemplateResultsForDialects([
  {
    expected: 3,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} dialectValue() { ${_return} 3; }
dialectValue();
`,
  },
  {
    expected: 11,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} branchValue() {
  ${_if} (${_true}) {
    ${_return} 11;
  } ${_else} {
    ${_return} 0;
  }
}
branchValue();
`,
  },
]);

assertDialectSyntaxError('js-spa', `
function broken() { return 7; }
broken();
`);

assertDialectSyntaxError('js-spa', `
function broken() { devuelve 7; }
broken();
`);

assertDialectSyntaxError('js-spa', `
funcion broken() { if (true) { devuelve 7; } else { devuelve 0; } }
broken();
`);

assertDialectSyntaxError('js-unknown', `
0;
`);
