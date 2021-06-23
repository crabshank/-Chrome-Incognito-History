var timer;
var links = [];
var innTx = [];
var inProgress = false;
var firstAct=false;

function newGetSend(skipInit){
	if((skipInit) || (!skipInit && firstAct)){
			if (!inProgress) {
				inProgress = true;
				getLinks();
				send(links);
				inProgress = false;
			}
	}else if (!skipInit && !firstAct){
		initialise();
	}
	
}


function removeEls(d, array) {
	var newArray = [];
	for (let i = 0; i < array.length; i++) {
		if (array[i] != d) {
			newArray.push(array[i]);
		}
	}
	return newArray;
}

function initialise() {

	firstAct=(!firstAct)?true:firstAct;
	
	chrome.storage.local.get(null, function(items) {
		if (Object.keys(items).length == 0) {

			chrome.storage.local.set({
				"cgVisCol": "true"
			}, function() {
				chrome.storage.local.set({
					"col": "#9043cc"
				}, function() {
					chrome.storage.local.set({
						"bklist": []
					}, function() {
						chrome.storage.local.get(null, function(items) {

							chrome.runtime.sendMessage({
								type: "SETTINGS",
								items
							}, function(response) {
								if (response.type == "SET") {
									console.log('Initial settings set!');
								}
							});

						});
					});
				});
			});

		}
		getLinks();
		send(links);
	});

	inProgress = false;
}


function getLinks() {

	var lk = [...document.getElementsByTagName('a')];
links = [];
innTx = [];
	for (let i = 0; i < lk.length; i++) {

		if (lk[i].href !== "") {
			links.push(lk[i].href);
		}

		if ((lk[i].innerText !== "") && (!lk[i].getAttribute('incog_hist_marked'))) {
			innTx.push(lk[i].innerText);
		}
	}

	links = Array.from(new Set(links));
	innTx = Array.from(new Set(innTx));


}


window.addEventListener('load',initialise);
//initialise();

function shaderef(u, a,c) { //(array of urls to shade, links array ['A'])
	let toShade=[];
	for (let i = 0; i < a.length; i++) {
		if(u.includes(a[i].href)){
			toShade.push(a[i]);
		}
	}
		for (let i = 0; i < toShade.length; i++) {
			if ((!toShade[i].getAttribute('incog_hist_marked')) || (toShade[i].getAttribute('incog_hist_marked') == "false")) {
				toShade[i].style.color = c;
				toShade[i].innerText =(toShade[i].innerText==='')?toShade[i].innerText: "▶" + toShade[i].innerText;
				toShade[i].setAttribute('incog_hist_marked', true);
				console.groupCollapsed(toShade[i].href + " coloured: ");
				console.log(toShade[i]);
				console.dir(toShade[i]);
				console.groupEnd();
			}
		}
		}

function deShadeRef(u) { //u is an 'A' tag
	for (let j = 0; j < innTx.length; j++) { //OG innerTexts

			if ((u.innerText.charAt(0) === '▶') && ((u.getAttribute('incog_hist_marked') == "true"))) {
				var origITx = u.innerText.slice(1);
			}
			else {
				var origITx = u.innerText;
			}

			if ((innTx[j] == origITx) && ((u.getAttribute('incog_hist_marked') == "true"))) {
				u.setAttribute('incog_hist_marked', false);
				u.innerText = innTx[j];
				u.style.color = 'initial';

			}

	}
}

if ((typeof observer !== "undefined") && (!(observer))) {
	const observer = new MutationObserver((mutations) => {
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			//  console.log('Rescan page links')
			newGetSend(false);
		}, 1000);
	});


	observer.observe(document, {
		attributes: true,
		childList: true,
		subtree: true
	});
}

function send(b) {
	// Send message to background:
	chrome.runtime.sendMessage({
		type: "PG_LINKS",
		b: b
	}, function(response) {});
}

function arrangeShade(request, lnks) {
	let toShade={full:false, arr:null};
	if (typeof request.uniq!=='undefined' && request.uniq.length>0){
		toShade.arr=request.uniq;
				toShade.full=true
	}else if (typeof request.addedHist!=='undefined' && request.addedHist.length>0){
		toShade.arr=request.addedHist;
	}
	
if (!!toShade.arr && lnks.length>0){
	if (typeof request.items!=='undefined'){
chrome.storage.local.set({"col": request.items.col},()=>{
shaderef(toShade.arr,lnks,request.items.col);
	if(toShade.full){
		for(let i=0; i<lnks.length; i++){
			if(!toShade.arr.includes(lnks[i].href)){
				deShadeRef(lnks[i]);
			}
		}
	}
	});
}else{
			shaderef(toShade.arr,lnks,"#9043cc");
				if(toShade.full){
					for(let i=0; i<lnks.length; i++){
						if(!toShade.arr.includes(lnks[i].href)){
						deShadeRef(lnks[i]);
						}
					}
				}
}
}
}


chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {

		switch (request.type) {

			case "URL":
				chrome.storage.local.get(null, function(items) {
					if (Object.keys(items).length == 0) {
						chrome.storage.local.set({
							"col": "#9043cc"
						}, function() {
							shaderef([request.url], [...document.getElementsByTagName('a')],"#9043cc");
						});
					}else {
						shaderef([request.url], [...document.getElementsByTagName('a')],items.col);
					}
				});

				break;


			case "VISITED":
				getLinks();
				arrangeShade(request, [...document.getElementsByTagName('a')]);
			break;

			case "PGDELETED":
				 newGetSend(true);
			break;

			/*case "STDELETED":
				newGetSend(true);
			break;*/

			case "NEWACTIVE_t":
				newGetSend(false);
			break;

			case "NWSETTINGS":
				if (!inProgress) {
					inProgress = true;
					initialise();
				}
			break;

			default:
				//console.log(request);
			break;

		}
		return true;
	});
