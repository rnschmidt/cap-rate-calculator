// Gross Potential Income
const propertyValue = document.getElementById('property-value');
const totalRentSquareFeet = document.getElementById('total-rent-square-feet');
const averageRentPerSquareFoot = document.getElementById('av-rent-per-sq-foot');
// Effective Gross Income
const vacanyCreditLoss = document.getElementById('vacany-credit-loss');
const otherIncome = document.getElementById('other-income');
// Operating Expenses
const expenses = document.querySelectorAll('.expenses');
// Internal Calulations
const grossPotentialIncome = document.getElementById('gross-potential-income');
const effectiveGrossIncome = document.getElementById('effective-gross-income');
const totalExpenses = document.getElementById('total-expenses');
// Calculated Results
const resultantGPI = document.getElementById('resultant-gpi');
const resultantEGI = document.getElementById('resultant-egi');
const resultantTotalExpenses = document.getElementById('resultant-total-expenses');
const netOperatingIncome = document.getElementById('net-operating-income');
const capRate = document.getElementById('cap-rate');

function checkIsPositive(e) {
  const value = parseFloat(e.target.value);
  if (e.target.value === "" || value > 0) {
    e.target.setCustomValidity("");
    e.target.style.borderColor = "grey";
  } else {
    e.target.setCustomValidity("Please select a value that is greater than 0.");
    e.target.style.borderColor = "red";
  }
}

const calculateGrossPotentialIncome = () => {
  const totalRentValue = parseFloat(totalRentSquareFeet.value);
  const rentPerSqFt = parseFloat(averageRentPerSquareFoot.value);
  if (totalRentValue && rentPerSqFt) {
    const grossPotentialIncomeValue = totalRentValue * rentPerSqFt;
    grossPotentialIncome.innerText = "$" + grossPotentialIncomeValue.toFixed(2);
    resultantGPI.innerText = "$" + grossPotentialIncomeValue.toFixed(2);
  } else {
    grossPotentialIncome.innerText = '$0.00';
    resultantGPI.innerText = '$0.00';
  }
  calculateEffectiveGrossIncome();
}

const calculateEffectiveGrossIncome = () => {
  const vacancyCreditLossValue = parseFloat(vacanyCreditLoss.value);
  const otherIncomeValue = parseFloat(otherIncome.value);
  const grossPotentialIncomeValue = parseFloat(grossPotentialIncome.innerText.replace('$', ''));
  let effectiveGrossIncomeValue = grossPotentialIncomeValue;
  if (vacancyCreditLossValue && grossPotentialIncomeValue) {
    effectiveGrossIncomeValue -= (grossPotentialIncomeValue * vacancyCreditLossValue / 100);
    effectiveGrossIncome.innerText = "$" + effectiveGrossIncomeValue.toFixed(2);
    resultantEGI.innerText = "$" + effectiveGrossIncomeValue.toFixed(2);
  }
  if(otherIncomeValue && grossPotentialIncomeValue) {
    effectiveGrossIncomeValue += otherIncomeValue;
    effectiveGrossIncome.innerText = "$" + effectiveGrossIncomeValue.toFixed(2);
    resultantEGI.innerText = "$" + effectiveGrossIncomeValue.toFixed(2);
  }
  if (!vacancyCreditLossValue && !otherIncomeValue && grossPotentialIncomeValue) {
    effectiveGrossIncome.innerText = "$" + effectiveGrossIncomeValue.toFixed(2);
    resultantEGI.innerText = "$" + effectiveGrossIncomeValue.toFixed(2);
  }
  if (!grossPotentialIncomeValue) {
    effectiveGrossIncome.innerText = '$0.00';
    resultantEGI.innerText = '$0.00';
  }
  calculateNetOperatingIncome();
}

const calculateTotalExpenses = () => {
  let totalExpensesValue = 0;
  expenses.forEach(expense => totalExpensesValue += expense.value ? parseFloat(expense.value) : 0);
  totalExpenses.innerText = "$" + totalExpensesValue.toFixed(2);
  resultantTotalExpenses.innerText = "$" + totalExpensesValue.toFixed(2);
  calculateNetOperatingIncome();
}

const calculateNetOperatingIncome = () => {
  const effectiveGrossIncomeValue = parseFloat(effectiveGrossIncome.innerText.replace('$', ''));
  const totalExpensesValue = parseFloat(totalExpenses.innerText.replace('$', ''));
  if (effectiveGrossIncomeValue && totalExpensesValue) {
    const netOperatingIncomeValue = effectiveGrossIncomeValue - totalExpensesValue;
    netOperatingIncome.innerText = "$" + netOperatingIncomeValue.toFixed(2);
  } else if (effectiveGrossIncomeValue) {
    netOperatingIncome.innerText = "$" + effectiveGrossIncomeValue.toFixed(2);
  } else {
    netOperatingIncome.innerText = '$0.00';
  }
  calculateCapRate(propertyValue.value);
}

const calculateCapRate = (propertyValue) => {
  const netOperatingIncomeValue = parseFloat(netOperatingIncome.innerText.replace('$', ''));
  if (netOperatingIncomeValue && propertyValue) {
    const capRateValue = (netOperatingIncomeValue / propertyValue) * 100;
    capRate.innerText = capRateValue.toFixed(2) + '%';
  } else {
    capRate.innerText = '0.00%';
  }
}

document.querySelectorAll(".float-field").forEach(element => element.addEventListener("input", checkIsPositive, false));

propertyValue.addEventListener('input', (e) => calculateCapRate(e.target.value));

totalRentSquareFeet.addEventListener('input', () => calculateGrossPotentialIncome());
averageRentPerSquareFoot.addEventListener('input', () => calculateGrossPotentialIncome());

vacanyCreditLoss.addEventListener('input', () => calculateEffectiveGrossIncome());
otherIncome.addEventListener('input', () => calculateEffectiveGrossIncome());

expenses.forEach(expense => expense.addEventListener('input', () => calculateTotalExpenses()));