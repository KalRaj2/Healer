// public/app.js
async function runTest() {
    const url = document.getElementById('testUrl').value;

    try {
        console.log("Calling:", `http://localhost:4050/run-test?url=${url}`);
        const res = await fetch(`http://localhost:4050/run-test?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        console.log("Result:", data);
        alert(JSON.stringify(data));
        loadHistory(); // refresh history after run
    } catch (err) {
        console.error("ERROR:", err);
        alert("Backend not reachable!");
    }
}

async function loadHistory() {
    try {
        const res = await fetch('http://localhost:4050/history');
        const data = await res.json();
        const list = document.getElementById('historyList');
        list.innerHTML = '';
        data.forEach(h => {
            const li = document.createElement('li');
            li.textContent = `[${h.status}] ${h.step} -> ${h.locator}`;
            list.appendChild(li);
        });
    } catch (err) {
        console.error(err);
        alert("Unable to load history");
    }
}