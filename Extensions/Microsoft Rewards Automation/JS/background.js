/***************************************************************************************************/
/***************************************[ background.JS ]*******************************************/
/***************************************************************************************************/
// "<all_urls>"
chrome.runtime.onInstalled.addListener(function(){
   
})
////////////////////////////////////
chrome.browserAction.onClicked.addListener(function() {
    let link = "https://www.bing.com/search?q=%2B&form=QBLH&sp=-1&pq=%2B&sc=10-1&qs=n&sk=&cvid=3064EE9B55AD4957B8C7190E479CA957&ghsh=0&ghacc=0&ghpl=";
    let tab = chrome.tabs.create({'url': link}, function(tab) {
        // Tab opened.
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////
chrome.runtime.setUninstallURL("https://www.google.com", function(){})
/////////////////////////////////////////////////////////////////////////////////////////////////////