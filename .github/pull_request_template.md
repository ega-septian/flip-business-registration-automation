## Summary

<!-- What changed and why, in 1-3 sentences. -->

## Related Test Case(s)

<!-- e.g. TC-03, TC-09 — or N/A for CI/tooling/docs-only changes. -->

## Changes

-

## Testing / Verification

<!-- Test run output, `npm run typecheck` result, manual check, etc. -->

## Checklist

- [ ] `npm run lint` and `npm run typecheck` pass
- [ ] Each `test()` maps 1:1 to a test case and its title matches the doc verbatim
- [ ] Every test is tagged with exactly one of `@smoke` / `@regression`, plus `@registration`
- [ ] No `test.skip()` / conditional skips
- [ ] Fields located via the Page Object (`pages/`); no ad-hoc selectors in the spec
- [ ] Reusable test data comes from `data/`; imports use the `@` aliases
- [ ] `@smoke` (account-creating) tests were considered — run intentionally, not on every change
