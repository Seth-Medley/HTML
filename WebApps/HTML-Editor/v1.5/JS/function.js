/*****************************************************************/
/***************************[Index.JS]****************************/
/*****************************************************************/
function loadDoc() { // Loads HTML Template
    var client = new XMLHttpRequest();
    client.open('GET','https://raw.githubusercontent.com/HD-Dev1/HTML-Projects/master/Template.txt');
    client.onreadystatechange = function () {
        const textarea = document.querySelector('textarea');
        const iframe = document.querySelector('iframe');
        textarea.value = client.responseText;
        iframe.srcdoc = textarea.value;
    }
    client.send();
}document.onload = loadDoc();
//////
function navButtons() { // Nav Buttons
    document.getElementById('toggleEditor').addEventListener('click', ()=> {
        if (document.querySelector('textarea').style.display == 'none') {
            document.querySelector('textarea').style.display = 'block'
        } else {
            document.querySelector('textarea').style.display = 'none'
        }
    })
    document.getElementById('toggleCopy').addEventListener('click', ()=> {
            var copyText = document.querySelector('textarea');
            copyText.select();
            copyText.setSelectionRange(0, 99999);
            document.execCommand("copy");
            console.log("You copied code!");
    })
    document.getElementById('toggleClear').addEventListener('click', ()=> {
        document.querySelector('textarea').value = "";
        document.querySelector('iframe').srcdoc = document.querySelector('textarea').value;
    })
    document.getElementById('toggleRefresh').addEventListener('click', ()=> {
        loadDoc();
    })
} document.onload = navButtons();
//////
function themeButtons() { // Themes Switcher
    document.getElementById("light__option__btn").addEventListener('click', ()=> {
        if (document.body.classList.contains('dark')||document.body.classList.contains('midnight')) {
            document.body.classList.remove('dark');
            document.body.classList.remove('midnight');
            document.body.classList.add('light');
            activeDetection();
        }
    })
    document.getElementById("dark__option__btn").addEventListener('click', ()=> {
        if (document.body.classList.contains('light')||document.body.classList.contains('midnight')) {
            document.body.classList.remove('light');
            document.body.classList.remove('midnight');
            document.body.classList.add('dark');
            activeDetection();
        }
    })
    document.getElementById("midnight__option__btn").addEventListener('click', ()=> {
        if (document.body.classList.contains('light')||document.body.classList.contains('dark')) {
            document.body.classList.remove('dark');
            document.body.classList.remove('light');
            document.body.classList.add('midnight');
            activeDetection();
        }
    })
} document.onload = themeButtons();
//////
function deviceButtons() { // Viewport Switcher
    document.getElementById('mobile__option__btn').addEventListener('click', ()=> {
        const textarea = document.querySelector('textarea');
        textarea.classList.add('mobile');
        textarea.classList.remove('tablet');
        textarea.classList.remove('laptop');
        activeDetection();
    })
    document.getElementById('tablet__option__btn').addEventListener('click', ()=> {
        const textarea = document.querySelector('textarea');
        textarea.classList.remove('mobile');
        textarea.classList.add('tablet');
        textarea.classList.remove('laptop');
        activeDetection();
    })
    document.getElementById('laptop__option__btn').addEventListener('click', ()=> {
        const textarea = document.querySelector('textarea');
        textarea.classList.remove('mobile');
        textarea.classList.remove('tablet');
        textarea.classList.add('laptop');
        activeDetection();
    })
} document.onload = deviceButtons();
//////
function openDialogs() { // Opens Dialogs
    document.getElementById('toggleProfile').addEventListener('click', ()=> {
        document.getElementById('profileDialog').classList.add('active');
    })
    document.getElementById('toggleThemes').addEventListener('click', ()=> {
        document.getElementById('themesDialog').classList.add('active');
    })
    document.getElementById('toggleDevices').addEventListener('click', ()=> {
        document.getElementById('devicesDialog').classList.add('active');
    })
    document.getElementById('toggleDownload').addEventListener('click', ()=> {
        document.getElementById('downloadDialog').classList.add('active');
        document.getElementById('preview_code').value = document.querySelector('textarea').value;
    })
    document.getElementById('toggleSettings').addEventListener('click', ()=> {
        const textarea = document.querySelector('textarea');
        const input_box = document.getElementById('fontSize__option__box');
        input_box.value = window.getComputedStyle(textarea).fontSize;
        document.getElementById('settingsDialog').classList.add('active');
    }) 
} document.onload = openDialogs();
//////
function closeDialogs() { // Closes Dialogs
    document.querySelectorAll('.dialog__close').forEach(dialog__close => {
        dialog__close.addEventListener('click', function handleClick(event) {
            document.querySelectorAll('.dialog').forEach(dialog => {
                dialog.classList.remove('active');
            });
        });
    });
    document.querySelectorAll('.dialog__backdrop').forEach(dialog__close => {
        dialog__close.addEventListener('dblclick', function handleClick(event) {
            document.querySelectorAll('.dialog').forEach(dialog => {
                dialog.classList.remove('active');
            });
        });
    });
} document.onload = closeDialogs();
//////
function referSettingsDialogs() {
    document.getElementById('theme__option__btn').addEventListener('click', ()=> {
        document.getElementById('settingsDialog').classList.remove('active');
        document.getElementById('themesDialog').classList.add("active");
    })
    document.getElementById('devices__option__btn').addEventListener('click', ()=> {
        document.getElementById('settingsDialog').classList.remove('active');
        document.getElementById('devicesDialog').classList.add("active");
    })
    document.getElementById('download__option__btn').addEventListener('click', ()=> {
        document.getElementById('settingsDialog').classList.remove('active');
        document.getElementById('downloadDialog').classList.add("active");
        document.getElementById('preview_code').value = document.querySelector('textarea').value;
    })
    document.getElementById('tags__option__btn').addEventListener('click', ()=> {
        const button = document.getElementById('tags__option__btn');
        if (button.value == "Disable") {
            button.value = "Enable";
            document.querySelectorAll('.tag').forEach(tags => {
                tags.style.display = "none";
            });
        } else {
            button.value = "Disable";
            document.querySelectorAll('.tag').forEach(tags => {
                tags.style.display = "flex";
            });
        }
    })
    document.getElementById('download__option__btn').addEventListener('click', ()=> {
        document.getElementById('settings__dialog').classList.remove('active');
        document.getElementById('download__dialog').classList.add("active");
    })
    document.getElementById('fontSize__option__btn').addEventListener('click', ()=> {
        const textarea = document.querySelector('textarea');
        const input_box = document.getElementById('fontSize__option__box');
        textarea.style.fontSize = input_box.value;
    })
} document.onload = referSettingsDialogs();
//////
function onLoad() { // Fires Functions On Page Load
    document.querySelector('textarea').addEventListener('mouseover', (tagText));
    document.querySelector('textarea').addEventListener("keyup", ()=> { // Syncs textarea & iframe
        var textContent = document.querySelector('textarea').value
        document.querySelector('iframe').srcdoc = textContent;
    })
    document.getElementById('toggle__sidenav').addEventListener('click', ()=> { // Toggles Sidenav
        const nav = document.querySelector('nav');
        if (nav.classList.contains('active')) {
            nav.classList.remove('active')
        } else {
            nav.classList.add('active')
        }
    })
    function tagText() { // Loads Tag Text
        const textarea = document.querySelector('textarea');
        const iframe = document.querySelector('iframe');
        const textarea__tag = document.getElementById('textarea__tag');
        const iframe__tag =  document.getElementById('iframe__tag');
    
        textarea__tag.innerHTML = "xy: " + textarea.offsetWidth + "x" + textarea.offsetHeight;
        iframe__tag.innerHTML = "xy: " + iframe.offsetWidth + "x" + iframe.offsetHeight;
    } tagText()
    function fileUpload() { // File Upload
        let input = document.querySelector('input');
        let textarea = document.querySelector('textarea');
        let iframe = document.querySelector('iframe');
        let sidenav = document.querySelector('nav');
        input.addEventListener('change', () => {
            let files = input.files
            if (files.length == 0) return
            const file = files[0]
            let reader = new FileReader()
            reader.onload = (e) => {
                const file = e.target.result;
                const lines = file.split(/\r\n|\n/)
                textarea.value = lines.join('\n')
                iframe.srcdoc = textarea.value
                sidenav.classList.remove("active")
                sidenav.classList.add("inactive")
            }
            reader.onerror = (e) => alert(e.target.error.name)
            reader.readAsText(file)
        });
    };document.onload = fileUpload();
} document.onload = onLoad();
//////
function download(filename, text) { // Download File
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
//////
function activeDetection() { // Active Detection
    const body = document.body;
    const light = document.getElementById("light__option__btn");
    const dark = document.getElementById("dark__option__btn");
    const midnight  = document.getElementById("midnight__option__btn");
    const mobile = document.getElementById('mobile__option__btn');
    const tablet = document.getElementById('tablet__option__btn');
    const laptop = document.getElementById('laptop__option__btn');
    const active__color = getComputedStyle(document.body).getPropertyValue('--active');
    if (body.classList.contains('light')) {
        light.style.backgroundColor = active__color;
        light.value = "Active";
        dark.style.backgroundColor = "transparent";
        dark.value = "Switch";
        midnight.style.backgroundColor = "transparent";
        midnight.value = "Switch";
    }
    if (body.classList.contains('dark')) {
        light.style.backgroundColor = "transparent";
        light.value = "Switch";
        dark.style.backgroundColor = active__color;
        dark.value = "Active";
        midnight.style.backgroundColor = "transparent";
        midnight.value = "Switch";
    }
    if (body.classList.contains('midnight')) {
        light.style.backgroundColor = "transparent";
        light.value = "Switch";
        dark.style.backgroundColor = "transparent";
        dark.value = "Switch";
        midnight.style.backgroundColor = active__color;
        midnight.value = "Active";
    }

    if (document.querySelector('textarea').classList.contains('mobile')) {
        mobile.style.backgroundColor = active__color;
        mobile.value = "Active";
        tablet.style.backgroundColor = "transparent";
        tablet.value = "Switch";
        laptop.style.backgroundColor = "transparent";
        laptop.value = "Switch";
    }
    if (document.querySelector('textarea').classList.contains('tablet')) {
        mobile.style.backgroundColor = "transparent";
        mobile.value = "Switch";
        tablet.style.backgroundColor = active__color;
        tablet.value = "Active";
        laptop.style.backgroundColor = "transparent";
        laptop.value = "Switch";
    }
    if (document.querySelector('textarea').classList.contains('laptop')) {
        mobile.style.backgroundColor = "transparent";
        mobile.value = "Switch";
        tablet.style.backgroundColor = "transparent";
        tablet.value = "Switch";
        laptop.style.backgroundColor = active__color;
        laptop.value = "Active";
    }
} document.onload = activeDetection();
//////
function errorTxt(Text, Target) {
    const text = document.createElement('p');
    const container = document.createElement('div');
    const target = document.getElementById(Target);
    target.style.display = "flex"
    target.style.justifyContent = "center"
    container.style.margin = "auto";
    text.innerHTML = Text;
    text.style.color = "#fff";
    text.style.width = "100%";
    text.style.height = "100%";
    container.appendChild(text);
    target.appendChild(container);
}
//////
/*****************************************************************/
/*****************************************************************/