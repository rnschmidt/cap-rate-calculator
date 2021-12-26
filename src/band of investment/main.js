/*------------------------------------- BAND OF INVESTMENT ------------------------------------------------ */

import { generateSharableLink, insertErrorMessage, parseFromUrl, removeErrorMessage } from "../utils/utils.js";

// Inputs for Band of Investment
const interestRate = document.getElementById('interest-rate');
const compoundingPeriodsPerYear = document.getElementById('cpi-per-year');
const loanValueRatio = document.getElementById('loan-value-ratio');
const loanTerm = new AutoNumeric('#loan-term', {
  decimalPlaces: 0,
  decimalPlacesRawValue: 0,
  minimumValue: "0",
  maximumValue: "120000",
  modifyValueOnWheel: false
});
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
// Shareable link
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);

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
    loanTermValue = parseFloat(loanTerm.rawValue);
  } else {
    loanTermValue = parseFloat(loanTerm.rawValue) * 12;
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

  shareLink.value = generateSharableLink(url, [interestRate, compoundingPeriodsPerYear, loanValueRatio, loanTerm, loanTermPeriod, equityDividendRate]);
}
// validate compounding periods per year to accept value less than or equal to 365
const validateCompoundingPeriodsPerYear = (e) => {
  const val = e.target.value;
  if (val > 365) {
    e.target.value = 365;
    insertErrorMessage(e, 'Compounding Periods Per Year cannot be greater than 365');
  } else {
    removeErrorMessage(e);
  }
}
// validate loan term to accept value less than or equal to 12000 years
const validateLoanTerm = (e) => {
  const val = parseFloat(e.target.value.replaceAll(',', ''));
  if (val > 12000) {
    e.target.value = '12,000';
    insertErrorMessage(e, 'Loan Amortization cannot be greater than 12000 years');
  } else {
    removeErrorMessage(e);
  }
}
// Event listener to validate compounding periods per year
compoundingPeriodsPerYear.addEventListener('input', validateCompoundingPeriodsPerYear, false);
// Event listener to validate loan term
loanTerm.domElement.addEventListener('input', validateLoanTerm, false);
// Event Listeners for calculating Mortgage Loan Constant
[interestRate, compoundingPeriodsPerYear, loanTerm.domElement, loanTermPeriod].forEach(element => element.addEventListener('input', (e) => { calculateMortgageLoanConstant(); }));
// Event Listeners for changing Loan Term Period Value
loanTermPeriod.addEventListener('input', () => {
  if (loanTermPeriod.checked) {
    loanTermPeriod.value = 'Monthly';
  } else {
    loanTermPeriod.value = 'Yearly';
  }
});
// Event Listeners for calculating Mortgage Component
loanValueRatio.addEventListener('input', (e) => { calculateDebtComponent(); });
// Event Listeners for calculating Equity Component
[loanValueRatio, equityDividendRate].forEach(element => element.addEventListener('input', (e) => { calculateEquityComponent(); }));
// Event Listners for generating sharable link and copy link to clipboard
shareResultButton.addEventListener('click', () => {
  let link = generateSharableLink(url, [interestRate, compoundingPeriodsPerYear, loanValueRatio, loanTerm, loanTermPeriod, equityDividendRate]);
  shareLink.value = link;
  shareLink.style.width = 'calc(100% - 3.5rem)';
  shareLink.style.padding = '0.5rem';
  copyText.style.opacity = '1';
});
// Get parmas from url
const params = new URLSearchParams(url.search);
// Toggle checkbox based on url params
if (params.has('loan-term-period')) {
  let value = params.get('loan-term-period');
  
  if (value === 'Monthly') {
    loanTermPeriod.checked = true;
  } else {
    loanTermPeriod.checked = false;
  }
}
// Populating input fields for sharable link and calculating the result
parseFromUrl(window.location.href, [calculateMortgageLoanConstant, calculateEquityComponent]);