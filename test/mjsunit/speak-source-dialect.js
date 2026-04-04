// Copyright 2026 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

assertEquals(3, eval(`
//# sourceDialect=js-eng
function english() { return 3; }
english();
`));

assertEquals(7, eval(`
//# sourceDialect=js-spa
funcion espanol() { devuelve 7; }
espanol();
`));

assertEquals(11, eval(`
//# sourceDialect=js-spa
funcion rama() { si (true) { devuelve 11; } sino { devuelve 0; } }
rama();
`));

assertThrows(
    "eval('\\n//# sourceDialect=js-spa\\nfunction broken() { return 7; }\\nbroken();')",
    SyntaxError);

assertThrows(
    "eval('\\n//# sourceDialect=js-spa\\nfunction broken() { devuelve 7; }\\nbroken();')",
    SyntaxError);

assertThrows(
    "eval('\\n//# sourceDialect=js-spa\\nfuncion broken() { if (true) { devuelve 7; } else { devuelve 0; } }\\nbroken();')",
    SyntaxError);

assertThrows(
    "eval('\\n//# sourceDialect=js-unknown\\n0;')",
    SyntaxError);
