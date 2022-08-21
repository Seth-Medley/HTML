const body = document.body;
const alertTime = 3000;
const toggle_sidenav_div = document.getElementById("toggle-sidenav");
const sidenav_div = document.getElementById("sidenav");
const text_editor_textarea = document.getElementById("text-editor");
const viewer_iframe = document.getElementById("viewer");
const toggle_editor_div = document.getElementById("toggle-editor");
const toggle_copy_div = document.getElementById("toggle-copy");
const toggle_refresh_div = document.getElementById("toggle-refresh");
const toggle_theme_div = document.getElementById("toggle-theme");
const toggle_devices_div = document.getElementById("toggle-devices");
const toggle_upload_div = document.getElementById("toggle-upload");
const toggle_download_div = document.getElementById("toggle-download");
const toggle_settings_div = document.getElementById("toggle-settings");
const preview_code_textarea = document.getElementById("preview_code");
const download_window_div = document.getElementById("download-window");
const settings_window_div = document.getElementById("settings-window");
const download_close_btn_span = document.getElementById("download-close-btn");
const settings_close_btn_span = document.getElementById("settings-close-btn");
const theme_panel_wrapper_div = document.getElementById("theme-panel-wrapper");
const device_panel_wrapper_div = document.getElementById("device-panel-wrapper");
const theme_panel_div = document.getElementById("theme-panel");
const device_panel_div = document.getElementById("device-panel");
const light_div = document.getElementById("Light");
const dark_div = document.getElementById("Dark");
const light_tag_p = document.getElementById("light-tag");
const dark_tag_p = document.getElementById("dark-tag");
const mobile_div = document.getElementById("Mobile");
const tablet_div = document.getElementById("Tablet");
const pc_div = document.getElementById("PC");
const mobile_tag_p = document.getElementById("mobile-tag");
const tablet_tag_p = document.getElementById("tablet-tag");
const pc_tag_p = document.getElementById("pc-tag");
const notifcation_alert_div = document.getElementById("notifcation-alert");
const notifcation_alert_text_p = document.getElementById("notifcation-alert-text");

function loadDoc() { // Loads HTML Template
    var client = new XMLHttpRequest();
    client.open('GET','https://raw.githubusercontent.com/Seth-Medley/HTML/master/Template.txt
    client.onreadystatechange = function () {
        text_editor_textarea.value = client.responseText;
        viewer_iframe.srcdoc = text_editor_textarea.value;
    }
    client.send();
}document.onload = loadDoc();
function getActiveClasses() {
    if (body.classList.contains("dark")) {
        dark_tag_p.innerHTML = "Dark" + " (Active)".fontsize(1).sup()
    } else {
        light_tag_p.innerHTML = "Light" + " (Active)".fontsize(1).sup()
    }
}document.onload = getActiveClasses();
function fileUpload() { // File Upload
    let input = document.querySelector('input')
    let textarea = document.querySelector('textarea')
    let iframe = document.querySelector('iframe')
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
            sidenav_div.classList.remove("active")
            sidenav_div.classList.add("inactive")
            Notify("You've uploaded a file.")
        }
        reader.onerror = (e) => alert(e.target.error.name)
        reader.readAsText(file)
    });
};document.onload = fileUpload();
function download(filename, text) { // Download File
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
function Notify(Text) {
     // Alert
    notifcation_alert_text_p.innerHTML = Text
    notifcation_alert_div.classList.remove("inactive")
    notifcation_alert_div.classList.add("active")
    setTimeout(() => {
        notifcation_alert_div.classList.remove("active")
        notifcation_alert_div.classList.add("inactive")
        notifcation_alert_text_p.innerHTML = "N/A"
    }, alertTime);
}
toggle_sidenav_div.addEventListener("click", ()=> { // Toggles SideNav
    if (sidenav_div.classList.contains("active")) {
        sidenav_div.classList.remove("active")
        theme_panel_div.classList.remove("active")
        theme_panel_div.classList.add("inactive")
        device_panel_div.classList.remove("active")
        device_panel_div.classList.add("inactive")
    } else {
        sidenav_div.classList.add("active")
    }
})
toggle_editor_div.addEventListener("click", ()=> { // Toggles Editor
    if (text_editor_textarea.style.display == "none") {
        text_editor_textarea.style.display = "block"
        Notify("The editor is visible.")
    } else {
        text_editor_textarea.style.display = "none"
        Notify("The editor is invisible.")
    }
})
toggle_copy_div.addEventListener("click", ()=> { // Copies Code
    var copyText = text_editor_textarea
    copyText.select();
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");
    console.log("You copied code!");
    Notify("You copied some code!")
})
text_editor_textarea.addEventListener("keyup", ()=> { // Syncs textarea & iframe
    var textContent = text_editor_textarea.value
    document.getElementById("viewer").srcdoc = textContent; 
})
toggle_refresh_div.addEventListener("click", () => { // Toggles Manual Refresh
    var client = new XMLHttpRequest();
    client.open('GET','https://raw.githubusercontent.com/Seth-Medley/HTML/master/Template.txt');
    client.onreadystatechange = function () {
        text_editor_textarea.value = client.responseText;
        viewer_iframe.srcdoc = text_editor_textarea.value;
    }
    client.send();
    Notify("Refreshing...")
})
toggle_download_div.addEventListener("click", ()=> { // Toggles Download Menu
    if (download_window_div.classList.contains("active")) {
        download_window_div.classList.remove("active")
        download_window_div.classList.add("inactive")
    } else {
        download_window_div.classList.remove("inactive")
        download_window_div.classList.add("active")
    }
    preview_code_textarea.value = text_editor_textarea.value
})
download_close_btn_span.addEventListener("click", ()=> { // Close Download Menu
    if (download_window_div.classList.contains("active")) {
        download_window_div.classList.remove("active")
        download_window_div.classList.add("inactive")
    }
})
toggle_settings_div.addEventListener("click", ()=> { // Toggle Settings Menu
    if (settings_window_div.classList.contains("active")) {
        settings_window_div.classList.remove("active")
        settings_window_div.classList.add("inactive")
    } else {
        settings_window_div.classList.remove("inactive")
        settings_window_div.classList.add("active")
    }
})
settings_close_btn_span.addEventListener("click", ()=> { // Close Settings Menu
    if (settings_window_div.classList.contains("active")) {
        settings_window_div.classList.remove("active")
        settings_window_div.classList.add("inactive")
    }
})
toggle_theme_div.addEventListener("click", () => { // Toggles Theme Panel
    if (theme_panel_div.classList.contains("inactive")) {
        theme_panel_div.classList.remove("inactive")
        theme_panel_div.classList.add("active")
        //
        theme_panel_wrapper_div.classList.remove("inactive")
        theme_panel_wrapper_div.classList.add("active")
        // Deactivate Device Panel
        device_panel_div.classList.remove("active")
        device_panel_div.classList.add("inactive")
    } else {
        theme_panel_div.classList.remove("active")
        theme_panel_div.classList.add("inactive")
    }
})
toggle_devices_div.addEventListener("click", () => { // Togggles Device Panel
    if (device_panel_div.classList.contains("inactive")) {
        device_panel_div.classList.remove("inactive")
        device_panel_div.classList.add("active")
        //
        device_panel_wrapper_div.classList.remove("inactive")
        device_panel_wrapper_div.classList.add("active")
        // Deactivate Theme Panel
        theme_panel_div.classList.remove("active")
        theme_panel_div.classList.add("inactive")
    } else {
        device_panel_div.classList.remove("active")
        device_panel_div.classList.add("inactive")
    }
})
theme_panel_wrapper_div.addEventListener("click", ()=> { // Dismisses Theme Panel
    theme_panel_div.classList.remove("active")
    theme_panel_div.classList.add("inactive")
setTimeout(() => {
    theme_panel_wrapper_div.classList.remove("active")
    theme_panel_wrapper_div.classList.add("inactive")
}, 300);
})
device_panel_wrapper_div.addEventListener("click", ()=> {  // Dismisses Device Panel
    device_panel_div.classList.remove("active")
    device_panel_div.classList.add("inactive")
    setTimeout(() => {
        device_panel_wrapper_div.classList.remove("active")
        device_panel_wrapper_div.classList.add("inactive")
    },300);
})
mobile_div.addEventListener("click", () => { // Toggles Mobile Viewport
    text_editor_textarea.style.width = "70%"
    mobile_tag_p.innerHTML = "Mobile" + " (Active)".fontsize(1).sup()
    tablet_tag_p.innerHTML = "Tablet"
    pc_tag_p.innerHTML = "PC"
})
tablet_div.addEventListener("click", () => { // Toggles Tablet Viewport
    text_editor_textarea.style.width = "30%"
    tablet_tag_p.innerHTML = "Tablet" + " (Active)".fontsize(1).sup()
    mobile_tag_p.innerHTML = "Mobile"
    pc_tag_p.innerHTML = "PC"
})
pc_div.addEventListener("click", () => { // Toggles PC Viewport
    text_editor_textarea.style.width = "0%"
    pc_tag_p.innerHTML = "PC" + " (Active)".fontsize(1).sup()
    tablet_tag_p.innerHTML = "Tablet"
    mobile_tag_p.innerHTML = "Mobile"
})
light_div.addEventListener("click", () => { // Toggles Light Theme
    if (body.classList.contains("dark")) {
        body.classList.remove("dark")
        body.classList.add("light")
        light_tag_p.innerHTML = "Light" + " (Active)".fontsize(1).sup()
        dark_tag_p.innerHTML = "Dark"
        Notify("Light theme has been enabled.")
    }
})
dark_div.addEventListener("click", () => { // Toggles Dark Theme
    if (body.classList.contains("light")) {
        body.classList.remove("light")
        body.classList.add("dark")
        dark_tag_p.innerHTML = "Dark" + " (Active)".fontsize(1).sup()
        light_tag_p.innerHTML = "Light"
        Notify("Dark theme has been enabled.")
    }
})