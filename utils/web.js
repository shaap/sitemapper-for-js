/*
 * *
 *  Copyright 2014 Comcast Cable Communications Management, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * /
 */

const puppeteer = require('puppeteer');
const config = require('../config');
const fs = require('fs');

process.on('unhandledrejection', () => {
    console.log('unhandled error occured');
});

const WebService = {

    async getWeb(url, browser) {
        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 926 });
			//console.log(url);
            await page.goto(url, config.pageLoad);
			const result = await page.content();
			//fs.writeFileSync("contents.txt", result,{flag:'a+'});
			if (result.includes("Server-Fehler")) {
				console.log ("SERR FOUND");
				return await this.getWeb(url, browser);
			}
			//fs.writeFileSync("contentsclean.txt", result,{flag:'a+'});
			let robots = await page.$eval("head > meta[name='robots']", element => element.content);
            robots = robots.split(',');

			if (!robots.includes("follow") || !robots.includes("index")) {
				console.log("Excluded (META) " + url); 
				return [false, []];
			}
            const links = await page.$$eval('a', as => as.map(a => a.href));
			//console.log(links.length);
			//fs.writeFileSync("links.txt", JSON.stringify(links),{flag:'a+'});
			//console.log(links);
            return [true, links];
        } catch (e) {
            return [false, []];
        }
    }

}

module.exports = WebService;