import {
  Application,
  expect,
  isFreePort,
  Router,
  RouterContext,
} from "./deps.ts";
import { getFreePort, Test } from "../deps.ts";
import { describe, it } from "./utils.ts";
import { superoak } from "../mod.ts";

describe("superoak(url)", () => {
  it("superoak(url): should support `superoak(url)` if consumer wants to handle server themselves", async (
    done,
  ) => {
    const router = new Router();
    const app = new Application();

    router.get("/", (ctx: RouterContext) => {
      ctx.response.body = "hello";
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    const controller = new AbortController();
    const { signal } = controller;

    app.addEventListener("listen", async ({ hostname, port, secure }) => {
      const protocol = secure ? "https" : "http";
      const url = `${protocol}://${hostname}:${port}`;

      (await superoak(url))
        .get("/")
        .expect("hello", () => {
          controller.abort();
          done();
        });
    });

    await app.listen(
      { hostname: "localhost", port: await getFreePort(1024), signal },
    );
  });

  describe(".end(cb)", () => {
    it("Oak: superoak(url): .end(cb): should set `this` to the test object when calling the `cb` in `.end(cb)`", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "hello";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      const controller = new AbortController();
      const { signal } = controller;

      app.addEventListener(
        "listen",
        async ({ hostname, port, secure }) => {
          const protocol = secure ? "https" : "http";
          const url = `${protocol}://${hostname}:${port}`;
          const test = (await superoak(url)).get("/");

          test.end(function (this: Test) {
            expect(test).toEqual(this);
            controller.abort();
            done();
          });
        },
      );

      await app.listen(
        { hostname: "localhost", port: await getFreePort(1024), signal },
      );
    });

    it("superoak(url): .end(cb): should handle error returned when server goes down", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      const controller = new AbortController();
      const { signal } = controller;

      app.addEventListener(
        "listen",
        async ({ hostname, port, secure }) => {
          const protocol = secure ? "https" : "http";
          const url = `${protocol}://${hostname}:${port}`;

          controller.abort();

          (await superoak(url))
            .get("/")
            .expect(200, (err) => {
              expect(err).toBeInstanceOf(Error);
              done();
            });
        },
      );

      await app.listen(
        { hostname: "localhost", port: await getFreePort(1024), signal },
      );
    });
  });
});

describe("superoak(app)", () => {
  it("superoak(app): should fire up the app on an ephemeral port", async (
    done,
  ) => {
    const router = new Router();
    const app = new Application();

    router.get("/", (ctx: RouterContext) => {
      ctx.response.body = "hey";
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    (await superoak(app))
      .get("/")
      .end((_err, res) => {
        expect(res.status).toEqual(200);
        expect(res.text).toEqual("hey");
        done();
      });
  });

  it("superoak(app): should not follow redirects by default", async (
    done,
  ) => {
    const router = new Router();
    const app = new Application();

    router.get("/", (ctx: RouterContext) => {
      ctx.response.body = "hey";
    });

    router.get("/redirect", (ctx: RouterContext) => {
      ctx.response.redirect("/");
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    const redirects: string[] = [];

    (await superoak(app))
      .get("/redirect")
      .on("redirect", (res) => {
        redirects.push(res.headers.location);
      })
      .then((res) => {
        expect(redirects).toEqual([]);
        expect(res.status).toEqual(302);
        done();
      });
  });

  it("superoak(app): should follow redirects when instructed", async (
    done,
  ) => {
    const router = new Router();
    const app = new Application();

    router.get("/", (ctx: RouterContext) => {
      ctx.response.body = "Smudgie";
    });

    router.get("/redirect", (ctx: RouterContext) => {
      ctx.response.redirect("/");
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    const redirects: string[] = [];

    (await superoak(app))
      .get("/redirect")
      .redirects(1)
      .on("redirect", (res) => {
        redirects.push(res.headers.location);
      })
      .then((res) => {
        expect(redirects).toEqual(["/"]);
        expect(res.status).toEqual(200);
        expect(res.text).toEqual("Smudgie");
        done();
      });
  });

  // TODO: https test.
  // it("superoak(app, true): should work with a https server", (done) => {});

  it("superoak(app): should work with .send() etc", async (done) => {
    const router = new Router();
    const app = new Application();

    router.post("/", async (ctx: RouterContext) => {
      if (ctx.request.hasBody) {
        ctx.response.body = await ctx.request.body();
      }
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    (await superoak(app))
      .post("/")
      .send({ name: "john" })
      .expect("john", () => {
        done();
      });
  });

  describe(".end(fn)", () => {
    it("superoak(app): .end(fn): should close server", async (done) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "superoak FTW!";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      const portPromise: Promise<number> = new Promise((resolve) => {
        app.addEventListener("listen", ({ port }) => resolve(port));
      });

      (await superoak(app)).get("/")
        .end(async (_err, _res) => {
          const port: number = await portPromise;
          const isClosed = await isFreePort(port);
          expect(isClosed).toBeTruthy();
          done();
        });
    });

    // TODO: support nested requests using the same `superoak` instance.
    // it("superoak(app): .end(fn): should support nested requests", async (
    //   done,
    // ) => {
    //   const router = new Router();
    //   const app = new Application();

    //   router.get("/", (ctx: RouterContext) => {
    //     ctx.response.body = "superoak FTW!";
    //   });

    //   app.use(router.routes());
    //   app.use(router.allowedMethods());

    //   const test = await superoak(app);

    //   test
    //     .get("/")
    //     .end(() => {
    //       test
    //         .get("/")
    //         .end((err, res) => {
    //           expect(err).toBeNull();
    //           expect(res.status).toEqual(200);
    //           expect(res.text).toEqual("superoak FTW!");
    //           done();
    //         });
    //     });
    // });

    it("superoak(app): .end(fn): should support nested requests if create a new superoak instance", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "superoak FTW!";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      let test = await superoak(app);

      test
        .get("/")
        .end(async () => {
          test = await superoak(app);

          test
            .get("/")
            .end((err, res) => {
              expect(err).toBeNull();
              expect(res.status).toEqual(200);
              expect(res.text).toEqual("superoak FTW!");
              done();
            });
        });
    });

    it("superoak(app): .end(fn): should include the response in the error callback", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "whatever";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect(() => {
          throw new Error("Some error");
        })
        .end((err, res) => {
          expect(err).toBeDefined();
          expect(res).toBeDefined();
          // Duck-typing response, just in case.
          expect(res.status).toEqual(200);

          done();
        });
    });

    it("superoak(app): .end(fn): should set `this` to the test object when calling the error callback", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "whatever";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      const test = (await superoak(app)).get("/");

      test.expect(() => {
        throw new Error("Some error");
      }).end(function (this: Test, err, _res) {
        expect(err).toBeDefined();
        expect(this).toEqual(test);
        done();
      });
    });

    it("superoak(app): .end(fn): should handle an undefined Response", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", async (ctx: RouterContext) => {
        await new Promise((resolve) => {
          setTimeout(() => {
            ctx.response.body = "";
            resolve(true);
          }, 20);
        });
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app)).get("/").timeout(1)
        .expect(200, (err, _res) => {
          expect(err).toBeInstanceOf(Error);
          done();
        });
    });

    // TODO: determine if _can_ test a server going down?
  });

  describe(".expect(status[, fn])", () => {
    it("superoak(app): .expect(status[, fn]): should assert the response status", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "hey";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect(404)
        .end((err, _res) => {
          expect(err.message).toEqual('expected 404 "Not Found", got 200 "OK"');
          done();
        });
    });
  });

  describe(".expect(status)", () => {
    it("superoak(app): .expect(status): should assert only status", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "hey";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect(200)
        .end(done);
    });
  });

  describe(".expect(status, body[, fn])", () => {
    it("superoak(app): .expect(status, body[, fn]): should assert the response body and status", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "foo";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect(200, "foo", done);
    });

    describe("when the body argument is an empty string", () => {
      it("superoak(app): .expect(status, body[, fn]): should not quietly pass on failure", async (
        done,
      ) => {
        const router = new Router();
        const app = new Application();

        router.get("/", (ctx: RouterContext) => {
          ctx.response.body = "foo";
        });

        app.use(router.routes());
        app.use(router.allowedMethods());

        (await superoak(app))
          .get("/")
          .expect(200, "")
          .end((err, _res) => {
            expect(err.message).toEqual('expected "" response body, got "foo"');
            done();
          });
      });
    });
  });

  describe(".expect(body[, fn])", () => {
    it("superoak(app): .expect(body[, fn]): should assert the response body", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = { foo: "bar" };
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect("hey")
        .end((err, _res) => {
          expect(err.message).toEqual(
            'expected "hey" response body, got \'{"foo":"bar"}\'',
          );
          done();
        });
    });

    it("superoak(app): .expect(body[, fn]): should assert the status before the body", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.status = 500;
        ctx.response.body = { message: "something went wrong" };
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect(200)
        .expect("hey")
        .end((err, _res) => {
          expect(err.message).toEqual(
            'expected 200 "OK", got 500 "Internal Server Error"',
          );
          done();
        });
    });

    it("superoak(app): .expect(body[, fn]): should assert the response text", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = { foo: "bar" };
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect('{"foo":"bar"}', done);
    });

    it("superoak(app): .expect(body[, fn]): should assert the parsed response body", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = { foo: "bar" };
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect({ foo: "baz" })
        .end(async (err, _res) => {
          expect(err.message).toEqual(
            'expected { foo: "baz" } response body, got { foo: "bar" }',
          );

          (await superoak(app))
            .get("/")
            .expect({ foo: "bar" })
            .end(done);
        });
    });

    it("superoak(app): .expect(body[, fn]): should test response object types", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.status = 200;
        ctx.response.body = { stringValue: "foo", numberValue: 3 };
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect({ stringValue: "foo", numberValue: 3 }, done);
    });

    it("superoak(app): .expect(body[, fn]): should deep test response object types", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.status = 200;
        ctx.response.body = {
          stringValue: "foo",
          numberValue: 3,
          nestedObject: { innerString: "5" },
        };
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect(
          {
            stringValue: "foo",
            numberValue: 3,
            nestedObject: { innerString: 5 },
          },
        )
        .end(async (err, _res) => {
          expect(err.message).toEqual(
            'expected { stringValue: "foo", numberValue: 3, nestedObject: { innerString: 5 } } response body, got { stringValue: "foo", numberValue: 3, nestedObject: { innerString: "5" } }',
          ); // eslint-disable-line max-len

          (await superoak(app))
            .get("/")
            .expect(
              {
                stringValue: "foo",
                numberValue: 3,
                nestedObject: { innerString: "5" },
              },
            )
            .end(done);
        });
    });

    it("superoak(app): .expect(body[, fn]): should support regular expressions", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "foobar";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect(/^bar/)
        .end((err, _res) => {
          expect(err.message).toEqual('expected body "foobar" to match /^bar/');
          done();
        });
    });
  });

  it("superoak(app): .expect(body[, fn]): should assert response body multiple times", async (
    done,
  ) => {
    const router = new Router();
    const app = new Application();

    router.get("/", (ctx: RouterContext) => {
      ctx.response.body = "hey deno";
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    (await superoak(app))
      .get("/")
      .expect(/deno/)
      .expect("hey")
      .expect("hey deno")
      .end((err, _res) => {
        expect(err.message).toEqual(
          'expected "hey" response body, got "hey deno"',
        );
        done();
      });

    it("superoak(app): .expect(body[, fn]): should assert response body multiple times with no exception", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "hey deno";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect(/deno/)
        .expect(/^hey/)
        .expect("hey deno", done);
    });
  });

  describe(".expect(field, value[, fn])", () => {
    it("superoak(app): .expect(field, value[, fn]): should assert the header field presence", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = { foo: "bar" };
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect("Content-Foo", "bar")
        .end((err, _res) => {
          expect(err.message).toEqual('expected "Content-Foo" header field');
          done();
        });
    });

    it("superoak(app): .expect(field, value[, fn]): should assert the header field value", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = { foo: "bar" };
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect("Content-Type", "text/plain")
        .end((err, _res) => {
          expect(err.message).toEqual(
            'expected "Content-Type" of "text/plain", got "application/json; charset=utf-8"',
          );
          done();
        });
    });

    it("superoak(app): .expect(field, value[, fn]): should assert multiple fields", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "hey";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect("Content-Type", "text/plain; charset=utf-8")
        .expect("Content-Length", "3")
        .end(done);
    });

    it("superoak(app): .expect(field, value[, fn]): should support regular expressions", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "hey";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect("Content-Type", /^application/)
        .end((err) => {
          expect(err.message).toEqual(
            'expected "Content-Type" matching /^application/, got "text/plain; charset=utf-8"',
          );
          done();
        });
    });

    it("superoak(app): .expect(field, value[, fn]): should support numbers", async (
      done,
    ) => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "hey";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      (await superoak(app))
        .get("/")
        .expect("Content-Length", 4)
        .end((err) => {
          expect(err.message).toEqual(
            'expected "Content-Length" of "4", got "3"',
          );
          done();
        });
    });

    describe("handling arbitrary expect functions", () => {
      const router = new Router();
      const app = new Application();

      router.get("/", (ctx: RouterContext) => {
        ctx.response.body = "hey";
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      it("superoak(app): .expect(field, value[, fn]): reports errors", async (
        done,
      ) => {
        (await superoak(app)).get("/")
          .expect((_res) => {
            throw new Error("failed");
          })
          .end((err) => {
            expect(err.message).toEqual("failed");
            done();
          });
      });

      it(
        "superoak(app): .expect(field, value[, fn]): ensures truthy non-errors returned from asserts are not promoted to errors",
        async (done) => {
          (await superoak(app)).get("/")
            .expect((_res) => {
              return "some descriptive error";
            })
            .end((err) => {
              expect(err).toBeNull();
              done();
            });
        },
      );

      it("superoak(app): .expect(field, value[, fn]): ensures truthy errors returned from asserts are throw to end", async (
        done,
      ) => {
        (await superoak(app)).get("/")
          .expect((_res) => {
            return new Error("some descriptive error");
          })
          .end((err) => {
            expect(err.message).toEqual("some descriptive error");
            expect(err).toBeInstanceOf(Error);
            done();
          });
      });

      it("superoak(app): .expect(field, value[, fn]): doesn't create false negatives", async (
        done,
      ) => {
        (await superoak(app)).get("/")
          .expect((_res) => {
          })
          .end(done);
      });

      it("superoak(app): .expect(field, value[, fn]): handles multiple asserts", async (
        done,
      ) => {
        const calls: number[] = [];

        (await superoak(app)).get("/")
          .expect((_res) => {
            calls[0] = 1;
          })
          .expect((_res) => {
            calls[1] = 1;
          })
          .expect((_res) => {
            calls[2] = 1;
          })
          .end(() => {
            const callCount = [0, 1, 2].reduce((count, i) => {
              return count + calls[i];
            }, 0);
            expect(callCount).toEqual(3);
            done();
          });
      });

      it("superoak(app): .expect(field, value[, fn]): plays well with normal assertions - no false positives", async (
        done,
      ) => {
        (await superoak(app)).get("/")
          .expect((_res) => {
          })
          .expect("Content-Type", /json/)
          .end((err) => {
            expect(err.message).toMatch(/Content-Type/);
            done();
          });
      });

      it("superoak(app): .expect(field, value[, fn]): plays well with normal assertions - no false negatives", async (
        done,
      ) => {
        (await superoak(app)).get("/")
          .expect((_res) => {
          })
          .expect("Content-Type", /plain/)
          .expect((_res) => {
          })
          .expect("Content-Type", /text/)
          .end(done);
      });
    });

    describe("handling multiple assertions per field", () => {
      it("superoak(app): .expect(field, value[, fn]): should work", async (
        done,
      ) => {
        const router = new Router();
        const app = new Application();

        router.get("/", (ctx: RouterContext) => {
          ctx.response.body = "hey";
        });

        app.use(router.routes());
        app.use(router.allowedMethods());

        (await superoak(app))
          .get("/")
          .expect("Content-Type", /text/)
          .expect("Content-Type", /plain/)
          .end(done);
      });

      it("superoak(app): .expect(field, value[, fn]): should return an error if the first one fails", async (
        done,
      ) => {
        const router = new Router();
        const app = new Application();

        router.get("/", (ctx: RouterContext) => {
          ctx.response.body = "hey";
        });

        app.use(router.routes());
        app.use(router.allowedMethods());

        (await superoak(app))
          .get("/")
          .expect("Content-Type", /bloop/)
          .expect("Content-Type", /plain/)
          .end((err) => {
            expect(err.message).toEqual(
              'expected "Content-Type" matching /bloop/, ' +
                'got "text/plain; charset=utf-8"',
            );
            done();
          });
      });

      it("superoak(app): .expect(field, value[, fn]): should return an error if a middle one fails", async (
        done,
      ) => {
        const router = new Router();
        const app = new Application();

        router.get("/", (ctx: RouterContext) => {
          ctx.response.body = "hey";
        });

        app.use(router.routes());
        app.use(router.allowedMethods());

        (await superoak(app))
          .get("/")
          .expect("Content-Type", /text/)
          .expect("Content-Type", /bloop/)
          .expect("Content-Type", /plain/)
          .end((err) => {
            expect(err.message).toEqual(
              'expected "Content-Type" matching /bloop/, ' +
                'got "text/plain; charset=utf-8"',
            );
            done();
          });
      });

      it("superoak(app): .expect(field, value[, fn]): should return an error if the last one fails", async (
        done,
      ) => {
        const router = new Router();
        const app = new Application();

        router.get("/", (ctx: RouterContext) => {
          ctx.response.body = "hey";
        });

        app.use(router.routes());
        app.use(router.allowedMethods());

        (await superoak(app))
          .get("/")
          .expect("Content-Type", /text/)
          .expect("Content-Type", /plain/)
          .expect("Content-Type", /bloop/)
          .end((err) => {
            expect(err.message).toEqual(
              'expected "Content-Type" matching /bloop/, ' +
                'got "text/plain; charset=utf-8"',
            );
            done();
          });
      });
    });
  });
});
