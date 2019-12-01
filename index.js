const bklist = document.getElementById('bklst');
const visC = document.getElementById('vis');
const visColour = document.getElementById('visCol');
const recStopper = document.getElementById('recStop');
const saver = document.getElementById('save');
const delPage = document.getElementById('delPg');
const delSite = document.getElementById('delSte');

var currentTab;

let rec = true;
recBtn();
console.log(localStorage);

if(localStorage.length>0){
visColour.checked = localStorage["cgVisCol"];
visC.value = localStorage["col"];

if(localStorage.blkst){
bklist.textContent = localStorage["blkst"].split(',').join(',\n');
}

}else{
	 saveSnd();
}

start();

function blacklistMatch(array, t) {
        var notFound = false;
        if((array.length == 1 && array[0] == "")||(array.length==0)) {
                return false
        } else {

                var track = null;
                for(let i = 0; i < array.length; i++) {

                        let b = removeEls("", array[i].split('*'));
                        for(let k = 0; k < b.length; k++) {
                                let pos = t.toLocaleLowerCase().indexOf(b[k].toLocaleLowerCase()); //full, then part
                                if(pos >= track) {
                                        track = pos;
                                } else {
                                        if(i == array.length - 1 && k == b.length - 1 && track == null) {
                                                notFound = true;
                                        }
                                }
                        }

                }
                if(notFound) {
                        return false;
                } else {
                        return true;
                }
        }
}

function removeEls(d, array) {
        var newArray = [];
        for(let i = 0; i < array.length; i++) {
                if(array[i] != d) {
                        newArray.push(array[i]);
                }
        }
        return newArray;
}


 function start() {
	 
   chrome.tabs.query({
                active: true,
                currentWindow: true
        }, function(tabs) {
                 currentTab = tabs[0]; // there will be only one in this array
			});	  
				
                sendId('ask');
		/* 	console.log("Requesting status of tab "+ currentTab.id+" from background");
          */
} 

const observer = new WebKitMutationObserver(function(mutations) {

        document.getElementById('eg').style.color = "#" + visC.value.replace(/#/g,'');


});


observer.observe(visC, {
        attributes: true,
        characterData: true,
});






function sendId(a) {
        chrome.tabs.query({
                active: true,
                currentWindow: true
        }, function(tabs) {
                 currentTab = tabs[0]; // there will be only one in this array
                let send_id = currentTab.id;
				let send_url=currentTab.url;
                chrome.runtime.sendMessage({
                        type: "TAB_ID",
                        send_id,
						send_url,
                        recording: a
                }, function(response) {
                if(response.type == "TBSTUS") {
					console.log(response);
					if ((response.inHstry=="true")||(response.sts=="r")){
						shwDels();
					}
					
					
					if (response.blTb===true){
						stopBtn();
					 }
			


                }

        });
});
}

function stop_rec() {
        if(rec == true) {
                stopBtn();
        } else {
                recBtn();
        }
}


function stopBtn() {

	console.log('Stopping recording, updating popup to reflect this.');
        rec = false;
        recStop.innerHTML = '&#x23F9;';

        recStop.title = "NOT RECORDING (Click to record)";

        recStop.style.filter = "invert(1) hue-rotate(206deg)"
        recStop.style.backgroundColor = "";
        recStop.style.borderColor = "";
}


function recBtn() {

		console.log('Recording, updating popup to reflect this');
        rec = true;

        recStop.innerHTML = '&#x23FA;';

        recStop.title = "RECORDING (Click to stop)";
        recStop.style.backgroundColor = "#7097ff";
        recStop.style.borderColor = "#7097ff";
        recStop.style.filter = "invert(0) hue-rotate(147deg)"
}

function rec_stop() {
        if(rec == true) {
                sendId("stop");
                stopBtn();
        } else {
                sendId("rec");
                recBtn();

        }
}

recStopper.addEventListener('click', rec_stop, false);


saver.addEventListener('click', saveSnd, false)


	function saveSnd(){
        localStorage["cgVisCol"] = visColour.checked;
        localStorage["col"] = '#' + visC.value.replace(/#/g,'');
		
		let lstChk=bklist.value.split(',');
		let validate=true;
		
		lstChk=removeEls("",lstChk);
		
		for(let i=0;i<lstChk.length;i++){
			
		if(lstChk[i].split('/').length==1){
console.log(lstChk[i]+' is valid!');
		}else{
			
	if(lstChk[i].split('://')[0]==""){
alert(lstChk[i]+' is invalid');
				validate=false;
	}
		
			if(lstChk[i].split('://')[lstChk[i].split('://').length+1]==""){
alert(lstChk[i]+' is invalid');
				validate=false;
	}
		
		
			if(lstChk[i].split('://').join('').split('/').length!==removeEls("",lstChk[i].split('://').join('').split('/')).length){
alert(lstChk[i]+' is invalid');
				validate=false;
	}
	
	}

	}
	
	if(validate){
		        localStorage["blkst"] = bklist.value;
	}else{
		    localStorage["blkst"] = "";
	}
		

        chrome.runtime.sendMessage({
                type: "SETTINGS",
                localStorage
        }, function(response) {
                if(response.type == "SET") {
                        console.log(response.settings);
                        alert("Current settings saved!")
                }
        });


}

delPage.addEventListener('click', function() {

        chrome.tabs.query({
                active: true,
                currentWindow: true
        }, function(tabs) {
                 currentTab = tabs[0]; // there will be only one in this array

				 
				 console.log('Sending message to delete page.');
                chrome.runtime.sendMessage({
                        type: "DELETE_PG",
                        url: currentTab.url
                }, function(response) {
                        if(response.type == "DELETED_PAGE") {
							if(response.status == "successful"){
								hdeDels();
							}
                                console.log(response);
                                alert(response.msg);
                                console.log(response.msg);
                        }
                });

        });

}, false)

delSite.addEventListener('click', function() {

        chrome.tabs.query({
                active: true,
                currentWindow: true
        }, function(tabs) {
                 currentTab = tabs[0]; // there will  be only one in this array
                let se = currentTab.url.split('/')[2];
                let cm = "Are you sure you want to delete all visits to " + se + "?";
                let sdc = confirm(cm);
                if(sdc == true) {

                        chrome.runtime.sendMessage({
                                type: "DELETE_STE",
                                url: se
                        }, function(response) {
							console.log(response);
							if(response.type ==  "DELETED_SITE"){
										if(response.status == "successful"){
								hdeDels();
							}
						

                                alert(response.msg);
						}
                        });
                }

        });

}, false)

function shwDels(){
	console.log('Showing page delete button.');
					delPage.style.display="initial";
}

function hdeDels(){
		console.log('Hiding page delete button.');
					delPage.style.display="none";
}



chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {



    switch (request.type) {

        case "ISINHISTORY":

 chrome.tabs.query({
                active: true,
                currentWindow: true
        }, function(tabs) {
           	currentTab = tabs[0]; 
					});	
				if (request.id==currentTab.id){
					

					
					console.log('URL in history now, can be deleted.');
					shwDels();
				}

		
break;

 case "TBUPDATE":
					hdeDels();
					  start();
					
break;

case "NEWACTIVE":

					hdeDels();
					  start();
					
			
break;
 
default:
	console.log(request);
break;



				}
});