function getUrl(tab) {
	return (tab.url == "" && !!tab.pendingUrl && typeof tab.pendingUrl !== 'undefined' && tab.pendingUrl != '') ? tab.pendingUrl : tab.url;
}

try {
	var blacklist = [];
	var tmpURLBlacklist = []
	var tabStatus = []; //[{'tabId':_,'status': 'r'/'s'/'a'/'i'}]
	var unrcTb_done = [];
	var tabBlacklist = [];

	function start() {

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
						}, function() {});
					});

				});
			} else {

				blacklist = items.bklist;
				blacklist = removeEls("", blacklist);
				blacklist = removeChar("\n", blacklist);
			}
		});

		chrome.tabs.query({}, function(tabs) {
						   if (!chrome.runtime.lastError) {
			for (let t = 0; t < tabs.length; t++) {
				tabStatus.push({
					'tabId': tabs[t].id,
					'status': 'i'
				});
			}
		}
		});

/*		chrome.tabs.query({}, function(tabs) {
						   if (!chrome.runtime.lastError) {
			activate(tabs[0]);
		}
		});*/

	}

	function removeChar(c, array) {
		for (let i = 0; i < array.length; i++) {
			array[i] = array[i].split(c).join('');
		}
		return array;
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

	function replaceEls(r, w, array) {
		for (let i = 0; i < array.length; i++) {
			if (array[i] == r) {
				array[i] = w;
			}
		}
		return array;
	}

	function findIndexTotalInsens(string, substring, index) {
		string = string.toLocaleLowerCase();
		substring = substring.toLocaleLowerCase();
		for (let i = 0; i < string.length; i++) {
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

	function caseInsMatch(array, t) { //Term (partially) in array element?
		var found = false;
		for (let i = 0; i < array.length; i++) {
			if (array[i].toLocaleLowerCase().indexOf(t.toLocaleLowerCase()) >= 0) { //full, then part
				//console.log(array[i]);
				found = true;
			}
		}
		return found;
	}

	function pageBlMatch(array, t) {
		var found = false;
		if (array.length == 0) {
			return false;
		} else {

			var pg = t.split('://')[1].split('?')[0];
			for (let i = 0; i < array.length; i++) {
				if (array[i].indexOf("://") >= 0) {
					if (array[i].indexOf(t) >= 0) {
						//console.log(array[i]);
						found = true;
						i = array.length - 1;
					}

				}
				return found;
			}
		}
	}

	function tbSt(d, t) {
		let foundTS = 0;
		for (let i = 0; i < tabStatus.length; i++) {
			if (tabStatus[i].tabId == d) {
				foundTS = 1;
				tabStatus[i].status = t;
				i = tabStatus.length - 1;
			}
		}
		if (foundTS == 0) {
			tabStatus.push({
				'tabId': d,
				'status': t
			});
		}
		//console.log(tabStatus);
	}

	function tbRd(d) {
		let foundTbS = 0;
		let rdTS = null;
		for (let i = 0; i < tabStatus.length; i++) {
			if (tabStatus[i].tabId == d) {
				foundTbS = 1;
				rdTS = tabStatus[i].status;
				i = tabStatus.length - 1;
			}
		}
		if (rdTS !== null) {
			return rdTS;
		}
	}

	function tbDel(d) {
		let foundTS = 0;
		for (let i = 0; i < tabStatus.length; i++) {
			if (tabStatus[i].tabId == d) {
				foundTS = 1;
				tabStatus = removeEls(tabStatus[i], tabStatus);
				i = tabStatus.length - 1;
			}
		}
	}

	function tbRep(o, n) {
		let foundTS = 0;
		for (let i = 0; i < tabStatus.length; i++) {
			if (tabStatus[i].tabId == o) {
				foundTS = 1;
				tabStatus[i].tabId = n;
				i = tabStatus.length - 1;
			}
		}
	}

	function tabSet(d) {
		let foundTb = 0;
		for (let i = 0; i < tabStatus.length; i++) {
			if (tabStatus[i].tabId == d) {
				foundTb = 1;
				//console.log(tabStatus);
				switch (tabStatus[i].status) {
					case "r":
						chrome.action.setIcon({
							path: "rec.png"
						});
						break;
					case "s":
						chrome.action.setIcon({
							path: "stop.png"
						});
						break;
					case "a":
						chrome.action.setIcon({
							path: "recAdd.png"
						});
						break;
					case "i":
						chrome.action.setIcon({
							path: "ih.png"
						});
						break;
					default:
						console.log("Couldn't set icon for tab " + d);
				}
				i = tabStatus.length - 1;
			}
		}

	}
	
	chrome.extension.isAllowedIncognitoAccess((isAllowedAccess)=>{
		if(isAllowedAccess){
			
				let contexts = ["link", "image"];
	chrome.contextMenus.create({
		"title": "⏹ Open in unrecorded incognito tab",
		"contexts": contexts,
		"id": "unrec"
	}, function(response) {
		//	console.log(response);
	});

	chrome.contextMenus.onClicked.addListener((info, tab) => {
		if (info.menuItemId == "unrec") {
			//console.log(tab);
			let to_url = (typeof info.linkUrl === 'undefined') ? info.srcUrl : info.linkUrl;
			if (tab.incognito) {
				chrome.tabs.create({
					"url": to_url,
					"windowId": tab.windowId,
					"index": (tab.index + 1),
					"active": false
				}, function(tab) {
					tabBlacklist.push(tab.id);
					tabBlacklist = Array.from(new Set(tabBlacklist));
					let tab_url = getUrl(tab);
					tmpURLBlacklist.push(tab_url);
					tmpURLBlacklist = Array.from(new Set(tmpURLBlacklist));
					tbSt(tab.id, 's');
					if (tab.active) {
						tabSet(tab.id);
					}
					unrcTb_done = removeEls(tab.id, unrcTb_done);
				});
			} else {
				chrome.windows.create({
					"url": to_url,
					"incognito": true
				}, function(newWindow) {
					for (let i = 0; i < newWindow.tabs.length; i++) {
						if (getUrl(newWindow.tabs[i]) == to_url) {
							tabBlacklist.push(newWindow.tabs[i].id);
							tabBlacklist = Array.from(new Set(tabBlacklist));
							tmpURLBlacklist.push(getUrl(newWindow.tabs[i]));
							tmpURLBlacklist = Array.from(new Set(tmpURLBlacklist));
							tbSt(newWindow.tabs[i].id, 's');
							if (newWindow.tabs[i].active) {
								tabSet(newWindow.tabs[i].id);
							}
							unrcTb_done = removeEls(newWindow.tabs[i].id, unrcTb_done);
						}
					}
				});
			}
		}
	});

		}
	});



function activate(tab) {
				let tId = null;
		if (tab.tabId) {
			tId = tab.tabId;
		} else if (tab.id) {
			tId = tab.id;
		}
		

if(!!tId){
									chrome.action.setBadgeText({
									'text': tId.toString()
									},()=>{});

					tabSet(tId);
		console.log('Switched to tab ' + tId);
		chrome.runtime.sendMessage({
			type: "NEWACTIVE",
			id: tId
		}, function(response) {
			//	console.log(response);
		});	


		chrome.tabs.sendMessage(tId, {
			type: "NEWACTIVE_t"
		}, function(response) {
			//console.log(response);
		});
			
}

	}

	start();

	chrome.tabs.onActivated.addListener(function(tab) {
		activate(tab);
		//	console.log(tabBlacklist);
		//console.log(tmpHistDelPg);
	});

	chrome.windows.onFocusChanged.addListener(function(windowId) {
		chrome.tabs.query({windowId: windowId}, function(tabs) {
						   if (!chrome.runtime.lastError) {
							   let tabsAct=tabs.filter((tb)=>{return tb.active});
							   if(tabsAct.length>0){
								   let acTab=tabsAct[tabsAct.length-1];
								   console.log('Switched to tab ' + acTab.id);
										activate(acTab);
							   }
		}
		});
	});

	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		console.log('Tab ' + tabId + ' removed');

		tabBlacklist = removeEls(tabId, tabBlacklist);

		tbDel(tabId);
		//console.log(tabBlacklist);

	});

	chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
		console.log('Tab ' + removedTabId + ' replaced by tab ' + addedTabId);

		//console.log(tabBlacklist);

		tbRep(removedTabId, addedTabId);
		tabBlacklist = replaceEls(newTabId, oldTabId, tabBlacklist);

		chrome.tabs.query({}, function(tabs) {
						   if (!chrome.runtime.lastError) {
			for (let i = 0; i < tabs.length; i++) {
				if (tabs[i].id == addedTabId) {
					visited(tabs[i]);
					i = tabs.length - 1;
				}
			}
		}
		});

		//console.log(tabBlacklist);

	});

	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		//console.log('Tab ' + tabId + ' updated');

		if (tbRd(tabId) == 'i') {
			let tab_url = getUrl(tab);
			visited(tab);
			if ((tabBlacklist.includes(tabId) == false) && (blacklistMatch(blacklist, tab_url) == false) && (pageBlMatch(tmpURLBlacklist, tab_url) == false)) { //&& (tmpHistDelPg.includes(tab.tabId) == false) 
				tbSt(tabId, 'r');
				if (tab.active) {
					tabSet(tabId);
				}
				inhist(tab);
			} else {
				tbSt(tabId, 's');
				if (tab.active) {
					tabSet(tabId);
				}
			}

			unrcTb_done = removeEls(tabId, unrcTb_done);

		}

		if ((!!changeInfo.url) && (unrcTb_done.includes(tabId) == false)) {
			console.log('Tab ' + tabId + ' updated with new page');
			
				if(tab.active){
					activate(tabId);
				}
			
			/* tmpHistAdd.push(tab.id);
			tmpHistAdd = Array.from(new Set(tmpHistAdd));
			console.log(tmpHistAdd);
			tmpHistDelPg = removeEls(tab.id, tmpHistDelPg)
			console.log(tmpHistDelPg); */
			let tab_url = getUrl(tab);
			visited(tab);
			if ((tabBlacklist.includes(tabId) == false) && (blacklistMatch(blacklist, tab_url) == false)) {

				tbSt(tabId, 'r');
				if (tab.active) {
					tabSet(tabId);
				}

				inhist(tab);

				chrome.runtime.sendMessage({
					type: "TBUPDATE",
					id: tabId
				}, function(response) {
					// console.log(response);
				});

			} else {

				tbSt(tabId, 's');

				if (tab.active) {
					tabSet(tabId);
				}

			}

		}

		console.log(tabStatus);

	});

	//  when tab is created
	chrome.tabs.onCreated.addListener(function(tab) {

		tbSt(tab.id, 'i');
		if (tab.active) {
			tabSet(tab.id);
		}
		unrcTb_done.push(tab.id);
		unrcTb_done = Array.from(new Set(unrcTb_done));
		console.log('Tab ' + tab.id + ' created');
	});

	function inhist(tab) {
		
		//	console.log('Going to add ' + tab.id + ' to history!');

		tbSt(tab.id, 'r');
		if (tab.active) {
			tabSet(tab.id);
		}
		let tab_url = getUrl(tab);
		addhist(tab_url);

		/* 	console.log(tmpHistAdd);
			tmpHistAdd.push(tab.id);
			tmpHistAdd = Array.from(new Set(tmpHistAdd));
			console.log(tmpHistAdd);
		} else {
			console.log('Tab ' + tab.id + ', is in a blacklist!');
			tbSt(tab.id, 's');
			if (tab.active) {
				tabSet(tab.id);
			} */
		//}
	}

	function visited(tab) {
		let tab_url = getUrl(tab);
		if (tab_url.split('://')[0] !== 'chrome') {
			chrome.storage.local.get("cgVisCol", function(item) {
				if (item === "true") {
							chrome.scripting.executeScript({
								  target: {tabId: tab.id, allFrames: true},
								  files: ['content.js'],
								}, () => {});
				}
			});
		}
	}

	function sendURL(url) {
		chrome.tabs.query({}, function(tabs) {
						   if (!chrome.runtime.lastError) {
			for (let t = 0; t < tabs.length; t++) {
				chrome.tabs.sendMessage(tabs[t].id, {
					type: "URL",
					url: url
				}, function(response) {});
			}
		}
		});
	}

	function addhist(url) {
		if ((url.split('//')[0] !== "chrome:") && (url.split('//')[0] !== "chrome-extension:")) {
			chrome.history.addUrl({
				url: url
			}, function() {
				console.log(url + " added to history!");
				//sendURL(url);
			});
		}
	}

	var visitd = [];
	var hstchk = [];
	
	
	chrome.bookmarks.onCreated.addListener((id, bookmark) => {
		
		if (typeof bookmark.url!=='undefined'){
		let addedHist = [bookmark.url];
		
												chrome.tabs.query({}, function(tabs) {
			   if (!chrome.runtime.lastError) {
								for (let t = 0; t < tabs.length; t++) {
									chrome.tabs.sendMessage(tabs[t].id, {
										type: "VISITED",
										addedHist
									}, function(response) {

									});
									
						if (getUrl(tabs[t]) === bookmark.url) {
							tbSt(tabs[t].id, 'a');
							if (tabs[t].active) {
								tabSet(tabs[t].id);
							}
							chrome.runtime.sendMessage({
								type: "ISINHISTORY",
								id: tabs[t].id
							}, function(response) {
								//console.log(response);
							});
						}
	
								}
										}
										
							});

		
		}
});
	
	
	chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
		if (typeof removeInfo.node.url!=='undefined'){
	chrome.history.search({
						text: "",
						startTime: 0,
						maxResults: 0
					}, function(hist) {
						let hist_URLs=hist.map((entry)=>{return entry.url});
						if (!hist_URLs.includes(removeInfo.node.url)){
																			chrome.tabs.query({}, function(tabs) {
			   if (!chrome.runtime.lastError) {
								for (let t = 0; t < tabs.length; t++) {
																			if (getUrl(tabs[t]) ===  removeInfo.node.url) {
												tbSt(tabs[t].id, 's');
													if (tabs[t].active) {
													tabSet(tabs[t].id);
													}
												}

											chrome.tabs.sendMessage(tabs[t].id, {
											type: "PGDELETED",
											all: false,
											delLink: removeInfo.node.url
											}, function(response) {

											});

												chrome.runtime.sendMessage({
												type: "NOTINHISTORY",
												id: tabs[t].id
												}, function(response) {
												//console.log(response);
												});
								}
			   }
																			});
												
						}
						
					});
			
		}
		});
	
	
	
	
	chrome.history.onVisitRemoved.addListener(function(removed){
		
												chrome.tabs.query({}, function(tabs) {
			   if (!chrome.runtime.lastError) {
								for (let t = 0; t < tabs.length; t++) {
									
									if(!!removed.allHistory){
											tbSt(tabs[t].id, 's');
											if (tabs[t].active) {
												tabSet(tabs[t].id);
											}
											
											chrome.tabs.sendMessage(tabs[t].id, {
											type: "PGDELETED",
											all: true,
											delLink: null
											}, function(response) {

											});
											
											chrome.runtime.sendMessage({
												type: "NOTINHISTORY",
												id: tabs[t].id
											}, function(response) {
												//console.log(response);
											});
									}else{
											for (let k = 0; k < removed.urls.length; k++) {
																								
												if (getUrl(tabs[t]) ===  removed.urls[k]) {
												tbSt(tabs[t].id, 's');
													if (tabs[t].active) {
													tabSet(tabs[t].id);
													}
												}

											chrome.tabs.sendMessage(tabs[t].id, {
											type: "PGDELETED",
											all: false,
											delLink: removed.urls[k]
											}, function(response) {

											});

												chrome.runtime.sendMessage({
												type: "NOTINHISTORY",
												id: tabs[t].id
												}, function(response) {
												//console.log(response);
												});
												}
											

									}
									
								}
			   }
												}); 

	});
	
	chrome.history.onVisited.addListener(function(Historyitem){
		
		let addedHist = [Historyitem.url];
					
										chrome.tabs.query({}, function(tabs) {
			   if (!chrome.runtime.lastError) {
								for (let t = 0; t < tabs.length; t++) {
									chrome.tabs.sendMessage(tabs[t].id, {
										type: "VISITED",
										addedHist
									}, function(response) {

									});
									
						if (getUrl(tabs[t]) === Historyitem.url) {
							tbSt(tabs[t].id, 'a');
							if (tabs[t].active) {
								tabSet(tabs[t].id);
							}
							chrome.runtime.sendMessage({
								type: "ISINHISTORY",
								id: tabs[t].id
							}, function(response) {
								//console.log(response);
							});
						}
	
								}
										}
										
							});


	});
	
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		switch (request.type) {
			case "TAB_ID":
				if (request.recording == "stop") {

					let inHsty = 'false';
					chrome.history.search({
						text: "",
						startTime: 0,
						maxResults: 0
					}, function(hist) {

						for (let i = 0; i < hist.length; i++) {

							if (pageBlMatch([hist[i].url], request.send_url) == true) {
								inHsty = 'true';
								i = hist.length - 1;

							}
						}

						if (inHsty = 'false') {

							tbSt(request.send_id, 's');
							chrome.tabs.query({}, function(tabs) {
											   if (!chrome.runtime.lastError) {
								for (let i = 0; i < tabs.length; i++) {
									if (tabs[i].id == request.send_id) {
										if (tabs[i].active) {
											tabSet(request.send_id);

										}
										i = tabs.length - 1;
									}
								}
							}
							});
						}

					});

					tabBlacklist.push(request.send_id);
					tabBlacklist = Array.from(new Set(tabBlacklist));
					console.log("Won't record tab " + request.send_id + " from now on.");
				} else if (request.recording == "rec") {

					let inHsty = 'false';
					chrome.history.search({
						text: "",
						startTime: 0,
						maxResults: 0
					}, function(hist) {

						for (let i = 0; i < hist.length; i++) {

							if (pageBlMatch([hist[i].url], request.send_url) == true) {
								inHsty = 'true';
								i = hist.length - 1;

							}
						}

						if (inHsty = 'true') {

							tbSt(request.send_id, 'r');

							chrome.tabs.query({}, function(tabs) {
											   if (!chrome.runtime.lastError) {
								for (let i = 0; i < tabs.length; i++) {
									if (tabs[i].id == request.send_id) {
										if (tabs[i].active) {
											tabSet(request.send_id);

										}
										i = tabs.length - 1;
									}
								}
							}
							});

						}

					});

					tabBlacklist = removeEls(request.send_id, tabBlacklist);
					console.log("Tab " + request.send_id + " will be recorded from now on.");

					let tempURLBlacklist = tmpURLBlacklist;
					for (let i = 0; i < tmpURLBlacklist.length; i++) {

						if (pageBlMatch([tmpURLBlacklist[i]], request.send_url) == true) {
							tempURLBlacklist = removeEls(tmpURLBlacklist[i], tmpURLBlacklist);
						}
					}
					tmpURLBlacklist = tempURLBlacklist;

				} else if (request.recording == "ask") {
					let inHistry = 'false';

					chrome.history.search({
						text: "",
						startTime: 0,
						maxResults: 0
					}, function(hist) {

						for (let i = 0; i < hist.length; i++) {

							if (pageBlMatch([hist[i].url], request.send_url) == true) {

								inHistry = 'true';
								i = hist.length - 1;

							}
						}

						//console.log(inHistry);
						sendResponse({
							type: "TBSTUS",
							inHstry: inHistry,
							sts: tbRd(request.send_id),
							blTb: tabBlacklist.includes(request.send_id)
						});

					});

				} else {
					//console.log(request);
				}
				//console.log(tabBlacklist);
				break;
			case "SETTINGS":
				chrome.storage.local.get(null, function(items) {
					blacklist = items.bklist;
					blacklist = removeEls("", blacklist);
					blacklist = removeChar("\n", blacklist);
					chrome.storage.local.set({
						"bklist": blacklist
					}, function() {
						sendResponse({
							type: "SET",
							settings: items
						});
					});

				});
				break;
			case "DELETE_PG":
				console.log('Page (' + request.url + ') deletion request received');
				chrome.tabs.query({}, function(tabs) {
								   if (!chrome.runtime.lastError) {
					let tmpCanDel = 0;
					for (let t = 0; t < tabs.length; t++) {
						if (getUrl(tabs[t]) == request.url) {
							if (unrcTb_done.includes(tabs[t].id) == false) {
								console.log('Page (' + request.url + ') about to be deleted');
								tmpCanDel = 1;
								if (delPg(request.url) == true) {
									tbSt(tabs[i].id, 's');
									if (tabs[i].active) {
										tabSet(tabs[i].id)
									}
								};
								t = tabs.length - 1;
							}
						}
					}
					if (tmpCanDel == 0) {
						console.log("Please wait!");
						sendResponse({
							type: "DELETED_PAGE",
							msg: "Please wait!",
							url: request.url
						});
					}
				}
				});

				function delPg(url) {
					var done;
					chrome.history.deleteUrl({
						url: url
					}, function() {
						chrome.history.search({
							text: "",
							startTime: 0,
							maxResults: 0
						}, function(hist) {
							done = true;
							for (let i = 0; i < hist.length; i++) {
								if (pageBlMatch([hist[i].url], url) == true) {
									console.log("Page delete failed.");
									i = hist.length - 1;
									done = false;
								}
							}
							if (done) {
								console.log(url + " deleted from history!");

								chrome.tabs.query({}, function(tabs) {
												   if (!chrome.runtime.lastError) {
									tabs.forEach(function(tb) {
										if (getUrl(tb) == url) {

											tbSt(tb.id, 's');
											if (tb.active) {
												tabSet(tb.id);
											}

										}
									});
								}
								});

								sendResponse({
									type: "DELETED_PAGE",
									status: 'successful',
									msg: url + " deleted from history!",
									url: url
								});

								/*chrome.runtime.sendMessage({
									type: "PGDELETED"
								}, function(response) {
									//console.log(response);
								});*/

								/*chrome.tabs.query({}, function(tabs) {
												   if (!chrome.runtime.lastError) {
									for (let t = 0; t < tabs.length; t++) {
										chrome.tabs.sendMessage(tabs[t].id, {
											type: "PGDELETED"
										}, function(response) {});
									}
								}
								});*/

							} else {
								//console.log(hist);
								console.log("Page delete failed");
								sendResponse({
									type: "DELETED_PAGE",
									status: 'failed',
									msg: "Deletion of " + url + " from history failed! Try again!",
									url: request.url
								});
								//delStePg(url);
							}
						});
					});
					return done;
				}
				break;
			case "DELETE_STE":
				chrome.history.search({
					text: "",
					startTime: 0,
					maxResults: 0
				}, function(hist) {
					//console.log(hist);

					async function siteDel() {
						var toDel = [];
						for (let i = 0; i < hist.length; i++) {
							if (hist[i].url.indexOf(request.url) >= 0) {
								toDel.push(hist[i]);
							}
						}

						if (toDel.length > 0) {
							await new Promise(function(resolve, reject) {
								var count = 0;
								for (let i = 0; i < toDel.length; i++) {
									chrome.history.deleteUrl({
										url: toDel[i].url
									}, function() {
										count++;
										if (count == toDel.length) {
											resolve();
										}
									});
								}
								setTimeout(() => reject(), 15000);
							}).then((result) => {
								;
							}).catch((result) => {
								;
							});
						}
					}

					siteDel();

					chrome.history.search({
						text: "",
						startTime: 0,
						maxResults: 0
					}, function(hist) {
						var nthgFnd = 1;
						for (let i = 0; i < hist.length; i++) {
							if (hist[i].url.indexOf(request.url) >= 0) {
								nthgFnd = 0;
								i = hist.length - 1;
							}
						}

						if (nthgFnd == 1) {

							chrome.tabs.query({}, function(tabs) {
											   if (!chrome.runtime.lastError) {
								tabs.forEach(function(tb) {
									if (getUrl(tb).indexOf(request.url) >= 0) {
										tbSt(tb.id, 's');
										if (tb.active) {
											tabSet(tb.id);
										}
									}
								});
							}
							});
							sendResponse({
								type: "DELETED_SITE",
								status: 'successful',
								msg: "All pages from site " + request.url + " have been deleted from history!",
								url: request.url
							});
							console.log("All pages from site " + request.url + " have been deleted from history!");

							/*chrome.runtime.sendMessage({
								type: "STDELETED"
							}, function(response) {
								//console.log(response);
							});*/

							/*chrome.tabs.query({}, function(tabs) {
											   if (!chrome.runtime.lastError) {
								for (let t = 0; t < tabs.length; t++) {
									chrome.tabs.sendMessage(tabs[t].id, {
										type: "STDELETED"
									}, function(response) {});
								}
							}
							});*/

						}
						if (nthgFnd == 0) {
							sendResponse({
								type: "DELETED_SITE",
								status: 'failed',
								msg: "Deleting all pages from site " + request.url + " failed, please try again!",
								url: request.url
							});
							console.log("Deleting all pages from site " + request.url + " failed, please try again!");
						}
					});

				});
				break;

			case "PG_LINKS":
				//console.log(request.chk);

				chrome.storage.local.get(null, function(items) {
					if (items.cgVisCol != "") {
							var urls=[];
							var urls2=[];
							var visitd=[];
						chrome.history.search({
							text: "",
							startTime: 0,
							maxResults: 0
						}, function(hist) {
							
								urls=hist.map((entry)=>{return entry.url});
								chrome.bookmarks.search({}, function(bookmarks) {
										urls2=bookmarks.map((bookmark)=>{return bookmark.url});
										urls= Array.from(new Set(urls.concat(urls2)));

								for (var i = 0; i < request.b.length; i++) {
									for (var m = 0; m < urls.length; m++) {
										if (urls[m] == request.b[i]) {
											visitd.push(request.b[i]);
										}
									}
								}
									let uniq = Array.from(new Set(visitd));
									
									chrome.tabs.query({}, function(tabs) {
										if (!chrome.runtime.lastError) {
										for (let t = 0; t < tabs.length; t++) {
											chrome.tabs.sendMessage(tabs[t].id, {
												type: "VISITED",
												uniq,
												items
											}, function(response) {

											});
										}
									}
							});

							console.log('Sent visited links to be coloured');
							visitd = [];
							hstchk = [];

								});

						});
					}
				});
				break;
			default:
				/*console.log(request)*/
				;
				break;
		}
		return true;
	});
} catch (e) {
	console.error(e);
}