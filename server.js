// run with cmd: node server.js
const cheerio = require('cheerio');
const request = require('request-promise');
const fs = require('fs');
const listJobType = ["フルタイム", "パートタイム", "契約社員", "インターン"];

// input key search
const keySearch = "倉庫　軽作業　千葉県流山市";
const encSear = encodeURI(keySearch);
// input start from
let start = 0;
let lrad = 10.0;
let count = 10;
let stop = false;
let dataRs = [];


const header = [
	// Title of the columns (column_names)
	'Job Name',
	'Post Person Jobs',
	'Salary',
	'Job Type',
	'Provider'
];

function contentMethod(options) {
	const a =  request(options, (error, response, html) => {
		if(!error && response.statusCode == 200) {
			const $ = cheerio.load(html);
			let data = []
			count = $('.pE8vnd.avtvi').length;
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
				});
			});
			$('.oNwCmf').each((index, el) => {
				$(el).find('.Qk80Jf').each((i,ele) => {
					if (i!=0){
						data[index].provider = $(ele).text();
					}
				});
			})
			dataRs.push(...data);
		}
		else {
			console.log(error);
		}
		start += 10;
		stop = false;
		console.log(start);
	});
	return a;
}

async function asyncCall() {
	// when data form gg < 10 record -> stop while
	while(count >= 10){
		if (!stop) {
			stop = true;
			const options = {
				uri: 'https://www.google.com/search?yv=3&rciv=jb&lrad='+lrad+'&nfpr=0&q='+encSear+'&start='+start+'&asearch=jb_list&async=_id:VoQFxe,_pms:hts,_fmt:pc',
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
					'sec-ch-ua-platform':  "Windows",
					'accept-language':  `ja;q=0.9,fr;q=0.8,de;q=0.7,es;q=0.6,it;q=0.5,nl;q=0.4,sv;q=0.3,nb;q=0.2`
				},
				json: true // Automatically parses the JSON string in the response
			};
			await contentMethod(options);
			writeCsv(dataRs);
		}
	}
}

// write data to file csv
function writeCsv(jsonObject) {
	let fileString = ""
	const separator = ","
	const fileType = "csv"
	const file = `data.${fileType}` // có thể cộng thêm ngày để phân biệt các file

	// write header
	header.forEach(value=>fileString += `"${value}"${separator}`) // ngoặc kép "${value}" để phân biệt khi tiền có dấu ","
	fileString = fileString.slice(0, -1)
	fileString += "\n"

	// write content
	jsonObject.forEach(transaction=>{
		Object.values(transaction).forEach(value=>fileString += `"${value}"${separator}`)
		fileString = fileString.slice(0, -1)
		fileString += "\n"
	})
	fs.writeFileSync(file, fileString, 'utf8');
}

asyncCall();














