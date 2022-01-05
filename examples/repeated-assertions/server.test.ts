import { superoak } from "../../mod.ts";
import { app } from "./server.ts";

Deno.test(
  "it will allow you to make multiple assertions on one SuperOak instance",
  async () => {
    const request = await superoak(app);

    await request.get("/").expect(200).expect("Hello Deno!");
  },
);

Deno.test(
  "it will allow you to re-use the Application for another SuperOak instance",
  async () => {
    let request = await superoak(app);

    await request.get("/")
      .expect(200);

    request = await superoak(app);

    await request
      .get("/")
      .expect("Hello Deno!");
  },
);
