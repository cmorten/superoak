# repeated-assertions

A example of how to repeated assertions on the same Oak Application object.

This directory contains Oak server code in `server.ts`, which will run a basic server on localhost port 3000, and a test file `server.test.ts` which uses SuperOak to test that the server's response body and status code matches what is expected.

## How to run this example

To run this example's SuperOak tests:

```bash
# If the repo is cloned locally:
deno test --allow-net ./examples/repeated-assertions/server.test.ts

# Or remotely:
deno test --allow-net https://raw.githubusercontent.com/asos-craigmorten/superoak/main/examples/repeated-assertions/server.test.ts
```

You should then see something like this in the console:

```console
$ deno test --allow-net ./examples/repeated-assertions/server.test.ts
running 2 tests
test it will allow your to make multiple assertions on one SuperOak instance ... ok (16ms)
test it will allow your to re-use the Application for another SuperOak instance ... ok (7ms)

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out (23ms)
```

---

If you just want to run the server:

```bash
# If the repo is cloned locally:
deno run --allow-net ./examples/repeated-assertions/server.ts

# Or remotely:
deno run --allow-net https://raw.githubusercontent.com/asos-craigmorten/superoak/main/examples/repeated-assertions/server.ts
```
