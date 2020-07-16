import { Application, Router } from "../../test/deps.ts";

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
