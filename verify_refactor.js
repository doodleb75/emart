
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Open index.html - Note: fetch() for header might fail on file protocol without flags or server
    // We'll check if the static HTML refactoring (slider/pagination) looks correct in DOM
    await page.goto('file:///c:/emart-everyday/index.html', { waitUntil: 'networkidle0' });

    // 1. Check Slider Track Class
    const sliderTrack = await page.$('.slider-track');
    const isSliderTrackPresent = !!sliderTrack;
    const sliderGap = await page.evaluate(el => el ? getComputedStyle(el).gap : null, sliderTrack);

    // 2. Check Pagination Container Class
    const pagination = await page.$('.pagination-container');
    const isPaginationPresent = !!pagination;
    const paginationDisplay = await page.evaluate(el => el ? getComputedStyle(el).display : null, pagination);

    console.log('Slider Track Present:', isSliderTrackPresent);
    console.log('Slider Gap (should be approx 24px/1.5rem):', sliderGap);
    console.log('Pagination Container Present:', isPaginationPresent);
    console.log('Pagination Display (should be flex):', paginationDisplay);

    await browser.close();
})();
