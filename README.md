# V8-Speak JavaScript Engine

An augmentation of the V8 JS compiler to explore support for alternative JS vocabularies. 

We already internationalize and localize applications written with JavaScript. Why not do the same for the JavaScript language itself also?

## V8

V8 is Google's open source JavaScript engine.

V8 implements ECMAScript as specified in ECMA-262.

V8 is written in C++ and is used in Google Chrome, the open source
browser from Google.

V8 can run standalone, or can be embedded into any C++ application.

V8 Project page: https://v8.dev/docs

# Environment

## Configure project in Google dev tools

Checkout [depot tools](http://www.chromium.org/developers/how-tos/install-depot-tools), and run

```bash
fetch v8
```

This will checkout V8 into the directory `v8` and fetch all of its dependencies.
To stay up to date, run

```bash
git pull origin
gclient sync
```

For fetching all branches, add the following into your remote
configuration in `.git/config`:

```txt
fetch = +refs/branch-heads/*:refs/remotes/branch-heads/*
fetch = +refs/tags/*:refs/tags/*
```

## Adapt to v8-speak

The Google dev tools config steps will help handle external dependencies and compilation. Your filesystem now should contain the following `gclient` project metadata files:

- `.gclient` (list of local google repo clones, including `solutions[name=v8]`)
- `.glient_entries` (list of local project and sub dependency remote git urls)
- `.gclient_previous_sync_commits` (list of project and dependency git version urls)
- `v8/` (project dir)

1. Rename the project/clone directory to `v8-speak`.
```sh
mv v8 v8-speak
```
2. Change the name of the `v8` solution in `.gclient` to `v8-speak`.
3. Update all keys in `.gclient_entries` and `.gclient_previous_sync_commits` to match the directory name `v8-speak`. Leave the values, as we should only need to use `gclient` for compilation with dependencies external to **v8-speak**.
4. Enter the `v8-speak/` project folder and add a remote for **v8-speak**.
```sh
cd v8-speak
git remote add speak https://github.com/<gh-host-account>/v8-speak.git

# optionally rename remote for v8 to be more explicit, like "root" or "v8"
git remote rename origin v8
```

# Implementation notes

## Change src/parsing/token.h:TOKEN_LIST

Compiled to `x64.release/d8`, and renamed the executable as `d8-speak`.
This change alone seemed to have no effect; English keywords seem to still parse as before, and spanish ones are not recognized as keywords.

## Change src/parsing/keywords.txt

This file is the input to `gperf`, for generating a keyword-token hashing class in `src/parsing/keywords-gen.h` called `PerfectKeywordHash`.

After modifying `keywords.txt`, update the keyword hashing class with the below command.

```sh
python3 tools/gen-keywords-gen-h.py
```

Compilation after this change renders the shell interpreter unusable. Pretty much any expression results in the following error.

```txt
d8-stringify:2: SyntaxError: Unexpected token '{'
(function() {
            ^
SyntaxError: Unexpected token '{'


#
# Fatal error in v8::ToLocalChecked
# Empty MaybeLocal
#
```

I think the problem is that the custom stringify function, used to display intermediate results in the d8-speak shell, is written in _english_ JS, so it becomes incompatible with other dialects.

## Change `Shell::stringify_source_` d8 shell JS function

Replace the content of this JS function definition in `src/d8/d8-js.cc` to match the current dialect. After making this change, the modified **d8** shell works!

## Update return values of `typeof` (pending)

pending

## Define magic comment for JS dialect (pending)

In `src/inspector/search-util` there are methods for extracting magic comments using `v8_inspector::findMagicComment` with name prefix `find`. Create a new method to find JS dialect.

```cpp
String16 findSourceDialect(const String16& content, bool multiline) {
    return findMagicComment(content, "sourceDialect", multiline);
}
```

The `findSourceDialect` method must then be called somewhere near the invocation of the scanner on the source code, so that the scanner+parser can then select the corresponding versions of `Token` and `PerfectKeywordHash`.

The source dialect will be added as a member of `Script` at `src/objects/script`, where I confirmed other script-level attributes are stored that come from magic comments.

```cpp
// src/objects/script.tq
extern class Script extends Struct {
    // [source_dialect]: sourceDialect from magic comment
    // type = Tagged<PrimitiveHeapObject>
    source_dialect: String|Undefined;
}
```

## Define multiple dialects simultaneously when compiling v8-speak (pending)

The classes like `Token` and `PerfectKeywordHash` should be extended to support different dialects, instead of one instance of `src/parsing/keywords.txt` (and other similar sources) being selected at compile time.

## References

[v8.dev/blog - scanner optimization](https://v8.dev/blog/scanner).

[freecodecamp.org - v8 execution overview](https://www.freecodecamp.org/news/javascript-under-the-hood-v8/) with parser, interpreter, compiler.

[gnu.org/gperf - perfect hash function generator](https://www.gnu.org/software/gperf/manual/gperf.html#Description) used for assigning unique hash values to keyword tokens.

## Glossary

**AST** = Abstract Syntax Tree; the tree representation of a statement (nested expressions as subtrees, expressions being declarations, operations, etc).

<details>
<summary>
Free form notes for understanding the compiler structure and, hopefully, figure out where to start implementing JS dialects. A dialect is a version of JS grammar with keyword aliasing (alternative vocabulary), and (potentially, probably not) altered semantics.
</summary>

```cpp
// src/inspector/v8-debugger-agent-impl
// indicative of how script magic-comment attrs might be set
void V8DebuggerAgentImpl::didParseSource(
    unique_ptr<V8DebuggerScript> script, bool success
) {
    if (!success) {
        // two magic-comment debugger script attributes
        script->setSourceURL(findSourceURL(scriptSource, false));
        script->setSourceMappingURL(findSourceMapURL(scriptSource, false));
    }

    // etc
}

// src/d8/d8.cc
v8::Script::Compile(context, source) {
    // wrapper for ScriptCompiler::CompileModule(context->GetIsolate(), source)
}

// include/v8-script.h
?::Compile(context, source, options=null, no_cache_reason=null)

// src/api/api.cc
v8::ScriptCompiler::Compile(context, source, options, no_cache_reason) {
    // confirm not module (module requires CompileModule)
    // compile
    ScriptCompiler::CompileUnboundInternal(context->GetIsolate(), source, etc);
    // return result
}

// src/api/api.cc
v8::ScriptCompiler::CompileUnboundInternal(isolate, source, options, no_cache_reason) {
    auto str = Utils::OpenHandle(*(source->source_string));

    i::ScriptDetails script_details = ScriptCompiler::GetScriptDetails(isolate, source_members_etc);
    
    i::MaybeHandle<i::SharedFunctionInfo> maybe_function_info;
    if (options == kConsumeCodeCache) {
        // unknown
    }
    else if (options = kConsumeCompileHints) {
        // unknown
    }
    else {
        // compile without cache
        maybe_function_info = i::Compiler::GetSharedFunctionInfoForScript(isolate, str, etc);
    }

    // store result
    maybe_function_info.ToHandle(&result);

    // handle exception
    // return result
    return /* escaped */ ToApiHandle<UnboundScript>(result);
}

// src/codegen/compiler.h
// src/codegen/compiler.cc
i::Compiler::GetSharedFunctionInfoForScript(isolate, Handle<String> source, etc) {
    return Compiler::GetSharedFunctionInfoForScriptImpl(isolate, source, script_details, nulls, etc);
}

// src/codegen/compiler.cc
Compiler::GetSharedFunctionInfoForScriptImpl(isolate, source, script_details, nulls, etc) {
    ScriptCompileTimerScope compile_timer(isolate, etc);

    // handle compile options for consume-cache and consume-hints

    LanguageMode language_mode = v8_flags.use_strict;
    CompilationCache* compilation_cache = isolate->compilation_cache();

    MaybeHandle<SharedFunctionInfo> maybe_result;
    if (use_compilation_cache) {
        // unknown
    }
    if (maybe_result.is_null()) {
        // result not determined from cache
        if (CanBackgroundCompile(script_details, etc)) {
            // compile in background thread for --stress-background-compile opt
            maybe_result = CompileScriptOnBothBackgroundAndMainThread(source, etc);
        }
        else {
            UnoptimizedCompileFlags flags = UnoptimizedCompileFlags::ForToplevelCompile(isolate, etc);

            maybe_result = CompileScriptOnMainThread(flags, source, etc);
        }
    }

    return maybe_result;
}

// src/codegen/compiler.cc
Compiler::CompileScriptOnMainThread(flags, Handle<String> source, etc) {
    UnoptimizedCompileState compile_state;
    ReusableUnoptimizedCompileState reusable_state(isolate);
    ParseInfo parse_info(isolate, flags, &compile_state, &reusable_state);

    Handle<Script> script;
    if (!maybe_script.ToHandle(&script)) {
        script = NewScript(isolate, &parse_info, source, etc);
    }

    return Compiler::CompileTopLevel(&parse_info, script, isolate, is_compiled_scope);
}

// src/parsing/parse-info.h
// src/parsing/parse-info.cc
v8::internal::ParseInfo::ParseInfo {
    // unknown, seems to not handle compilation

    // includes CreateScript method, accepting isolate and source string
}
ParseInfo::CreateScript(isolate, source, etc) {
    Handle<Script> script = isolate->factory()->NewScriptWithId(source, id, event);
}

// src/execution/isolate.h
? Isolate {
    // some sort of wrapper for isolate instances
    v8::internal::Factory* factory() {
        return (v8::internal::Factory*)this;
    }
}

// src/codegen/compiler.cc
v8::internal::Compiler::CompileTopLevel(parse_info, Handle<Script> script, maybe_outer_scope_info, isolate, is_compiled_scope) {
    PostponeInterruptsScope postpone(isolate);

    VMState<BYTECODE_COMPILER> state(isolate);
    if (parse_info->literal() == nullptr && !parsing::ParseProgram(parse_info, script, etc)) {
        FailWithException(etc);
        return MaybeHandle<SharedFunctionInfo>();
    }
    
    // does this line do any compilation, or just save a measurement of it?
    // seems like only measurement, as Counters is defined in src/logging/
    NestedTimedHistogram* rate = isolate->counters()->compile();
    Handle<SharedFunctionInfo> shared_info = GetOrCreateTopLevelSharedFunctionInfo(etc);

    // compile outermost/root function
    FinalizeUnoptimizedScriptCompilation(isolate, script, etc);
    
    return shared_info;
}

// gap

// src/parsing/parsing.cc
bool v8::internal::parsing::ParseProgram(ParseInfo info, Handle<Script> script, etc, isolate, etc) {
    VMState<PARSER> state(isolate);

    // create char stream for parser

    Parser parser(isolate->main_thread_local_isolate(), info, script);

    parser.ParseProgram(isolate, script, info, maybe_outer_scope_info);

    return info->literal() != nullptr;
}

// src/parsing/parser.cc
v8::internal::Parser::Parser : ParserBase<Parser>(zone, &scanner_, etc, isolate, script, etc) {
    // ... seems like a class constructor, but I don't understand the syntax
    // I think the class structure is defined in parser.h, and this defines the body of each
    // member without showing their relationships to each other explicitly.
}

// gap

// src/parsing/parser.cc
v8::internal::Parser::DoParseProgram(Isolate* isolate, ParseInfo* info) {
    FunctionLiteral* result = nullptr;
    {
        Scope* outer = original_scope_;

        DeclarationScope* scope = outer->AsDeclarationScope();
        scope->set_start_position(0);

        FunctionState function_state(&function_state_, &scope_, scope);
        ScopedPtrList<Statement> body(pointer_buffer());

        if (flags().is_module()) {
            ParseGeneratorVariables();
            {
                StatementListT statements(pointer_buffer());
                ParseModuleItemList(&statements);
                statements.MergeInto(&body);
            }
            if (IsAsyncModule(scope->function_kind())) {
                impl()->RewriteAsyncFunctionBody(&body, block, etc);
            }
            // pending
        }
        else if (info->is_wrapped_as_function()) {
            ParseWrapped(isolate, info, &body, scope, zone());
        }
        else if (flags().is_repl_mode()) {
            ParseREPLProgram(info, &body, scope);
        }
        else {
            this->scope()->SetLanguageMode(info->language_mode());
            ParseStatementList(&body, Token::EOS);
        }

        if (is_strict(language_mode())) {
            CheckStrictOctalLiteral(beg_pos, end_position());
        }
        if (is_sloppy(language_mode())) {
            InsertSloppyBlockFunctionVarBindings(scope);
        }
        // is_eval pending

        if (flags().parse_restriction() == ONLY_SINGLE_FUNCTION_LITERAL) {
            if (/* multiple function literals */) {
                ReportMessage(MessageTemplate::kSingleFunctionLiteral);
            }
        }

        result = factory()->NewScriptOrEvalFunctionLiteral(scope, body, etc, parameter_count=0);
    }

    info->set_max_function_literal_id(GetLastFunctionLiteralId());

    return result;
}

// src/parsing/parser.cc
v8::internal::Parser::ParseREPLProgram(info, body, scope) {
    // similar to parsing body of async function, but the value resolving promise as result
    // is the completion value of the script
    this->scope()->SetLanguageMode(info->language_mode());
    PrepareGeneratorVariables();

    BlockT block = impl()->NullBlock();
    {
        StatementListT statements(pointer_buffer());
        // TODO follow ParseStatementList
        ParseStatementList(&statements, Token::EOS);
        block = factory()->NewBlock(true, statements);
    }

    // pending
}

ParserBase<Impl>::ParseStatementList(StatementListT* body, Token::Value end_token) {
    Scanner::Location token_loc = scanner()->peek_location();
}

// gap

//src/parsing/token.h
#define TOKEN_LIST(T, K)
    // long list of tokens in format:
    T(TOKEN_NAME, "<token-string>", precedence)
    // or format:
    K(TOKEN_NAME, "<token-string>", precedence)
    // T seems to be used for non-text symbols/operators
    // and K for text keywords. I think K entries are the only ones
    // compatible with PerfectKeywordHash

//src/parsing/token.h
class v8::internal::Token {
    enum Value : uint8_t {
        TOKEN_LIST(T, T) NUM_TOKENS
    };

}

// src/parsing/scanner.h
struct v8::internal::scanner::TokenDesc {
    Location location;
    LiteralBuffer literal_chars;
    v8::internal::Token::Value token = Token::UNINITIALIZED;
    bool after_line_terminator = false;
}

// src/parsing/keywords.txt
// gperf perfect-hash-generator input file used by gen-keywords-gen-h.py

// gap

// tools/gen-keywords-gen.h.py
// generates the keword-token hash function definition (kewords-gen.h) using gperf

// src/parsing/keywords-gen.h
// defines keyword-token hash function

// gap

// src/d8/d8-js.cc
const char* v8::Shell::stringify_source_ = R"D8(
    (function() {
        "use strict";
        // etc
    })()
)
```
</details>
