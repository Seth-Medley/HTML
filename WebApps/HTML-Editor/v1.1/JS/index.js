function loadDoc() {
    var client = new XMLHttpRequest();
    client.open('GET', 'https://raw.githubusercontent.com/HD-Dev1/HTML-Projects/master/Template.txt');
    client.onreadystatechange = function () {
        document.getElementById("editor-textarea").value = client.responseText;

    }
    client.send();
    console.log("HTML Template Text Status: Recived");
}
document.onload = loadDoc();
function refresh() {
    var textContent = document.getElementById("editor-textarea").value;
    document.getElementById("viewer").srcdoc = textContent;
}
function mobileEdit() {
    const Crush = document.getElementById("editor-textarea");
    if (Crush.style.display === "block") {
        Crush.style.display = "none";
    } else {
        Crush.style.display = "block";
    }
}
function Menu() {
    const Options = document.getElementById("Options");
    const Push = document.getElementById("editor-textarea");
    if (Options.style.display === "flex") {
        Options.style.display = "none";
        Push.style.top = "0";
        Push.style.height = "93%";
        document.getElementById("ViewPort-Container").style.display = "none";
        document.getElementById("Color-Palette").style.display = "none";
    } else {
        Options.style.display = "flex";
        Push.style.top = "20";
        Push.style.height = "89.8%";
    }
}
function copyToClip() {
    var copyText = document.getElementById("editor-textarea");
    copyText.select();
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");
    console.log("You copied code!");
}
function resetEditor() {
    var client = new XMLHttpRequest();
    client.open('GET', 'https://raw.githubusercontent.com/HD-Dev1/HTML-Projects/master/Template.txt');
    client.onreadystatechange = function () {
        document.getElementById("editor-textarea").value = client.responseText;

    }
    client.send();
}
function viewSize() {
    const Break = document.getElementById("ViewPort-Container");
    const Ball = document.getElementById("editor-textarea");
    if (Break.style.display === "flex") {
        Break.style.display = "none";
        Ball.style.top = "20";
        Ball.style.height = "89.8%";
    } else {
        Break.style.display = "flex";
        document.getElementById("Color-Palette").style.display = "none";
        Ball.style.top = "50";
        Ball.style.height = "84.9%";
    }
}
function mobileView() {
    document.getElementById("viewer").style.width = "400";
    document.getElementById("editor-textarea").style.top = "20";
    document.getElementById("editor-textarea").style.height = "89.8%";
    document.getElementById("ViewPort-Container").style.display = "none";
}
function computerView() {
    document.getElementById("viewer").style.width = "930";
    document.getElementById("editor-textarea").style.top = "20";
    document.getElementById("editor-textarea").style.height = "89.8%";
    document.getElementById("ViewPort-Container").style.display = "none";
}
function tabletView() {
    document.getElementById("viewer").style.width = "730";
    document.getElementById("editor-textarea").style.top = "20";
    document.getElementById("editor-textarea").style.height = "89.8%";
    document.getElementById("ViewPort-Container").style.display = "none";
}
function backgroundChange() {
    const Yun = document.getElementById("Color-Palette");
    const Yin = document.getElementById("editor-textarea");
    if (Yun.style.display === "flex") {
        Yun.style.display = "none";
        Yin.style.top = "20";
        Yin.style.height = "89.8%";
    } else {
        Yun.style.display = "flex";
        document.getElementById("ViewPort-Container").style.display = "none";
        Yin.style.top = "50";
        Yin.style.height = "84.9%";
    }
}
function colorGrey() {
    document.getElementById("body").style.backgroundColor = "#ecf0f1";
    document.getElementById("footer-bottom").style.color = "black";
    document.getElementById("footer-web").style.color = "#2D3544";
}
function colorDarkGrey() {
    document.getElementById("body").style.backgroundColor = "#333";
    document.getElementById("footer-bottom").style.color = "darkgrey";
    document.getElementById("footer-web").style.color = "grey"
}
function colorWhite() {
    document.getElementById("body").style.backgroundColor = "white";
    document.getElementById("footer-bottom").style.color = "black";
    document.getElementById("footer-web").style.color = "#2D3544";
}
function colorWheat() {
    document.getElementById("body").style.backgroundColor = "wheat";
    document.getElementById("footer-bottom").style.color = "black";
    document.getElementById("footer-web").style.color = "#2D3544";
}