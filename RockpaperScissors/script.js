
let playerscore = 0;
let computerscore = 0;

const choices = document.querySelectorAll('.choice');
const msg = document.querySelector('#msg');

const playerScorePara = document.querySelector("#player-score");
const computerScorePara = document.querySelector("#computer-score");

const gencomputerchoice = () => {
    const options = ['rock', 'paper', 'scissors'];
    const Indexnumber = Math.floor(Math.random() * 3);
    return options[Indexnumber]
};

const drawgame = () => {
  msg.innerText = "It's a draw!";
  msg.style.backgroundColor = "gray";
};

const showWinner = (userwin, computerchoice, playerchoice) => {
    if(userwin){
        playerscore++;
        playerScorePara.innerText = playerscore;
        msg.innerText = `You win! ${playerchoice} beats ${computerchoice}`;
        msg.style.backgroundColor = "green";
    }else{
        computerscore++;
        computerScorePara.innerText = computerscore;
        msg.innerText = `You lose! ${computerchoice} beats ${playerchoice}`;
        msg.style.backgroundColor = "red";
    }

};

playgame = (playerchoice) => {
    const computerchoice = gencomputerchoice();
    if(playerchoice === computerchoice){
        drawgame();
        return;
}
    let userwin = true;
    if(playerchoice === 'rock'){
        userwin = computerchoice === 'scissors' ? true : false;
    }else if(playerchoice === 'paper'){
        userwin = computerchoice === 'rock' ? true : false;
    }else if(playerchoice === 'scissors'){
        userwin = computerchoice === 'paper' ? true : false;
    }
    showWinner(userwin, computerchoice, playerchoice);
    };

choices.forEach((choice) => {
    choice.addEventListener('click', () => {
        const playerchoice = choice.getAttribute("id");
        playgame(playerchoice);
    });
});