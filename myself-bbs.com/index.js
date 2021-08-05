const { exec } = require("child_process");
const fetch = require("node-fetch")
const jsdom = require("jsdom")
const { JSDOM } = jsdom

const url = "https://myself-bbs.com/thread-46593-1-1.html"

const fs = require('fs');
const dir = '../video';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// define functions
const analyze = async () => {

	const res = await fetch(url)
	const result = await res.text()
	const dom = new JSDOM(result)
	const array = dom.window._document.getElementsByClassName("main_list")
	const table = array[0].querySelectorAll("a")
	let episodes = 1;
	let target = "";
	let fragment = url.split(/\/|-/g);
	console.log(fragment)
	let next = false
	for(const index in fragment){
		if(next === true){
			target=fragment[index]
			break;
		}
		if(fragment[index] === "thread"){
			next = true;
		}
	}
	console.log(target)
	
	let downloadList = []

	for (const node of table) {
		if (node.hasAttribute("href")) {
			if (node.getAttribute("href") === "javascript:;") {
				console.log(node.text)
				const raw = await fetch(`https://v.myself-bbs.com/vpx/${target}/${stringParse(episodes)}`)
				const response = await raw.json();
				
				downloadList.push(download(`${response["host"][0]['host']}${response["video"]["720p"]}`,`../video/"${node.text}".mp4`))
				episodes++
				break;
			}
		}
	}
	try{
		const result = await Promise.all(downloadList)
	}catch(err){
		console.log('Download Intteruptted')
	}
	
}

const stringParse = (value)=>{
	const word = value.toString().length;
	let toReturn = ""
	for(let i = 0;i < 3 - word;++i){
		toReturn = toReturn + "0"
	}
	toReturn = toReturn + value.toString()
	return toReturn
}

const download = async (m3u8_url, filename) => {
	console.log(`url: ${m3u8_url}`)
	console.log(`fileName: ${filename}`)
	exec(`ffmpeg -i ${m3u8_url} -c copy ${filename}`, (error, stdout, stderr) => {
		if (error) {
			console.log(`error: ${error.message}`);
			return;
		}
		if (stderr) {
			console.log(`stderr: ${stderr}`);
			return;
		}
		console.log(`stdout: ${stdout}`)
	})
}

analyze();
