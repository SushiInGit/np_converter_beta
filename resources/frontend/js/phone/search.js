const searchbarText = document.getElementById('searchbar');
const suggestionsBox = document.getElementById('suggestionsBox');
const messagesBox = document.getElementById('messagesBox');
let suggestionSelected = false;

const searchSyntax = [
    { syntax: "to:", description: "Filter conversations by a specific number in the communication list." },
    { syntax: "name:", description: "Filter conversations by a specific name, excluding unknown contacts." },
    { syntax: "has_phone:", description: "Show conversations with phone numbers." },
    { syntax: "has_phone_strict:", description: "Show <u><b>only</b></u> messages with phone numbers." },
    { syntax: "has_number:", description: "Show conversations with any type of numbers." },
    { syntax: "has_number_strict:", description: "Show <u><b>only</b></u> messages with numbers." },
    { syntax: "has_links:", description: "Show conversations with links and images." },
    { syntax: "no_calls:", description: "Show conversations without call logs displayed." },
];

const messages = middleman.requestData.allMetadata();

searchbarText.setAttribute('data-placeholder', searchbarText.getAttribute('placeholder'));

searchbarText.addEventListener('input', () => {
    if (searchbarText.textContent.trim() === "") {
        searchbarText.setAttribute('data-placeholder', searchbarText.getAttribute('placeholder'));
    } else {
        searchbarText.removeAttribute('data-placeholder');
    }
});

suggestionsBox.addEventListener('mousedown', function (event) {
    suggestionSelected = true;
});

suggestionsBox.addEventListener('mouseup', function (event) {
    suggestionSelected = false;
});

searchbarText.addEventListener('blur', function () {
    setTimeout(function () {
        if (!suggestionSelected) {
            suggestionsBox.classList.remove('show');
        }
    }, 100);
});

searchbarText.addEventListener('input', function () {
    const inputText = this.innerText.toLowerCase();
    showSuggestions(inputText);
    filterMessages(inputText);
    highlightSyntax(inputText);
});

searchbarText.addEventListener('focus', function () {
    const inputText = this.innerText.toLowerCase();
    showSuggestions(inputText);
});

searchbarText.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});

function showSuggestions(inputText = '') {
    suggestionsBox.innerHTML = '';

    const filteredSuggestions = inputText
        ? searchSyntax.filter(item => item.syntax.startsWith(inputText))
        : searchSyntax;

    if (filteredSuggestions.length > 0) {
        suggestionsBox.classList.add('show');
        filteredSuggestions.forEach((syntaxItem, index) => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.classList.add('suggestion');
            suggestionDiv.innerHTML = `<span class="syntax">${syntaxItem.syntax}</span> <span class="hint">${syntaxItem.description}</span>`;
            
            suggestionDiv.addEventListener('click', () => {
                selectSuggestion(syntaxItem.syntax);  
            });

            suggestionsBox.appendChild(suggestionDiv);
        });
    } else {
        suggestionsBox.classList.remove('show');
    }
}

function selectSuggestion(syntax) {
    const currentText = searchbarText.innerHTML;
    searchbarText.innerHTML = `<span class="syntax">${syntax}</span> .`;
    searchbarText.focus();
    suggestionsBox.classList.remove('show');
    highlightSyntax(searchbarText.innerText);  

    setTimeout(() => {
        if (searchbarText.innerHTML.endsWith('.')) {
            searchbarText.innerHTML = searchbarText.innerHTML.slice(0, -1); 
            highlightSyntax(searchbarText.innerText); 
        }
    }, 10);
    filterMessages(searchbarText.innerText);
}


function highlightSyntax(inputText) {
    const regex = /(\w+:\s?)/g;
    searchbarText.innerHTML = inputText.replace(regex, '<span class="syntax">$1</span> ');
    placeCaretAtEnd(searchbarText);
}

function placeCaretAtEnd(el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function filterMessages(inputText) {

    const regex = /(\w+):\s*(.+)/g;
    const matches = [...inputText.matchAll(regex)];

    if (!inputText || inputText.trim() === '') {
        frontend.renderList(middleman.requestData.allMetadata());
        return; 
    }
    if (matches.length === 0) {
        frontend.renderList(middleman.filterBy.All(inputText));
        return;
    } 

    matches.some(match => {
        const key = match[1].toLowerCase();
        const value = match[2].toLowerCase();
        if (key === "to") {
            frontend.renderList(middleman.filterBy.Number(value));
        } else if (key === "has_phone") {
            frontend.renderList(middleman.filterBy.hasPhone(value));
        } else if (key === "has_number") {
            frontend.renderList(middleman.filterBy.hasNumber(value));
        } else if (key === "has_phone_strict") {
            frontend.renderList(middleman.filterBy.hasPhone(value));
        } else if (key === "has_number_strict") {
            frontend.renderList(middleman.filterBy.hasNumber(value));
        } else if (key === "has_links") {
            frontend.renderList(middleman.filterBy.hasLink(value));
        } else if (key === "no_calls") {
            frontend.renderList(middleman.filterBy.noCalls(value));
        } else if (key === "name") {
            frontend.renderList(middleman.filterBy.Name(value));
        } 
    });
}