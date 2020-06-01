import {
  superdeno,
  Server,
  SuperDeno,
  Application,
  getFreePort,
} from "../deps.ts";

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
  app: string | Application,
  secure?: boolean,
): Promise<SuperDeno> {
  if (app instanceof Application) {
    const controller = new AbortController();
    const { signal } = controller;

    return await new Promise(async (resolve) => {
      app.addEventListener("listen", ({ hostname, port, secure }) => {
        const serverSham: Server = Object.create(Server.prototype);

        serverSham.close = () => controller.abort();

        serverSham.listener = {
          addr: {
            port,
            hostname: hostname as string,
            transport: "tcp",
          },
        } as any;

        resolve(superdeno(serverSham, secure));
      });

      const freePort = await getFreePort(random(1024, 49151));

      app.listen(
        { hostname: "127.0.0.1", port: freePort, signal },
      );
    });
  }

  return superdeno(app, secure);
}
