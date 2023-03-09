const puppeteer = require("puppeteer");

// create the asynchronous main function
async function main() {
  const start = Date.now();

  // launch a headless browser instance
  const browser = await puppeteer.launch({ headless: true });

  // create a new page object
  const page = await browser.newPage();

  // navigate to the target URL, wait until the loading finishes
  await page.goto("https://danube-webshop.herokuapp.com/", { waitUntil: "networkidle2" });

  // wait for left-side bar to load
  await page.waitForSelector("ul.sidebar-list");

  // click to the first element and wait for the navigation to finish
  await Promise.all([page.waitForNavigation(), page.click("ul[class='sidebar-list'] > li > a")]);

  // wait for previews to load
  await page.waitForSelector("li[class='preview']");

  // extract the book previews
  const books = await page.evaluateHandle(() => [...document.querySelectorAll("li[class='preview']")]);

  // extract the relevant data using page.evaluate
  // just pass the elements as the second argument and processing function as the first argument
  const processed_data = await page.evaluate((elements) => {
    // define an array to store the extracted data
    let data = [];
    // use a forEach loop to loop through every preview
    elements.forEach((element) => {
      // get the HTMl text of title, author, rating, and price data, respectively.
      let title = element.querySelector("div.preview-title").innerHTML;
      let author = element.querySelector("div.preview-author").innerHTML;
      let rating = element.querySelector("div.preview-details > p.preview-rating").innerHTML;
      let price = element.querySelector("div.preview-details > p.preview-price").innerHTML;

      // build a dictionary and store the data as key:value pairs
      let result = { title: title, author: author, rating: rating, price: price };
      // append the data to the `data` array
      data.push(result);
    });
    // return the result (it will be stored in `processed_data` variable)
    return data;
  }, books);

  // print out the extracted data
  console.log(processed_data);
  // close the page and browser respectively
  await page.close();
  await browser.close();

  const end = Date.now();
  console.log(`Execution time: ${(end - start) / 1000} s`);
}

// run the main function to scrape the data
main();
