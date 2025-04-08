import { NowRequest, NowResponse } from "@vercel/node";
import { getArticle } from "../../../util/medium";
import medium from "../../../assets/medium";

export default async (req: NowRequest, res: NowResponse) => {
  const {
    query: { user, index, theme },
    headers,
  } = req;

  if (!user || !index) {
    return res.status(400).json({ error: "Missing 'user' or 'index' query parameter." });
  }

  try {
    const { title, thumbnail, url, date, description } = await getArticle(
      index.toString(),
      user.toString()
    );

    const dest = headers["sec-fetch-dest"] || headers["Sec-Fetch-Dest"];
    const accept = headers["accept"];
    const isImage = dest ? dest === "image" : !/text\/html/.test(accept ?? "");

    if (isImage) {
      res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
      res.setHeader("Content-Type", "image/svg+xml");

      return res.send(
        medium({
          title,
          thumbnail,
          url,
          date,
          description,
          theme,
        })
      );
    }

    res.writeHead(301, { Location: url });
    res.end();
  } catch (error) {
    console.error("Error in getArticle:", error);
    res.status(500).json({ error: "Failed to fetch article data." });
  }
};
