// Credit goes to whatsdev on YouTube. Check out their channel: https://www.youtube.com/channel/UC0tRdbXVDbhaRvZPKsRgmxg
let userScore = 0;
let computerScore = 0;
const rock_div = document.getElementById("r");
const paper_div = document.getElementById("p");
const sissors_div = document.getElementById("s");
const result_div = document.querySelector(".result > p");
const scoreBoard_div = document.querySelector(".scoreboard");
const userScore_span = document.getElementById("user-score");
const computerScore_span = document.getElementById("computer-score");
rock_div.addEventListener("click", () => {game("r");});
paper_div.addEventListener("click", () => {game("p");});
sissors_div.addEventListener("click", () => {game("s");});
function convertToWord(letter) {
    if (letter === "r") return "Rock";
    if (letter === "p") return "Paper";
    return "Sissors";
}  
function getComputerChoice() {
  const choices = ['r', 'p', 's'];
  const randomNumber = Math.floor(Math.random() * 3);
  return choices[randomNumber];
}
function win(userChoice, computerChoice) {
  userScore++;
  userScore_span.innerHTML = userScore;
  computerScore_span.innerHTML = computerScore;
  const smallUserWord = " user ".fontsize(3).sub();
  const smallCompWord = " comp ".fontsize(3).sub();
  const userChoice_div = document.getElementById(userChoice);
  result_div.innerHTML = `${convertToWord(userChoice)}${smallUserWord} beats ${convertToWord(computerChoice)}${smallCompWord} . You win!`;
  userChoice_div.classList.add("green-glow");
  setTimeout(() => userChoice_div.classList.remove("green-glow"), 300);
}
function loose(userChoice, computerChoice) {
  computerScore++;
  userScore_span.innerHTML = userScore;
  computerScore_span.innerHTML = computerScore;
  const smallUserWord = " user ".fontsize(3).sub();
  const smallCompWord = " comp ".fontsize(3).sub();
  const userChoice_div = document.getElementById(userChoice);
  result_div.innerHTML = `${convertToWord(userChoice)}${smallUserWord} looses to ${convertToWord(computerChoice)}${smallCompWord} . You lost...`;
  userChoice_div.classList.add("red-glow");
  setTimeout(() => userChoice_div.classList.remove("red-glow"), 300);
}
function draw(userChoice, computerChoice) {
  const smallUserWord = " user ".fontsize(3).sub();
  const smallCompWord = " comp ".fontsize(3).sub();
  const userChoice_div = document.getElementById(userChoice);
  result_div.innerHTML = `${convertToWord(userChoice)}${smallUserWord} equals ${convertToWord(computerChoice)}${smallCompWord} . It's a draw.`;
  userChoice_div.classList.add("gray-glow");
  setTimeout(() => userChoice_div.classList.remove("gray-glow"), 300);
}
function game(userChoice) {
  const computerChoice = getComputerChoice();
  switch (userChoice + computerChoice) {
    case "rs":
    case "pr":
    case "sp":
      win(userChoice, computerChoice);
      break;
    case "rp":
    case "ps":
    case "sr":
      loose(userChoice, computerChoice);
      break;
    case "rr":
    case "pp":
    case "ss":
      draw(userChoice, computerChoice);
      break;
  }
}
