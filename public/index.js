let transactions = [];
let myChart;

fetch("/api/transaction")
  .then(response => {
    return response.json();
  })
  .then(data => {
    transactions = data;
//variable gets saved a global
    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  // reduces multipule amounts to a single total displayed on page
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}
// appends inputed data straight to html file, displaying the users income/outgoing money and HOW MUCH money came in or went out
function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach(transaction => {
//populates table
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

function populateChart() {
//takes in the data array and reverses it (lol this is a funny question. 1st question on leetcode :)))))
  let reversed = transactions.slice().reverse();
  let sum = 0;

//lables the data displayed on chat so data is readable by the user
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

//increments the total value of user with the sum of inputed data
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

//literally just restarts the chart (deletes old one and makes & displays a new one)
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
      data: {
        labels,
        datasets: [{
            label: "Total Over Time",
            fill: true,
            backgroundColor: "#6666ff",
            data
        }]
    }
  });
}
// targets html elements
function sendTransaction(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

// runs a validation to make sure the form isnt emptyy 
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  }
  else {
    errorEl.textContent = "";
  }

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };

// if the users input is negative, it coverts already existing data to negative and exports to chart
  if (!isAdding) {
    transaction.value *= -1;
  }

  transactions.unshift(transaction);


//runs functions to fill data charts up in needed
  populateChart();
  populateTable();
  populateTotal();
  
//basic post method ssends user input 
  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
  .then(response => {    
    return response.json();
  })
  .then(data => {
    if (data.errors) {
      errorEl.textContent = "Missing Information";
    }
    else {
//clears the user input form after data was inputed
      nameEl.value = "";
      amountEl.value = "";
    }
  })
  .catch(err => {
    saveRecord(transaction);
    nameEl.value = "";
    amountEl.value = "";
  });
}

document.querySelector("#add-btn").onclick = function() {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function() {
  sendTransaction(false);
};
