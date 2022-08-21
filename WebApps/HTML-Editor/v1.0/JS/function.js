document.getElementById("editor-textarea").addEventListener("keyup", refresh);
function refresh() {
    var textContent = document.getElementById("editor-textarea").value;
    document.getElementById("viewer").srcdoc = textContent;
}