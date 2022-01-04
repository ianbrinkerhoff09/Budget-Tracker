// global variable
let db;
let request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
	let db = event.target.result;
	db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
	db = event.target.result;
	if (navigator.onLine) {
		checkDatabase();
	}
};

request.onerror = function (event) {
	console.log(event.target.errorCode);
};

function saveRecord(record) {
	let transaction = db.transaction(["pending"], "readwrite");
	let store = transaction.objectStore("pending");
	store.add(record);
}

function checkDatabase() {
	let transaction = db.transaction(["pending"], "readwrite");
	let store = transaction.objectStore("pending");
	let getAll = store.getAll();

	getAll.onsuccess = function () {
		if (getAll.result.length > 0) {
			fetch("api/transaction/bulk", {
				method: "POST",
				body: JSON.stringify(getAll.result),
				headers: {
					Accept: "application/json, text,plain, */*",
					"Content-Type": "application/json",
				},
			})
				.then((response) => response.json())
				.then(() => {
					let transaction = db.transaction(
						["pending"],
						"readwrite"
					);
					let store = transaction.objectStore("pending");
					store.clear();
				});
		}
	};
}

window.addEventListener("online", checkDatabase);
