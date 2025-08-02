from playwright.async_api import async_playwright

target_url = "https://shortsvillereindeer.com"

async def interceptRequest(route, request, targetUrl):
    """Block specific resource types from loading. Also blocks routing to other pages."""
    if request.url == targetUrl:
        if request.resource_type in ["image", "stylesheet", "font", "media"]:
            await route.abort()  # Block unwanted resource types
        else:
            await route.continue_()  # Allow other requests for the main URL
    else:
        # print("Intercepted: " + str(request.url))
        await route.abort()  # Block all other domains

async def handle_route(route, request):
    await interceptRequest(route, request, target_url)


async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.route("**/*", handle_route)
        try:
            resp = await page.goto("https://shortsvillereindeer.com", wait_until="domcontentloaded", timeout=20000)
            print("Success:", resp.status)
            print("Title:", await page.title())
            # Example of taking a screenshot
            await page.screenshot(path="screenshot.png")
        except Exception as e:
            print("FAILED:", e)
        await browser.close()

import asyncio
asyncio.run(run())