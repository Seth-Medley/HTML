$(document).ready(function(){
    $(document).ready(function() { // Sets contents from uploaded file to the textarea.
            let input = document.querySelector('input')
            let textarea = document.querySelector('textarea')
            let iframe = document.querySelector('iframe')
            input.addEventListener('change', () => {
                let files = input.files;
    
                if (files.length == 0) return;
                const file = files[0];
    
                let reader = new FileReader();
    
                reader.onload = (e) => {
                    document.getElementById("sidebar").classList.remove("grow");
                    document.getElementById("sidebar").classList.add("shrink");
                    const file = e.target.result;
                    const lines = file.split(/\r\n|\n/);
                    textarea.value = lines.join('\n');
                    iframe.srcdoc = textarea.value
                };
    
                reader.onerror = (e) => alert(e.target.error.name);
    
                reader.readAsText(file);
                document.getElementById("sidebar").classList.remove("active");
                document.getElementById("deviceSelector").classList.remove("active");
                document.getElementById("themeSelector").classList.remove("active");
            });
    })
    $(document).ready(function() { // Loads HTML Template
       var client = new XMLHttpRequest();
                client.open('GET', 'https://raw.githubusercontent.com/Seth-Medley/HTML/master/Template.txt');
                client.onreadystatechange = function () {
                    document.getElementById("texteditor").value = client.responseText;
                }
                client.send();
                console.log("HTML Template Text Status: Recived");
                document.getElementById("viewer").srcdoc = document.getElementById("texteditor").value;
    
    })
    $("#toggleCopy").click(function() {var copyText = document.getElementById("texteditor"); // Copies Code
        copyText.select();
        copyText.setSelectionRange(0, 99999)
        document.execCommand("copy");
        console.log("You copied code!");
    //
    $("#deviceSelector").removeClass("active"); $("#themeSelector").removeClass("active");
    })
    $("#toggleRefresh").click(function() {
        //
        $("#texteditor").width("40%"); $("#viewer").width("100%");
        //
        $("#deviceSelector").removeClass("active"); $("#themeSelector").removeClass("active");
        //
        var client = new XMLHttpRequest(); // Refreshes Textarea
                client.open('GET', 'https://raw.githubusercontent.com/Seth-Medley/HTML/master/Template.txt');
                client.onreadystatechange = function () {
                    document.getElementById("texteditor").value = client.responseText;
                }
                client.send();
                console.log("HTML Template Text Status: Recived");
                document.getElementById("viewer").srcdoc = document.getElementById("texteditor").value;
    })
    $("#toggleMenu").click(function() {$("#sidebar").toggleClass("active"); $("#deviceSelector").removeClass("active"); $("#themeSelector").removeClass("active");}) // Toggles Sidebar
    $("#toggleEditor").click(function() {$("#texteditor").toggleClass("active");  $("#deviceSelector").removeClass("active"); $("#themeSelector").removeClass("active");}) // Toggles Editor
    $("#toggleMobileEdit").click(function() {$("#texteditor").toggleClass("active");}) // Toggles Editor
    $("#toggleDownloadCloseBtn").click(function(){$("#downloadPanel").toggleClass("active")}) //Toggles Download Panel
    $("#toggleDownload").click(function() {$("#downloadPanel").toggleClass("active"), $("#preview_code").val($("#texteditor").val());  $("#deviceSelector").removeClass("active"); $("#themeSelector").removeClass("active");}) // Syncs download preview
    $("#texteditor").keyup(function() {document.getElementById("viewer").srcdoc = document.getElementById("texteditor").value;  $("#deviceSelector").removeClass("active"); $("#themeSelector").removeClass("active");}) // Syncs iframe
    $("#upload-wrapper").click(function() {$("#deviceSelector").removeClass("active"); $("#themeSelector").removeClass("active");}) // User Interaction w/ Upload Button
    $("#toggleTheme").click(function() { // Toggles Theme Selector
        if($("#deviceSelector").hasClass) {
            $("#deviceSelector").removeClass("active")
            $("#themeSelector").toggleClass("active")
        }
    })
    $("#toggleDevice").click(function() { // Toggles Device Selector
        if($("#themeSelector").hasClass) {
            $("#themeSelector").removeClass("active")
            $("#deviceSelector").toggleClass("active")
        }
    })
    $("#Mobile").click(function() {$("#texteditor").width("100%"); $("#viewer").width("30%");  $("#deviceSelector").removeClass("active"); $("#themeSelector").removeClass("active");}) //Mobile View
    $("#Tablet").click(function() {$("#texteditor").width("40%"); $("#viewer").width("100%");  $("#deviceSelector").removeClass("active"); $("#themeSelector").removeClass("active");}) //Tablet View
    $("#PC").click(function() {$("#texteditor").width("10%"); $("#viewer").width("100%");  $("#deviceSelector").removeClass("active"); $("#themeSelector").removeClass("active");}) //PC View
    $("#lightScheme").click(function() {
       $("body").addClass("light");
       $("body").removeClass("dark");
    })
    $("#darkScheme").click(function() {
        $("body").addClass("dark");
        $("body").removeClass("light");
    })
    $("#toggleSettings").click(function() {$("#settingsPanel").toggleClass("active")})
    $("#toggleSettingsCloseBtn").click(function() {$("#settingsPanel").toggleClass("active")})
    })
    function download(filename, text) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', filename);
    
                element.style.display = 'none';
                document.body.appendChild(element);
    
                element.click();
    
                document.body.removeChild(element);
            }
    