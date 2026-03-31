const axios = require('axios');

const GITHUB_TOKEN = "YOUR_GITHUB_TOKEN";
const OWNER = "YOUR_USERNAME";
const REPO = "qa-ai-tool";
const BASE_BRANCH = "main";

const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json"
};

async function createPR(oldLocator, newLocator) {

    try {

        // 1️⃣ Get latest commit SHA
        const ref = await axios.get(
            `https://api.github.com/repos/${OWNER}/${REPO}/git/ref/heads/${BASE_BRANCH}`,
            { headers }
        );

        const baseSha = ref.data.object.sha;

        // 2️⃣ Create new branch
        const branchName = `auto-fix-${Date.now()}`;

        await axios.post(
            `https://api.github.com/repos/${OWNER}/${REPO}/git/refs`,
            {
                ref: `refs/heads/${branchName}`,
                sha: baseSha
            },
            { headers }
        );

        // 3️⃣ Create file content
        const content = Buffer.from(
`Auto Locator Fix

Old: ${oldLocator}
New: ${newLocator}`
        ).toString('base64');

        // 4️⃣ Commit file
        await axios.put(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/locator-fix.txt`,
            {
                message: "Auto locator fix commit",
                content: content,
                branch: branchName
            },
            { headers }
        );

        // 5️⃣ Create PR
        const pr = await axios.post(
            `https://api.github.com/repos/${OWNER}/${REPO}/pulls`,
            {
                title: "🤖 Auto Locator Fix",
                head: branchName,
                base: BASE_BRANCH,
                body: `Auto-fixed locator\n\nOld: ${oldLocator}\nNew: ${newLocator}`
            },
            { headers }
        );

        console.log("✅ PR Created:", pr.data.html_url);

    } catch (err) {
        console.log("❌ GitHub PR Error:", err.response?.data || err.message);
    }
}

module.exports = { createPR };