<p align="center">
  <a href="https://www.linkedin.com/in/hannah-morten-b1218017a/"><img height="200" style="height: 200px;" src="https://github.com/asos-craigmorten/superoak/raw/main/.github/icon.png" alt="Super Oak standing in the rain at night – stoically facing the dark battle that is software engineering"></a>
  <h1 align="center">SuperOak</h1>
</p>
<p align="center">
  HTTP assertions for Deno's Oak web framework made easy via <a href="https://github.com/asos-craigmorten/superdeno">SuperDeno</a>.
</p>
<p align="center">
   <a href="https://github.com/asos-craigmorten/superoak/tags/"><img src="https://img.shields.io/github/tag/asos-craigmorten/superoak" alt="Current version" /></a>
   <img src="https://github.com/asos-craigmorten/superoak/workflows/Test/badge.svg" alt="Current test status" />
   <a href="https://doc.deno.land/https/deno.land/x/superoak/mod.ts"><img src="https://doc.deno.land/badge.svg" alt="SuperOak docs" /></a>
   <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs are welcome" /></a>
   <a href="https://github.com/asos-craigmorten/superoak/issues/"><img src="https://img.shields.io/github/issues/asos-craigmorten/superoak" alt="SuperOak issues" /></a>
   <img src="https://img.shields.io/github/stars/asos-craigmorten/superoak" alt="SuperOak stars" />
   <img src="https://img.shields.io/github/forks/asos-craigmorten/superoak" alt="SuperOak forks" />
   <img src="https://img.shields.io/github/license/asos-craigmorten/superoak" alt="SuperOak license" />
   <a href="https://GitHub.com/asos-craigmorten/superoak/graphs/commit-activity"><img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="SuperOak is maintained" /></a>
</p>
<p align="center">
   <a href="https://deno.land/x/superoak"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Flatest-version%2Fx%2Fsuperoak%2Fmod.ts" alt="SuperOak latest /x/ version" /></a>
   <a href="https://github.com/denoland/deno/blob/main/Releases.md"><img src="https://img.shields.io/badge/deno-^1.11.2-brightgreen?logo=deno" alt="Minimum supported Deno version" /></a>
   <a href="https://deno-visualizer.danopia.net/dependencies-of/https/deno.land/x/superoak/mod.ts"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fdep-count%2Fx%2Fsuperoak%2Fmod.ts" alt="SuperOak dependency count" /></a>
   <a href="https://deno-visualizer.danopia.net/dependencies-of/https/deno.land/x/superoak/mod.ts"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fupdates%2Fx%2Fsuperoak%2Fmod.ts" alt="SuperOak dependency outdatedness" /></a>
   <a href="https://deno-visualizer.danopia.net/dependencies-of/https/deno.land/x/superoak/mod.ts"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fcache-size%2Fx%2Fsuperoak%2Fmod.ts" alt="SuperOak cached size" /></a>
</p>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [About](#about)
- [Installation](#installation)
- [Example](#example)
- [Documentation](#documentation)
- [API](#api)
- [FAQs](#faqs)
  - [`Property 'get' does not exist on type 'Promise<SuperDeno>'`
    error](#property-get-does-not-exist-on-type-promisesuperdeno-error)
  - [`Request has been terminated` error](#request-has-been-terminated-error)
- [Contributing](#contributing)
- [License](#license)

## About

This module aims to provide a high-level abstraction for testing HTTP in Deno's
Oak web framework. This is a wrapper compatibility layer around
[SuperDeno](https://github.com/asos-craigmorten/superdeno) to reduce some of the
boilerplate needed to setup Oak integration + functional tests.

## Installation

This is a [Deno](https://deno.land/) module available to import direct from this
repo and via the [Deno Registry](https://deno.land/x).

Before importing, [download and install Deno](https://deno.land/#installation).

You can then import SuperOak straight into your project:

```ts
import { superoak } from "https://deno.land/x/superoak@4.3.0/mod.ts";
```

SuperOak is also available on [nest.land](https://nest.land/package/superoak), a
package registry for Deno on the Blockchain.

```ts
import { superoak } from "https://x.nest.land/superoak@4.3.0/mod.ts";
```

## Example

You may pass a url string (for an already running Oak server), or an Oak
`Application` object to `superoak()` - when passing an Oak `Application`,
SuperOak will automatically handle the creation of a server, binding to a free
ephemeral port and closing of the server on a call to `.end()`.

SuperOak works with any Deno test framework. Here's an example with Deno's
built-in test framework.

```ts
import { Application, Router } from "https://deno.land/x/oak@v7.6.3/mod.ts";
import { superoak } from "https://deno.land/x/superoak@4.3.0/mod.ts";

const router = new Router();
router.get("/", (ctx) => {
  ctx.response.body = "Hello Deno!";
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

// Send simple GET request
Deno.test("it should support the Oak framework", async () => {
  const request = await superoak(app);
  await request.get("/").expect("Hello Deno!");
});

// Custom requests can be built with the superagent API
// https://visionmedia.github.io/superagent/#post--put-requests.
Deno.test("it should allow post requests", async () => {
  const request = await superoak(app);
  await request.post("/user")
    .set("Content-Type", "application/json")
    .send('{"name":"superoak"}')
    .expect(200)
})
```

Save the above to a file `demo.test.ts` and test it using
`deno test --allow-net demo.test.ts`.

For further examples, see the
[SuperOak examples](https://github.com/asos-craigmorten/superoak/blob/main/examples/README.md),
[tests](https://github.com/asos-craigmorten/superoak/blob/main/test/superoak.test.ts)
or the
[SuperDeno examples](https://github.com/asos-craigmorten/superdeno#example) for
inspiration.

## Documentation

- [SuperOak Type Docs](https://asos-craigmorten.github.io/superoak/)
- [SuperOak Deno Docs](https://doc.deno.land/https/deno.land/x/superoak/mod.ts)
- [SuperOak Examples](https://github.com/asos-craigmorten/superoak/blob/main/examples/README.md)
- [License](https://github.com/asos-craigmorten/superoak/blob/main/LICENSE.md)
- [Changelog](https://github.com/asos-craigmorten/superoak/blob/main/.github/CHANGELOG.md)

## API

Please refer to the
[SuperDeno API](https://github.com/asos-craigmorten/superdeno#api) and
[SuperAgent API](https://visionmedia.github.io/superagent/).

## FAQs

### `Property 'get' does not exist on type 'Promise<SuperDeno>'` error

Unlike [SuperDeno](https://github.com/asos-craigmorten/superdeno), `superoak()`
returns a promise which will need to be awaited before you can call any method
such as `.get("/")`.

```ts
// ✅ works
Deno.test("it will allow you to make assertions if you await it", async () => {
  const request = await superoak(app);
  await request.get("/").expect(200).expect("Hello Deno!");
});

// ❌ won't work
Deno.test("it will allow you to make assertions if you await it", async () => {
  const request = superoak(app);
  await request.get("/").expect(200).expect("Hello Deno!"); // Boom 💥 `Property 'get' does not exist on type 'Promise<SuperDeno>'`
});
```

### `Request has been terminated` error

Unlike [SuperDeno](https://github.com/asos-craigmorten/superdeno), you cannot
re-use SuperOak instances. If you try you will encounter an error similar to
below:

```console
Error: Request has been terminated
Possible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.
    at Test.Request.crossDomainError
    at XMLHttpRequestSham.xhr.onreadystatechange
    ...
```

This is because SuperOak instances automatically close the underlying Oak server
once the assertion chain has completed.

Instead you should make all of your assertions on a single SuperOak instance, or
create a new SuperOak instance for subsequent assertions like below:

```ts
// ✅ works
Deno.test("it will allow you to make multiple assertions on one SuperOak instance", async () => {
  const request = await superoak(app);
  await request.get("/").expect(200).expect("Hello Deno!");
});

// ✅ works
Deno.test("it will allow you to re-use the Application for another SuperOak instance", async () => {
  const request1 = await superoak(app);
  await request1.get("/").expect(200);

  const request2 = await superoak(app);
  await request2.get("/").expect("Hello Deno!");
});

// ❌ won't work
Deno.test("it will throw an error if try to re-use a SuperOak instance", async () => {
  const request = await superoak(app);
  await request.get("/").expect(200);
  await request.get("/").expect("Hello Deno!"); // Boom 💥 `Error: Request has been terminated`
});
```

## Contributing

[Contributing guide](https://github.com/asos-craigmorten/superoak/blob/main/.github/CONTRIBUTING.md)

---

## License

SuperOak is licensed under the [MIT License](./LICENSE.md).

Icon designed and created by
[Hannah Morten](https://www.linkedin.com/in/hannah-morten-b1218017a/).
