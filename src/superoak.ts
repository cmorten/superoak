// deno-lint-ignore-file no-explicit-any

import { getFreePort, SuperDeno, superdeno } from "../deps.ts";

/**
 * Generates a random number between min and max
 * @param {number} min
 * @param {number} max
 *
 * @returns {number}
 * @private
 */
function random(min: number, max: number): number {
  return Math.round(Math.random() * (max - min)) + min;
}

// TODO: this should be handled with better type logic as is brittle to
// Oak API interface changes.
/**
 * Duck typing to determine if is Oak application like.
 *
 * @param {any} thing
 *
 * @returns {boolean}
 * @private
 */
function isOakApplication(thing: any): boolean {
  return typeof thing === "object" && typeof thing?.listen === "function" &&
    typeof thing?.addEventListener === "function";
}

/**
 * Takes a url string (for an already running Oak server), or an Oak `Application` object.
 *
 * When passing a url string, accepts an optional second argument of `secure` to determine
 * whether connections should be over _HTTPS_ (`true`) or _HTTP_ (`false`).
 *
 * When passing an Oak `Application`, SuperOak will automatically handle the creation of a server, binding
 * to a free ephemeral port and closing of the server on a call to `.end()`.
 *
 * @param {string|Application} app
 * @param {?boolean} secure
 *
 * @returns {Promise<SuperDeno>}
 * @public
 */
export async function superoak(
  app: string | any,
  secure?: boolean,
): Promise<SuperDeno> {
  if (isOakApplication(app)) {
    const controller = new AbortController();
    const { signal } = controller;

    const freePort = await getFreePort(random(1024, 49151));

    let listenPromise: Promise<any>;

    return new Promise((resolve) => {
      app.addEventListener(
        "listen",
        (
          { hostname, port, secure }: {
            hostname: string;
            port: number;
            secure: boolean;
          },
        ) => {
          const serverSham = {
            async listenAndServe() {},
            async close() {
              controller.abort();

              if (listenPromise) {
                await listenPromise;
              }
            },
            get addrs() {
              return [{
                port,
                hostname: hostname as string,
                transport: "tcp" as const,
              }];
            },
          };

          resolve(superdeno(serverSham, secure));
        },
      );

      listenPromise = app.listen(
        { hostname: "127.0.0.1", port: freePort, signal },
      );
    });
  }

  return superdeno(app, secure);
}
