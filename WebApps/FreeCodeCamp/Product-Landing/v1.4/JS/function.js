/************************************************************************************/
/************************************[ JavaScript ]**********************************/
/************************************************************************************/
function Credits(Name, Project, Version, Created, Updated, Year, Email) {
    document.title = Project + " v" + Version;
    document.getElementById('Name').innerHTML = Name;
    document.getElementById('Email').innerHTML = Email;
    document.getElementById('Created').innerHTML = Created;
    document.getElementById('Updated').innerHTML = Updated;
    document.getElementById('yearCreated').innerHTML = '(' + Year + ')';
    console.log('Author: ' + Name + '\n' + 'Project: ' + Project + '\n' + 'Version: ' + Version + '\n' + 'Created: ' + Created + '\n' + 'Updated: ' + Updated + '\n' + 'Email: ' + Email);
} Credits('Seth Medley', 'Landing', '1.4', '8/2/22', '8/16/22', '2022', 'Shmedley03@gmail.com');
/************************************************************************************/
/************************************************************************************/