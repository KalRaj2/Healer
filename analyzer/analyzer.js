function analyzeFailure(locator, dom) {

    if (!dom.includes("button")) {
        return "Frontend Issue: Button not rendered";
    }

    if (locator.toLowerCase().includes("login") && dom.includes("loginBtn")) {
        return "Locator Issue: ID changed";
    }

    if (locator.startsWith(".")) {
        return "CSS Class mismatch";
    }

    return "Unknown issue (needs investigation)";
}

module.exports = { analyzeFailure };