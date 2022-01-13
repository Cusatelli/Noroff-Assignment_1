const bankBalanceElement = document.getElementById('bank-balance');
const workBalanceElement = document.getElementById('work-balance');
const computerDropdownElement = document.getElementById("dropdown");

const computerInfoNameElement = document.getElementById('computer-info-name');
const computerInfoDescElement = document.getElementById('computer-info-desc');
const computerInfoPriceElement = document.getElementById('computer-info-price');

const loanButtonElement = document.getElementById("loan-button");
const payLoanButtonElement = document.getElementById("pay-loan-button");
const bankButtonElement = document.getElementById("bank-button");
const workButtonElement = document.getElementById("work-button");
const buyButtonElement = document.getElementById("buy-button");

const computerSelectInfoElement = document.getElementById("computer-select-info");

let computers = [];
let currentComputerIndex = 0;
let cart = [];
let totalPrice = 0.0;
let workBalance = 0.0;
let bankBalance = 0.0;
let debtBalance = 0.0;

payLoanButtonElement.style.display = "none";

fetch("https://noroff-komputer-store-api.herokuapp.com/computers")
    .then(response => response.json())
    .then(data => computers = data)
    .then(computers => addComputersToDropdown(computers));

const addComputersToDropdown = e => {
    computers.forEach(computer => addComputerToDropdown(computer));
}

const setComputerInfo = (index) => {
    computerInfoNameElement.innerText = computers[index].title;
    computerInfoDescElement.innerText = computers[index].description;
    computerInfoPriceElement.innerText = computers[index].price + " kr";
}

const addComputerToDropdown = (computer) => {
    const computerElement = document.createElement("option");
    computerElement.value = computer.id;
    computerElement.appendChild(document.createTextNode(computer.title));
    
    computerDropdownElement.appendChild(computerElement);
    
    computerSelectInfoElement.innerText = "";
    computers[currentComputerIndex].specs.forEach(spec => {
        computerSelectInfoElement.innerText += spec + "\n";
    });

    setComputerInfo(0);
}

const handleGetLoanButtonEvent = e => {
    if(debtBalance <= 0) {
        const askLoanSum = prompt("Please enter the amount of money you wish to loan: ");
        if(askLoanSum <= bankBalance * 2) {
            debtBalance = parseFloat(askLoanSum);
            bankBalance += parseFloat(debtBalance);
            setBalance(bankBalanceElement, bankBalance);

            payLoanButtonElement.style.display = "inline";
        } else {
            alert(
                "Sorry, you need to have at least half the amount you're asking for."
                + "\nCurrent max amount: " + (bankBalance * 2) + " kr"
            );
        }
    } else {
        alert("Sorry, you can only have one loan at a time.");
    }
}

const handlePayLoanButtonEvent = e => {
    alert("You owe the bank: " + debtBalance);
}

const setBalance = (element, amount) => {
    element.innerText = amount + " kr";
}

const handleWorkButtonEvent = e => {
    workBalance += 100;
    setBalance(workBalanceElement, workBalance);
}

const handleBankButtonEvent = e => {
    bankBalance += workBalance;
    workBalance = 0;
    setBalance(workBalanceElement, workBalance);
    setBalance(bankBalanceElement, bankBalance);
}

const handleBuyNowButtonEvent = e => {
    const currentComputerPrice = computers[currentComputerIndex].price;
    if(currentComputerPrice <= bankBalance) {
        bankBalance -= currentComputerPrice;
        setBalance(bankBalanceElement, bankBalance);
    } else {
        alert(
            "You can't buy this computer!"
            + "\nYou're missing: " + ((bankBalance - currentComputerPrice) * -1) + " kr" // Multiply by -1 to convert to positive (or flip order).
        );
    }
}

const setComputerFeatures = (index) => {
    computers[index].specs.forEach(spec => {
        computerSelectInfoElement.innerText += spec + "\n";
    });
}

const handleDropdownChangeEvent = e => {
    computerSelectInfoElement.innerText = ""; // Reset

    currentComputerIndex = e.target.selectedIndex;
    setComputerFeatures(currentComputerIndex);
    setComputerInfo(currentComputerIndex);
}

computerDropdownElement.addEventListener("change", handleDropdownChangeEvent);
loanButtonElement.addEventListener("click", handleGetLoanButtonEvent);
payLoanButtonElement.addEventListener("click", handlePayLoanButtonEvent);
bankButtonElement.addEventListener("click", handleBankButtonEvent);
workButtonElement.addEventListener("click", handleWorkButtonEvent);
buyButtonElement.addEventListener("click", handleBuyNowButtonEvent);
