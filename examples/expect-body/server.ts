import { Application, Router } from "https://deno.land/x/oak@v5.3.1/mod.ts";

const router = new Router();
router.get("/", (ctx) => {
  ctx.response.body = "Hello Deno!";
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", ({ port }) => {
  console.log(`Listening at http://localhost:${port}`);
});

if (import.meta.main) {
  await app.listen({ port: 3000 });
}

export { app };
