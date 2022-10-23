var links = [];
var linkTags= [];
var firstAct=false;
var incog_hist_marked=[];
//var last_a=false;

/*function isValid_A(el){
	return ( (el.tagName==='A' && el.href!==null && typeof el.href!=='undefined' && el.href!=='')? true : false );
}*/

function keepMatchesShadow(els,slc,isNodeName){
   if(slc===false){
      return els;
   }else{
      let out=[];
   for(let i=0, len=els.length; i<len; i++){
      let n=els[i];
           if(isNodeName){
	            if((n.nodeName.toLocaleLowerCase())===slc){
	                out.push(n);
	            }
           }else{ //selector
	               if(!!n.matches && typeof n.matches!=='undefined' && n.matches(slc)){
	                  out.push(n);
	               }
           }
   	}
   	return out;
   	}
}

function getMatchingNodesShadow(docm, slc, isNodeName, onlyShadowRoots){
slc=(isNodeName && slc!==false)?(slc.toLocaleLowerCase()):slc;
var shrc=[docm];
var shrc_l=1;
var out=[];
let srCnt=0;

while(srCnt<shrc_l){
	let curr=shrc[srCnt];
	let sh=(!!curr.shadowRoot && typeof curr.shadowRoot !=='undefined')?true:false;
	let nk=keepMatchesShadow([curr],slc,isNodeName);
	let nk_l=nk.length;
	
	if( !onlyShadowRoots && nk_l>0){  
		out.push(...nk);
	}
	
	shrc.push(...curr.childNodes);
	
	if(sh){
		   let cs=curr.shadowRoot;
		   let csc=[...cs.childNodes];
			   if(onlyShadowRoots){
			      if(nk_l>0){
			       out.push({root:nk[0], childNodes:csc});
			      }
			   }
			   shrc.push(...csc);
	}

	srCnt++;
	shrc_l=shrc.length;
}

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

function initialise() {

	if(!firstAct){
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

		firstAct=true;

		getLinks();
		send(links);
	}
}


function getLinks() {
var lk = getMatchingNodesShadow(document,'A',true,false);
linkTags= lk.filter((lnk)=>{
	return (!!lnk.href && typeof lnk.href!=='undefined' && lnk.href!=='');
});
links = linkTags.map(function(lnk) {
      return lnk.href;
});

	links = Array.from(new Set(links));
}

function shaderef(u, a,c) { //(array of urls to shade, link tags array ['A'], color)
if(!!u && typeof u!=='undefined' && !!a && typeof a!=='undefined'){
	let toShade=a.filter((lkTg)=>{
		return u.includes(lkTg.href);
	});

			for (let i = 0; i < toShade.length; i++) {
			if (!incog_hist_marked.map((a)=>{return a.el;}).includes(toShade[i])) {
							let wcs=window.getComputedStyle(toShade[i]);
							
							let a_obj={el: toShade[i], chld:[]};
							
			
			/*a_obj['og_outline-color']=wcs['outline-color'];
			a_obj['og_outline-width']=wcs['outline-width'];
			a_obj['og_outline-style']=wcs['outline-style'];*/
			a_obj['og_box-shadow']=wcs['box-shadow'];
			a_obj['og_color']=wcs['color'];
			a_obj['og_border']=wcs['border'];
			
			/*toShade[i].style.setProperty('outline-color', c, 'important');
			toShade[i].style.setProperty('outline-width', '1px', 'important');
			toShade[i].style.setProperty('outline-style', 'outset', 'important');*/
			toShade[i].style.setProperty('box-shadow', '0em 0em 8px 2px '+c, 'important');
			toShade[i].style.setProperty('color', c, 'important');
			toShade[i].style.setProperty('border', c+ ' 1px outset', 'important');
			
			let toShadChld=[...toShade[i].children];
			
				for (let k = 0; k < toShadChld.length; k++) {
					wcsc=window.getComputedStyle(toShadChld[k]);
					a_obj.chld.push({el: toShadChld[k], color: wcsc['color']})
					toShadChld[k].style.setProperty('color', c, 'important');
				}
			
				incog_hist_marked.push(a_obj);
				console.groupCollapsed(toShade[i].href + " coloured: ");
				console.log(toShade[i]);
				console.dir(toShade[i]);
				console.groupEnd();
			}
		}
	
}
		}

function deShadeRef(u) { //u is an 'A' tag
			let ix=incog_hist_marked.findIndex((a)=>{return a.el.isSameNode(u);}); if (ix>=0) {
				
			let obj=incog_hist_marked[ix];
			
			/*u.style.setProperty('outline-color',obj['og_outline-color']);
			u.style.setProperty('outline-width',obj['og_outline-width']);
			u.style.setProperty('outline-style',obj['og_outline-style']);*/
			u.style.setProperty('box-shadow',obj['og_box-shadow']);
			u.style.setProperty('color',obj['og_color']);
			u.style.setProperty('border',obj['og_border']);

						let uChld=[...u.children];
			
				for (let k = 0; k < uChld.length; k++) {
					let ixc=obj.chld.findIndex((a)=>{return a.el.isSameNode(uChld[k]);}); if (ixc>=0) {
						uChld[k].style.setProperty('color',obj.chld[ixc]['color']);
					}
				}

				incog_hist_marked=incog_hist_marked.filter((a)=>{return a.el!==u;});
			}
}


function send(b) {
	if(b.length>0){
		// Send message to background:
		chrome.runtime.sendMessage({
			type: "PG_LINKS",
			b: b
		}, function(response) {});
	}
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
				shaderef(toShade,lnkTgs,request.items.col);
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
			case "nav":
				newGetSend(false);
			break;

			case "NWSETTINGS":
					firstAct=false;
					initialise();
			break;

			default:
				//console.log(request);
			break;

		}
		return true;
});


if (
  (document.readyState === "complete") ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  initialise();
} else {
  document.addEventListener("DOMContentLoaded", initialise);
}


	if(typeof observer ==="undefined" && typeof timer ==="undefined"){
			var timer;
			var timer_tm=null;
		const observer = new MutationObserver((mutations) =>
		{
			if(timer){
				clearTimeout(timer);
				if(performance.now()-timer_tm>=200){
					newGetSend(false);
					timer_tm=performance.now();
				}
			}
			
			timer = setTimeout(() =>
			{
				newGetSend(false);
				timer_tm=performance.now();
			}, 100);
			
			if(timer_tm ===null){
				timer_tm=performance.now();
			}
		});


		observer.observe(document, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeOldValue: true,
			characterData: true,
			characterDataOldValue: true
		});
	}

/*
Exhaustive:

if (typeof observer === "undefined") {
	const observer = new MutationObserver((mutations) => {
	
		let fnd=false;
			
		for(let i=0, len=mutations.length; i<len;i++){
			let t=mutations[i];
			if(isValid_A(t.target)){
				fnd=true;
				last_a=true;
				i=len-1;
			}else{
				let d=[...t.addedNodes];
				let ix=d.findIndex((n)=>{return isValid_A(n); } ); if(ix>=0){
					fnd=true;
					last_a=true;
					i=len-1;
				}
			}
		}
				
		if(last_a){
			newGetSend(false);
			last_a=(!fnd)?false:last_a;
		}
			
	});

		observer.observe(document, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeOldValue: true,
			characterData: true,
			characterDataOldValue: true
		});

}*/
