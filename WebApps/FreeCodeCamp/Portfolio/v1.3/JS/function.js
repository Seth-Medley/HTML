/************************************************************************************/
/************************************[ JavaScript ]**********************************/
/************************************************************************************/
function Credits(Name, Project, Version, Created, Updated, Year, Email) {
    document.title = Project + " v" + Version;
    document.getElementById('Title').innerHTML = Project;
    document.getElementById('Name').innerHTML = Name;
    document.getElementById('Created').innerHTML = 'Created: ' + Created;
    document.getElementById('Updated').innerHTML = 'Updated: ' + Updated;
    document.getElementById('Email').innerHTML = 'Email: ' + Email;
    document.getElementById('yearCreated').innerHTML = '(' + Year + ')';
    console.log('Author: ' + Name + '\n' + 'Project: ' + Project + '\n' + 'Version: ' + Version + '\n' + 'Created: ' + Created + '\n' + 'Updated: ' + Updated + '\n' + 'Email: ' + Email);
} Credits('Seth Medley', 'Portfolio', '1.3', '8/1/22', '8/16/22', '2022', 'Shmedley03@gmail.com');
/************************************************************************************/
/************************************************************************************/