// /api/create-issue.js  (Vercel Serverless Function)
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { title, body } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ error: "Missing title or body" });
    }

    const GITHUB_PAT = process.env.GITHUB_PAT;
    const GITHUB_REPO = process.env.GITHUB_REPO || "somikds3-glitch/Mahindra";

    if (!GITHUB_PAT) {
      return res.status(500).json({ error: "Server missing GITHUB_PAT" });
    }

    // extra safety: redact obvious secrets server-side as well
    const redact = (s) => {
      if (!s) return s;
      return String(s)
        .replace(/\bgithub_pat_[A-Za-z0-9_]{50,}\b/g, "[REDACTED_GITHUB_PAT]")
        .replace(/\bghp_[A-Za-z0-9]{36,}\b/g, "[REDACTED_GHP]")
        .replace(/\bgho_[A-Za-z0-9]{36,}\b/g, "[REDACTED_GHO]")
        .replace(/\bghu_[A-Za-z0-9]{36,}\b/g, "[REDACTED_GHU]")
        .replace(/\bghs_[A-Za-z0-9]{36,}\b/g, "[REDACTED_GHS]")
        .replace(/\bghr_[A-Za-z0-9]{36,}\b/g, "[REDACTED_GHR]")
        .replace(/\b[A-Za-z0-9_\-]{40,}\b/g, "[REDACTED]");
    };

    const payload = { title: redact(title), body: redact(body) };

    const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GITHUB_PAT}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify(payload)
    });

    const data = await ghRes.json();
    if (!ghRes.ok) {
      return res.status(ghRes.status).json({ error: data || "GitHub API error" });
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
