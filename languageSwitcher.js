const languageSwitchButton = document.getElementById('language-switch');

languageSwitchButton.addEventListener('click', () => {
  if (languageSwitchButton.textContent === 'Switch language') {
    languageSwitchButton.textContent = 'Změnit jazyk';
  } else {
    languageSwitchButton.textContent = 'Switch language';
  }
});