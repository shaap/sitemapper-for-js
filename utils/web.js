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
				return getWeb(url);
			}
			//fs.writeFileSync("contentsclean.txt", result,{flag:'a+'});
            const links = await page.$$eval('a', as => as.map(a => a.href));
			//fs.writeFileSync("links.txt", JSON.stringify(links),{flag:'a+'});
			//console.log(links);
            return links;
        } catch (e) {
            return [];
        }
    }

}

module.exports = WebService;