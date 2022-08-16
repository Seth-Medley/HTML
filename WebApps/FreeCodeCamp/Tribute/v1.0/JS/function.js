/************************************************************************************/
/************************************[ JavaScript ]**********************************/
/************************************************************************************/
function Credits(Name, Project, Version, Created, Updated, Year, Email) {
    document.title = Project + ' v' + Version;
    document.getElementById('yearCreated').innerHTML = '(' + Year + ')';
    console.log('Author: ' + Name + '\n' + 'Project: ' + Project + '\n' + 'Version: ' + Version + '\n' + 'Created: ' + Created + '\n' + 'Updated: ' + Updated + '\n' + 'Email: ' + Email);
} Credits('Seth Medley', 'Tribute', '1.0', '4/2/19', '8/16/22', '2022', 'Shmedley03@gmail.com');
/************************************************************************************/
/************************************************************************************/