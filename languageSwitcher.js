document.getElementById('language-switch').addEventListener('click', function() { 
  changeLanguage('en');
  changeLanguage('cs')
});
function changeLanguage(language) {
  if (language === 'cs') {
      fetch('index-cs.html')
          .then(response => response.text())
          .then(data => {
              document.body.innerHTML = data;
          });
  } else if (language === 'en') {
      fetch('index-en.html')
          .then(response => response.text())
          .then(data => {
              document.body.innerHTML = data;
          });
  }
}