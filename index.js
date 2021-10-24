const blklist = document.getElementById('bklst');
const visC = document.getElementById('vis');
const visColour = document.getElementById('visCol');
const recStopper = document.getElementById('recStop');
const saver = document.getElementById('save');
const delPage = document.getElementById('delPg');
const delSite = document.getElementById('delSte');
const exmp = document.getElementById('eg');
const vsL = document.getElementById('visL');
const s1 = document.getElementById('isC');
const s2 = document.getElementById('isC2');

var currentTab;

const blklist_h=blklist.clientHeight;

function removeChar(c, array) {
	for (let i = 0; i < array.length; i++) {
		array[i] = array[i].split(c).join('');
	}
	return array;
}

function chgCol(col){
s1.innerText='input[type="color" i]::-webkit-color-swatch{\nborder-color:'+visC.value;+'\n}'
s2.innerText='input[type="color" i]{\nbackground-color:'+col+';\nborder:'+col+';\n}'
exmp.style.color=col;
}

let rec = true;
recBtn();




visC.oninput= ()=>{
vsL.innerText=visC.value;	
chgCol(visC.value);

}

vsL.oninput= ()=>{
visC.value=vsL.innerText
chgCol(visC.value);
}

chrome.storage.local.get(null, function(items) {
console.log(items);
if(Object.keys(items).length>0){
visColour.checked = items.cgVisCol;
visC.value = items.col;
	vsL.innerText=visC.value;	
chgCol(visC.value);
	
if(items.bklist.length>0){
blklist.value = items.bklist.join(",\n");
}

let hgt=blklist.scrollHeight+2;
let hgt1=(hgt>blklist_h)?hgt:blklist_h;
blklist.style.height = hgt1+"px";

}else{
	 saveSnd();
}

start();

});






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

function blacklistMatch(array, t) {
    var found = false;
    if (!((array.length == 1 && array[0] == "") || (array.length == 0))) {
        ts = t.toLocaleLowerCase();
        for (var i = 0; i < array.length; i++) {
            let spl = array[i].split('*');
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
            i = (found) ? array.length - 1 : i;
        }
    }
    //console.log(found);
    return found;

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
			   if (!chrome.runtime.lastError) {
       currentTab = tabs[0]; // there will be only one in this array
    }    
			});	  
				
                sendId('ask');
		/* 	console.log("Requesting status of tab "+ currentTab.id+" from background");
          */
} 



function sendId(a) {
        chrome.tabs.query({currentWindow: true}, function(tabs) {
						   if (!chrome.runtime.lastError) {
							   for (let t=0; t<tabs.length; t++){

							   if(!!tabs[t].active){
                let send_id = tabs[t].id;
				let send_url=tabs[t].url;
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
						   }
						   }
		}
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


blklist.addEventListener('input', function(){
	let hgt=blklist.scrollHeight+2;
	let hgt1=(hgt>blklist_h)?hgt:blklist_h;
blklist.style.height = hgt1+"px";
}, false);


recStopper.addEventListener('click', rec_stop, false);


saver.addEventListener('click', saveSnd, false)


	function saveSnd(){
		chrome.storage.local.get(null, function(items) {
			chrome.storage.local.set({"cgVisCol":visColour.checked}, function(){
				chrome.storage.local.set({"col":'#' + visC.value.replace(/#/g,'')}, function(){
								let lstChk=blklist.value.split(',');
		let validate=true;
		
		lstChk=removeEls("",lstChk);
		lstChk = removeChar("\n", lstChk);
		
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
	if (validate){

		     	chrome.storage.local.set({"bklist": lstChk}, function(){
					        chrome.runtime.sendMessage({
                type: "SETTINGS",
                items
        }, function(response) {
                if(response.type == "SET") {
					

	        chrome.tabs.query({currentWindow: true}, function(tabs) {
						   if (!chrome.runtime.lastError) {
							   for (let t=0; t<tabs.length; t++){
							   if(!!tabs[t].active){
									chrome.tabs.sendMessage(tabs[t].id, {
									type: "NWSETTINGS"
									}, function(response) {});
							   }
							   }
						   }
			});
	
					
                        console.log(response.settings);
                        alert("Current settings saved!")
                }
        });
					
				});

				}
				


	});
				});
			});
			



}

delPage.addEventListener('click', function() {


	
	        chrome.tabs.query({currentWindow: true}, function(tabs) {
						   if (!chrome.runtime.lastError) {
							   for (let t=0; t<tabs.length; t++){

							   if(!!tabs[t].active){
								   				 console.log('Sending message to delete page.');
                chrome.runtime.sendMessage({
                        type: "DELETE_PG",
                        url: tabs[t].url
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
							   }
							   }
						   }
			});


}, false)

delSite.addEventListener('click', function() {


	
	        chrome.tabs.query({currentWindow: true}, function(tabs) {
						   if (!chrome.runtime.lastError) {
							   for (let t=0; t<tabs.length; t++){

							   if(!!tabs[t].active){
								   let chkSchm=tabs[t].url.split('///');
                let se = (chkSchm.length>1)?chkSchm[0]+'///':tabs[t].url.split('/')[2];
				if(se!==''){
                let cm = "Are you sure you want to delete all visits to " + ((chkSchm.length>1)?se+'*':se) + "?";
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
						   }
						   }
						   }
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
	        chrome.tabs.query({currentWindow: true}, function(tabs) {
						   if (!chrome.runtime.lastError) {
							   for (let t=0; t<tabs.length; t++){

							   if(!!tabs[t].active){
									if (request.id==tabs[t].id){
									console.log('URL in history now, can be deleted.');
									shwDels();
									}
							   }
							   }
						   }
			});
break;

 case "NOTINHISTORY":
	        chrome.tabs.query({currentWindow: true}, function(tabs) {
						   if (!chrome.runtime.lastError) {
							   for (let t=0; t<tabs.length; t++){
									if(!!tabs[t].active){
									if (request.id==tabs[t].id){
									console.log('URL not in history.');
									hdeDels();
									}
							   }
							   }
						   }
			});		
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
	return true;


				}

});