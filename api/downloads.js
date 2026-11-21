const DOWNLOAD_KEY = "beauty_beyond_bruises_downloads";
const BOOK_PATH = "/Beauty-beyond-bruises.html";

async function updateDownloadCount(increment) {
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
        throw new Error("The KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not configured");
    }

    const operation = increment ? "incr" : "get";
    const response = await fetch(`${redisUrl}/${operation}/${DOWNLOAD_KEY}`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Upstash Redis request failed (${response.status})`);
    }

    const result = await response.json();
    const count = Number(result.result ?? 0);
    if (!Number.isSafeInteger(count) || count < 0) {
        throw new Error("Upstash Redis returned an invalid download count");
    }

    return count;
}

module.exports = async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const isDownload = req.query.download === "1";

    try {
        const count = await updateDownloadCount(isDownload);
        if (isDownload) {
            return res.redirect(302, BOOK_PATH);
        }
        return res.status(200).json({ count });
    } catch (error) {
        console.error("Book download counter error:", error);
        if (isDownload) {
            return res.redirect(302, BOOK_PATH);
        }
        return res.status(503).json({ error: "Download count is temporarily unavailable" });
    }
};
