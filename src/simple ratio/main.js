/* ------------------------SIMPLE RATIO ------------------------------------- */
import { numberWithCommas, insertErrorMessage, removeErrorMessage, amountConfig } from "../utils/utils.js";

// Gross Potential Income
const propertyValue = new AutoNumeric('#property-value', amountConfig);
const totalRentSquareFeet = new AutoNumeric('#total-rent-square-feet', {
  decimalPlaces: 2,
  decimalPlacesRawValue: 2,
  minimumValue: "0",
  maximumValue: "10000000000",
  modifyValueOnWheel: false
});
const averageRentPerSquareFoot = new AutoNumeric('#av-rent-per-sq-foot', amountConfig);
// Effective Gross Income
const vacanyCreditLoss = document.getElementById('vacany-credit-loss');
const otherIncome = new AutoNumeric('#other-income', amountConfig);
// Operating Expenses
const managementFee = document.getElementById('management-fee'); 
const expenses = document.querySelectorAll('.expenses');
// Internal Calulations
const grossPotentialIncome = document.getElementById('gross-potential-income');
const effectiveGrossIncome = document.getElementById('effective-gross-income');
const totalExpenses = document.getElementById('total-expenses');
// Calculated Results
const resultantGPI = document.getElementById('resultant-gpi');
const resultantVacany = document.getElementById('resultant-vacany');
const resultantOtherIncome = document.getElementById('resultant-other-income');
const resultantEGI = document.getElementById('resultant-egi');
const resultantTotalExpenses = document.getElementById('resultant-total-expenses');
const netOperatingIncome = document.getElementById('net-operating-income');
const resultantPropertyValue = document.getElementById('resultant-property-value');
const capRate = document.getElementById('cap-rate');

// Validate Total Rent Square Feet to accept value less than or equal to 1,000,000,000
const validateTotalRentSquareFeet = (e) => {
  const val = parseFloat(totalRentSquareFeet.rawValue);
  if (val > 1000000000) {
    e.target.value = '1,000,000,000';
    insertErrorMessage(e, 'Please select a value less than or equal to 1,000,000,000.');
  } else {
    removeErrorMessage(e);
  }
}
/*
  # Caclulate Gross Potential Income
  # Gross Potential Income = Total Rent SquareFeet * Average Rent Per Square Foot
  # If both `totalRentSquareFeet` and `averageRentPerSquareFoot` are filled in, calculate Gross Potential Income
  # Any change in either of the two fields will trigger the calculation of Effective Gross Income
*/
const calculateGrossPotentialIncome = () => {
  const totalRentValue = parseFloat(totalRentSquareFeet.rawValue);
  const rentPerSqFt = averageRentPerSquareFoot.rawValue;
  if (totalRentValue && rentPerSqFt) {
    const grossPotentialIncomeValue = Math.round(totalRentValue * rentPerSqFt);
    grossPotentialIncome.innerText = "$" + numberWithCommas(grossPotentialIncomeValue);
    resultantGPI.innerText = "$" + numberWithCommas(grossPotentialIncomeValue);
  } else {
    grossPotentialIncome.innerText = '$0';
    resultantGPI.innerText = '$0';
  }
  calculateEffectiveGrossIncome();
}
/*
  # Calculate Effective Gross Income
  # Effective Gross Income = Gross Potential Income - Vacancy Credit Loss + Other Income
  # If `vacanyCredutLoss` is filled in and, `grossPotentialIncome` is valid, calculate Effective Gross Income
  # If `otherIncome` is filled in and, `grossPotentialIncome` is valid, re-calculate Effective Gross Income
  # If both `vacanyCredutLoss` and `otherIncome` are invalid then, initialize Effective Gross Income equal to Gross Potential Income
  # Any change in either of the two fields will trigger the calculation of Net Operating Income
*/
const calculateEffectiveGrossIncome = () => {
  const vacancyCreditLossValue = parseFloat(vacanyCreditLoss.value);
  const otherIncomeValue = otherIncome.rawValue;
  const grossPotentialIncomeValue = parseFloat(grossPotentialIncome.innerText.replace(/\$|,/g, ''));
  let effectiveGrossIncomeValue = Math.round(grossPotentialIncomeValue);
  
  if (vacancyCreditLossValue) {
    resultantVacany.innerText = parseFloat(vacanyCreditLoss.value) + "%";
  } else {
    resultantVacany.innerText = '0%';
  }

  if (otherIncomeValue) {
    resultantOtherIncome.innerText = "$" + otherIncome.domElement.value;
  } else {
    resultantOtherIncome.innerText = '$0';
  }

  if (effectiveGrossIncomeValue) {
    effectiveGrossIncome.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
    resultantEGI.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
  }
  
  if (vacancyCreditLossValue && grossPotentialIncomeValue) {
    effectiveGrossIncomeValue -= Math.round(grossPotentialIncomeValue * vacancyCreditLossValue / 100);
    effectiveGrossIncome.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
    resultantEGI.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
  }

  if (otherIncomeValue && grossPotentialIncomeValue) {
    effectiveGrossIncomeValue = Math.round(parseFloat(effectiveGrossIncomeValue) + parseFloat(otherIncomeValue));
    effectiveGrossIncome.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
    resultantEGI.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
  }

  calculateTotalExpenses();
}
/*
  # Update Total Expenses Property on Calculated Results
*/
const updateResultantTotalExpenses = (element) => {
  let resultantId = 'resultant-' + element.target.id;
  let resultant = document.getElementById(resultantId);
  let value = element.target.value;
  let isManagementFee = resultantId === 'resultant-management-fee';
  
  if (value) {
    if (isManagementFee) {
      resultant.innerText = value + '%';
    } else {
      resultant.innerText = "$" + value;
    }
  } else {
    if (isManagementFee) {
      resultant.innerText = '0.0%';
    } else {
      resultant.innerText = '$0';
    }
  }
}
/*
  # Calculate Managment Fee from percentage value
  # If `managementFee` is filled in and, `grossPotentialIncome` is valid, calculate Management Fee in dollars
*/
const calculateManagementFee = () => {
  const managementFeeValue = parseFloat(managementFee.value);
  const effectiveGrossIncomeValue = parseFloat(effectiveGrossIncome.innerText.replace(/\$|,/g, ''));
  let netManagementFee = 0;

  if (managementFeeValue && effectiveGrossIncomeValue) {
    netManagementFee = (effectiveGrossIncomeValue * managementFeeValue / 100).toFixed(2);
  }

  return parseFloat(netManagementFee);
}
/*
  # Calculate Total Expenses
  # Total Expenses = Sum of all Expenses
  # If any of the Expenses are filled in, calculate Total Expenses
  # Any change in any of the Expenses will trigger the calculation of Net Operating Income
*/
const calculateTotalExpenses = () => {
  let totalExpensesValue = calculateManagementFee();
  expenses.forEach(expense => {
    let expenseValue = parseFloat(expense.value.replaceAll(',', ''));
    if (expenseValue) {
      totalExpensesValue += expenseValue;
    }
  });
  totalExpenses.innerText = "$" + numberWithCommas(Math.round(totalExpensesValue));
  resultantTotalExpenses.innerText = "$" + numberWithCommas(Math.round(totalExpensesValue));
  calculateNetOperatingIncome();
}
/*
  # Calculate Net Operating Income
  # Net Operating Income = Effective Gross Income - Total Expenses
  # If `effectiveGrossIncome` and `totalExpenses` are filled in, calculate Net Operating Income
  # If only `effectiveGrossIncome` is filled in, initialize Net Operating Income equal to Effective Gross Income
  # Any change in either of the two fields will trigger the calculation of Cap Rate
*/
const calculateNetOperatingIncome = () => {
  const effectiveGrossIncomeValue = parseInt(effectiveGrossIncome.innerText.replace(/\$|,/g, ''));
  const totalExpensesValue = parseInt(totalExpenses.innerText.replace(/\$|,/g, ''));
  if (effectiveGrossIncomeValue && totalExpensesValue) {
    const netOperatingIncomeValue = parseInt(effectiveGrossIncomeValue - totalExpensesValue);
    netOperatingIncome.innerText = "$" + numberWithCommas(netOperatingIncomeValue);
  } else if (effectiveGrossIncomeValue) {
    netOperatingIncome.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
  } else {
    netOperatingIncome.innerText = '$0';
  }
  calculateCapRate(propertyValue.domElement.value);
}
/*
  # Calculate Cap Rate
  # Cap Rate = Net Operating Income / Property Value
  # If `netOperatingIncome` and `propertyValue` are filled in, calculate Cap Rate
  # If only `netOperatingIncome` is filled in, initialize Cap Rate equal to 0
*/
const calculateCapRate = (propertyVal) => {
  const netOperatingIncomeValue = parseFloat(netOperatingIncome.innerText.replace(/\$|,/g, ''));
  if (propertyVal) {
    resultantPropertyValue.innerText = "$" + propertyVal;
  } else {
    resultantPropertyValue.innerText = '$0';
  }
  
  if (netOperatingIncomeValue && propertyVal) {
    let rawPropertyValue = propertyValue.rawValue;
    const capRateValue = (netOperatingIncomeValue / rawPropertyValue) * 100;
    capRate.innerText = capRateValue.toFixed(2) + '%';
  } else {
    capRate.innerText = '0.00%';
  }
}

// Add event listener to Property Value field to trigger calculation of Cap Rate
propertyValue.domElement.addEventListener('input', (e) => { calculateCapRate(e.target.value); });
// Add event listener to validate total rent squalre feet
totalRentSquareFeet.domElement.addEventListener('input', (e) => { validateTotalRentSquareFeet(e); });
// Add event listener to Total Rent Square Foot and Average Rent Square Foot fields to trigger calculation of Gross Potential Income
totalRentSquareFeet.domElement.addEventListener('input', (e) => { calculateGrossPotentialIncome(); });
averageRentPerSquareFoot.domElement.addEventListener('input', (e) => { calculateGrossPotentialIncome(); });
// Add event listener to Vacancy Credit Loss and Other Income fields to trigger calculation of Effective Gross Income
vacanyCreditLoss.addEventListener('input', (e) => { calculateEffectiveGrossIncome(); });
otherIncome.domElement.addEventListener('input', (e) => { calculateEffectiveGrossIncome(); });
// Add event listener to Management Fee to trigger calculation of Total Expenses
managementFee.addEventListener('input', (e) => { calculateTotalExpenses(); updateResultantTotalExpenses(e); });
// For all the input fileds required for expenses add event listener to trigger calculation of Total Expenses
expenses.forEach(expense => new AutoNumeric(expense, amountConfig));
expenses.forEach(expense => expense.addEventListener('input', (e) => { calculateTotalExpenses(); updateResultantTotalExpenses(e); }));