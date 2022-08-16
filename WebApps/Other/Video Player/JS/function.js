function Credits(Name, Project, Created, Updated, Year, Email) {
    document.title = Project;
    document.getElementById('yearCreated').innerHTML = '(' + Year + ')';
    console.log('Author: ' + Name + '\n' + 'Project: ' + Project + '\n' + 'Created: ' + Created + '\n' + 'Updated: ' + Updated + '\n' + 'Email: ' + Email);
} Credits('Seth Medley', 'Template', '8/1/22', '8/1/22', '2022', 'Shmedley03@gmail.com');

$('#addPhotosBtn').click(function() {
    $(this).parents().find('#addPhotosInput').click();
  });
  
  document.getElementById('addPhotosInput').onchange = e => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    const li = ` <li> <img src=" ${url} ">
     <span><i class="fa fa-trash"></i></span>
     </li>`
    $('.photos-list ul').append(li);
  };
  
  $('#addVideosBtn').click(function() {
    $(this).parents().find('#addVideosInput').click();
  });
  
  document.getElementById('addVideosInput').onchange = e => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    const li = ` <li> <video controls="controls" src=" ${url} " type="video/mp4" width="400px" height="200px"></video>
         <span><i class="fa fa-trash"></i></span>
     </li>`
    $('section').append(li);
  };