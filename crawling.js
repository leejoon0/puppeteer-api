const puppeteer = require("puppeteer");
const axios = require("axios");
const cheerio = require("cheerio");

(async () => {
  const browser = await puppeteer.launch({
    //headless:false로 변경하면 브라우저 창이 뜨는것을 볼 수 있습니다.
    headless: false,
    // 크롬이 설치된 위치를 입력해줍니다. 엣지 등 크로미움 기반의 웹브라우저도 지원됩니다.
    // executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--window-size=1920,1080"],
    slowMo: 30,
  });
  const page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  let keyword = "점프스타터";

  await Promise.all([page.goto("https://www.coupang.com/np/search?component=&q=" + encodeURI(keyword) + "&channel=user"), page.waitForNavigation()]);

  //   await page.waitForXPath(target);

  let target = "//div[@class='search-query-result']//dl[@class='search-related-keyword']//dd";

  await page.waitForXPath(target);
  let s = await page.$x(target);
  //   s = s[0];
  let iIdx = 0;
  for (item of s) {
    const value = await item.evaluate((el) => el.textContent);
    console.log("value", value);
    console.log(iIdx++);
  }

  //   await s.type("점프스타터");

  //   target = "//a[@id='headerSearchBtn']";
  //   await page.waitForXPath(target);
  //   s = await page.$x(target);

  //   await s[0].click();

  // await parsing(page.url());

  //fullPage:false로 하면 현재 브라우저에서 보이는 영역만 스크린캡쳐를 뜨게 됩니다.
  //   await page.screenshot({ path: "example.png", fullPage: true });
  // await Promise((r) => setTimeout(r, 3000));
  //   await browser.close();
})();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
