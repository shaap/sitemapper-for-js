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

const http = require('http');
const config = require('./config');
const pages = config.urls;
const parallel = require('paralleljs');
const crawler = require('./crawler');
const { CronJob } = require('cron');
const fs = require('fs');


const app = http.createServer((req, res) => {  
		fs.readFile("sitemap.xml", function (err,data) {
			if (err) {
				res.writeHead(404);
				//res.end(JSON.stringify(err));
				res.end("Sitemap being generated...");
				return;
			}
			res.writeHead(200, {'Content-Type': 'application/xml'});
			res.end(data);
		});
});


async function crawlBusiness() {
    try {
        if (!config.autoCrawl) {
            // Setting up processes
            let processes = [];
            pages.forEach((page) => processes.push(crawler.getXml(page, pages.length)))

            // Running the process
            new parallel(processes);
        } else {
			await crawler.init();
            process.setMaxListeners(Infinity);
            crawler.processes.push(config.base);
            crawler.autoFetch();
			//crawler.closeBrowser();
        }
    }
    catch (e) {
        console.log(e);
    }
}

// Enable below when cluster is disabled
startServer();

function startServer() {
    const server = app.listen(process.env.PORT || 9055, err => {
        if (err) return console.error(err);
        const port = server.address().port;
        console.info(`App listening on port ${port}`);
        crawlBusiness();
		const job = new CronJob('59 23 * * 0', crawlBusiness);
		job.start();
	});
}
