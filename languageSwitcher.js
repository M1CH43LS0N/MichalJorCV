const languageSwitchButton = document.getElementById('language-switch');
const contentDiv = document.getElementById('content');

let currentLanguage = 'en'; // Default language

languageSwitchButton.addEventListener('click', () => {
    if (currentLanguage === 'en') {
        currentLanguage = 'cs';
    } else {
        currentLanguage = 'en';
    }

    fetch(`index_${currentLanguage}.html`)
        .then(response => response.text())
        .then(data => {
            contentDiv.innerHTML = data;
        });
});

// Load the initial content
fetch(`index_${currentLanguage}.html`)
    .then(response => response.text())
    .then(data => {
        contentDiv.innerHTML = data;
    });