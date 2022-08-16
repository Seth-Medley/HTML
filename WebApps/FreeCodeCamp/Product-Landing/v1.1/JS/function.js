/************************************************************************************/
/************************************[ JavaScript ]**********************************/
/************************************************************************************/
function Credits(Name, Project, Version, Created, Updated, Year, Email) {
    document.title = Project + ' v' + Version;
    document.getElementById('yearCreated').innerHTML = '(' + Year + ')';
    console.log('Author: ' + Name + '\n' + 'Project: ' + Project + '\n' + 'Version: ' + Version + '\n' + 'Created: ' + Created + '\n' + 'Updated: ' + Updated + '\n' + 'Email: ' + Email);
} Credits('Seth Medley', 'Landing', '1.1', '7/5/19', '8/16/22', '2019', 'Shmedley03@gmail.com');
/************************************************************************************/
/************************************************************************************/