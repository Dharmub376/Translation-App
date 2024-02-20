document.addEventListener("DOMContentLoaded", function() {
  // Selecting DOM elements
  const fromText = document.querySelector(".from-text"),
    toText = document.querySelector(".to-text"),
    selectTag = document.querySelectorAll("select"),
    exchangeIcon = document.querySelector(".exchange"),
    icons = document.querySelectorAll(".row i");

  // Function to fetch and update translation
  const updateTranslation = () => {
    let text = fromText.value,
      translateFrom = selectTag[0].value,
      translateTo = selectTag[1].value;
    if (!text) {
      toText.value = ""; // Clear the "to" textarea if the "from" textarea is empty
      return;
    }
    toText.setAttribute("placeholder", "Translating...");
    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
    // Fetch API response and update "to" textarea with translated text
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        toText.value = data.responseData.translatedText;
        toText.setAttribute("placeholder", "Translation");
        // Store search history in localStorage
        try {
          const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
          searchHistory.push({ text, translateFrom, translateTo });
          localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        } catch (error) {
          console.error('Error storing search history:', error);
        }
      })
      .catch((error) => {
        console.error('Error fetching translation:', error);
        toText.value = "Error fetching translation";
        toText.setAttribute("placeholder", "Translation");
      });
  };

  // Event listener for real-time translation as user types
  fromText.addEventListener("input", updateTranslation);

  // Populate select tags with options for languages
  selectTag.forEach((tag, id) => {
    for (const country_code in countries) {
      // Selecting English by default as FROM language and Nepali as TO language
      let selected;
      if (id == 0 && country_code == "en-GB") {
        selected = "selected";
      } else if (id == 1 && country_code == "ne-NP") {
        selected = "selected";
      }
      let option = `<option value="${country_code}" ${selected}>${countries[country_code]}</option>`;
      tag.insertAdjacentHTML("beforeend", option);
    }
  });

  // Event listener for exchange icon
  exchangeIcon.addEventListener("click", () => {
    // Exchanging textarea and select tag values
    let tempText = fromText.value;
    tempLang = selectTag[0].value;
    fromText.value = toText.value;
    selectTag[0].value = selectTag[1].value;
    toText.value = tempText;
    selectTag[1].value = tempLang;
    // Update translation after exchange
    updateTranslation();
  });

  // Event listeners for icons
  icons.forEach((icon) => {
    icon.addEventListener("click", ({ target }) => {
      if (target.classList.contains("fa-copy")) {
        if (target.id === "from") {
          navigator.clipboard.writeText(fromText.value);
        } else {
          navigator.clipboard.writeText(toText.value);
        }
      } else {
        let utterance;
        if (target.id === "from") {
          utterance = new SpeechSynthesisUtterance(fromText.value);
          // Set the language for speech synthesis
          utterance.lang = selectTag[0].value;
          // Set the voice for speech synthesis (female voice)
          utterance.voice = speechSynthesis.getVoices().find(voice => voice.name === 'Google US English Female');
        } else {
          utterance = new SpeechSynthesisUtterance(toText.value);
          // Set the language for speech synthesis
          utterance.lang = selectTag[1].value;
          // Set the voice for speech synthesis (female voice)
          utterance.voice = speechSynthesis.getVoices().find(voice => voice.name === 'Google US English Female');
        }
        // Speak the utterance
        speechSynthesis.speak(utterance);
      }
    });
  });
});
