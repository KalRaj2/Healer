async function runTest() {
    const res = await fetch('/run-test');
    const data = await res.json();
    document.getElementById('output').innerText = JSON.stringify(data, null, 2);
}