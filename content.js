	var timer;
        var links = [];
		var innHT=[];
		var inProgress=false;
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
	
chrome.storage.local.set({"cgVisCol":"true"}, function(){
	chrome.storage.local.set({"col":"#9043cc"}, function(){
		chrome.storage.local.set({"bklist":[]}, function(){
			chrome.storage.local.get(null, function(items) {
				
			chrome.runtime.sendMessage({
                type: "SETTINGS",
                items
        }, function(response) {
                if(response.type == "SET") {
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

inProgress=false;
}
 

 function getLinks(){
	 
        var lk = document.getElementsByTagName('a');

        for(let i = 0; i < lk.length; i++) {

if (lk[i].href!==""){
                links.push(lk[i].href);
}

if ((lk[i].innerHTML!=="")&&(!lk[i].getAttribute('incog_hist_marked'))){
                innHT.push(lk[i].innerHTML);
}
        }
	 
	links=Array.from(new Set(links));
	innHT=Array.from(new Set(innHT));

	 
 }
 
 

initialise();


/*
function shade(u,a){
		  for (var i=0;i<u.length;i++){
		  for (var j=0;j<a.length;j++){
if (u[i]==a[j].href){
	a[j].style.color='#9043cc';

  }
}
		  }
}
*/

function shaderef(u, c) {
        var lk = document.getElementsByTagName('a');

        for(let i = 0; i < lk.length; i++) {

                if(u == lk[i].href) {
					

						if ((!lk[i].getAttribute('incog_hist_marked'))||(lk[i].getAttribute('incog_hist_marked')=="false")) {
							                        lk[i].style.color = c;
 lk[i].innerHTML="▶"+ lk[i].innerHTML;
	  lk[i].setAttribute('incog_hist_marked', true);
			   console.groupCollapsed(lk[i].href+" coloured: ");
	           console.log(lk[i]);
	           console.dir(lk[i]);
			   console.groupEnd();
                }
        }
}
}

function deShadeRef(u) {
/*         var lk = document.getElementsByTagName('a');

        for(let i = 0; i < lk.length; i++) { */
			 for(let j = 0; j < innHT.length; j++) {
				 if(u.innerHTML){
					 
					 if(( u.innerHTML.charAt( 0 ) === '▶' )&&((u.getAttribute('incog_hist_marked')=="true"))){
    var origIH = u.innerHTML.slice( 1 );
				 }else{
					 var origIH = u.innerHTML;
				 }
				 
		if((innHT[j]==origIH)&&((u.getAttribute('incog_hist_marked')=="true"))){
  u.setAttribute('incog_hist_marked', false);
      u.innerHTML=innHT[j];
	  u.style.color = 'initial';
	  
		}
			 }
		}
//}
}

if((typeof observer !== "undefined")&&(!(observer))){
const observer = new MutationObserver( (mutations) => {
  if (timer) {clearTimeout(timer);}
  timer = setTimeout(() => {
	//  console.log('Rescan page links')
 				if(!inProgress){
					inProgress=true;
		getLinks();
        send(links);
		inProgress=false;
				}
  }, 1000);
});


observer.observe(document, {
        attributes: true,
		childList: true,
		subtree:true
});
}

/*
observer.observe(document, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
});
*/

function send(b) {
        // Send message to background:
      chrome.runtime.sendMessage({
                type: "PG_LINKS",
                b:b
        }, function(response) {}); 
}





function arrangeShade(request,lnks){

	                                                //console.log(request);
												//localStorage["col"]=request.items.col;
												
chrome.storage.local.set({"col":request.items.col}, function(){
	var tmpLinks=[];
                for(let k = 0; k < lnks.length; k++) {
tmpLinks.push(lnks[k].href);
                        for(let j = 0; j < request.uniq.length; j++) {


                                if(request.uniq[j] == lnks[k].href) {

                                        shaderef(lnks[k].href, request.items.col);
										tmpLinks=removeEls(lnks[k].href,tmpLinks);
										
/*                                 }else{
									  deShadeRef(lnks[k]);
									
								} */

                        }

                }
}
	links=Array.from(new Set(links));
	
	for (let m=0;m<tmpLinks.length;m++){
		  deShadeRef(tmpLinks[m]);
	}

});


}


chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

                switch (request.type) {

                        case "URL":
				if(!inProgress){
					inProgress=true;
chrome.storage.local.get(null, function(items) {
	if (Object.keys(items).length == 0) {
	chrome.storage.local.set({"col":"#9043cc"}, function(){
	shaderef(request.url, "#9043cc");
	});
	}else{
	shaderef(request.url, items.col);
	}
});
inProgress=false;
				}
break;


case "VISITED":
				if(!inProgress){
					inProgress=true;
getLinks();
arrangeShade(request, document.getElementsByTagName('a'));
inProgress=false;
				}
break;

 case "PGDELETED":
 				if(!inProgress){
					inProgress=true;
		getLinks();
        send(links);
		inProgress=false;
				}
break;

case "STDELETED":
				if(!inProgress){
					inProgress=true;
		getLinks();
        send(links);
				inProgress=false;
				}
break;

case "NEWACTIVE_t":
				if(!inProgress){
					inProgress=true;
		getLinks();
        send(links);
		inProgress=false;
				}
break;

case "NWSETTINGS":
if(!inProgress){
					inProgress=true;
initialise();
}
break;

                        default:
                                //console.log(request);
                                break;

                }
												return true;
        });