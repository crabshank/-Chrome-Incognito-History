var timer;
var links = [];
var linkTags= [];
var firstAct=false;

function getTagNameShadow(docm, tgn){
var shrc=[docm];
var out=[];
var shrc_l=1;

let srCnt=0;

while(srCnt<shrc_l){
	allNodes=[shrc[srCnt],...shrc[srCnt].querySelectorAll('*')];
	for(let i=0, len=allNodes.length; i<len; i++){
		if(!!allNodes[i] && typeof allNodes[i] !=='undefined' && allNodes[i].tagName===tgn){
			out.push(allNodes[i]);
		}

		if(!!allNodes[i].shadowRoot && typeof allNodes[i].shadowRoot !=='undefined'){
			let c=allNodes[i].shadowRoot.children;
			shrc.push(...c);
		}
	}
	srCnt++;
	shrc_l=shrc.length;
}
	shrc=shrc.slice(1);
	let srv=shrc.filter((c)=>{return c.tagName===tgn;});
	out.push(...srv);
	
	return out;
}

function newGetSend(skipInit){
	if((skipInit) || (!skipInit && firstAct)){
				getLinks();
				send(links);

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

	});

firstAct=(!firstAct)?true:firstAct;

getLinks();
send(links);

}


function getLinks() {

	var lk = getTagNameShadow(document,'A');
	linkTags=lk;
links = lk.filter((lnk)=>{
	return (!!lnk.href && typeof lnk.href!=='undefined' && lnk.href!=='');
}).map(function(lnk) {
      return lnk.href;
});

	links = Array.from(new Set(links));
}


window.addEventListener('load',initialise);
//initialise();

function shaderef(u, a,c) { //(array of urls to shade, link tags array ['A'], color)
if(!!u && typeof u!=='undefined' && !!a && typeof a!=='undefined'){
	let toShade=a.filter((lkTg)=>{
		return u.includes(lkTg.href);
	});

			for (let i = 0; i < toShade.length; i++) {
			if ((!toShade[i].getAttribute('incog_hist_marked')) || (toShade[i].getAttribute('incog_hist_marked') === "false")) {
			toShade[i].style.setProperty('outline-color', c, 'important');
			toShade[i].style.setProperty('outline-width', '1px', 'important');
			toShade[i].style.setProperty('outline-style', 'outset', 'important');
			toShade[i].style.setProperty('box-shadow', '0em 0em 8px 2px '+c, 'important');
						toShade[i].style.setProperty('color', c, 'important');
			//toShade[i].style.setProperty('background-color', c, 'important');
			//toShade[i].style.setProperty('background-clip', 'content-box', 'important');
			
			let toShadChld=[...toShade[i].children];
			
				for (let k = 0; k < toShadChld.length; k++) {
					toShadChld[k].style.setProperty('color', c, 'important');
				}
			
				toShade[i].setAttribute('incog_hist_marked', true);
				console.groupCollapsed(toShade[i].href + " coloured: ");
				console.log(toShade[i]);
				console.dir(toShade[i]);
				console.groupEnd();
			}
		}
	
}
		}

function deShadeRef(u) { //u is an 'A' tag

			if ((u.getAttribute('incog_hist_marked') == "true") || (!!u.getAttribute('incog_hist_marked'))) {
			u.setAttribute('incog_hist_marked', false);

			u.style.setProperty('outline-color','unset');
			u.style.setProperty('outline-width', 'unset');
			u.style.setProperty('outline-style','unset');
			u.style.setProperty('box-shadow','unset');
			u.style.setProperty('color','unset');
			//u.style.setProperty('background-color','unset');
			//u.style.setProperty('background-clip','unset');
			
						let uChld=[...u.children];
			
				for (let k = 0; k < uChld.length; k++) {
					uChld[k].style.setProperty('color','unset');
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

function arrangeShade(request, lnkTgs) {
	
		let toShade=null;
	if (typeof request.uniq!=='undefined' && request.uniq.length>0){
		toShade=request.uniq;
	}else if (typeof request.addedHist!=='undefined' && request.addedHist.length>0){
		toShade=request.addedHist;
	}
	
	if (!!toShade && lnkTgs.length>0){
		
			if (typeof request.items!=='undefined'){
chrome.storage.local.set({"col": request.items.col},()=>{
shaderef(toShade,lnkTgs,request.items.col);
	});
}else{
		shaderef(toShade,lnkTgs,"#9043cc");
	}

}
}

function arrangeDeshade(request) {
	if(request.all){
		for (let i = 0; i < linkTags.length; i++) {
		deShadeRef(linkTags[i]);
		}
	}else{
		let reqLk=linkTags.filter((lnk)=>{return lnk.href===request.delLink});
				for (let i = 0; i < reqLk.length; i++) {
		deShadeRef(reqLk[i]);
		}
	}
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {

		switch (request.type) {
			
			case "VISITED":
				getLinks();
				arrangeShade(request, linkTags);
				
			break;

			case "PGDELETED":
				getLinks();
				arrangeDeshade(request);
			break;

			/*case "STDELETED":
				newGetSend(true);
			break;*/

			case "NEWACTIVE_t":
				newGetSend(false);
			break;

			case "NWSETTINGS":
					initialise();
			break;

			default:
				//console.log(request);
			break;

		}
		return true;
	});
