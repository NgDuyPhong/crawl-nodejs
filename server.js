// run with cmd: nodemon index
const cheerio = require('cheerio');
const request = require('request-promise');
const fs = require('fs');
const moment = require('moment');  
const { data } = require('cheerio/lib/api/attributes');
const listJobType = ["フルタイム", "パートタイム", "契約社員", "インターン"];
let AN_HOUR = "1 時間 ";
const crypto = require('crypto');

// input start from
let start = 0;
let IRAD = 10.0;
let count = 10;
let stop = false;
let dataRs = [];
let sum = 0;
let fileNameSuccess = "";
let listHashRecruitmentID = [];

const listExclusionFlag = ["フォーク","ﾌｫｰｸ"];
const header = [
	// Title of the columns (column_names)
	"募集データID",
	"物件ID",
	"データ取得日",
	"距離条件",
	"除外フラグ",
	"募集主体",
	"提供元",
	"求人タイトル",
	"時給（from）",
	"時給（to）	雇用形態"
];

function contentMethod(options, bukken_id, dateNow, lrad) {
	const a =  request(options, (error, response, html) => {
		let countItem = 0;
		if(!error && response.statusCode == 200) {
			const $ = cheerio.load(html);
			setTimeout(function () {}, 500)
			let data = [];
			countItem = count = $('.pE8vnd.avtvi').length;
			$('.pE8vnd.avtvi').each((index, el) => {
				const jobName = $(el).find('.sH3zFd h2').text();
				const postPerson = $(el).find('.nJlQNd.sMzDkb').text();
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
				salaryMin = formatSalary(salaryMin);
				salaryMax = formatSalary(salaryMax);
				const recruitmentID = "0";
				// create key
				// const recruitmentID = provider + jobName + salaryMin + salaryMax + jobType;
				// const hashRecruitmentID = crypto.createHash('md5').update(recruitmentID).digest('hex');

				// if (listHashRecruitmentID.indexOf(hashRecruitmentID) === -1) {
				// 	listHashRecruitmentID.push(hashRecruitmentID);
					let date = moment(dateNow).format('YYYY-MM-DD');
					let exclusionFlag = "N";
					if (jobName.indexOf(listExclusionFlag[0]) != -1 || jobName.indexOf(listExclusionFlag[1]) != -1) {
						exclusionFlag = "Y";
					}
					let lradStr = lrad === "" ? "2km" : "10km";
					data.push({
						recruitmentID, bukken_id, date, lradStr, exclusionFlag, postPerson, provider, jobName, salaryMin, salaryMax, jobType
					});
				// } else {
				// 	// sum item of file output-- if recruitmentID exists
				// 	countItem > 0 ? countItem-- : (countItem = 0);
				// }
				
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

function formatSalary(salary) {
	if (salary) {
		salary = salary.replace("￥", "");
		salary = salary.replace(",", "");
	}
	return salary;
}

async function asyncCall(req) {
	// input key search
	// let keySearch = "倉庫　軽作業　千葉県流山市";
	const encSear = encodeURI(req.keyword);
	let lrad = req.location != "2" ? ("&lrad=" + IRAD) : ("&lrad=2.0");
	let chips = req.dayPosted != "0" ? ("&chips=date_posted:" + req.dayPosted + "&schips=date_posted;" + req.dayPosted) : ""
	count = 10;
	start = 0;
	sum = 0;
	dataRs = [];
	listHashRecruitmentID = [];
	const dateNow = new Date();
	// when data form gg < 10 record -> stop while
	while(count > 0){
		if (!stop) {
			stop = true;
			const options = {
				uri: 'https://www.google.com/search?yv=3&rciv=jb'+lrad+'&nfpr=0&q='+encSear+'&start='+start+'&asearch=jb_list&async=_id:VoQFxe,_pms:hts,_fmt:pc',
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
					'sec-ch-ua-platform':  "Windows",
					'accept-language':  `ja;q=0.9,fr;q=0.8,de;q=0.7,es;q=0.6,it;q=0.5,nl;q=0.4,sv;q=0.3,nb;q=0.2`
				},
				json: true // Automatically parses the JSON string in the response
			};
			console.log('https://www.google.com/search?yv=3&rciv=jb'+lrad+chips+'&nfpr=0&q='+encSear+'&start='+start+'&asearch=jb_list&async=_id:VoQFxe,_pms:hts,_fmt:pc');
			await contentMethod(options, req.bukken_id, dateNow, lrad);
		}
	}
	if (sum == 0) console.log("data not found!")
	else writeCsv(dataRs, req.keyword, dateNow);
}

// write data to file csv
function writeCsv(jsonObject, keySearch, dateNow) {
	let fileString = ""
	const separator = ","
	const fileType = "csv"
	// example name: 倉庫 軽作業　千葉県流山市_2021-09-22_09-50-06_217.csv
	const date = moment(dateNow).format('YYYY-MM-DD_hh-mm-ss-SSS');
	const fileName = `${keySearch}_${date}_${sum}.${fileType}`;
	const file = `${__dirname}/data/${fileName}`;
	fileNameSuccess = fileName;
	// write header
	header.forEach(value=>fileString += `${value}${separator}`) // ngoặc kép "${value}" để phân biệt khi tiền có dấu ","
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
exports.asyncCall = async function(req){
    await asyncCall(req);
	return {sum: sum, fileName: fileNameSuccess};
}














