// Setting Game Name

let gameName = "Guess The Word";
document.title = gameName;
document.querySelector("h1").innerHTML = gameName;
document.querySelector("footer").innerHTML =
  `${gameName} Game Created By Youssef ;D`;

// Manage Words
let words = [];
let wordToGuess = "";

let messageArea = document.querySelector(".message");

// Setting Game Options
let numberOfTries = 6;
let numberOfLetters = 0;

async function initGame() {
  try {
    const res = await fetch("wordle-allowed-guesses.txt");
    const data = await res.text();
    words = data
      .split("\n")
      .map((word) => word.trim())
      .filter((word) => word);

    wordToGuess = words[Math.floor(Math.random() * words.length)].toLowerCase();
    numberOfLetters = wordToGuess.length;
    console.log(wordToGuess);

    generateInput();
  } catch (error) {
    console.error("Error loading words:", error);
  }
}
let currentTry = 1;
let numberOfHints = 2;

document.querySelector(".hint span").innerHTML = numberOfHints;
const getHintBtn = document.querySelector(".hint");
getHintBtn.addEventListener("click", getHint);

const repeatBtn = document.querySelector(".repeat");
repeatBtn.addEventListener("click", () => window.location.reload());

function generateInput() {
  const inputContainer = document.querySelector(".inputs");

  // Create Try Div
  for (let i = 1; i <= numberOfTries; i++) {
    const tryDiv = document.createElement("div");
    tryDiv.classList.add(`try-${i}`);
    tryDiv.innerHTML = `<span>${i}<span>`;

    if (i !== 1) tryDiv.classList.add("disabled-inputs");

    // Create Inputs
    for (let j = 1; j <= numberOfLetters; j++) {
      const input = document.createElement("input");
      input.type = "text";
      input.id = `guess-${i}-letter-${j}`;
      input.setAttribute("maxlength", "1");
      input.autocomplete = "off";

      tryDiv.appendChild(input);
    }

    inputContainer.appendChild(tryDiv);
  }

  // Focus On First Element
  inputContainer.children[0].children[1].focus();

  // Disable All Inputs Except First One
  const inputsInDisabledDiv = document.querySelectorAll(
    ".disabled-inputs input",
  );
  inputsInDisabledDiv.forEach((input) => (input.disabled = true));

  const inputs = document.querySelectorAll("input");
  inputs.forEach((input, index) => {
    input.addEventListener("input", function () {
      this.value = this.value.toUpperCase();

      const nextInput = inputs[index + 1];
      if (nextInput) nextInput.focus();
    });

    input.addEventListener("keydown", function (e) {
      const currentIndex = Array.from(inputs).indexOf(e.target);

      if (e.key == "ArrowRight") {
        const nextInput = currentIndex + 1;
        if (nextInput < inputs.length) inputs[nextInput].focus();
      }
      if (e.key == "ArrowLeft") {
        const previousInput = currentIndex - 1;
        if (previousInput >= 0) inputs[previousInput].focus();
      }
    });
  });
}

const guessButton = document.querySelector(".check");
guessButton.addEventListener("click", handleGuesses);

function handleGuesses() {
  // Check If All the Inputs Are Filled And If the Word Is Real
  const enabledInputs = document.querySelectorAll(
    `.try-${currentTry} input:not(:disabled)`,
  );
  let emptyInputs = Array.from(enabledInputs).filter(
    (input) => input.value == "",
  );
  let word = Array.from(enabledInputs)
    .map((input) => input.value)
    .join("")
    .toLowerCase();

  if (!words.includes(word) || emptyInputs.length > 0) {
    enabledInputs.forEach((input) => input.classList.add("shaked"));
    setTimeout(() => {
      enabledInputs.forEach((input) => input.classList.remove("shaked"));
    }, 200);
    return;
  }

  let successGuess = true;
  for (let i = 1; i <= numberOfLetters; i++) {
    const inputField = document.querySelector(
      `#guess-${currentTry}-letter-${i}`,
    );
    const letter = inputField.value.toLowerCase();

    const actuelLetter = wordToGuess[i - 1];

    // * Game Logic

    if (letter === actuelLetter) {
      inputField.classList.add("in-place");
      document
        .querySelector(`#${letter.toUpperCase()}`)
        .classList.add("in-place");
    } else if (wordToGuess.includes(letter) && letter !== "") {
      inputField.classList.add("not-in-place");
      document
        .querySelector(`#${letter.toUpperCase()}`)
        .classList.add("not-in-place");
      successGuess = false;
    } else {
      inputField.classList.add("no");
      document.querySelector(`#${letter.toUpperCase()}`).classList.add("no");
      successGuess = false;
    }
  }

  // Check If User Win Or Lose
  if (successGuess) {
    messageArea.innerHTML = `You Win The Word Is <span>${wordToGuess}</span>`;

    if (numberOfHints == 2) {
      messageArea.innerHTML += `<p>Congratz You Didn't Use Hints</p>`;
    }

    let allTries = document.querySelectorAll(".inputs > div");

    allTries.forEach((tryDiv) => tryDiv.classList.add("disabled-inputs"));
    guessButton.style.display = "none";
    repeatBtn.style.display = "block";
    getHintBtn.disabled = true;
  } else {
    document
      .querySelector(`.try-${currentTry}`)
      .classList.add("disabled-inputs");

    const currentTryInputs = document.querySelectorAll(
      `.try-${currentTry} input`,
    );
    currentTryInputs.forEach((input) => (input.disabled = true));

    currentTry++;

    const nextTryInputs = document.querySelectorAll(`.try-${currentTry} input`);
    nextTryInputs.forEach((input) => (input.disabled = false));

    let el = document.querySelector(`.try-${currentTry}`);

    if (el) {
      el.classList.remove("disabled-inputs");
      nextTryInputs[0].focus();
    } else {
      messageArea.innerHTML = `You Lost The Word Was <span>${wordToGuess}</span>`;
      guessButton.style.display = "none";
      repeatBtn.style.display = "block";
      getHintBtn.disabled = true;
    }
  }
}

function getHint() {
  if (numberOfHints > 0) {
    numberOfHints--;
    document.querySelector(".hint span").innerHTML = numberOfHints;

    const enabledInputs = document.querySelectorAll(
      `.try-${currentTry} input:not(:disabled)`,
    );
    const emptyEnabledInputs = Array.from(enabledInputs).filter(
      (input) => input.value == "",
    );

    if (emptyEnabledInputs.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyEnabledInputs.length);
      const randomInput = emptyEnabledInputs[randomIndex];
      const indexToFill = Array.from(enabledInputs).indexOf(randomInput);

      if (indexToFill !== -1) {
        randomInput.value = wordToGuess[indexToFill].toUpperCase();
      }
    }
  }

  if (numberOfHints === 0) {
    getHintBtn.disabled = true;
  }
}

function handleBackspace(e) {
  if (e.key === "Backspace") {
    const inputs = document.querySelectorAll(`input:not([disabled])`);
    const currentIndex = Array.from(inputs).indexOf(document.activeElement);

    if (currentIndex > 0) {
      const currentInput = inputs[currentIndex];
      const prevInput = inputs[currentIndex - 1];

      if (currentInput.value == "") {
        prevInput.value = "";
        prevInput.focus();
      } else {
        currentInput.value = "";
      }
    }
  }

  if (e.key === "Enter") {
    guessButton.click();
  }
}

window.onload = function () {
  initGame();
};

document.addEventListener("keydown", handleBackspace);
