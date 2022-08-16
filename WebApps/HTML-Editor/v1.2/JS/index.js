document.onload = pageLoad();
document.getElementById("menu-expand-svg").addEventListener("click", openNav);
document.getElementById("mobile-menu-expand-svg").addEventListener("click", mobileToggleEditor);
document.getElementById("Editor").addEventListener("click", enableEditor);
document.getElementById('Devices').addEventListener("click", viewportMenu);
document.getElementById('deviceList').addEventListener("click", viewportMenuClose);
document.getElementById('editor').addEventListener("keyup", refresh);
document.getElementById('Refresh').addEventListener("click", loadDoc);
document.getElementById('Clipboard').addEventListener("click", copyToClip);
document.getElementById('Phone').addEventListener("click", phoneView);
document.getElementById('Tablet').addEventListener("click", tabletView);
document.getElementById('PC').addEventListener("click", pcView);
document.getElementById('Theme').addEventListener("click", Themes);
document.getElementById('Settings').addEventListener("click", OpenSettings);
document.getElementById('closeSettings').addEventListener("click", closeSettings);
document.getElementById('settingsBg').addEventListener("dblclick", closeSettings);
document.getElementById('SaveMobile').addEventListener("click", OpenSave);
document.getElementById('Save').addEventListener("click", OpenSave);
document.getElementById('closeSave').addEventListener("click", CloseSave);
document.getElementById('saveBg').addEventListener("dblclick", CloseSave);
document.getElementById('fileUp').addEventListener('change', handleFileSelect);
document.getElementById('editor').addEventListener("mouseover", currentSize);
document.getElementById('viewer').addEventListener("mouseover", currentSize);

function pageLoad() {
    /////////////////
    let List = {
        Clipboard,
        Devices,
        Editor,
        Refresh,
        Sources,
        Theme,
        File,
        Title,
        //Style,
        Save,
        Settings
    }
    for (let key in List) {
        var Item = document.getElementById(key, List[key]);
        Item.style.display = "none";
    }
    /////////////////
    currentSize();
    refresh();
}

function currentSize() {
    const data1 = document.getElementById('editor').getBoundingClientRect();
    //console.log(Math.round(data1.width) + "x" + Math.round(data1.height));
    document.getElementById('editorTag').innerHTML = "x:" + Math.round(data1.width) + " y:" +
        Math.round(data1
            .height);

    const data2 = document.getElementById('viewer').getBoundingClientRect();
    document.getElementById('viewerTag').innerHTML = "x:" + Math.round(data2.width) + " y:" +
        Math.round(data2
            .height);
}

function openNav() {
    var Title = document.getElementById("Title");
    var Clipboard = document.getElementById("Clipboard");
    var Editor = document.getElementById("Editor");
    var Refresh = document.getElementById("Refresh");
    var Devices = document.getElementById("Devices");
    var Theme = document.getElementById("Theme");
    var Sources = document.getElementById("Sources");
    var File = document.getElementById("File");
    var Save = document.getElementById("Save");
    var Settings = document.getElementById("Settings");

    if (document.getElementById("mySidenav").style.width == "250px") {
        document.getElementById("mySidenav").style.width = "0px";
        document.getElementById("leftBar").style.display = "block";
        Title.classList.toggle("menuSvgVisibility");
        Clipboard.classList.toggle("menuSvgVisibility");
        Editor.classList.toggle("menuSvgVisibility");
        Refresh.classList.toggle("menuSvgVisibility");
        Devices.classList.toggle("menuSvgVisibility");
        Theme.classList.toggle("menuSvgVisibility");
        Sources.classList.toggle("menuSvgVisibility");
        File.classList.toggle("menuSvgVisibility");
        Save.classList.toggle("menuSvgVisibility");
        Settings.classList.toggle("menuSvgVisibility");
    } else {
        document.getElementById("mySidenav").style.width = "250px";
        document.getElementById("leftBar").style.display = "none";
        Title.classList.toggle("menuSvgVisibility");
        Clipboard.classList.toggle("menuSvgVisibility");
        Editor.classList.toggle("menuSvgVisibility");
        Refresh.classList.toggle("menuSvgVisibility");
        Devices.classList.toggle("menuSvgVisibility");
        Theme.classList.toggle("menuSvgVisibility");
        Sources.classList.toggle("menuSvgVisibility");
        File.classList.toggle("menuSvgVisibility");
        Save.classList.toggle("menuSvgVisibility");
        Settings.classList.toggle("menuSvgVisibility");
    }
}

function refresh() {
    var textContent = document.getElementById("editor").value;
    document.getElementById("viewer").srcdoc = textContent;
    document.getElementById("DownloadPreview").value = textContent;
}

function loadDoc() {
    var client = new XMLHttpRequest();
    client.open('GET',
        'https://raw.githubusercontent.com/HD-Dev1/HTML-Projects/master/Template.txt');
    client.onreadystatechange = function () {
        document.getElementById("editor").value = client.responseText;

    }
    client.send();
    console.log("HTML Template Text Status: Recived");
}
document.onload = loadDoc();
function mobileToggleEditor() {
    let editor = document.getElementById("editor");
    let viewer = document.getElementById("viewer");
    if (editor.style.display === "none") {
        editor.style.display = "block";
    } else {
        editor.style.display = "none";
    }
}

function copyToClip() {
    var copyText = document.getElementById("editor");
    copyText.select();
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");
    console.log("You copied code!");
}

function enableEditor() {
    const Editor = document.getElementById("editor");
    const Viewer = document.getElementById("viewer");
    if (Editor.style.display == "none") {
        Editor.style.display = "block";
        Viewer.style.width = "100%";
        Editor.style.width = "100%";
    } else {
        Viewer.style.width = "100%";
        Editor.style.width = "100%";
        Editor.style.display = "none";
    }
}

function viewportMenu() {
    const List = document.getElementById("deviceList");
    const PhoneSVG = document.getElementById("PhoneSVG");
    const PhoneTxt = document.getElementById("PhoneTxt");
    const TabletSVG = document.getElementById("TabletSVG");
    const TabletTxt = document.getElementById("TabletTxt");
    const pcSVG = document.getElementById("pcSVG");
    const pcTxt = document.getElementById("pcTxt");

    if (List.classList.contains("shrink")) {
        List.classList.remove("shrink");
        List.classList.add("grow");
    } else {
        List.classList.add("shrink");
        List.classList.remove("grow");
    }
}

function viewportMenuClose() {
    const List = document.getElementById("deviceList");
    const PhoneSVG = document.getElementById("PhoneSVG");
    const PhoneTxt = document.getElementById("PhoneTxt");
    const TabletSVG = document.getElementById("TabletSVG");
    const TabletTxt = document.getElementById("TabletTxt");
    const pcSVG = document.getElementById("pcSVG");
    const pcTxt = document.getElementById("pcTxt");
    List.classList.add("shrink");
    List.classList.remove("grow");
}

function phoneView() {
    const Editor = document.getElementById("editor");
    const Viewer = document.getElementById("viewer");
    Editor.style.width = "70%";
    Editor.style.height = "100%";
    Viewer.style.width = "30%";
}

function tabletView() {
    const Editor = document.getElementById("editor");
    const Viewer = document.getElementById("viewer");
    Editor.style.width = "55%";
    Editor.style.height = "100%";
    Viewer.style.width = "100%";
}

function pcView() {
    const Editor = document.getElementById("editor");
    const Viewer = document.getElementById("viewer");
    Editor.style.width = "23.9%";
    Editor.style.height = "100%";
    Viewer.style.width = "100%";
}

function Themes() {
    const List = document.getElementById("themesPallete");
    const Light = document.getElementById("Light");
    const Dark = document.getElementById("Dark");
    if (List.classList.contains("shrink")) {
        List.classList.remove("shrink");
        List.classList.add("grow");
    } else {
        List.classList.add("shrink");
        List.classList.remove("grow");
    }
}

function Styles() {
    const Menu = document.getElementById("stylesBg");
    if (Menu.classList.contains("invisible")) {
        Menu.classList.remove("invisible");
        Menu.classList.add("visible");
    } else {
        Menu.classList.add("invisible");
        Menu.classList.remove("visible");
    }
}

function closeStyles() {
    const Menu = document.getElementById("stylesBg");
    Menu.classList.add("invisible");
    Menu.classList.remove("visible");
}

function OpenSettings() {
    const Menu = document.getElementById("settingsBg");
    if (Menu.classList.contains("invisible")) {
        Menu.classList.remove("invisible");
        Menu.classList.add("visible");
    } else {
        Menu.classList.add("invisible");
        Menu.classList.remove("visible");
    }
}

function closeSettings() {
    const Menu = document.getElementById("settingsBg");
    Menu.classList.add("invisible");
    Menu.classList.remove("visible");
}


function OpenSave() {
    const Menu = document.getElementById("saveBg");
    refresh();
    if (Menu.classList.contains("invisible")) {
        Menu.classList.remove("invisible");
        Menu.classList.add("visible");
    } else {
        Menu.classList.add("invisible");
        Menu.classList.remove("visible");
    }
}

function CloseSave() {
    const Menu = document.getElementById("saveBg");
    Menu.classList.add("invisible");
    Menu.classList.remove("visible");
}

function handleFileSelect(evt) {
    var files = evt.target.files;
    for (var i = 0, f; f = files[i]; i++) {

        var reader = new FileReader();
        reader.onload = function (event) {
            var contents = event.target.result;
            var lines = contents.split('\n');
            document.getElementById('editor').value = contents;
            refresh();
        };
        reader.readAsText(f);
    }
}
function download(filename, text) {
var element = document.createElement('a');
element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
element.setAttribute('download', filename);

element.style.display = 'none';
document.body.appendChild(element);

element.click();

document.body.removeChild(element);
}
