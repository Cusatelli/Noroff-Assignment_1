const computersElement = document.getElementById("computers");
const priceElement = document.getElementById("price");
const addElement = document.getElementById("add");
const cartElement = document.getElementById("cart");
const quantityElement = document.getElementById("quantity");
const payElement = document.getElementById("pay");
const totalDueElement = document.getElementById("totalDue");

let computers = [];
let cart = [];
let totalDue = 0.0;

fetch("https://noroff-komputer-store-api.herokuapp.com/computers")
.then(Response => Response.json())
.then(data => computers = data)
.then(computers => addComputersToMenu(computers))
const addComputersToMenu = (computers) => {
    computers.forEach(x => addComputerToMenu(x));
}
const addComputerToMenu = (computer) => {
    const computerElement = document.createElement("option");
    computerElement.value = computer.id;
    computerElement.appendChild(document.createTextNode(computer.description));
    computersElement.appendChild(computerElement);
}
const handleComputerMenuChange = e => {
    const selectedComputer = computers[e.target.selectedIndex];
    priceElement.innerText = selectedComputer.price;
}
const handleAddComputer = () => {
    const selectedComputer = computers[computersElement.selectedIndex];
    const quantity = parseInt(quantityElement.value);
    const cartItem = document.createElement("li");
    const lineTotal = quantity * selectedComputer.price;
    cartItem.innerText = `${selectedComputer.description} ${selectedComputer.price} ${quantity} ${lineTotal.toFixed(2)}`;
    cartElement.appendChild(cartItem);
    totalDue += lineTotal;
    totalDueElement.innerHTML = `Total Due: ${totalDue.toFixed(2)}`;
}

const handlePay = () => {
    const totalPaid = prompt("Please enter the amount of money you wish to pay: ");
    const change = parseFloat(totalPaid) - totalDue;
    alert(`Total change: ${ change.toFixed(2) }`);
}

computersElement.addEventListener("change", handleComputerMenuChange);
addElement.addEventListener("click", handleAddComputer);
payElement.addEventListener("click", handlePay);
