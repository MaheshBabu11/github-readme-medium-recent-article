import axios from "axios";
import moment from "moment";
const { parse } = require("rss-to-json");

export const getArticle = async (index, username) => {
  try {
    const rssUrl = `https://medium.com/feed/${username}`;
    const response = await axios.get(rssUrl);
    const rssContent = response.data;

    if (!rssContent) {
      throw new Error("Failed to fetch RSS content");
    }

    const rssJson = await parse(response.data);
    if (!rssJson || !rssJson.items) {
      throw new Error("Failed to parse RSS content");
    }

    const items = rssJson.items;
    let fixItem: any[] = [];

    items.forEach((element) => {
      const { description } = element;
      const regexPattern = /<img[^>]+src="(.*?)"/;
      const match = description.match(regexPattern);
      const imgSrc = match ? match[1] : "";

      if (imgSrc.includes("cdn")) {
        element.thumbnail = imgSrc;
        fixItem.push(element);
      }
    });

    if (fixItem.length === 0) {
      throw new Error("No articles found with the specified criteria");
    }

    const {
      title,
      pubDate,
      link: url,
      thumbnail,
      description,
    } = fixItem[index || 0];

    let convertedThumbnail = "";
    if (thumbnail) {
      const { data: thumbnailRaw } = await axios.get(thumbnail, {
        responseType: "arraybuffer",
      });

      const base64Img = Buffer.from(thumbnailRaw).toString("base64");
      const imgTypeArr = thumbnail.split(".");
      const imgType = imgTypeArr[imgTypeArr.length - 1];
      convertedThumbnail = `data:image/${imgType};base64,${base64Img}`;
    }

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
    console.error("Error occurred:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }
    throw error;
  }
};
