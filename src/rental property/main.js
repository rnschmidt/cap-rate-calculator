import { amountConfig, numberWithCommas } from "../utils/utils.js";

// Operating Statement Inputs
const monthlyRent = new AutoNumeric('#monthly-rent', amountConfig);
const otherIncome = new AutoNumeric('#other-income', amountConfig);
const vacanyRate = document.getElementById('vacancy-rate');
const managementFee = document.getElementById('management-fee'); 
const expenses = document.querySelectorAll('.expenses');
// internal calculations
const effectiveGrossIncome = document.getElementById('effective-gross-income');
const totalExpenses = document.getElementById('total-expenses');
// calculated results
const resultantMonthlyRent = document.getElementById('resultant-monthly-rent');
const resultantOtherIncome = document.getElementById('resultant-other-income');
const resultantVacancyRate = document.getElementById('resultant-vacancy-rate');
const resultantEffectiveGrossIncome = document.getElementById('resultant-effective-gross-income');
const resultantTotalExpenses = document.getElementById('resultant-total-expenses');
const netOperatingIncome = document.getElementById('net-operating-income');
// share link
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);
/*
  # Update Total Expenses Property on Calculated Results
*/
const updateResultantTotalExpenses = (element) => {
  let resultantId = 'resultant-' + (element.target ? element.target.id : element.id);
  let resultant = document.getElementById(resultantId);
  let value = element.target ? element.target.value : element.value;
  let isManagementFee = resultantId === 'resultant-management-fee';
  
  if (value) {
    if (isManagementFee) return;
    resultant.innerText = "$" + value;
  } else {
    resultant.innerText = '$0';
  }
}
/*
  # Calculate Managment Fee from percentage value
  # If `managementFee` is filled in and, `grossPotentialIncome` is valid, calculate Management Fee in dollars
*/
const calculateManagementFee = () => {
  const managementFeeValue = parseFloat(managementFee.value);
  const effectiveGrossIncomeValue = parseFloat(effectiveGrossIncome.innerText.replace(/\$|,/g, ''));
  const resultantManagementFee = document.getElementById('resultant-management-fee');
  let netManagementFee = 0;

  if (managementFeeValue && effectiveGrossIncomeValue) {
    netManagementFee = (effectiveGrossIncomeValue * managementFeeValue / 100).toFixed(2);
    resultantManagementFee.innerText = "$" + numberWithCommas(Math.round(netManagementFee));
  } else {
    resultantManagementFee.innerText = '$0';
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
  Calculate Effective Gross Income
  Effective Gross Income = Potential Gross Income - Vacancy & Credit Loss
*/
const calculateEffectiveGrossIncome = () => { 
  const monthlyRentValue = parseInt(monthlyRent.rawValue);
  const otherIncomeValue = parseInt(otherIncome.rawValue);
  const vacancyRateValue = parseFloat(vacanyRate.value);
  const vacancyRateValueInDollars = (monthlyRentValue + otherIncomeValue) * vacancyRateValue / 100;

  if (monthlyRentValue) {
    resultantMonthlyRent.innerText = "$" + numberWithCommas(monthlyRentValue);
  } else { 
    resultantMonthlyRent.innerText = '$0';
  }

  if (otherIncomeValue) {
    resultantOtherIncome.innerText = "$" + numberWithCommas(otherIncomeValue);
  } else { 
    resultantOtherIncome.innerText = '$0';
  }

  if (vacancyRateValueInDollars) {
    resultantVacancyRate.innerText = "$" + numberWithCommas(Math.round(vacancyRateValueInDollars));
  } else { 
    resultantVacancyRate.innerText = '$0';
  }

  const effectiveGrossIncomeValue = monthlyRentValue + otherIncomeValue - Math.round(vacancyRateValueInDollars);

  if (effectiveGrossIncomeValue) {
    effectiveGrossIncome.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
    resultantEffectiveGrossIncome.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
  } else { 
    effectiveGrossIncome.innerText = '$0';
    resultantEffectiveGrossIncome.innerText = '$0';
  }

  calculateNetOperatingIncome();
}
/*
  Calculate Net Operating Income
  Net Operating Income = Effective Gross Income - Total Expenses
*/
const calculateNetOperatingIncome = () => { 
  const effectiveGrossIncomeValue = parseInt(effectiveGrossIncome.innerText.replace(/\$|,/g, ''));
  const totalExpensesValue = parseInt(totalExpenses.innerText.replace(/\$|,/g, ''));

  const netOperatingIncomeValue = effectiveGrossIncomeValue - totalExpensesValue;
  
  if (netOperatingIncomeValue) {
    netOperatingIncome.innerText = "$" + numberWithCommas(netOperatingIncomeValue);
  } else {
    netOperatingIncome.innerText = '$0';
  }
}
// For all the input fileds required for expenses add event listener to trigger calculation of Total Expenses
expenses.forEach(expense => new AutoNumeric(expense, amountConfig));
expenses.forEach(expense => expense.addEventListener('input', (e) => { calculateTotalExpenses(); updateResultantTotalExpenses(e); }));
// add eventlistners to calculate Effective Gross Income
[monthlyRent.domElement, otherIncome.domElement, vacanyRate].forEach(element => element.addEventListener('input', calculateEffectiveGrossIncome));