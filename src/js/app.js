const bankBalanceElement = document.getElementById('bank-balance');
const bankLoanElement = document.getElementById('bank-loan');
const bankLoanSectionElement = document.getElementById('loan-section');
const workBalanceElement = document.getElementById('work-balance');
const computerDropdownElement = document.getElementById("dropdown");

const computerInfoNameElement = document.getElementById('computer-info-name');
const computerInfoDescElement = document.getElementById('computer-info-desc');
const computerInfoPriceElement = document.getElementById('computer-info-price');
const computerInfoImageElement = document.getElementById('computer-info-image');

const computerSelectInfoElement = document.getElementById("computer-select-info");

const loanButtonElement = document.getElementById("loan-button");
const payLoanButtonElement = document.getElementById("pay-loan-button");
const repayLoanButtonElement = document.getElementById("repay-loan-button");
const bankButtonElement = document.getElementById("bank-button");
const workButtonElement = document.getElementById("work-button");
const buyButtonElement = document.getElementById("buy-button");

let computers = [];
let currentComputerIndex = 0;
let cart = [];
let totalPrice = 0.0;
let workBalance = 0.0;
let bankBalance = 0.0;
let debtBalance = 0.0;

const interestRate = 0.1; // 10%

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
    computerInfoImageElement.src = "https://noroff-komputer-store-api.herokuapp.com/" + computers[index].image;
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

const hideBankLoanSection = () => {
    payLoanButtonElement.style.display = "none";
    bankLoanSectionElement.style.display = "none";
    repayLoanButtonElement.style.display = "none";
    //bankButtonElement.style.display = "inline";
}

const showBankLoanSection = () => {
    payLoanButtonElement.style.display = "inline";
    bankLoanSectionElement.style.display = "flex";
    repayLoanButtonElement.style.display = "inline";
    //bankButtonElement.style.display = "none";
}

const handleGetLoanButtonEvent = e => {
    if(debtBalance <= 0) {
        const askLoanSum = prompt("Please enter the amount of money you wish to loan: ");
        if(askLoanSum === null) { askLoanSum = 0; } // Handle 'Cancel' event

        if(askLoanSum <= bankBalance * 2) {
            debtBalance = parseFloat(askLoanSum);
            bankBalance += parseFloat(debtBalance);
            setBalance(bankBalanceElement, bankBalance);
            setBalance(bankLoanElement, debtBalance);

            showBankLoanSection();
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

const setBalance = (element, amount) => {
    element.innerText = amount + " kr";
}

const handlePayLoanButtonEvent = (element, accountBalance) => {
    if(debtBalance > 0) {
        let payBackLoanAmount = prompt(
            "You owe the bank: " + debtBalance 
            + "\nPlease enter the amount of money you wish to pay back: "
        );
        if(payBackLoanAmount === null) { payBackLoanAmount = 0; } // Handle 'Cancel' event

        if(payBackLoanAmount <= accountBalance) {
            if(payBackLoanAmount > debtBalance) { payBackLoanAmount = debtBalance } // Clamp
            debtBalance -= payBackLoanAmount;
            accountBalance -= payBackLoanAmount;

            setBalance(bankLoanElement, debtBalance);
            setBalance(element, accountBalance);

            if(debtBalance <= 0) {
                hideBankLoanSection();
            }
        }
    }
    return accountBalance;
}

const handleRepayLoanButtonEvent = () => {
    if(debtBalance > 0) {
        if(workBalance > 0) {
            const remainingWorkBalance = (debtBalance - workBalance);
            if(remainingWorkBalance < 0) {
                workBalance = remainingWorkBalance  * -1;
                debtBalance = 0;
            } else {
                debtBalance -= workBalance - (workBalance * interestRate); // Interest rate on repayment of loan.
                workBalance = 0;
            }

            setBalance(bankLoanElement, debtBalance);
            setBalance(workBalanceElement, workBalance);

            if(debtBalance <= 0) {
                hideBankLoanSection();
            }
        }
    }
    return workBalance;
}

const handleWorkButtonEvent = e => {
    workBalance += 100;
    setBalance(workBalanceElement, workBalance);
}

const handleBankButtonEvent = e => {
    if(debtBalance > 0) {
        const interest = workBalance * interestRate; // 10% tax
        debtBalance -= interest;
        workBalance -= interest;
        if(debtBalance < 0) {
            workBalance += debtBalance; // Add remaining back before sending to bank.
            debtBalance = 0;
        }
        
        setBalance(bankLoanElement, debtBalance);
    }

    if(debtBalance <= 0) { hideBankLoanSection(); }

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
        alert(
            "Thank you for purchasing:\n"
            + "'" + computers[currentComputerIndex].title + "'!"
            + "\n\nYour remaining funds: " + bankBalance + " kr"
            + "\n\nWelcome back!"
        );
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
payLoanButtonElement.addEventListener("click", () => bankBalance = handlePayLoanButtonEvent(bankBalanceElement, bankBalance));
// repayLoanButtonElement.addEventListener("click", () => workBalance = handlePayLoanButtonEvent(workBalanceElement, workBalance));
repayLoanButtonElement.addEventListener("click", handleRepayLoanButtonEvent);
bankButtonElement.addEventListener("click", handleBankButtonEvent);
workButtonElement.addEventListener("click", handleWorkButtonEvent);
buyButtonElement.addEventListener("click", handleBuyNowButtonEvent);

hideBankLoanSection();
