/************************************************************************************/
/************************************[ JavaScript ]*********************************/
/************************************************************************************/
function Credits(Name, Project, Version, Created, Updated, Year, Email) {
    document.title = Project + ' v' + Version;
    document.getElementById('yearCreated').innerHTML = '(' + Year + ')';
    console.log('Author: ' + Name + '\n' + 'Project: ' + Project + '\n' + 'Version: ' + Version + '\n' + 'Created: ' + Created + '\n' + 'Updated: ' + Updated + '\n' + 'Email: ' + Email);
} Credits('Seth Medley', 'Portfolio', '1.2', '9/17/21', '8/1/22', '2021', 'Shmedley03@gmail.com');
/************************************************************************************/
document.getElementById("toggleMenu").addEventListener("click", function () {
    if (document.getElementById("list-menu").classList.contains("inactive")) {
        document.getElementById("list-menu").classList.remove("inactive");
        document.getElementById("list-menu").classList.add("active");
    } else {
        document.getElementById("list-menu").classList.add("inactive");
        document.getElementById("list-menu").classList.remove("active");
    }
})
/************************************************************************************/
/************************************************************************************/