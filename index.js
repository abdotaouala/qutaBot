'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
// google search
var google = require('googleapis')
var customsearch = google.customsearch('v1')
const CX = '002528928840247269812:jn11494mk90'
const API_KEY = 'AIzaSyCYZXiSOBwJxjFBCyLGavuFD1hCHAL3mIM'

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

let token = "EAAcTJWkRoR8BAHVbnbO5XafM7ZB7LO0lXXG3YOOKtNaMzZAEISZCLr6Wm3grDoGZB7843Gg0XpwcEQuyXCcIZB6kXvr8sKvIpUlKZCQDZAZASIhyLZC2ZCQDHnnqzb8mUHJBlZCpFxoCKnNmLq40naY82pxi8fqz27gC5oQ7yy5n30VksdI2oFMyitc"

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
			let abreger = text.match('[a-zA-Z]+')
			let abreger2 = text.match('\w*help\w*')
			if(abreger == null) abreger = ""
			if(abreger2 == null) abreger2 = ""
			// delete the first word to return only the question ;)
			
			if(abreger.toString().toLowerCase() === "wiki"){ 
				let query = text.replace(abreger, '')
				searchWiki(sender, query)
			}else if(abreger.toString().toLowerCase() === "github"){
				let query = text.replace(abreger, '')
				searchGit(sender, query)
			}else if(text.trim().toLowerCase() === "hi" || text.trim().toLowerCase() === "hello"){
				sendText(sender, "Hi! How i can help you ?")
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
			}
			
		}else if (event.postback && event.postback.payload) {
			let payload = event.postback.payload;
			console.log("**mounir** : i am in the postback ")
			if(payload === "YES"){
				sendText(sender,"Thanks, we save your answer")
			}else if(payload === "NO"){
				sendText(sender,"Thanks, Next time we will be better")
			}
		}
	}
	res.sendStatus(200)
})

function sendText(sender, text,link="",msgType="") {
	let messageData = null
	if(msgType === "weburl"){
		messageData = {
			attachment:{
				type: "template",
				payload: {
					template_type: "button",
					text: text,
					buttons: [{
						type: "web_url",
						url: link,
						title: "Visit Page",
					}]
				}
			}
		}
	}else if(msgType === "postback"){
		messageData = {
			attachment:{
				type: "template",
				payload: {
					template_type: "button",
					text: "Is this answer helpful ?",
					buttons: [{
						type: "postback",
						title: "YES",
						payload: "YES",
					},{
						type: "postback",
						title: "NO",
						payload: "NO",
					}]
				}
			}
		}
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
			sendText(sender, "Result : " + resp.items[0].title, resp.items[0].link,"weburl")
			setTimeout(function() {
				sendText(sender, "Result : " + resp.items[0].title, resp.items[0].link, "postback")
			}, 1000)
			
			//return 'First result name is ' + resp.items[0].title
		}
	  });
}

function searchWiki(sender, query){
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
		}else{
			//if(body[2][0] != null)sendText(sender, "1) " + body[2][0], body[3][0],"weburl")
			if(body[2][1] != null) sendText(sender, " " + body[2][1] , body[3][0],"weburl")
			setTimeout(function() {
				if(body[2][2] != null) sendText(sender, " " + body[2][2] , body[3][0],"weburl")
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
		console.log("**Mounir** : " + JSON.stringify(body))
		if (error) {
			console.log("wiki sending error")
		}else if (response.body.error) {
			console.log("response body error : " + JSON.stringify(response.body))
			sendText(sender, "No repositories found !")
		}else if(body.items.length < 0){
			sendText(sender, "No repositories found !")
		}else{
			if(body.items[0] != null) sendText(sender, "Name : " + body.items[0].name + "\nOwner : " + body.items[0].owner.login + "\nDescription : " + body.items[0].description, body.items[0].html_url,"weburl")
		}
	})

}

function getAbreger(text){
	return text.match('[a-zA-Z]+')
}