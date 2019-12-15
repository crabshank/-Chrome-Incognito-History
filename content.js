var timer;
        var links = [];
		var innHT=[];
		
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

		getLinks();
        send(links);

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
 
 
 if(localStorage.length>0){
 
 let storeCol=localStorage["col"];
 
 }else{
	 let storeCol='#9043cc';
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
	           console.log(lk[i].href+' coloured.');
	           console.log(lk[i]);
                }
        }
}
}

function deShadeRef(u) {
/*         var lk = document.getElementsByTagName('a');

        for(let i = 0; i < lk.length; i++) { */
			 for(let j = 0; j < innHT.length; j++) {
				 if(u.innerHTML){
					 
					 if( u.innerHTML.charAt( 0 ) === '▶' ){
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

const observer = new MutationObserver( (mutations) => {
  if (timer) {clearTimeout(timer);}
  timer = setTimeout(() => {
	//  console.log('Rescan page links')
initialise();
  }, 1000);
});




observer.observe(document, {
        attributes: true,
		childList: true,
		subtree:true
});


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
        }, function(response) {
			
/* 			if(response.type=="VISITED"){
                                                console.log(response);
												localStorage["col"]=response.localStorage.col;
					storeCol=localStorage["col"];
                for(let k = 0; k < b.length; k++) {

                        for(let j = 0; j < response.uniq.length; j++) {


                                if(response.uniq[j] == b[k]) {

                                        shaderef(b[k], response.localStorage.col);
                                }

                        }

                }
} */

        }); 

}





function arrangeShade(request,lnks){
	var tmpLinks=[];
	                                                //console.log(request);
												localStorage["col"]=request.localStorage.col;
					storeCol=localStorage["col"];
                for(let k = 0; k < lnks.length; k++) {
tmpLinks.push(lnks[k].href);
                        for(let j = 0; j < request.uniq.length; j++) {


                                if(request.uniq[j] == lnks[k].href) {

                                        shaderef(lnks[k].href, request.localStorage.col);
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

}


chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

                switch (request.type) {

                        case "URL":
						
 shaderef(request.url, storeCol);

                                break;


case "VISITED":

getLinks();
arrangeShade(request, document.getElementsByTagName('a'));

break;

 case "PGDELETED":
initialise();
break;

case "STDELETED":
initialise();
break;

                        default:
                                console.log(request);
                                break;

                }
        });