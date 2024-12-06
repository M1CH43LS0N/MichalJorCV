const languageSelector = document.getElementById('language-selector');

languageSelector.addEventListener('change', () => {
    const selectedLanguage = languageSelector.value;
    const url = `index_${selectedLanguage}.html`;
    window.location.href = url;
});