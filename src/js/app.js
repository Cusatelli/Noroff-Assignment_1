// Get elements from html document
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
let workBalance = 0.0;
let bankBalance = 0.0;
let debtBalance = 0.0;

const interestRate = 0.1; // a 10% interest rate

// Get the list of computers from the provided API
fetch("https://noroff-komputer-store-api.herokuapp.com/computers")
    .then(response => response.json())
    .then(data => computers = data)
    .then(computers => addComputersToDropdown(computers));

/**
 * Add all computers found in the API to a select element in the document.
 * @param {Event} event 
 */
const addComputersToDropdown = event => {
    computers.forEach(computer => addComputerToDropdown(computer));
}

/**
 * Set the computer information elements to the selected computer value (id) on
 * select change event (update).
 * @param {Number} index 
 */
const setComputerInfo = (index) => {
    computerInfoNameElement.innerText = computers[index].title;
    computerInfoDescElement.innerText = computers[index].description;
    computerInfoPriceElement.innerText = computers[index].price + " kr";
    computerInfoImageElement.src = "https://noroff-komputer-store-api.herokuapp.com/" + computers[index].image; // API + assets/X.png
}

/**
 * Add a computer to the select element in the document (HTML).
 * Called at start of app initialization.
 * @param {Object} computer 
 */
const addComputerToDropdown = (computer) => {
    const computerElement = document.createElement("option"); // Select element
    computerElement.value = computer.id;
    computerElement.appendChild(document.createTextNode(computer.title)); // Create new text element with title
    
    computerDropdownElement.appendChild(computerElement);
    
    computerSelectInfoElement.innerText = "";
    // Add all specs found in API to text element.
    computers[currentComputerIndex].specs.forEach(spec => {
        computerSelectInfoElement.innerText += spec + "\n"; // Add spec and new line (List style).
    });

    // Set display information to the first computer in API on start.
    setComputerInfo(0);
}

/**
 * Toggle hide elements
 */
const hideBankLoanSection = () => {
    payLoanButtonElement.style.display = "none";
    bankLoanSectionElement.style.display = "none";
    repayLoanButtonElement.style.display = "none";
}

/**
 * Toggle show elements
 */
const showBankLoanSection = () => {
    payLoanButtonElement.style.display = "inline";
    bankLoanSectionElement.style.display = "flex";
    repayLoanButtonElement.style.display = "inline";
}

/**
 * Handle the Get Loan Button eventListener.
 * Check if there is a loan taken before proceeding, and on successful loan add values
 * to bank balance & debt, before setting innerText.
 * @param {Event} event
 */
const handleGetLoanButtonEvent = event => {
    if(debtBalance <= 0) {
        const askLoanSum = prompt("Please enter the amount of money you wish to loan: ");
        if(askLoanSum === null) { askLoanSum = 0; } // Handle 'Cancel' event

        if(askLoanSum <= bankBalance * 2) {
            // Add loan to debt and bank balance
            debtBalance = parseFloat(askLoanSum);
            bankBalance += parseFloat(debtBalance);
            // Set innerText
            setBalance(bankBalanceElement, bankBalance);
            setBalance(bankLoanElement, debtBalance);

            showBankLoanSection();
        } else {
            // If you request a loan too large.
            alert(
                "Sorry, you need to have at least half the amount you're asking for."
                + "\nCurrent max amount: " + (bankBalance * 2) + " kr"
            );
        }
    } else {
        // If you are not eligable for another loan.
        alert("Sorry, you can only have one loan at a time.");
    }
}

/**
 * Set the element innerText value to a number + currency.
 * @param {Element} element 
 * @param {Number} amount 
 */
const setBalance = (element, amount) => {
    element.innerText = amount + " kr";
}

/**
 * Handle the Pay Loan Button eventListener.
 * Check if there is a loan taken before proceeding. On successful pay back value inserted,
 * subtract amount from debt and bank balance.
 * Lastly set innerText.
 * @param {Element} element 
 * @param {Number} accountBalance 
 * @returns current account balance if no debt found
 */
const handlePayLoanButtonEvent = (element, accountBalance) => {
    if(debtBalance > 0) { // If has a loan / debt
        // Ask user how much they wish to pay back with a prompt
        let payBackLoanAmount = prompt(
            "You owe the bank: " + debtBalance 
            + "\nPlease enter the amount of money you wish to pay back: "
        );
        if(payBackLoanAmount === null) { payBackLoanAmount = 0; } // Handle 'Cancel' event

        // Handle: if you wish to pay more than you owe the bank
        if(payBackLoanAmount <= accountBalance) {
            if(payBackLoanAmount > debtBalance) { payBackLoanAmount = debtBalance; } // Clamp
            // Subtract value from balance
            debtBalance -= payBackLoanAmount;
            accountBalance -= payBackLoanAmount;

            // Set innerText elements
            setBalance(bankLoanElement, debtBalance);
            setBalance(element, accountBalance);

            // Debt is less or equal to 0 (Payed back in full)
            if(debtBalance <= 0) {
                // Hide pay back elements
                hideBankLoanSection();
            }
        }
    }
    return accountBalance;
}

/**
 * Handle the Repay Loan Button eventListener.
 * Check if there is a loan taken before proceeding. If so immediately remove loan amount from work
 * balance and return remaining balance after loan has been payed back, or set 0 with remaining loan amount in debt.
 * Lastly set innerText.
 * @returns current work account balance if no debt found
 */
const handleRepayLoanButtonEvent = () => {
    if(debtBalance > 0) {
        // If work account balance has money.
        if(workBalance > 0) {
            // Find remaining balance after debt has been payed.
            const remainingWorkBalance = (debtBalance - workBalance); // i.e 200kr (loan) 300kr (balance) = -100kr
            if(remainingWorkBalance < 0) { // Has payed too much to bank
                // Return remaining money and set debt to 0.
                workBalance = (remainingWorkBalance + (remainingWorkBalance  * -1) * interestRate) * - 1;
                debtBalance = 0;
            } else { // Has not payed off loan
                debtBalance -= workBalance - (workBalance * interestRate); // Interest rate on repayment of loan.
                workBalance = 0;
            }

            // Set innerText elements
            setBalance(bankLoanElement, debtBalance);
            setBalance(workBalanceElement, workBalance);

            // If loan has been payed off hide loan elements.
            if(debtBalance <= 0) {
                hideBankLoanSection();
            }
        }
    }
    return workBalance;
}

/**
 * Add currency to work account balance on work button event click.
 * @param {Event} event 
 */
const handleWorkButtonEvent = event => {
    workBalance += 100; // 100 is the defined amount in assignment
    setBalance(workBalanceElement, workBalance);
}

/**
 * Handle the Bank Button eventListener.
 * Check if there is a loan taken before proceeding. If there is a loan subtract interest from debt and work balance.
 * @param {Event} event
 */
const handleBankButtonEvent = event => {
    if(debtBalance > 0) {
        const interest = workBalance * interestRate; // 10% tax
        debtBalance -= interest;
        workBalance -= interest;
        if(debtBalance < 0) {
            workBalance += debtBalance; // Add remaining back before sending to bank.
            debtBalance = 0;
        }
        
        // Set innerText element
        setBalance(bankLoanElement, debtBalance);
    }

    if(debtBalance <= 0) { hideBankLoanSection(); } // Loan has been payed back in full, hide loan elements

    bankBalance += workBalance;
    workBalance = 0;
    
    // Set innerText element again
    setBalance(workBalanceElement, workBalance);
    setBalance(bankBalanceElement, bankBalance);
}

/**
 * Handle the Buy Computer Button event.
 * When the user clicks the Buy Now button this function will compare the price of the computer
 * to your bank account and let you purchase the computer if you can afford it.
 * It ignores your work balance.
 * @param {Event} event 
 */
const handleBuyNowButtonEvent = event => {
    const currentComputerPrice = computers[currentComputerIndex].price;
    if(currentComputerPrice <= bankBalance) { // If you can afford the computer
        bankBalance -= currentComputerPrice;
        setBalance(bankBalanceElement, bankBalance);
        // Thank you message
        alert(
            "Thank you for purchasing:\n"
            + "'" + computers[currentComputerIndex].title + "'!"
            + "\n\nYour remaining funds: " + bankBalance + " kr"
            + "\n\nWelcome back!"
        );
    } else { // If you can not afford the computer
        // "Error" message
        alert(
            "You can't buy this computer!"
            + "\nYou're missing: " + ((bankBalance - currentComputerPrice) * -1) + " kr" // Multiply by -1 to convert to positive (or flip order).
        );
    }
}

/**
 * Update the displayed specs of a computer selected.
 * @param {Number} index 
 */
const setComputerFeatures = (index) => {
    computers[index].specs.forEach(spec => {
        computerSelectInfoElement.innerText += spec + "\n"; // new line for list style
    });
}

/**
 * Handle the on change event triggered by selecting a new computer in the dropdown menu.
 * Triggered once "change" has been invoked on "select" element.
 * @param {Event} event 
 */
const handleDropdownChangeEvent = event => {
    computerSelectInfoElement.innerText = ""; // Reset

    currentComputerIndex = event.target.selectedIndex; // Set current index for reference
    setComputerFeatures(currentComputerIndex); // Update Computer Specs (Features) text elements
    setComputerInfo(currentComputerIndex); // Update Computer Info  text elements
}

/*
 * Event Listeners
 */
computerDropdownElement.addEventListener("change", handleDropdownChangeEvent);
loanButtonElement.addEventListener("click", handleGetLoanButtonEvent);
payLoanButtonElement.addEventListener("click", () => bankBalance = handlePayLoanButtonEvent(bankBalanceElement, bankBalance));
repayLoanButtonElement.addEventListener("click", handleRepayLoanButtonEvent);
bankButtonElement.addEventListener("click", handleBankButtonEvent);
workButtonElement.addEventListener("click", handleWorkButtonEvent);
buyButtonElement.addEventListener("click", handleBuyNowButtonEvent);

// On Start, hide hidden elements
hideBankLoanSection();
