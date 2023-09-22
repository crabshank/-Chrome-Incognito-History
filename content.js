var links = [];
var linkTags= [];
var firstAct=false;
var incog_hist_marked=[];
var logged=[];
var logged_hist=[];
var addrs=[];
var slctrs=[];
var extScroll=[null,false];

//var last_a=false;

/*function isValid_A(el){
	return ( (el.tagName==='A' && el.href!==null && typeof el.href!=='undefined' && el.href!=='')? true : false );
}*/

function removeEls(d, arr) {
    return arr.filter((a)=>{return a!==d});
}

function findIndexTotalInsens(string, substring, index) {
    string = string.toLocaleLowerCase();
    substring = substring.toLocaleLowerCase();
    for (let i = 0; i < string.length ; i++) {
        if ((string.includes(substring, i)) && (!(string.includes(substring, i + 1)))) {
            index.push(i);
            break;
        }
    }
    return index;
}

function absBoundingClientRect(el){
	let st = [window?.scrollY,
					window?.pageYOffset,
					el?.ownerDocument?.documentElement?.scrollTop,
					document?.documentElement?.scrollTop,
					document?.body?.parentNode?.scrollTop,
					document?.body?.scrollTop,
					document?.head?.scrollTop];
					
		let sl = [window?.scrollX,
						window?.pageXOffset,
						el?.ownerDocument?.documentElement?.scrollLeft,
						document?.documentElement?.scrollLeft,
						document?.body?.parentNode?.scrollLeft,
						document?.body?.scrollLeft,
						document?.head?.scrollLeft];
						
				let scrollTop=0;
				for(let k=0; k<st.length; k++){
					if(!!st[k] && typeof  st[k] !=='undefined' && st[k]>0){
						scrollTop=(st[k]>scrollTop)?st[k]:scrollTop;
					}
				}			

				let scrollLeft=0;
				for(let k=0; k<sl.length; k++){
					if(!!sl[k] && typeof  sl[k] !=='undefined' && sl[k]>0){
						scrollLeft=(sl[k]>scrollLeft)?sl[k]:scrollLeft;
					}
				}
	
	const rct=el.getBoundingClientRect();
	let r={};

	r.left=rct.left+scrollLeft;
	r.right=rct.right+scrollLeft;
	r.top=rct.top+scrollTop;
	r.bottom=rct.bottom+scrollTop;
	r.height=rct.height;
	r.width=rct.width;
	
	return r;
}

function blacklistMatch(arr, t) {
    var found = false;
	var blSite='';
	var blSel='';
    if (!((arr.length == 1 && arr[0] == "") || (arr.length == 0))) {
        ts = t.toLocaleLowerCase();
        for (var i = 0; i < arr.length; i++) {
            let spl = arr[i].split('*');
            spl = removeEls("", spl);

            var spl_mt = [];
            for (let k = 0; k < spl.length; k++) {
                var spl_m = [];
                findIndexTotalInsens(ts, spl[k], spl_m);

                spl_mt.push(spl_m);


            }

            found = true;

            if ((spl_mt.length == 1) && (typeof spl_mt[0][0] === "undefined")) {
                found = false;
            } else if (!((spl_mt.length == 1) && (typeof spl_mt[0][0] !== "undefined"))) {

                for (let m = 0; m < spl_mt.length - 1; m++) {

                    if ((typeof spl_mt[m][0] === "undefined") || (typeof spl_mt[m + 1][0] === "undefined")) {
                        found = false;
                        m = spl_mt.length - 2; //EARLY TERMINATE
                    } else if (!(spl_mt[m + 1][0] > spl_mt[m][0])) {
                        found = false;
                    }
                }

            }
            if(found){
            		blSite = arr[i];
					blSel = slctrs[i];
					i = arr.length - 1;
            }
        }
    }
    //console.log(found);
    return [found,blSite,blSel];

}

var isCurrentSiteBlacklisted = function()
{
		return blacklistMatch(addrs, window.location.href);
};

var tl={};

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
	
	for(let i=0, len=curr.childNodes.length; i<len; i++){
		shrc.push(curr.childNodes[i]);
	}
	
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
				let setObj={}

				if(!!items.cgVisCol && typeof  items.cgVisCol!=='undefined'){
					setObj["cgVisCol"]=items.cgVisCol;
				}else{
					setObj["cgVisCol"]='true';
				}
				
				if(!!items.col && typeof  items.col!=='undefined'){
					setObj["col"]=items.col;
				}else{
					setObj["col"]='#9043cc';
				}
				
				if(!!items.bklist && typeof  items.bklist!=='undefined'){
					setObj["bklist"]=items.bklist;
				}else{
					setObj["bklist"]='[]';
				}
				
				if(!!items.slc_list && typeof  items.slc_list!=='undefined'){
					setObj["slc_list"]=items.slc_list;
					slctrs=JSON.parse(items.slc_list);
				}else{
					setObj["slc_list"]='[]';
				}
				if(!!items.addrs_list && typeof  items.addrs_list!=='undefined'){
					setObj["addrs_list"]=items.addrs_list;
					addrs=JSON.parse(items.addrs_list);
				}else{
					setObj["addrs_list"]='[]';
				}	
				
						chrome.storage.local.set(setObj, function() {
							chrome.storage.local.get(null, function(items) {
								chrome.runtime.sendMessage({
									type: "SETTINGS",
									items
								}, function(response) {
									if (response.type == "SET") {
										//console.log('Initial settings set!');
										tl={top:null, left:null, el:null, forceDisable:false, isBl:isCurrentSiteBlacklisted(), lastConsole:null};
										
										
												firstAct=true;
												
												chrome.runtime.onMessage.addListener(
											function(request, sender, sendResponse) {
												if(typeof request.add_hist_bk!=='undefined'){
													tl.forceDisable=true;
												}
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
													
													case "chkLnkH": //forced recount
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

										window.addEventListener('scroll',(e)=>{
											if(extScroll[0]===true){
												extScroll[0]=false;
											}else if(extScroll[0]===false && extScroll[1]===true){
												tl.forceDisable=true;
											}
										});

												
												getLinks();
												send(links);
									}
								});
							});
						});
		});
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

function scrollShade(){
		let isNullEl=tl.el;
		let tpl={top:tl.top, left: tl.left}
		tl.top=null;
		tl.left=null;
		
	for (let i = 0; i < incog_hist_marked.length; i++) {
			let elm= incog_hist_marked[i].el;
			if(tl.isBl[0] && elm.matches(tl.isBl[2])){
					let aRct=absBoundingClientRect(elm);
					let asgn=false;
					if(isNullEl===null){
						asgn=true;
					}else if(aRct.top<tpl.top && tpl.top!==null){
						asgn=true;
					}else if( aRct.top===tpl.top  && tpl.top!==null && aRct.left<tpl.left && tpl.left!==null){
						asgn=true;
					}
					if(asgn){
						tl.top=aRct.top;
						tl.left=aRct.left;
						tl.el=elm;
						isNullEl=elm;
					}
					
				}
	}
	
		if(tl.el!==null){
			extScroll[0]=(!extScroll[0] || extScroll[0]==null)?true:extScroll[0];
			tl.el.scrollIntoView({behavior: "auto", block: 'center', inline: "start"});
			if(tl.el!==tl.lastConsole){
				tl.lastConsole=tl.el;
				console.group('Incognito History — CSS-matched link scrolled to:');
					console.log('Scrolled to:');
					console.log(tl.el);
					console.dir(tl.el);
				console.groupEnd();
			}
		}
		extScroll[1]=true;
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
				
				let lgix=logged.findIndex((l)=>{return l===toShade[i];});
				if(lgix<0){
					logged.push(toShade[i]);
					console.groupCollapsed(toShade[i].href + " coloured: ");
					console.log(toShade[i]);
					console.dir(toShade[i]);
					console.groupEnd();
				}	
				
				lgix=logged_hist.findIndex((l)=>{return l===toShade[i];});
				if(lgix<0){
					logged_hist.push(toShade[i]);
					chrome.runtime.sendMessage({
						type: "shd_lks",
						cnt: logged_hist.length
					}, function(response) {});
				}
			}
		}
}
	if(!tl.forceDisable){
		scrollShade();
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
				logged_hist=logged_hist.filter((l)=>{return l!==u;});
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
	let lhl=logged_hist.length;
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
					
				if(lhl!==logged_hist.length){
					chrome.runtime.sendMessage({
						type: "shd_lks",
						cnt: logged_hist.length
					}, function(response) {});
				}
}


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
