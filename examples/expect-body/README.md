# expect-body

A basic example of how to test the returned body is as expected.

This directory contains Oak server code in `server.ts`, which will run a basic server on localhost port 3000, and a test file `server.test.ts` which uses SuperOak to test that the server's response body matches what is expected.

## How to run this example

To run this example's SuperOak tests:

```bash
# If the repo is cloned locally:
deno test --allow-net ./examples/expect-body/server.test.ts

# Or remotely:
deno test --allow-net https://raw.githubusercontent.com/asos-craigmorten/superoak/main/examples/expect-body/server.test.ts
```

You should then see something like this in the console:

```console
$ deno test --allow-net ./examples/expect-body/server.test.ts
running 1 tests
test it should support the Oak framework ... Listening at http://localhost:2940
ok (20ms)

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out (21ms)
```

---

If you just want to run the server:

```bash
# If the repo is cloned locally:
deno run --allow-net ./examples/expect-body/server.ts

# Or remotely:
deno run --allow-net https://raw.githubusercontent.com/asos-craigmorten/superoak/main/examples/expect-body/server.ts
```
