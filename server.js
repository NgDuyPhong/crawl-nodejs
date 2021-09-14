// cài thư viện cheerio và request-promise
// npm install cheerio request-promise
// run bằng lệnh node server.js
const cheerio = require('cheerio');

const request = require('request-promise');
const fs = require('fs');
const listJobType = ["フルタイム", "パートタイム", "契約社員", "インターン"];
var options = {
    uri: 'https://www.google.com/search?vet=10ahUKEwj2s7X8lP7yAhXV7WEKHT0nCiwQ06ACCJoI..i&ei=BW1AYbadL9XbhwO9zqjgAg&yv=3&rciv=jb&nfpr=0&q=%E5%80%89%E5%BA%AB%E3%80%80%E8%BB%BD%E4%BD%9C%E6%A5%AD%E3%80%80%E5%8D%83%E8%91%89%E7%9C%8C%E6%B5%81%E5%B1%B1%E5%B8%82&start=0&asearch=jb_list&async=_id:VoQFxe,_pms:hts,_fmt:pc',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
		'sec-ch-ua-platform':  "Windows",
		'accept-language':  `ja;q=0.9,fr;q=0.8,de;q=0.7,es;q=0.6,it;q=0.5,nl;q=0.4,sv;q=0.3,nb;q=0.2`
    },
    json: true // Automatically parses the JSON string in the response
};

request(options, (error, response, html) => {
  if(!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    let data = []

    $('.pE8vnd.avtvi').each((index, el) => {
		const jobName = $(el).find('.sH3zFd h2').text();
		const postPerson = $(el).find('.nJlQNd.sMzDkb').text();
		let salary = "";
		let jobType = "";
		$(el).find('.ocResc.icFQAc .n1Mpqb').each((i,ele) => {
		if (i!=0){
			let str = $(ele).find('.SuWscb').text();
			if (listJobType.indexOf(str) != -1) {
				jobType = str;
			} else {
				salary = str;
			}
		}
		});
		data.push({
		jobName, postPerson, salary, jobType
		}); // đẩy dữ liệu vào biến data
    });
	$('.oNwCmf').each((index, el) => {
		$(el).find('.Qk80Jf').each((i,ele) => {
			if (i!=0){
				data[index].provider = $(ele).text();
			}
		});
	})
    fs.writeFileSync('data.json', JSON.stringify(data)); // lưu dữ liệu vào file data.json
  }
  else {
    console.log(error);
  }
});







