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
