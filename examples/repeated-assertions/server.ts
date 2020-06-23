import { Application, Router } from "https://deno.land/x/oak@v5.3.1/mod.ts";

const router = new Router();
const app = new Application();

router.get("/", (ctx) => {
  ctx.response.body = "Hello Deno!";
});

app.use(router.routes());
app.use(router.allowedMethods());

if (import.meta.main) {
  await app.listen({ port: 3000 });
}

export { app };
