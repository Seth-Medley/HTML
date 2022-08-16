/************************************************************************************/
/************************************[ JavaScript ]**********************************/
/************************************************************************************/
function Credits(Name, Project, Version, Created, Updated, Year, Email) {
  document.title = Project + ' v' + Version;
  document.getElementById('yearCreated').innerHTML = '(' + Year + ')';
  console.log('Author: ' + Name + '\n' + 'Project: ' + Project + '\n' + 'Version: ' + Version + '\n' + 'Created: ' + Created + '\n' + 'Updated: ' + Updated + '\n' + 'Email: ' + Email);
} Credits('Seth Medley', 'Portfolio', '1.1', '4/6/20', '8/16/22', '2020', 'Shmedley03@gmail.com');
/************************************************************************************/
function myFunction() { // NavBar
    var x = document.getElementById("myLinks");
    if (x.style.display === "block") {
      x.style.display = "none";
    } else {
      x.style.display = "block";
    }
  }
/************************************************************************************/
/************************************************************************************/