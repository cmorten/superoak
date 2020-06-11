import { superoak } from "https://deno.land/x/superoak@master/mod.ts";
import { app } from "./server.ts";

Deno.test(
  "it will allow your to make multiple assertions on one SuperOak instance",
  async () => {
    let request = await superoak(app);

    await request.get("/").expect(200).expect("Hello Deno!");
  },
);

Deno.test(
  "it will allow your to re-use the Application for another SuperOak instance",
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
