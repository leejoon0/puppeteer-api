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

  await Promise.all([page.goto("http://www.naver.com"), page.waitForNavigation()]);

  let target = "//span[text()='쇼핑']/ancestor::a";

  await page.waitForTimeout(3000);
  await page.waitForXPath(target);

  let s = await page.$x(target);
  s = s[0];

  await Promise.all([s.click(), page.waitForNavigation()]);

  target = "//ul[@class='category_set_list__cseqS']/li/button";
  await page.waitForXPath(target);

  s = await page.$x(target);

  for (item of s) {
    const value = await item.evaluate((el) => el.textContent);
    console.log("value", value);
  }

  target = "//input[@class='_searchInput_search_text_fSuJ6']";
  await page.waitForXPath(target);
  s = await page.$x(target);
  s = s[0];

  await s.type("핫 아이템");

  target = "//button[@class='_searchInput_button_search_h79Dk']";
  await page.waitForXPath(target);
  s = await page.$x(target);
  s = s[0];

  await Promise.all([s.click(), page.waitForNavigation()]);

  await autoScroll(page);

  const elements = await page.$$("div.basicList_info_area__TWvzp");

  for (const element of elements) {
    const iconName = await element.$eval(attr, (el) => el.getAttribute("alt"));
  }

  const getHTML = async (url) => {
    try {
      return await axios.get(url);
    } catch (err) {
      console.log(err);
    }
  };

  const parsing = async (url) => {
    const html = await getHTML(url);
    const $ = cheerio.load(html.data);

    const productList = $(".list_basis li.basicList_item__0T9JD");

    let prods = [];
    productList.each((idx, node) => {
      const title = $(node).find(".basicList_title__VfX3c").text();
      const etc = $(node).find(".basicList_etc_box__5lkgg").text();

      prods.push({
        title: title,
        etc: etc,
      });

      console.log(prods);
    });
  };

  console.log(page.url());

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
