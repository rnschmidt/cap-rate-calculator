/* ------------------------SIMPLE RATIO ------------------------------------- */
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
const resultantVacany = document.getElementById('resultant-vacany');
const resultantOtherIncome = document.getElementById('resultant-other-income');
const resultantEGI = document.getElementById('resultant-egi');
const resultantTotalExpenses = document.getElementById('resultant-total-expenses');
const netOperatingIncome = document.getElementById('net-operating-income');
const capRate = document.getElementById('cap-rate');
// add thousand separators to numbers
const numberWithCommas = (x) => {
  x = x.toString();
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x))
      x = x.replace(pattern, "$1,$2");
  return x;
}
// change input border color with red if input is negavtive
const checkIsPositive = (e) => {
  const value = parseFloat(e.target.value);
  if (e.target.value === "" || value > 0) {
    e.target.setCustomValidity("");
    e.target.style.borderColor = "grey";
  } else {
    e.target.setCustomValidity("Please select a value that is greater than 0.");
    e.target.style.borderColor = "red";
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
    const grossPotentialIncomeValue = (totalRentValue * rentPerSqFt).toFixed(2);
    grossPotentialIncome.innerText = "$" + numberWithCommas(grossPotentialIncomeValue);
    resultantGPI.innerText = "$" + numberWithCommas(grossPotentialIncomeValue);
  } else {
    grossPotentialIncome.innerText = '$0.00';
    resultantGPI.innerText = '$0.00';
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
  let effectiveGrossIncomeValue = grossPotentialIncomeValue.toFixed(2);
  if (vacancyCreditLossValue && grossPotentialIncomeValue) {
    effectiveGrossIncomeValue -= (grossPotentialIncomeValue * vacancyCreditLossValue / 100).toFixed(2);
    effectiveGrossIncome.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
    resultantEGI.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
    resultantVacany.innerText = vacanyCreditLoss.value + "%";
  }
  if (otherIncomeValue && grossPotentialIncomeValue) {
    effectiveGrossIncomeValue = (effectiveGrossIncomeValue + otherIncomeValue).toFixed(2);
    effectiveGrossIncome.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
    resultantEGI.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
    resultantOtherIncome.innerText = "$" + numberWithCommas(otherIncome.value);
  }
  if (!vacancyCreditLossValue && !otherIncomeValue && grossPotentialIncomeValue) {
    effectiveGrossIncome.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
    resultantEGI.innerText = "$" + numberWithCommas(effectiveGrossIncomeValue);
  }
  if (!grossPotentialIncomeValue) {
    effectiveGrossIncome.innerText = '$0.00';
    resultantEGI.innerText = '$0.00';
  }
  calculateNetOperatingIncome();
}
/*
  # Calculate Total Expenses
  # Total Expenses = Sum of all Expenses
  # If any of the Expenses are filled in, calculate Total Expenses
  # Any change in any of the Expenses will trigger the calculation of Net Operating Income
*/
const calculateTotalExpenses = () => {
  let totalExpensesValue = 0;
  expenses.forEach(expense => totalExpensesValue += expense.value ? parseFloat(expense.value) : 0);
  totalExpenses.innerText = "$" + numberWithCommas(totalExpensesValue.toFixed(2));
  resultantTotalExpenses.innerText = "$" + numberWithCommas(totalExpensesValue.toFixed(2));
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
  if (netOperatingIncomeValue && propertyValue) {
    const capRateValue = (netOperatingIncomeValue / propertyValue) * 100;
    capRate.innerText = capRateValue.toFixed(2) + '%';
  } else {
    capRate.innerText = '0.00%';
  }
}
// For all the input fileds add event listener to check if the values are positive numbers
document.querySelectorAll(".float-field").forEach(element => element.addEventListener("input", checkIsPositive, false));
// Add event listener to Property Value field to trigger calculation of Cap Rate
propertyValue.addEventListener('input', (e) => calculateCapRate(e.target.value));
// Add event listener to Total Rent Square Foot and Average Rent Square Foot fields to trigger calculation of Gross Potential Income
totalRentSquareFeet.addEventListener('input', () => calculateGrossPotentialIncome());
averageRentPerSquareFoot.addEventListener('input', () => calculateGrossPotentialIncome());
// Add event listener to Vacancy Credit Loss and Other Income fields to trigger calculation of Effective Gross Income
vacanyCreditLoss.addEventListener('input', () => calculateEffectiveGrossIncome());
otherIncome.addEventListener('input', () => calculateEffectiveGrossIncome());
// For all the input fileds required for expenses add event listener to trigger calculation of Total Expenses
expenses.forEach(expense => expense.addEventListener('input', () => calculateTotalExpenses()));

/*------------------------------------- BAND OF INVESTMENT ------------------------------------------------ */
// Inputs for Band of Investment
const interestRate = document.getElementById('interest-rate');
const compoundingPeriodsPerYear = document.getElementById('cpi-per-year');
const loanValueRatio = document.getElementById('loan-value-ratio');
const loanTerm = document.getElementById('loan-term');
const equityDividendRate = document.getElementById('equity-dividend-rate');
const mortgageLoanConstant = document.getElementById('mortgage-loan-constant');
// Calculated Results for Band of Investment
const resultantLoanValueRatio = document.getElementById('resultant-loan-value-ratio');
const resultantMortgageLoanConstant = document.getElementById('resultant-mortgage-loan-constant');
const mortgageComponent = document.getElementById('mortgage-component');
const resultantLoanValueRatioInverse = document.getElementById('resultant-loan-value-ratio-inverse');
const resultantEquityDividendRate = document.getElementById('resultant-equity-dividend-rate');
const equityComponent = document.getElementById('equity-component');
const indicatedCapitalizationRate = document.getElementById('indicated-capitalization-rate');
const finalRoundedCapRate = document.getElementById('final-rounded-cap-rate');

/*
  # Calculate Mortgage Loan Constant
  # Let I = Interest Rate, C = Compounding Periods Per Year, LVR = Loan Value Ratio
  # Mortgage Loan Constant = ((I / C) / (1 - (1 / (1 + (I / C) ^ (C * LVR)))) * C)
  # If `interestRate` and `compoundingPeriodsPerYear` and `loanValueRatio` are filled in, calculate Mortgage Loan Constant
  # Any change in any of the three fields will trigger the calculation of Mortgage Component
*/
const calculateMortgageLoanConstant = () => {
  const interestRateValue = parseFloat(interestRate.value) / 100;
  const compoundingPeriodsPerYearValue = parseFloat(compoundingPeriodsPerYear.value);
  const loanTermValue = parseFloat(loanTerm.value);
  if (interestRateValue && compoundingPeriodsPerYearValue && loanTermValue) {
    const mortgageLoanConstantValue = (((interestRateValue / compoundingPeriodsPerYearValue) / (1 - (1 / Math.pow((1 + (interestRateValue / compoundingPeriodsPerYearValue)),(compoundingPeriodsPerYearValue * loanTermValue))))) * compoundingPeriodsPerYearValue).toFixed(8);
    mortgageLoanConstant.innerText = mortgageLoanConstantValue;
    resultantMortgageLoanConstant.innerText = mortgageLoanConstantValue;
  } else {
    mortgageLoanConstant.innerText = '0.00';
    resultantMortgageLoanConstant.innerText = '0.00';
  }
  calculateMortgageComponent();
}
/*
  # Calculate Mortgage Component
  # Mortgage Component = Mortgage Loan Constant * Loan Value Ratio
  # If `mortgageLoanConstant` and `loanValueRatio` are filled in, calculate Mortgage Component
  # Any change in either of the two fields will trigger the calculation of Indicated Capitalization Rate
*/
const calculateMortgageComponent = () => {
  const loanValueRatioValue = parseFloat(loanValueRatio.value) / 100;
  const mortgageLoanConstantValue = parseFloat(mortgageLoanConstant.innerText);
  if (loanValueRatioValue && mortgageLoanConstantValue) {
    const mortgageComponentValue = (loanValueRatioValue * mortgageLoanConstantValue).toFixed(8);
    resultantLoanValueRatio.innerText = loanValueRatioValue;
    mortgageComponent.innerText = mortgageComponentValue;
  } else {
    resultantLoanValueRatio.innerText = '0.00';
    mortgageComponent.innerText = '0.00';
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
    const equityComponentValue = (equityDividendRateValue * loanValueRatioInverseValue).toFixed(8);
    resultantLoanValueRatioInverse.innerText = loanValueRatioInverseValue;
    resultantEquityDividendRate.innerText = equityDividendRateValue;
    equityComponent.innerText = equityComponentValue;
  } else {
    resultantEquityDividendRate.innerText = '0.00';
    equityComponent.innerText = '0.00';
  }
  calculateIndicatedCapitalizationRate();
}
/*
  # Calculate Indicated Capitalization Rate
  # Indicated Capitalization Rate = (Mortgage Component + Equity Component)
  # If `mortgageComponent` and `equityComponent` are filled in, calculate Indicated Capitalization Rate
  # Final Rounded Capitalization Rate will be calculated based on the rounded value of Indicated Capitalization Rate
*/
const calculateIndicatedCapitalizationRate = () => {
  const mortgageComponentValue = parseFloat(mortgageComponent.innerText);
  const equityComponentValue = parseFloat(equityComponent.innerText);
  if (mortgageComponentValue && equityComponentValue) {
    const indicatedCapitalizationRateValue = (mortgageComponentValue + equityComponentValue).toFixed(8);
    indicatedCapitalizationRate.innerText = indicatedCapitalizationRateValue;
    finalRoundedCapRate.innerText = (indicatedCapitalizationRateValue * 100).toFixed(2) + '%';
  } else {
    indicatedCapitalizationRate.innerText = '0.00';
    finalRoundedCapRate.innerText = '0.00%';
  }
}
// Event Listeners for calculating Mortgage Loan Constant
[interestRate, compoundingPeriodsPerYear, loanTerm].forEach(element => element.addEventListener('input', calculateMortgageLoanConstant, false));
// Event Listeners for calculating Mortgage Component
loanValueRatio.addEventListener('input', () => calculateMortgageComponent());
// Event Listeners for calculating Equity Component
[loanValueRatio, equityDividendRate].forEach(element => element.addEventListener('input', calculateEquityComponent, false));

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
  
  if (discountRateValue && noiGrowthRateValue) {
    capRate = (discountRateValue - noiGrowthRateValue).toFixed(2);
    gordonModelCapRate.innerText = capRate + '%';
  } else {
    gordonModelCapRate.innerText = '0.0%';
  }

  if (noiValue && capRate) {
    let value = (noiValue * (100 / capRate)).toFixed(2);
    gordonModelValue.innerText = '$' + numberWithCommas(value);
  }
}

noi.addEventListener('input', calculateGordonModelCapRate);
discountRate.addEventListener('input', calculateGordonModelCapRate);
noiGrowthRate.addEventListener('input', calculateGordonModelCapRate);