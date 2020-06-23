<p align="center">
  <a href="https://www.linkedin.com/in/hannah-morten-b1218017a/"><img height="200" style="height: 200px;" src="https://github.com/asos-craigmorten/superoak/raw/master/.github/icon.png" alt="Super Oak standing in the rain at night – stoically facing the dark battle that is software engineering"></a>
  <h1 align="center">SuperOak</h1>
</p>
<p align="center">
HTTP assertions for Deno's Oak web framework made easy via [SuperDeno](https://github.com/asos-craigmorten/superdeno).
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
   <a href="http://hits.dwyl.com/asos-craigmorten/superoak"><img src="http://hits.dwyl.com/asos-craigmorten/superoak.svg" alt="SuperOak repository visit count" /></a>
</p>

---

## Table of Contents

- [About](#about)
- [Installation](#installation)
- [Example](#example)
- [Documentation](#documentation)
- [API](#api)
- [Notes](#notes)
- [Contributing](#contributing)
- [License](#license)

## About

This module aims to provide a high-level abstraction for testing HTTP in Deno's Oak web framework. This is a wrapper compatibility layer around [SuperDeno](https://github.com/asos-craigmorten/superdeno) to reduce some of the boilerplate needed to setup Oak integration + functional tests.

## Installation

This is a [Deno](https://deno.land/) module available to import direct from this repo and via the [Deno Registry](https://deno.land/x).

Before importing, [download and install Deno](https://deno.land/#installation).

You can then import SuperOak straight into your project:

```ts
import { superoak } from "https://deno.land/x/superoak@master/mod.ts";
```

If you want to use a specific version of SuperOak, just modify the import url to contain the version:

```ts
import { superoak } from "https://deno.land/x/superoak@1.0.1/mod.ts";
```

Or if you want to use a specific commit of SuperOak, just modify the import url to contain the commit hash:

```ts
import { superoak } from "https://deno.land/x/superoak@c4eb4a8/mod.ts";
```

## Example

You may pass a url string (for an already running Oak server), or an Oak `Application` object to `superoak()` - when passing an Oak `Application`, SuperOak will automatically handle the creation of a server, binding to a free ephemeral port and closing of the server on a call to `.end()`.

SuperOak works with any Deno test framework. Here's an example with Deno's built-in test framework.

```ts
import { Application, Router } from "https://deno.land/x/oak@master/mod.ts";
import { superoak } from "https://deno.land/x/superoak@master/mod.ts";

const router = new Router();
router.get("/", (ctx) => {
  ctx.response.body = "Hello Deno!";
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

Deno.test("it should support the Oak framework", async () => {
  const request = await superoak(app);
  await request.get("/").expect("Hello Deno!");
});
```

Save the above to a file `demo.test.ts` and test it using `deno test --allow-net demo.test.ts`.

For further examples, see the [SuperOak examples](https://github.com/asos-craigmorten/superoak/blob/master/examples/README.md), [tests](https://github.com/asos-craigmorten/superoak/blob/master/test/superoak.test.ts) or the [SuperDeno examples](https://github.com/asos-craigmorten/superdeno#example) for inspiration.

## Documentation

- [SuperOak Type Docs](https://asos-craigmorten.github.io/superoak/)
- [SuperOak Deno Docs](https://doc.deno.land/https/deno.land/x/superoak/mod.ts)
- [SuperOak Examples](https://github.com/asos-craigmorten/superoak/blob/master/examples/README.md)
- [License](https://github.com/asos-craigmorten/superoak/blob/master/LICENSE.md)
- [Changelog](https://github.com/asos-craigmorten/superoak/blob/master/.github/CHANGELOG.md)

## API

Please refer to the [SuperDeno API](https://github.com/asos-craigmorten/superdeno#api).

## Notes

- Unlike [SuperDeno](https://github.com/asos-craigmorten/superdeno), `superoak()` returns a promise which will need to be awaited before you can call a method such as `.get("/")`.
- Unlike [SuperDeno](https://github.com/asos-craigmorten/superdeno), you cannot re-use a SuperOak instance once the chained `.end()` method has been called. This is because SuperOak will automatically close the server once the chained `.end()` method is called. Instead you should make all of your assertions on the one SuperOak instance, or create a new SuperOak instance like below:

  ```ts
  import { Application, Router } from "https://deno.land/x/oak@master/mod.ts";
  import { superoak } from "https://deno.land/x/superoak@master/mod.ts";

  const router = new Router();
  const app = new Application();

  router.get("/", (ctx) => {
    ctx.response.body = "Hello Deno!";
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  Deno.test(
    "it will allow your to make multiple assertions on one SuperOak instance",
    async () => {
      let request = await superoak(app);

      await request.get("/").expect(200).expect("Hello Deno!");
    }
  );

  Deno.test(
    "it will allow your to re-use the Application for another SuperOak instance",
    async () => {
      let request = await superoak(app);

      await request.get("/").expect(200);

      request = await superoak(app);

      await request.get("/").expect("Hello Deno!");
    }
  );
  ```

## Contributing

[Contributing guide](https://github.com/asos-craigmorten/superoak/blob/master/.github/CONTRIBUTING.md)

---

## License

SuperOak is licensed under the [MIT License](./LICENSE.md).

Icon designed and created by [Hannah Morten](https://www.linkedin.com/in/hannah-morten-b1218017a/).
