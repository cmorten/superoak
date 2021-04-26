# ChangeLog

## [4.2.0] - 26-04-2021

- feat: Support Deno 1.9.2 and std 0.95.0
- chore: upgrade dependencies

## [4.1.0] - 06-03-2021

- feat: Support Deno 1.8.0 and std 0.89.0
- chore: upgrade dependencies

## [4.0.0] - 10-02-2021

- feat: upgrade to superdeno 4.0.0 (#19)
- docs: simplify the contributing process

## [3.1.0] - 10-02-2021

- fix: upgrade `superdeno` version to prevent need to supply superfluous
  `--location <href>` flag.

## [3.0.1] - 15-12-2020

- feat: upgrade supported Deno to `1.6.1` and std module to `0.81.0`.
- chore: remove lock fixing for ci build due to CDN hash issues.

## [3.0.0] - 12-12-2020

- feat: upgrade to `superdeno@3.0.0` - **BREAKING CHANGE** support
  [superagent `.redirects(n)` API](https://visionmedia.github.io/superagent/#following-redirects),
  with a default of `0`.

The consequence of upgrading superdeno to support the `.redirects(n)` API is
that superoak follows a default of `0` redirects, for parity with
[supertest](https://github.com/visionmedia/supertest/blob/master/lib/test.js#L32).
If your test requires superoak to follow multiple redirects, specify the number
of redirects required in `.redirects(n)`, or use `-1` to have superoak follow
all redirects.

## [2.5.0] - 13-12-2020

- feat: upgrade supported Deno to `1.6.0` and std module to `0.80.0`.
- feat: upgrade superdeno to `2.5.0`.

## [2.4.1] - 07-12-2020

- fix: upgrade superdeno to `2.4.1` for type fixes.

## [2.4.0] - 06-12-2020

- feat: upgrade supported Deno to `1.5.4` and std module to `0.79.0`.
- feat: upgrade superdeno to `2.4.0`.
- fix: upgrade expect to `0.2.6` to fix import bug.
- docs: update `contributing.md` r.e. getting started with an issue.

## [2.3.1] - 19-09-2020

- chore: upgrade to eggs@0.2.2 in CI

## [2.3.0] - 19-09-2020

- feat: upgrade supported Deno to `1.4.1` and std module to `0.70.0`.

## [2.2.0] - 24-08-2020

- feat: upgrade supported Deno to `1.3.1` and std module to `0.66.0`.
- feat: upgrade superdeno dep.

## [2.1.0] - 05-08-2020

- chore: upgrade supported Deno and std module versions to `1.2.2` and `0.63.0`.
- chore: fix modules to tagged versions as
  [commits and branches are no longer supported by Deno
  registry](https://deno.land/posts/registry2).
- docs: remove reference to importing commit or branch from readme as not
  supported by Deno registry v2.

## [2.0.0] - 16-07-2020

- feat: update to Deno `1.2.0` (breaking upgrade), std `0.61.0` and other dep
  upgrades.
- chore: update formatting.

## [1.3.0] - 09-07-2020

- feat: move to default branch of `main`.

## [1.2.0] - 09-07-2020

- feat: support Deno `1.1.3`, std `0.60.0` and consume SuperDeno `1.6.1`.

## [1.1.1] - 23-06-2020

- fix: examples using incorrect branch for Oak.

## [1.1.0] - 23-06-2020

- chore: update dependencies.
- feat: support <https://nest.land> registry.
- docs: update README.md with SuperOak icon.

## [1.0.2] - 11-06-2020

- docs: add examples matching the main repo README with tests.

## [1.0.1] - 02-06-2020

- fix: decouple SuperOak from Oak v5.0.0 to prevent type errors.

## [1.0.0] - 01-06-2020

- feat: initial Oak extension for SuperDeno - _SuperOak_.
