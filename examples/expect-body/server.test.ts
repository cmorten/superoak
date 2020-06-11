import { superoak } from "https://deno.land/x/superoak@master/mod.ts";
import { app } from "./server.ts";

Deno.test("it should support the Oak framework", async () => {
  const request = await superoak(app);
  await request.get("/").expect("Hello Deno!");
});
