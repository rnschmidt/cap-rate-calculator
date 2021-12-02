const totalRent = document.getElementById('total-rent');
const averageRent = document.getElementById('average-rent');
const vacancy = document.getElementById('vacancy');
const calculateRentBtn = document.getElementById('calculate-rent');
const displayTotalRent = document.getElementById('display-total-rent');
const displayAverageRent = document.getElementById('display-average-rent');
const displayVacancy = document.getElementById('display-vacancy');
const effectiveRent = document.getElementById('effective-rental-income');
const step1 = document.querySelector('.step-1');
const displayContainer = document.querySelector('.display-result');

calculateRentBtn.addEventListener('click', () => {
  console.log("clicked")
  const totalRentValue = parseInt(totalRent.value);
  const averageRentValue = parseInt(averageRent.value);
  const vacancyValue = parseInt(vacancy.value);
  const grossPotentialIncome = totalRentValue * averageRentValue;
  const effectiveRentValue = grossPotentialIncome - (grossPotentialIncome * (vacancyValue / 100));
  displayTotalRent.innerHTML = "$" + totalRentValue;
  displayAverageRent.innerHTML = "$" + averageRentValue;
  displayVacancy.innerHTML = vacancyValue + "%";
  effectiveRent.innerHTML = "$" + effectiveRentValue;
  step1.classList.add('hide');
  displayContainer.classList.remove('hide');
});