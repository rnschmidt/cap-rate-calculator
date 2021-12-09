/* ------------------------SIMPLE RATIO ------------------------------------- */
// Gross Potential Income
const propertyValue = document.getElementById('property-value');
const totalRentSquareFeet = document.getElementById('total-rent-square-feet');
const averageRentPerSquareFoot = document.getElementById('av-rent-per-sq-foot');
// Effective Gross Income
const vacanyCreditLoss = document.getElementById('vacany-credit-loss');
const otherIncome = document.getElementById('other-income');
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
// add thousand separators to numbers
const numberWithCommas = (x) => {
  x = x.toString();
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x))
      x = x.replace(pattern, "$1,$2");
  return x;
}
// Limit input to accept only Integer value
const validateInteger = (e) => {
  const i = e.value;
  e.value = parseInt(i, 10);
}
// Limit input to accept only upto 2 decimal places
const validateFloating = (e) => {
  const t = e.target.value;
  e.target.value = (t.indexOf(".") >= 0) ? (t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), 3)) : t;
}
// Add HTML element to show error message
const insertErrorMessage = (e, message) => {
  if (e.target.style.borderColor !== 'red') {
    e.target.style.borderColor = "red";
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-label');
    errorMessage.innerText = message;
    e.target.parentNode.appendChild(errorMessage);
  }
}
// Remove HTML element which shows error message
const removeErrorMessage = (e) => {
  if (e.target.style.borderColor === 'red') {
    e.target.style.borderColor = "";
    const errorMessage = e.target.parentNode.querySelector('.error-label');
    if (errorMessage) {
      e.target.parentNode.removeChild(errorMessage);
    }
  }
}
// Limit percentage input to accept in range 0-100
const validatePercentage = (e) => {
  const val = e.target.value;
  if (val < 0 || val > 100) {
    insertErrorMessage(e, 'Please select a value between 0 and 100.');
  } else {
    removeErrorMessage(e);
  }
}
// Make sure amount value does not exceed 100,000,000,000,000
const validateAmount = (e) => {
  const val = e.target.value;
  if (val > 100000000000000) {
    insertErrorMessage(e, 'Please select a value less than 100,000,000,000,000.');
  } else {
    removeErrorMessage(e);
  }
}
// Validate Total Rent Square Feet to accept value less than or equal to 1,000,000,000
const validateTotalRentSquareFeet = (e) => {
  const val = e.target.value;
  if (val > 1000000000) {
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
  const totalRentValue = parseFloat(totalRentSquareFeet.value);
  const rentPerSqFt = parseFloat(averageRentPerSquareFoot.value);
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
  const otherIncomeValue = parseFloat(otherIncome.value);
  const grossPotentialIncomeValue = parseFloat(grossPotentialIncome.innerText.replace(/\$|,/g, ''));
  let effectiveGrossIncomeValue = Math.round(grossPotentialIncomeValue);
  
  if (vacancyCreditLossValue) {
    resultantVacany.innerText = parseFloat(vacanyCreditLoss.value) + "%";
  } else {
    resultantVacany.innerText = '0%';
  }

  if (otherIncomeValue) {
    resultantOtherIncome.innerText = "$" + numberWithCommas(parseFloat(otherIncome.value));
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
    effectiveGrossIncomeValue = Math.round(parseFloat(effectiveGrossIncomeValue) + otherIncomeValue);
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
  let value = parseFloat(element.target.value);
  let isManagementFee = resultantId === 'resultant-management-fee';
  
  if (value) {
    if (isManagementFee) {
      resultant.innerText = value + '%';
    } else {
      resultant.innerText = "$" + numberWithCommas(value);
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
  expenses.forEach(expense => { if(expense.value) {totalExpensesValue += parseFloat(expense.value)} });
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
  const effectiveGrossIncomeValue = parseFloat(effectiveGrossIncome.innerText.replace(/\$|,/g, '')).toFixed(2);
  const totalExpensesValue = parseFloat(totalExpenses.innerText.replace(/\$|,/g, ''));
  if (effectiveGrossIncomeValue && totalExpensesValue) {
    const netOperatingIncomeValue = (effectiveGrossIncomeValue - totalExpensesValue).toFixed(2);
    netOperatingIncome.innerText = "$" + numberWithCommas(netOperatingIncomeValue);
  } else if (effectiveGrossIncomeValue) {
    netOperatingIncome.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
  } else {
    netOperatingIncome.innerText = '$0.00';
  }
  calculateCapRate(propertyValue.value);
}
/*
  # Calculate Cap Rate
  # Cap Rate = Net Operating Income / Property Value
  # If `netOperatingIncome` and `propertyValue` are filled in, calculate Cap Rate
  # If only `netOperatingIncome` is filled in, initialize Cap Rate equal to 0
*/
const calculateCapRate = (propertyValue) => {
  const netOperatingIncomeValue = parseFloat(netOperatingIncome.innerText.replace(/\$|,/g, ''));
  
  if (propertyValue) {
    resultantPropertyValue.innerText = "$" + numberWithCommas(parseFloat(propertyValue));
  } else {
    resultantPropertyValue.innerText = '$0';
  }
  
  if (netOperatingIncomeValue && propertyValue) {
    const capRateValue = (netOperatingIncomeValue / propertyValue) * 100;
    capRate.innerText = capRateValue.toFixed(2) + '%';
  } else {
    capRate.innerText = '0.00%';
  }
}
document.querySelectorAll('.validate-amount').forEach(element => element.addEventListener('input', validateAmount, false));
// Add event listner to all input fields to accept upto 2 decimal places
document.querySelectorAll('.float-field').forEach(element => element.addEventListener('input', validateFloating, false));
// Add event listner to validate percent value to keep between between 0 and 100
document.querySelectorAll('.validate-percent').forEach(element => element.addEventListener('input', validatePercentage, false));
// Add event listener to Property Value field to trigger calculation of Cap Rate
propertyValue.addEventListener('input', (e) => { calculateCapRate(e.target.value); });
// Add event listener to validate total rent squalre feet
totalRentSquareFeet.addEventListener('input', (e) => { validateTotalRentSquareFeet(e); });
// Add event listener to Total Rent Square Foot and Average Rent Square Foot fields to trigger calculation of Gross Potential Income
totalRentSquareFeet.addEventListener('input', (e) => { validateInteger(e.target); calculateGrossPotentialIncome(); });
averageRentPerSquareFoot.addEventListener('input', (e) => { calculateGrossPotentialIncome(); });
// Add event listener to Vacancy Credit Loss and Other Income fields to trigger calculation of Effective Gross Income
vacanyCreditLoss.addEventListener('input', (e) => { calculateEffectiveGrossIncome(); });
otherIncome.addEventListener('input', (e) => { calculateEffectiveGrossIncome(); });
// Add event listener to Management Fee to trigger calculation of Total Expenses
managementFee.addEventListener('input', (e) => { calculateTotalExpenses(); updateResultantTotalExpenses(e); });
// For all the input fileds required for expenses add event listener to trigger calculation of Total Expenses
expenses.forEach(expense => expense.addEventListener('input', (e) => { calculateTotalExpenses(); updateResultantTotalExpenses(e); }));

/*------------------------------------- BAND OF INVESTMENT ------------------------------------------------ */
// Inputs for Band of Investment
const interestRate = document.getElementById('interest-rate');
const compoundingPeriodsPerYear = document.getElementById('cpi-per-year');
const loanValueRatio = document.getElementById('loan-value-ratio');
const loanTerm = document.getElementById('loan-term');
const loanTermPeriod = document.getElementById('loan-term-period');
const equityDividendRate = document.getElementById('equity-dividend-rate');
const mortgageLoanConstant = document.getElementById('mortgage-loan-constant');
// Calculated Results for Band of Investment
const resultantLoanValueRatio = document.getElementById('resultant-loan-value-ratio');
const resultantMortgageLoanConstant = document.getElementById('resultant-mortgage-loan-constant');
const debtComponent = document.getElementById('debt-component');
const resultantEquityDividendRate = document.getElementById('resultant-equity-dividend-rate');
const equityComponent = document.getElementById('equity-component');
const indicatedCapitalizationRate = document.getElementById('indicated-capitalization-rate');
const finalRoundedCapRate = document.getElementById('final-rounded-cap-rate');

/*
  # Calculate Mortgage Loan Constant
  # Let I = Interest Rate, C = Compounding Periods Per Year, LT = Loan Term
  # Mortgage Loan Constant = ((I / C) / (1 - (1 / (1 + (I / C) ^ (C * LT)))) * C)
  # If `interestRate` and `compoundingPeriodsPerYear` and `loanTerm` are filled in, calculate Mortgage Loan Constant
  # Any change in any of the three fields will trigger the calculation of Mortgage Component
*/
const calculateMortgageLoanConstant = () => {
  const interestRateValue = parseFloat(interestRate.value) / 100;
  const compoundingPeriodsPerYearValue = parseFloat(compoundingPeriodsPerYear.value);
  let loanTermValue = 0;
  
  if (loanTermPeriod.checked) {
    loanTermValue = parseFloat(loanTerm.value)
  } else {
    loanTermValue = parseFloat(loanTerm.value) * 12;
  }
  
  if (interestRateValue && compoundingPeriodsPerYearValue && loanTermValue) {
    const mortgageLoanConstantValue = (((interestRateValue / compoundingPeriodsPerYearValue) / (1 - (1 / Math.pow((1 + (interestRateValue / compoundingPeriodsPerYearValue)),(compoundingPeriodsPerYearValue * loanTermValue))))) * compoundingPeriodsPerYearValue).toFixed(8);
    mortgageLoanConstant.innerText = mortgageLoanConstantValue;
    resultantMortgageLoanConstant.innerText = mortgageLoanConstantValue;
  } else {
    mortgageLoanConstant.innerText = '0.00';
    resultantMortgageLoanConstant.innerText = '0.00';
  }
  calculateDebtComponent();
}
let equityComponentValue = 0, debtComponentValue = 0;
/*
  # Calculate Mortgage Component
  # Mortgage Component = Mortgage Loan Constant * Loan Value Ratio
  # If `mortgageLoanConstant` and `loanValueRatio` are filled in, calculate Mortgage Component
  # Any change in either of the two fields will trigger the calculation of Indicated Capitalization Rate
*/
const calculateDebtComponent = () => {
  const loanValueRatioValue = parseFloat(loanValueRatio.value) / 100;
  const mortgageLoanConstantValue = parseFloat(mortgageLoanConstant.innerText);
  if (loanValueRatioValue && mortgageLoanConstantValue) {
    debtComponentValue = (loanValueRatioValue * mortgageLoanConstantValue).toFixed(8);
    resultantLoanValueRatio.innerText = (loanValueRatioValue * 100).toFixed(2) + '%';
    debtComponent.innerText = `${parseFloat(loanValueRatio.value)}% x ${mortgageLoanConstantValue} = ${debtComponentValue}`;
  } else {
    resultantLoanValueRatio.innerText = '0.0%';
    debtComponent.innerText = '0.00';
    debtComponentValue = 0;
  }
  calculateIndicatedCapitalizationRate();
}
/*
  # Calculate Equity Component
  # Equity Component = Equity Dividend Rate * Inverse of Loan Value Ratio
  # If `equityDividendRate` and `loanValueRatioInverse` are filled in, calculate Equity Component
  # Any change in either of the two fields will trigger the calculation of Indicated Capitalization Rate
*/
const calculateEquityComponent = () => {
  const equityDividendRateValue = parseFloat(equityDividendRate.value) / 100;
  const loanValueRatioInverseValue = parseFloat((100 - loanValueRatio.value) / 100);
  if (equityDividendRateValue && loanValueRatioInverseValue) {
    equityComponentValue = (equityDividendRateValue * loanValueRatioInverseValue).toFixed(8);
    resultantEquityDividendRate.innerText = (equityDividendRateValue * 100).toFixed(2) + '%';
    equityComponent.innerText = `${100 - loanValueRatio.value}% x ${parseFloat(equityDividendRate.value)}%  = ${equityComponentValue}`;
  } else {
    resultantEquityDividendRate.innerText = '0.00';
    equityComponent.innerText = '0.00';
    equityComponentValue = 0;
  }
  calculateIndicatedCapitalizationRate();
}
/*
  # Calculate Indicated Capitalization Rate
  # Indicated Capitalization Rate = (Mortgage Component + Equity Component)
  # If `debtComponent` and `equityComponent` are filled in, calculate Indicated Capitalization Rate
  # Final Rounded Capitalization Rate will be calculated based on the rounded value of Indicated Capitalization Rate
*/
const calculateIndicatedCapitalizationRate = () => {
  let indicatedCapitalizationRateValue = parseFloat(debtComponentValue) + parseFloat(equityComponentValue);
  indicatedCapitalizationRate.innerText = indicatedCapitalizationRateValue.toFixed(8);
  finalRoundedCapRate.innerText = (indicatedCapitalizationRateValue * 100).toFixed(2) + '%';
}
// validate compounding periods per year to accept value less than or equal to 365
const validateCompoundingPeriodsPerYear = (e) => {
  const val = e.target.value;
  if (val > 365) {
    insertErrorMessage(e, 'Compounding Periods Per Year cannot be greater than 365');
  } else {
    removeErrorMessage(e);
  }
}
// validate loan term to accept value less than or equal to 12000 years
const validateLoanTerm = (e) => {
  const val = e.target.value;
  if (val > 12000) {
    insertErrorMessage(e, 'Loan Term cannot be greater than 12000 years');
  } else {
    removeErrorMessage(e);
  }
}
// Event listener to validate compounding periods per year
compoundingPeriodsPerYear.addEventListener('input', validateCompoundingPeriodsPerYear, false);
// Event listener to validate loan term
loanTerm.addEventListener('input', validateLoanTerm, false);
// Event Listeners for calculating Mortgage Loan Constant
[interestRate, compoundingPeriodsPerYear, loanTerm, loanTermPeriod].forEach(element => element.addEventListener('input', (e) => { calculateMortgageLoanConstant(); }));
// Event Listeners for calculating Mortgage Component
loanValueRatio.addEventListener('input', (e) => { calculateDebtComponent(); });
// Event Listeners for calculating Equity Component
[loanValueRatio, equityDividendRate].forEach(element => element.addEventListener('input', (e) => { calculateEquityComponent(); }));

/*------------------------------------- GORDON MODEL ------------------------------------------------ */
const noi = document.getElementById('noi');
const discountRate = document.getElementById('discount-rate');
const noiGrowthRate = document.getElementById('noi-growth-rate');
const gordonModelCapRate = document.getElementById('gm-cap-rate');
const gordonModelValue = document.getElementById('gm-value');

const calculateGordonModelCapRate = () => {
  const noiValue = parseFloat(noi.value);
  const discountRateValue = parseFloat(discountRate.value);
  const noiGrowthRateValue = parseFloat(noiGrowthRate.value);
  let capRate = 0;
  
  if (discountRateValue) {
    capRate = discountRateValue;
  }

  if (noiGrowthRateValue) {
    capRate -= noiGrowthRateValue;
  }
  
  gordonModelCapRate.innerText = capRate.toFixed(2) + '%';

  if (noiValue && capRate) {
    let value = (noiValue * (100 / capRate)).toFixed(2);
    gordonModelValue.innerText = '$' + numberWithCommas(value);
  }
}

noi.addEventListener('input', (e) => { calculateGordonModelCapRate(); });
discountRate.addEventListener('input', (e) => { calculateGordonModelCapRate(); });
noiGrowthRate.addEventListener('input', (e) => { calculateGordonModelCapRate(); });