function analyzeFailure(locator, dom) {

    if (!dom.includes("button")) {
        return "Frontend Issue: Button missing in DOM";
    }

    if (locator.includes("login") && dom.includes("loginBtn")) {
        return "Locator Issue: ID changed";
    }

    return "Unknown Issue";
}

module.exports = { analyzeFailure };