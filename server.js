// run with cmd: nodemon index
const cheerio = require('cheerio');
const request = require('request-promise');
const fs = require('fs');
const { data } = require('cheerio/lib/api/attributes');
const listJobType = ["フルタイム", "パートタイム", "契約社員", "インターン"];
let AN_HOUR = "1 時間 ";

// input start from
let start = 0;
let lrad = 10.0;
let count = 10;
let stop = false;
let dataRs = [];
let sum = 0;
let fileNameSuccess = "";

const header = [
	// Title of the columns (column_names)
	'Job Name',
	'Post Person Jobs',
	'Provider',
	'Salary Min',
	'Salary Max',
	'Job Type'
];

function contentMethod(options) {
	const a =  request(options, (error, response, html) => {
		if(!error && response.statusCode == 200) {
			const $ = cheerio.load(html);
			// setTimeout(function () {}, 500)
			// console.log(html);
			let data = [];
			count = $('.pE8vnd.avtvi').length;
			$('.pE8vnd.avtvi').each((index, el) => {
				const jobName = $(el).find('.sH3zFd h2').text();
				const postPerson = $(el).find('.nJlQNd.sMzDkb').text();
				// console.log($('.nJlQNd.sMzDkb'));
				let salaryMin = "";
				let salaryMax = "";
				let jobType = "";
				$(el).find('.ocResc.icFQAc .n1Mpqb').each((i,ele) => {
				if (i!=0){
					let str = $(ele).find('.SuWscb').text();
					if (listJobType.indexOf(str) != -1) {
						jobType = str;
					} else {
						if (str.indexOf(AN_HOUR) != -1) {
							let salary = str.replace(AN_HOUR, '').split('～');
							salaryMin = salary[0] ? salary[0] : '';
							salaryMax = salary[1] ? salary[1] : '';
						}
					}
				}
				});
				const provider = $(el).find('.pMhGee.Co68jc.j0vryd').text().split(": ")[1];
				
				data.push({
				jobName, postPerson, provider, salaryMin, salaryMax, jobType
				});
			});
			dataRs.push(...data);
		}
		else {
			console.log(error);
		}
		
		if (count != 0) {
			sum += count;
			console.log("Total number of rows crawled: " + (sum));
		}
		start += 10;
		stop = false;
	});
	return a;
}

async function asyncCall(keySearch) {
	// input key search
	// let keySearch = "倉庫　軽作業　千葉県流山市";
	const encSear = encodeURI(keySearch);
	count = 10;
	start = 0;
	sum = 0;
	dataRs = [];
	// when data form gg < 10 record -> stop while
	while(count > 0){
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
			
		}
	}
	if (sum == 0) console.log("data not found!")
	else writeCsv(dataRs, keySearch);
}

// write data to file csv
function writeCsv(jsonObject, keySearch) {
	let fileString = ""
	const separator = ","
	const fileType = "csv"
	// example name: data_2021-9-19_18-02-58_212.csv
	const date = (new Date().toLocaleString().replace(" ", "_")).replace(/:/g, "-");
	const fileName = `${keySearch}_${date}_${sum}.${fileType}`;
	const file = `${__dirname}/data/${fileName}`;
	fileNameSuccess = fileName;
	// write header
	header.forEach(value=>fileString += `"${value}"${separator}`) // ngoặc kép "${value}" để phân biệt khi tiền có dấu ","
	fileString = fileString.slice(0, -1);
	fileString += "\n";

	// write content
	jsonObject.forEach(transaction=>{
		Object.values(transaction).forEach(value=>fileString += `"${value}"${separator}`)
		fileString = fileString.slice(0, -1)
		fileString += "\n"
	})
	fs.writeFileSync(file, "\uFEFF" + fileString, 'utf8');
}
exports.asyncCall = async function(keySearch){
    await asyncCall(keySearch);
	return {sum: sum, fileName: fileNameSuccess};
}













