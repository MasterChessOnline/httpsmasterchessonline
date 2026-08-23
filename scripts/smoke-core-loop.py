#!/usr/bin/env python3
"""Core-loop smoke test (plan section 27).

Checks the pages the whole product depends on: home -> play -> online -> signup.
Fails (exit 1) if a route 404s, renders no H1, or throws a real console error.

Usage: python3 scripts/smoke-core-loop.py [base_url]
"""
import asyncio
import sys
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
ROUTES = ["/", "/play", "/play/online", "/signup", "/open", "/opening-guides"]
IGNORE = ("Function components cannot be given refs", "Download the React DevTools")


async def main() -> int:
    failures: list[str] = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 390, "height": 1800})
        for route in ROUTES:
            page = await context.new_page()
            errors: list[str] = []
            page.on(
                "console",
                lambda m: errors.append(m.text)
                if m.type == "error" and not any(i in m.text for i in IGNORE)
                else None,
            )
            resp = await page.goto(BASE + route, wait_until="domcontentloaded")
            await page.wait_for_timeout(3500)
            status = resp.status if resp else 0
            h1 = await page.locator("h1").first.text_content() if await page.locator("h1").count() else None
            ok = status < 400 and bool(h1) and not errors
            print(f"{'PASS' if ok else 'FAIL'} {route} status={status} h1={(h1 or '')[:50]!r}")
            if errors:
                print("   errors:", errors[:3])
            if not ok:
                failures.append(route)
            await page.close()
        await browser.close()
    print("\nsmoke:", "all green" if not failures else f"failed {failures}")
    return 1 if failures else 0


sys.exit(asyncio.run(main()))
