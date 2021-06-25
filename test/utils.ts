/**
 * Test timeout.
 */
export const TEST_TIMEOUT = 3000;

/**
 * A no-op _describe_ method.
 *
 * @param name
 * @param fn
 */
export function describe(_name: string, fn: () => void | Promise<void>) {
  return fn();
}

export type Done = (err?: Error) => void;

/**
 * An _it_ wrapper around `Deno.test`.
 *
 * @param name
 * @param fn
 */
export function it(
  name: string,
  fn: (done: Done) => void | Promise<void>,
  options?: Partial<Deno.TestDefinition>,
) {
  Deno.test({
    ...options,
    name,
    fn: async () => {
      let done: Done = (err?: Error) => {
        if (err) throw err;
      };

      let race: Promise<unknown> = Promise.resolve();

      if (fn.length === 1) {
        let resolve: (value?: unknown) => void;
        const donePromise = new Promise((r) => {
          resolve = r;
        });

        let timeoutId: number;

        race = Promise.race([
          new Promise((_, reject) =>
            timeoutId = setTimeout(() => {
              reject(
                new Error(
                  `test "${name}" failed to complete by calling "done" within ${TEST_TIMEOUT}ms.`,
                ),
              );
            }, TEST_TIMEOUT)
          ),
          donePromise,
        ]);

        done = (err?: Error) => {
          clearTimeout(timeoutId);
          resolve();
          if (err) throw err;
        };
      }

      await fn(done);
      await race;
    },
  });
}
