// Copyright 2026 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load('test/mjsunit/speak/dialect-case.js');

assertTemplateResultsForDialects([
  {
    expected: 6,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} sum() {
  ${_var} total = 0;
  ${_for} (${_const} valor ${_of} [1, 2, 3]) {
    total = total + valor;
  }
  ${_return} total;
}
sum();
`,
  },
  {
    expected: 5,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} funName() {
  ${_const} ${_of} = 5;
  ${_return} ${_of};
}
funName();
`,
  },
  {
    expected: 1,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} Target() {
  ${_this}.value = ${_new}.${_target} === undefined ? 0 : 1;
}
(${_new} Target()).value;
`,
  },
  {
    expected: 3,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} funProp() {
  ${_const} caja = {${_target}: 3};
  ${_return} caja.${_target};
}
funProp();
`,
  },
  {
    expected: 7,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} protoDialect() {
  ${_const} proto = {valor: 7};
  ${_const} objeto = {${_proto}: proto};
  ${_return} Object.getPrototypeOf(objeto).valor;
}
protoDialect();
`,
  },
  {
    expected: 4,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} protoProp() {
  ${_const} objeto = {valor: 4};
  objeto.${_proto} = 9;
  ${_return} Object.getPrototypeOf(objeto) === Object.prototype ? 4 : 0;
}
protoProp();
`,
  },
  {
    expected: 9,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} evalDirect() {
  ${_var} x = 1;
  ${_eval}('x = 9;');
  ${_return} x;
}
evalDirect();
`,
  },
  {
    expected: 5,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_class} Counter {
  ${_constructor_name}(value) {
    ${_this}.value = value;
  }
  readValue() {
    ${_return} ${_this}.value;
  }
}
${_new} Counter(5).readValue();
`,
  },
  {
    expected: 8,
    dialects: ['js-eng', 'js-spa'],
    template: `
${_const} bag = {
  ${_constructor_name}: 8,
};
bag.${_constructor_name};
`,
  },
]);

assertTemplateSyntaxErrorsForDialects([
  {
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} argStrict(${_arguments}) {
  "use strict";
  ${_return} ${_arguments};
}
`,
  },
  {
    dialects: ['js-eng', 'js-spa'],
    template: `
${_function} evalStrict(${_eval}) {
  "use strict";
  ${_return} ${_eval};
}
`,
  },
  {
    dialects: ['js-eng', 'js-spa'],
    template: `
${_class} InvalidConstructorField {
  ${_constructor_name} = 1;
}
`,
  },
  {
    dialects: ['js-eng', 'js-spa'],
    template: `
${_class} DuplicateConstructors {
  ${_constructor_name}() {}
  ${_constructor_name}() {}
}
`,
  },
]);
