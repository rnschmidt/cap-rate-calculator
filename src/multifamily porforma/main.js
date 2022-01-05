import { renderDeleteIcon, amountConfig, numberWithCommas } from "../utils/utils.js";
/* --------------------Building Data-------------------------- */
const buildingDataInputContainer = document.querySelector('.building-data-inputs-container');
const resultantBuildingDataContainer = document.querySelector('.resultant-building-data-container');
const addNewRowButton = document.getElementById('add-new-row');
const totalUnits = document.getElementById('total-units');
const totalRent = document.getElementById('total-rent');
const totalAnnualRent = document.getElementById('total-annual-rent');
// share link
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);
// building data input selectors
const buildingDataInputSelectors = ['.unit-type-br', '.unit-type-ba', '.number-of-units', '.average-rent-per-month'];
// remove event listeners from inputs when row is deleted
const removeAllInputsEventListeners = (id) => { 
  const br = document.getElementById(`unit-type-br-${id}`);
  const ba = document.getElementById(`unit-type-ba-${id}`);
  
  [br, ba].forEach(element => element.removeEventListener('input', handleBrBaInputs, false));

  const numberOfUnits = document.getElementById(`number-of-units-${id}`);
  numberOfUnits.removeEventListener('input', handleNumberOfUnits, false);

  const averageRentPerMonth = document.getElementById(`average-rent-per-month-${id}`);
  averageRentPerMonth.removeEventListener('input', handleAverageRentPerMonth, false);
}
// delete row from input container & result container
const deleteRowFromContainer = (id) => { 
  let row = document.getElementById(`row-${id}`);
  buildingDataInputContainer.removeChild(row);
  row = document.getElementById(`resultant-row-${id}`);
  resultantBuildingDataContainer.removeChild(row);
}
// add new row to input container
const addNewRowToContainer = (id) => {   
  const row = document.createElement('div');
  row.classList.add('row');
  row.id = `row-${id}`;
  row.innerHTML = `
    <div class="input-container">
      <div class="input-label">
        <label for="unit-type">Unit Type</label>
      </div>
      <div class="input-wrapper">
        <div class="input-row">
          <span class="rounded-left">br</span>
          <input type="number" name="unit-type" id="unit-type-br-${id}" class="unit-type-br short-input rounded-right" placeholder="0" min="0" step="1" />
        </div>
        <div class="input-row">
          <input type="number" name="unit-type" id="unit-type-ba-${id}" class="unit-type-ba short-input rounded-left" placeholder="0" min="0" step="1" />
          <span class="rounded-right">ba</span>
        </div>
      </div>
    </div>

    <div class="input-container">
      <div class="input-label">
        <label for="number-of-units">Number of Units</label>
      </div>
      <div class="input-wrapper">
        <input type="number" name="number-of-units" id="number-of-units-${id}" class="number-of-units" placeholder="0" min="0" step="1" />
      </div>
    </div>

    <div class="input-container">
      <div class="input-label">
        <label for="average-rent-per-month">Average Rent per Month</label>
      </div>
      <div class="input-wrapper">
        <span class="rounded-left">$</span>
        <input type="text" name="average-rent-per-month" id="average-rent-per-month-${id}" class="average-rent-per-month validate-amount rounded-right" min="0" step="1" placeholder="0" />
      </div>
    </div>
  `;

  const deleteIcon = renderDeleteIcon(row);
  deleteIcon.addEventListener('click', () => { 
    removeAllInputsEventListeners(id);
    deleteRowFromContainer(id)
    updateTotalValues();
  });

  buildingDataInputContainer.appendChild(row);

  const averageRentPerMonth = new AutoNumeric(`#average-rent-per-month-${id}`, amountConfig);
}
// add new row to result container
const addNewRowToResultantContainer = (id) => { 
  const row = document.createElement('div');
  row.classList.add('resultant-building-data-container-row');
  row.id = `resultant-row-${id}`;
  row.innerHTML = `
    <h4 id="resultant-unit-type-${id}">0 br / 0 ba</h4>
    <h4 id="resultant-number-of-units-${id}">0</h4>
    <h4 id="resultant-average-rent-per-month-${id}">$0</h4>
    <h4 id="total-annual-rent-${id}" class="total-annual-rent">$0</h4>
  `;

  resultantBuildingDataContainer.appendChild(row);
}
// calculate and update `total units`, `total average rent per month` and `total annual rent` on result container
const updateTotalValues = () => { 
  const numberOfUnits = document.querySelectorAll('.number-of-units');
  const totalNumberOfUnits = Array.from(numberOfUnits).reduce((acc, curr) => acc + (parseInt(curr.value) || 0), 0);
  totalUnits.innerText = numberWithCommas(totalNumberOfUnits);

  const averageRentPerMonth = document.querySelectorAll('.average-rent-per-month');
  const totalAvRentPerMonth = Array.from(averageRentPerMonth).reduce((acc, curr) => acc + (parseInt(curr.value.replace(/\,/g, '')) || 0), 0);
  totalRent.innerText = '$' + numberWithCommas(totalAvRentPerMonth);

  const resultantTotalAnnualRent = document.querySelectorAll('.total-annual-rent');
  const totalAnnualRentValue = Array.from(resultantTotalAnnualRent).reduce((acc, curr) => acc + (parseInt(curr.innerText.replace(/\,|\$/g, '')) || 0), 0);
  totalAnnualRent.innerText = '$' + numberWithCommas(totalAnnualRentValue);
  resultantPotentialIncome.innerText = '$' + numberWithCommas(totalAnnualRentValue);

  calculateTotalOtherIncome();
  calculatePricePerUnit();
}
/*
  Calculate and update `total annual rent` on result container
  Total Annual Rent = Total Units * Total Average Rent per Month * 12
*/
const calculateTotalAnnualRent = (id, numberOfUnits, averageRentPerMonth) => { 
  const totalAnnualRent = document.getElementById(`total-annual-rent-${id}`);
  averageRentPerMonth = parseInt(averageRentPerMonth.replace(/\,/g, '')) || 0;
  const totalAnnualRentValue = numberOfUnits * averageRentPerMonth * 12; 
  totalAnnualRent.innerText = `$${numberWithCommas(totalAnnualRentValue)}`;
  updateTotalValues();
  shareLink.value = generateSharableLink();
}

const handleBrBaInputs = (id, brValue, baValue) => { 
  const resultantUnitType = document.getElementById(`resultant-unit-type-${id}`);
  resultantUnitType.innerText = `${brValue}br / ${baValue}ba`;
  shareLink.value = generateSharableLink();
}

const handleNumberOfUnits = (id, numberOfUnitsValue, averageRentPerMonthValue) => { 
  const resultantNumberOfUnits = document.getElementById(`resultant-number-of-units-${id}`);
  resultantNumberOfUnits.innerText = numberOfUnitsValue;
  calculateTotalAnnualRent(id, numberOfUnitsValue, averageRentPerMonthValue);
}

const handleAverageRentPerMonth = (id, numberOfUnitsValue, averageRentPerMonthValue) => { 
  const resultantAverageRentPerMonth = document.getElementById(`resultant-average-rent-per-month-${id}`);
  resultantAverageRentPerMonth.innerText = `$${averageRentPerMonthValue}`;
  calculateTotalAnnualRent(id, numberOfUnitsValue, averageRentPerMonthValue);
}
// add event listeners to inputs and update values on result container
const addEventListnersToInputs = (id) => {
  const br = document.getElementById(`unit-type-br-${id}`);
  const ba = document.getElementById(`unit-type-ba-${id}`);

  [br, ba].forEach(element => element.addEventListener('input', () => handleBrBaInputs(id, br.value, ba.value)));

  const numberOfUnits = document.getElementById(`number-of-units-${id}`);
  const averageRentPerMonth = document.getElementById(`average-rent-per-month-${id}`);
  
  numberOfUnits.addEventListener('input', () => handleNumberOfUnits(id, numberOfUnits.value, averageRentPerMonth.value));

  averageRentPerMonth.addEventListener('input', () => handleAverageRentPerMonth(id, numberOfUnits.value,averageRentPerMonth.value));
}
// On click of add new row button -> add new row to building data container and add event listeners to inputs
addNewRowButton.addEventListener('click', () => {
  const id = Math.random().toString(36).substring(7);
  addNewRowToContainer(id);
  addNewRowToResultantContainer(id);
  addEventListnersToInputs(id);
});
// On fresh load of page -> atleast one row should be added
addNewRowButton.click(); 

/*------------------------------------Investment & Financing Data---------------- */
// investment data inputs
const purchasePrice = new AutoNumeric('#purchase-price', amountConfig);
const terminalCapRate = document.getElementById('terminal-cap-rate');
const saleMonth = document.getElementById('sale-month');
const costOfSale = document.getElementById('cost-of-sale');
const discountRateUnlevered = document.getElementById('discount-rate-unlevered');
const discountRateLevered = document.getElementById('discount-rate-levered');
// financing data inputs
const loanInterestRate = document.getElementById('loan-interest-rate');
const loanAmortization = document.getElementById('loan-amortization');
const ltv = document.getElementById('ltv');
const dscr = document.getElementById('dscr');
// calculated result
const resultantPurchasePrice = document.getElementById('resultant-purchase-price');
const resultantPerUnit = document.getElementById('resultant-per-unit');
const resultantTerminalCapRate = document.getElementById('resultant-terminal-cap-rate');
const resultantSaleMonth = document.getElementById('resultant-sale-month');
const resultantCostOfSale = document.getElementById('resultant-cost-of-sale');
const resultantDiscountRateUnlevered = document.getElementById('resultant-discount-rate-unlevered');
const resultantDiscountRateLevered = document.getElementById('resultant-discount-rate-levered');
const resultantLoanInterestRate = document.getElementById('resultant-loan-interest-rate');
const resultantLoanAmortization = document.getElementById('resultant-loan-amortization');
const resultantLtv = document.getElementById('resultant-ltv');
const resultantDscr = document.getElementById('resultant-dscr');
const loanAmountLtv = document.getElementById('loan-amount-ltv');
const loanAmountDscr = document.getElementById('loan-amount-dscr');
const maximumLoanAmount = document.getElementById('maximum-loan-amount');
const initialEquity = document.getElementById('initial-equity');
const monthlyDebtService = document.getElementById('monthly-debt-service');
const annualDebtService = document.getElementById('annual-debt-service');

const validateSaleMonth = (e) => { }

const validateDSCR = (e) => { }

const calculatePricePerUnit = () => { 
  const purchasePriceValue = parseInt(purchasePrice.rawValue) || 0;
  const totalUnitsValue = parseInt(totalUnits.innerText);
  
  if (purchasePriceValue) {
    resultantPurchasePrice.innerText = `$${numberWithCommas(purchasePriceValue)}`;
  } else { 
    resultantPurchasePrice.innerText = '$0';
  }

  const pricePerUnit = Math.round(purchasePriceValue / totalUnitsValue);
  
  if(pricePerUnit && pricePerUnit !== Infinity) {
    resultantPerUnit.innerText = `$${numberWithCommas(pricePerUnit)}`;
  } else {
    resultantPerUnit.innerText = '$0';
  }
}

const calculateLoanAmountLTV = () => {
  const purchasePriceValue = parseInt(purchasePrice.rawValue) || 0;
  const ltvValue = parseFloat(ltv.value) || 0;

  if (ltvValue) {
    resultantLtv.innerText = `${ltvValue}%`;
  } else {
    resultantLtv.innerText = '0.0%';
  }

  const loanAmountLtvValue = Math.round(purchasePriceValue * ltvValue / 100);

  if (loanAmountLtvValue) { 
    loanAmountLtv.innerText = `$${numberWithCommas(loanAmountLtvValue)}`;
  } else {
    loanAmountLtv.innerText = '$0';
  }
}

// add event listners to inputs and update values on result container
purchasePrice.domElement.addEventListener('input', () => { calculatePricePerUnit(); calculateLoanAmountLTV(); });
ltv.addEventListener('input', calculateLoanAmountLTV);

/* -----------------------------------Operating Statement ----------------------- */

// operating statement inputs
const otherIncome = new AutoNumeric('#other-income', amountConfig);
const vacanyCreditLoss = document.getElementById('vacany-credit-loss');
const expenses = document.querySelectorAll('.expenses');
// internal calculations
const effectiveGrossIncome = document.getElementById('effective-gross-income');
const totalExpenses = document.getElementById('total-expenses');
// Operating Expenses
const managementFee = document.getElementById('management-fee'); 
// calculated results
const resultantPotentialIncome = document.getElementById('resultant-potential-income');
const totalOtherIncome = document.getElementById('total-other-income');
const resultantPotentialGrossIncome = document.getElementById('resultant-potential-gross-income');
const resultantVacancyCreditLoss = document.getElementById('resultant-vacancy-credit-loss');
const resultantEffectiveGrossIncome = document.getElementById('resultant-effective-gross-income');
const resultantTotalExpenses = document.getElementById('resultant-total-expenses');
const netOperatingIncome = document.getElementById('net-operating-income');
const operatingMargin = document.getElementById('operating-margin');
const debtService = document.getElementById('debt-service');
const cashFlowBeforeTax = document.getElementById('cash-flow-before-tax');
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
  Calculate Total Other Income
  Total Other Income = Other Income * Total Units
*/
const calculateTotalOtherIncome = () => { 
  const totalUnitsValue = parseInt(totalUnits.innerText);
  const otherIncomeValue = parseInt(otherIncome.rawValue);
  const totalOtherIncomeValue = totalUnitsValue * otherIncomeValue;
  if (totalOtherIncomeValue) { 
    totalOtherIncome.innerText = "$" + numberWithCommas(totalOtherIncomeValue);
  } else {
    totalOtherIncome.innerText = '$0';
  }

  calculatePotentialGrossIncome();
}
/*
  Calculate Potential Gross Income
  Potential Gross Income = Potential Rental Income + Total Other Income
*/
const calculatePotentialGrossIncome = () => { 
  const potentialRentalIncomeValue = parseInt(resultantPotentialIncome.innerText.replace(/\$|,/g, ''));
  const totalOtherIncomeValue = parseInt(totalOtherIncome.innerText.replace(/\$|,/g, ''));
  const resultantPotentialGrossIncomeValue = potentialRentalIncomeValue + totalOtherIncomeValue;
  if (resultantPotentialGrossIncomeValue) {
    resultantPotentialGrossIncome.innerText = "$" + numberWithCommas(resultantPotentialGrossIncomeValue);
  } else {
    resultantPotentialGrossIncome.innerText = '$0';
  }

  calculateEffectiveGrossIncome();
}
/*
  Calculate Effective Gross Income
  Effective Gross Income = Potential Gross Income - Vacancy & Credit Loss
*/
const calculateEffectiveGrossIncome = () => { 
  const potentialGrossIncomeValue = parseInt(resultantPotentialGrossIncome.innerText.replace(/\$|,/g, ''));
  const vacancyCreditLossValue = Math.round(vacanyCreditLoss.value * potentialGrossIncomeValue / 100);
  
  if (vacancyCreditLossValue) {
    resultantVacancyCreditLoss.innerText = "$" + numberWithCommas(vacancyCreditLossValue);   
  } else {
    resultantVacancyCreditLoss.innerText = '$0';
  }
  
  const resultantEffectiveGrossIncomeValue = potentialGrossIncomeValue - vacancyCreditLossValue;
 
  if (resultantEffectiveGrossIncomeValue) {
    effectiveGrossIncome.innerText = "$" + numberWithCommas(resultantEffectiveGrossIncomeValue);
    resultantEffectiveGrossIncome.innerText = "$" + numberWithCommas(resultantEffectiveGrossIncomeValue);
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

  calculateOperatingMargin();
}
/*
  Calculate Operating Margin
  Operating Margin = Net Operating Income / Effective Gross Income
*/
const calculateOperatingMargin = () => {
  const effectiveGrossIncomeValue = parseInt(effectiveGrossIncome.innerText.replace(/\$|,/g, ''));
  const netOperatingIncomeValue = parseInt(netOperatingIncome.innerText.replace(/\$|,/g, ''));
  const operatingMarginValue = netOperatingIncomeValue / effectiveGrossIncomeValue;
  if (operatingMarginValue) {
    operatingMargin.innerText = operatingMarginValue.toFixed(2) + '%';
  } else {
    operatingMargin.innerText = '0%';
  }
}
// For all the input fileds required for expenses add event listener to trigger calculation of Total Expenses
expenses.forEach(expense => new AutoNumeric(expense, amountConfig));
expenses.forEach(expense => expense.addEventListener('input', (e) => { calculateTotalExpenses(); updateResultantTotalExpenses(e); }));
// add event listner for other income
otherIncome.domElement.addEventListener('input', calculateTotalOtherIncome);
// add event listner for vacancy credit loss
vacanyCreditLoss.addEventListener('input', calculateEffectiveGrossIncome);
// add event listner for management fee
managementFee.addEventListener('input', calculateTotalExpenses);

/* -----------------------------------Sharable link----------------------------- */

// generate sharable link for building data
const generateSharableLink = () => { 
  let parameters = {};
  
  buildingDataInputSelectors.forEach(selector => {
    const inputs = Array.from(document.querySelectorAll(selector));
    parameters[selector] = inputs.map(input => input.value);
  });
  
  let params = new URLSearchParams(parameters);
  
  return 'http://' + url.host + url.pathname + '?' + params.toString();
}
// parse parameter from url and pre-populate building data container inputs and resultant-building data container
const parseUrlParameters = (link) => { 
  const url = new URL(link);
  const params = new URLSearchParams(url.search);
  const parmasMap = {};
  let rows = 0;

  params.forEach((value, key) => { 
    parmasMap[key] = value.split(',');
    rows = parmasMap[key].length;
  });

  for (let i = 1; i < rows; i++) addNewRowButton.click();

  let ids = [];

  buildingDataInputSelectors.forEach(selector => { 
    const inputs = Array.from(document.querySelectorAll(selector));
    inputs.forEach((input, index) => {
      if (parmasMap[selector]) { 
        input.value = parmasMap[selector][index];
        let className = input.classList[0];
        let id = input.id.replace(className + '-', '');
        if(!ids.includes(id)) ids.push(id);
      } 
    });
  });

  ids.forEach(id => {
    const br = document.getElementById(`unit-type-br-${id}`);
    const ba = document.getElementById(`unit-type-ba-${id}`);
    handleBrBaInputs(id, br.value, ba.value);

    const numberOfUnits = document.getElementById(`number-of-units-${id}`);
    const averageRentPerMonth = document.getElementById(`average-rent-per-month-${id}`);
    handleNumberOfUnits(id, numberOfUnits.value, averageRentPerMonth.value);
    handleAverageRentPerMonth(id, numberOfUnits.value, averageRentPerMonth.value);
  });
}
// On click of share button -> generate sharable link and show copy to clipboard icon
shareResultButton.addEventListener('click', () => {
  let link = generateSharableLink();
  shareLink.value = link;
  shareLink.style.width = 'calc(100% - 3.5rem)';
  shareLink.style.padding = '0.5rem';
  copyText.style.opacity = '1';
});

parseUrlParameters(window.location.href);
