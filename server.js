// cài thư viện cheerio và request-promise
// npm install cheerio request-promise
// run bằng lệnh node server.js
const cheerio = require('cheerio');

const request = require('request-promise');
const fs = require('fs');

var options = {
    uri: 'https://www.google.com/search?vet=10ahUKEwjcrbnx3PvyAhVjQPUHHTwID8EQ06ACCJkI..i&ei=xiU_YdyyN-OA1e8PvJC8iAw&yv=3&rciv=jb&nfpr=0&q=%E5%80%89%E5%BA%AB%E3%80%80%E8%BB%BD%E4%BD%9C%E6%A5%AD%E3%80%80%E5%8D%83%E8%91%89%E7%9C%8C%E6%B5%81%E5%B1%B1%E5%B8%82&start=10&asearch=jb_list&async=_id:VoQFxe,_pms:hts,_fmt:pc',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
		'sec-ch-ua-platform':  "Windows"
    },
    json: true // Automatically parses the JSON string in the response
};

request(options, (error, response, html) => {
  if(!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    let data = []
	console.log($.html);

    $('.job__list-item').each((index, el) => {
      const job = $(el).find('.job__list-item-title a').text();
      const company = $(el).find('.job__list-item-company span').text();
      const address = $(el).find('.job__list-item-info').find('.address').text();
      const salary = $(el).find('.job__list-item-info').find('.salary').text();

      data.push({
        job, company, address, salary
      }); // đẩy dữ liệu vào biến data
    });

    fs.writeFileSync('data.json', html); // lưu dữ liệu vào file data.json
  }
  else {
    console.log(error);
  }
});