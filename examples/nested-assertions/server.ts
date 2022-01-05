import { Application, Router } from "../../test/deps.ts";

const router = new Router();
const app = new Application();

const globalResponse = "Hello Deno!";

router.get("/", (ctx) => {
  ctx.response.body = globalResponse;
});

router.get("/hello", (ctx) => {
  ctx.response.body = globalResponse;
});

app.use(router.routes());
app.use(router.allowedMethods());

if (import.meta.main) {
  await app.listen({ port: 3000 });
}

export { app };
