"""Browser checks of a static DOM/CSS fixture, NOT React integration tests."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"audit"/"layout-fixture"
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path="/usr/bin/chromium",headless=True,args=["--no-sandbox"])
    page=browser.new_page()
    for width,height in [(360,800),(390,844),(430,932),(768,1024),(1024,1366),(1440,960)]:
        page.set_viewport_size({"width":width,"height":height})
        page.set_content((OUT/"home.html").read_text(encoding="utf-8"), wait_until="load")
        page.evaluate("document.fonts.ready")
        page.evaluate("window.scrollTo(0,0)")
        m=page.evaluate("""() => {
          const bad=[...document.querySelectorAll('button')].map(el=>{
            const r=el.getBoundingClientRect();return {label:el.textContent.trim()||el.getAttribute('aria-label'),w:r.width,h:r.height}
          }).filter(r=>r.w<55.9||r.h<55.9);
          return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
            columnCount:getComputedStyle(document.querySelector('.qy-place-grid')).gridTemplateColumns.split(' ').length,
            smallTargets:bad,buttonCount:document.querySelectorAll('button').length};
        }""")
        page.screenshot(path=str(OUT/f"static-home-{width}.png"),full_page=True)
        page.screenshot(path=str(OUT/f"static-home-viewport-{width}.png"))
        page.evaluate("window.scrollTo(0,document.documentElement.scrollHeight)")
        m["dockDoesNotHideLastCard"]=page.evaluate("""() => {
          const cards=document.querySelectorAll('.qy-place-card');
          return cards[cards.length-1].getBoundingClientRect().bottom<=document.querySelector('.qy-support-dock').getBoundingClientRect().top+1;
        }""")
        m["pass"]=m["scrollWidth"]<=width and not m["smallTargets"] and m["dockDoesNotHideLastCard"]
        m["height"]=height
        results.append(m)
    browser.close()
report={"kind":"Static DOM/CSS fixture only; not React runtime","viewports":results,
 "passed":sum(x["pass"] for x in results),"failed":sum(not x["pass"] for x in results),
 "limits":["Placeholder icon contours","No React lifecycle","No project build","No app e2e","No approved visual baseline"]}
(OUT/"measurements.json").write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
if report["failed"]:raise SystemExit(1)
