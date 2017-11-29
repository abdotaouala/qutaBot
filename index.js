'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
// google search
var google = require('googleapis')
var customsearch = google.customsearch('v1')
const CX = '***************:jn11494mk90'
const CXSO = '****************:-a-blhreslu'
const API_KEY = '*********************'

// wit.ai access token
const wit_token = "Bearer ************"

let PAY_LOAD = ""

const app = express()

// declare const
const keys = ["wiki","gh","so"]

app.set('port', (process.env.PORT || 5000))

// Allows us to process the data | parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// parse application/json
app.use(bodyParser.json())

// Routes

app.get('/', function(req, res){
	res.send("Hi i am QutaBot")
})

// facebook

let token = "TOKEN"

app.get('/webhook/', function(req, res){
	if (req.query['hub.verify_token'] === "QutaBotABDMNR"){
		res.send(req.query['hub.challenge'])
	}
	res.send("Wrong token")
})

app.post('/webhook/', function(req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = messaging_events[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			// traitements l9ass n3aljo ;)
			// get the first word indication
			//let abreger = text.match('[a-zA-Z]+')
			let abreger2 = text.match('\w*help\w*')
			//if(abreger == null) abreger = ""
			if(abreger2 == null) abreger2 = ""
			// delete the first word to return only the question ;)
			
			//sendQuickReplies(sender, "select the type of search you want")
			if(event.message.quick_reply && event.message.quick_reply.payload){
				let payloaded = event.message.quick_reply.payload
				console.log("*** Mounir *** : " + payloaded)
				if(payloaded === "BACK"){
					PAY_LOAD = ""
					sendText(sender, "","", "postback")
					setTimeout(function() {
						sendQuickReplies(sender, "You can search again 👇 👇", "")
					}, 1500)
					
				}else if(payloaded === "SEARCH_GITHUB"){
					PAY_LOAD = "github"
					text = ""
					sendQuickReplies(sender, "Now type the repo\nyou want to serach in Github", "back")
				}else if(payloaded === "SEARCH_SOF"){
					PAY_LOAD = "sof"
					text = ""
					sendQuickReplies(sender, "Now type your error msg 📝", "back")
				}else if(payloaded === "SEARCH_WIKI"){
					PAY_LOAD = "wiki"
					text = ""
					sendQuickReplies(sender, "Now type your word 📝", "back")
				}else if(payloaded === "SEARCH_WEB"){
					PAY_LOAD = "web"
					text = ""
					sendQuickReplies(sender, "Now type your msg error 📝", "back")
				}
			}

			if(PAY_LOAD === ""){
				witai(sender,text)
				
				
				// if(text.trim().toLowerCase() === "hi" || text.trim().toLowerCase() === "hello" || text.trim().toLowerCase() === "hey"){
				// 	//sendQuickReplies(sender, "Hi! How i can help you ?")
					
				// 	sendText(sender, "Hi, you wanna find the best solution for your errors 🕵️")
					
				// 	setTimeout(function() {
				// 		sendQuickReplies(sender, "use one of the button below to start search 👇 👇","")
				// 	}, 1000)
				// }else if(abreger2.toString().toLowerCase() === "help"){
				// 	sendText(sender, "I can help you find the best solution for your bugs 🐞")
				// 	setTimeout(function() {
				// 		sendText(sender, "select one of the buttons bellow to start")
				// 	}, 1000)
					
				// 	setTimeout(function() {
				// 		sendQuickReplies(sender, "then type the problem you want to fix 😉", "")
				// 	}, 1000)
				// }
			}else if(PAY_LOAD === "github"){
				if(text !== ""){
					console.log("github --> text : " + text)
					searchGit(sender, text)
				}
			}else if(PAY_LOAD === "sof"){
				if(text !== ""){
					console.log("stackoverflow --> text : " + text)
					searchStackoverflow(sender, text)
				}
			}else if(PAY_LOAD === "wiki"){
				if(text !== ""){
					console.log("wikipedia --> text : " + text)
					searchWiki(sender, text)
				}
			}else if(PAY_LOAD === "web"){
				if(text !== ""){
					console.log("web --> text : " + text)
					searchGoogle(sender, text)
				}
			}

			/*if(abreger.toString().toLowerCase() === "wiki" || abreger.toString().toLowerCase() === "wikipedia"){ 
				let query = text.replace(abreger, '')
				searchWiki(sender, query)
			}else if(abreger.toString().toLowerCase() === "github" || abreger.toString().toLowerCase() === "git"){
				let query = text.replace(abreger, '')
				searchGit(sender, query)
			}else if(abreger.toString().toLowerCase() === "sof" || abreger.toString().toLowerCase() === "stackoverflow"){
				let query = text.replace(abreger, '')
				searchStackoverflow(sender, query)
			}else if(text.trim().toLowerCase() === "hi" || text.trim().toLowerCase() === "hello"){
				//sendQuickReplies(sender, "Hi! How i can help you ?")
				setTimeout(function() {
					sendText(sender, "Use wiki to search in Wikipedia (ex: wiki java)")
				}, 1000)
				setTimeout(function() {
					sendText(sender, "Use github to search in github (ex: github angular cli)")
				}, 1000)
			}else if(abreger2.toString().toLowerCase() === "help"){
				sendText(sender, "to Search in Google just type your question")
				setTimeout(function() {
					sendText(sender, "Use wiki to search in Wikipedia (ex: wiki java)")
				}, 1000)
				setTimeout(function() {
					sendText(sender, "Use github to search in Github (ex: github angular cli)")
				}, 1000)
			}else if(text != ""){
				//sendText(sender, " error2 : abreger : " + abreger + " | query : " + text)
				searchGoogle(sender, text)
			}*/
			
		}else if (event.postback && event.postback.payload) {
			let payload = event.postback.payload;
			console.log("**mounir** : i am in the postback ")
			if(payload === "YES"){
				sendText(sender,"Thank you  😎 ")
				setTimeout(function() {
					sendQuickReplies(sender, "I will remember your answer")
				}, 1000)
				
			}else if(payload === "NO"){
				sendText(sender,"Thanks ")
				setTimeout(function() {
					sendQuickReplies(sender, "Next time i will be better 💪")
				}, 1000)
			}
		}
	}
	res.sendStatus(200)
})

function sendText(sender, text,link="",msgType="") {
	let messageData = {
		attachment:{
			type: "template",
			payload: {
				template_type: "generic",
			}
		}
	}

	if(msgType === "weburl"){
		messageData.attachment.payload.template_type = "button"
		messageData.attachment.payload.text = text
		messageData.attachment.payload.buttons = [{
			type: "web_url",
			url: link,
			title: "Visit Page",
		}]
		
	}else if(msgType === "postback"){
		messageData.attachment.payload.template_type = "button"
		messageData.attachment.payload.text = "Is this answer helpful ?"
		messageData.attachment.payload.buttons = [{
			type: "postback",
			title: "YES",
			payload: "YES",
		},{
			type: "postback",
			title: "NO",
			payload: "NO",
		}]

	}else if(msgType === "list"){
		messageData.attachment.payload.sharable =  true
		messageData.attachment.payload.elements = []
		let i = 0
		let elem = []
		while(text[i] != null){
			if(i<3){
				let obj = {
					title:text[1][i],
					subtitle:text[2][i],
					buttons:[
					  {
						type:"web_url",
						url:text[3][i],
						title:"Visit page"
					  }              
					]
				}
				elem.push(obj)
			}else{
				break
			}
			i++
		}
		messageData.attachment.payload.elements = elem

	}else if(msgType === "listgit"){
		messageData.attachment.payload.sharable =  true
		messageData.attachment.payload.elements = []
		let i = 0
		let elem = []
		while(text.items[i] != null){
			if(i<3){
				let obj = {
					title: text.items[i].full_name,
					image_url: text.items[i].owner.avatar_url,
					subtitle: text.items[i].description,
					buttons:[
					  {
						type:"web_url",
						url: text.items[i].html_url,
						title:"Visit Repository"
					  } 
					]      
				  }
				elem.push(obj)
			}else{
				break
			}
			i++
		}
		messageData.attachment.payload.elements = elem

	}else if(msgType === "listsof"){
		messageData.attachment.payload.sharable =  true
		messageData.attachment.payload.elements = []
		let imgurl = "http://i67.tinypic.com/vyxzth.jpg"
		let img = {cse_image : [{src : imgurl}]}
		let i = 0
		let elem = []
		while(text.items[i] != null){
			console.log("Mounir testing values : " + JSON.stringify(text.items[i]))
			if(i<3){
				if(text.items[i].pagemap.cse_image == undefined){text.items[i].pagemap = img}
				if(text.items[i].snippet == undefined){text.items[i].snippet = "No Description"}
				let obj = {
					title: text.items[i].title,
					image_url: text.items[i].pagemap.cse_image[0].src,
					subtitle: text.items[i].snippet,
					buttons:[
					  {
						type:"web_url",
						url: text.items[i].link,
						title:"Visit Page"
					  } 
					]      
				  }
				elem.push(obj)
			}else{
				break
			}
			i++
		}
		messageData.attachment.payload.elements = elem

	}else{
		messageData = {text: text}
	}
	
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : {access_token: token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message : messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log("sending error")
		} else if (response.body.error) {
			console.log("response body error : " + JSON.stringify(response.body))
		}
	})
}

function sendQuickReplies(sender, text,type=""){
	let quickr
	if(type === "back"){
		quickr = {
			text : text,
			quick_replies : [
				{
					content_type: "text",
					title: " 🔙 Back",
					payload: "BACK"
				}
			  ]
		}
	}else{
		quickr = {
			text : text,
			quick_replies : [
				{
					content_type: "text",
					title: "Search in Github",
					payload: "SEARCH_GITHUB",
					image_url: "https://assets-cdn.github.com/images/modules/logos_page/Octocat.png"
				},{
					content_type: "text",
					title: "Search in Stackoverflow",
					payload: "SEARCH_SOF",
					image_url: "https://cdn.sstatic.net/Sites/stackoverflow/company/img/logos/so/so-icon.png"
				},{
					content_type: "text",
					title: "Search in Wikipedia",
					payload: "SEARCH_WIKI",
					image_url: "https://fr.wikipedia.org/static/images/project-logos/frwiki.png"
				},{
					content_type: "text",
					title: "Search in the Web",
					payload: "SEARCH_WEB",
					image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/2000px-Google_%22G%22_Logo.svg.png"
				}
			]
		}
	}

	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : {access_token: token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message : quickr,
		}
	}, function(error, response, body) {
		if (error) {
			console.log("sending error")
		} else if (response.body.error) {
			console.log("Quick replies error : response body error : " + JSON.stringify(response.body))
		}
	})
}

app.listen(app.get('port'), function(){
	console.log(" running port")
})

// functions

function searchGoogle(sender, query){
	customsearch.cse.list({ cx: CX, q: query, auth: API_KEY }, function (err, resp) {
		if (err) {
			sendText(sender, "An error occured : " + err)
			//return 'An error occured' + err
		}
		// Got the response from custom search
		//console.log('Result: ' + resp.searchInformation.formattedTotalResults);
		if (resp.items && resp.items.length > 0) {
			sendText(sender, resp, resp.items[0].link,"listsof")
			setTimeout(function() {
				sendQuickReplies(sender, " 👆 👆 ", "back")
			}, 1500)
		}else{
			sendQuickReplies(sender, " ✖️ No solution found try again :) ", "back")
		}
	  });
}

function searchWiki(sender, query){
	let q = query.replace(" ","_")
	let lurl = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+ query +"&format=json"

	request({
		url: lurl,
		method: "GET",
		json: true
	}, function(error, response, body) {
		if (error) {
			console.log("wiki sending error")
		}else if (response.body.error) {
			console.log("response body error : " + JSON.stringify(response.body))
			sendText(sender, "No articles found !")
		}else if(body.length < 0){
			sendText(sender, "No articles found !")
			setTimeout(function() {
				sendQuickReplies(sender, " ✖️ ", "back")
			}, 1000)
		}else{
			//if(body[2][1] != null) sendText(sender, " " + body[2][1] , body[3][0],"weburl")
			sendText(sender, body , body[3][0],"list")
			setTimeout(function() {
				sendQuickReplies(sender, " ✔️ ", "back")
			}, 1000)
			
		}
	})

}

function searchGit(sender, query){
	let q = query.replace(" ","+")
	let lurl = "https://api.github.com/search/repositories?q=" + q

	request({
		url: lurl,
		method: "GET",
		headers: {
			'User-Agent': 'MounirABD'
		},
		json: true
	}, function(error, response, body) {
		//console.log("**Mounir** : " + JSON.stringify(body))
		if (error) {
			console.log("wiki sending error")
		}else if (response.body.error) {
			console.log("response body error : " + JSON.stringify(response.body))
			sendText(sender, "No repositories found !")
		}else if(body.items.length < 0){
			sendText(sender, "No repositories found !")
		}else{
			//if(body.items[0] != null) sendText(sender, "Name : " + body.items[0].name + "\nOwner : " + body.items[0].owner.login + "\nDescription : " + body.items[0].description, body.items[0].html_url,"listgit")
			if(body.items[0] != null) {
				sendText(sender, body, " ", "listgit")
				setTimeout(function() {
					sendQuickReplies(sender, " ✔️ ", "back")
				}, 2000)
			}else{
				sendText(sender, " Oops! i didn\'t find the repository that you\'r looking for")
				setTimeout(function() {
					sendText(sender, " You can try again :) ")
				}, 1000)
				setTimeout(function() {
					sendQuickReplies(sender, " ✖️ ", "back")
				}, 1000)
				
			}
		}
	})

}

function searchStackoverflow(sender, query){
	customsearch.cse.list({ cx: CXSO, q: query, auth: API_KEY }, function (err, resp) {
		if (err) {
			sendText(sender, "An error occured : " + err)
			//return 'An error occured' + err
		}
		// Got the response from custom search
		//console.log('Result stackoverflow ---> : ' + JSON.stringify(resp));
		if (resp.items && resp.items.length > 0) {
			sendText(sender, resp, resp.items[0].link,"listsof")
			setTimeout(function() {
				sendQuickReplies(sender, " ✔️ ", "back")
			}, 1500)
		}else{
			sendQuickReplies(sender, " ✖️ No solution found try again :) ", "back")
		}
	  });
}

function witai(sender, text){
	let lurl = "https://api.wit.ai/message?v=26/11/2017&q=" + text
	//var dataEntities = {}
		request({
			url: lurl,
			method: "GET",
			headers: {
				'Authorization': wit_token
			},
			json: true
		}, function(error, response, body) {
			//console.log("**Mounir** : " + JSON.stringify(body))
			if (error) {
				console.log("wit.ai sending error")
			}else if (response.body.error) {
				console.log("response body error : " + JSON.stringify(response.body))
				sendText(sender, "Sorry, I didn't understand your question !")
			}else if(Object.keys(body.entities).length == 0){
				sendText(sender, "Sorry, I didn't understand what you mean !")
			}else{

				if(body.entities !== null && body.entities !== undefined){
					
					let elem = Object.keys(body.entities)[0]

					if(elem === "greetings"){
						sendText(sender, "Hi, i can find the best solution for your errors 🕵️")
						setTimeout(function() {
							sendQuickReplies(sender, "just choise one of the button below to start search 👇 👇","")
						}, 1000)
					}else if(elem === "help"){
						sendText(sender, "I can help you find the best solution for your bugs 🐞")
						setTimeout(function() {
							sendText(sender, "select one of the buttons bellow to start")
						}, 500)
						setTimeout(function() {
							sendQuickReplies(sender, "then type the problem you want to fix 😉", "")
						}, 1200)
					}else if(elem === "bye"){
						//sendText(sender, "See you later 🙂")
						setTimeout(function() {
							sendQuickReplies(sender, "See you later 🙂 ","")
						}, 500)
					}
				}

				console.log("**Mounir** return entities : " + JSON.stringify(body.entities))
			}
			
		})

}

function getAbreger(text){
	return text.match('[a-zA-Z]+')
}
