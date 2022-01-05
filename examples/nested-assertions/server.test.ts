import { superoak } from "../../mod.ts";
import { expect } from "../../test/deps.ts";
import { app } from "./server.ts";

Deno.test(
  "it will allow you to make nested assertions",
  async () => {
    const request1 = await superoak(app);
    const request2 = await superoak(app);

    let done: () => void;
    const donePromise = new Promise<void>((resolve) => done = resolve);

    request1.get("/").expect(200).end((err, response1) => {
      if (err) {
        throw err;
      }

      request2.get("/hello").expect(200).end((err, response2) => {
        if (err) {
          throw err;
        }

        expect(response1.body).toEqual(response2.body);
        done();
      });
    });

    await donePromise;
  },
);

Deno.test(
  "it will allow you to make multiple assertions",
  async () => {
    const request1 = await superoak(app);
    const request2 = await superoak(app);

    const response = await request1.get("/")
      .expect(200);

    const response2 = await request2
      .get("/hello")
      .expect(200);

    expect(response.body).toEqual(response2.body);
  },
);
