import axios from "axios";
import moment from "moment";
import { feedToJSON } from "./feedtojson";
import { JSDOM } from "jsdom";
import { getRandomUserAgent } from "./useragent";

export const getArticle = async (index: string, username: string) => {
  try {
    const rssUrl = `https://medium.com/feed/${username}`;
    const res = await feedToJSON(rssUrl);

    if (!res?.items || res.items.length === 0) {
      throw new Error("No articles found in the RSS feed.");
    }

    const fixItem: any[] = [];
    res.items.forEach((element) => {
      const thumbnail = extractFirstImageFromHTML(element.content);
      if (thumbnail) {
        element.thumbnail = thumbnail;
        fixItem.push(element);
      }
    });

    if (fixItem.length === 0) {
      throw new Error("No articles with valid thumbnails found.");
    }

    const {
      title,
      published: pubDate,
      link: url,
      thumbnail,
      content: description,
    } = fixItem[parseInt(index, 10) || 0];

    if (!title || !url || !thumbnail) {
      throw new Error("Invalid article data.");
    }

    const responseThumbnail = await axios(thumbnail.src, {
      responseType: "arraybuffer",
      headers:{
        "User-Agent": getRandomUserAgent(),
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        "Referer": "https://medium.com/",
      }
    });
    const base64Img = Buffer.from(responseThumbnail.data, "binary").toString(
      "base64"
    );

    const imgTypeArr = thumbnail.src.split(".");
    const imgType = imgTypeArr[imgTypeArr.length - 1];

    const convertedThumbnail = `data:image/${imgType};base64,${base64Img}`;
    return {
      title: title.length > 80 ? title.substring(0, 80) + " ..." : title,
      thumbnail: convertedThumbnail,
      url,
      date: moment(pubDate).format("DD MMM YYYY, HH:mm"),
      description:
        description
          .replace(/<h3>.*<\/h3>|<figcaption>.*<\/figcaption>|<[^>]*>/gm, "")
          .substring(0, 60) + "...",
    };
  } catch (error) {
    console.error("Error in getArticle:", error);
    throw new Error("Failed to fetch article data.");
  }
};

// Define a type for the image data
type ImageData = {
  src: string;
  alt: string;
  caption?: string;
};

function extractFirstImageFromHTML(html: string): ImageData | null {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Select the first figure that contains an image
  const figure = document.querySelector("figure img");
  if (figure) {
    const img = figure as HTMLImageElement; // Ensure it's treated as an image element
    // const figcaption = figure.parentElement ? figure.parentElement.querySelector('figcaption') : null;
    return {
      src: img.src,
      alt: img.alt || "", // Use an empty string if alt is not present
    };
  }

  return null; // Return null if no images are found
}
