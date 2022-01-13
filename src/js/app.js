const bankBalanceElement = document.getElementById('bank-balance');
const workBalanceElement = document.getElementById('work-balance');
const computerDropdownElement = document.getElementById("dropdown");

const computerInfoPriceElement = document.getElementById('computer-info-price');

const loanButtonElement = document.getElementById("loan-button");
const bankButtonElement = document.getElementById("bank-button");
const workButtonElement = document.getElementById("work-button");
const buyButtonElement = document.getElementById("buy-button");

const computerSelectInfoElement = document.getElementById("computer-select-info");

let computers = [];
let cart = [];
let totalPrice = 0.0;
let workBalance = 0.0;
let bankBalance = 0.0;

fetch("https://noroff-komputer-store-api.herokuapp.com/computers")
    .then(response => response.json())
    .then(data => computers = data)
    .then(computers => addComputersToDropdown(computers));

const addComputersToDropdown = e => {
    computers.forEach(computer => addComputerToDropdown(computer));
}

const addComputerToDropdown = (computer) => {
    const computerElement = document.createElement("option");
    computerElement.value = computer.id;
    computerElement.appendChild(document.createTextNode(computer.description));
    
    computerDropdownElement.appendChild(computerElement);
    
    computerSelectInfoElement.innerText = "";
    computers[0].specs.forEach(spec => {
        computerSelectInfoElement.innerText += spec + "\n";
    });
}

const handleGetLoanButtonEvent = e => {
    alert("I want to get a loan!");
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
    alert("Buy Now Button");
}

const setComputerFeatures = (index) => {
    computers[index].specs.forEach(spec => {
        computerSelectInfoElement.innerText += spec + "\n";
    });
}

const handleDropdownChangeEvent = e => {
    computerSelectInfoElement.innerText = ""; // Reset

    setComputerFeatures(e.target.selectedIndex);
}

computerDropdownElement.addEventListener("change", handleDropdownChangeEvent);

loanButtonElement.addEventListener("click", handleGetLoanButtonEvent);
bankButtonElement.addEventListener("click", handleBankButtonEvent);
workButtonElement.addEventListener("click", handleWorkButtonEvent);
buyButtonElement.addEventListener("click", handleBuyNowButtonEvent);
