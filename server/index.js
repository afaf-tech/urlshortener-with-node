const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const yup = require("yup");
const app = express();
const { nanoid } = require("nanoid");
const { default: monk } = require("monk");

require("dotenv").config();

const db = monk(process.env.MONGO_URI);
const urls = db.get("urls");
urls.createIndex({ slug: 1 }, { unique: true });

app.use(helmet());
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.static("./public"));

app.get("/:id", async (req, res) => {
  //  TODO : redirect to url
  const { id: slug } = req.params;
  try {
    const url = await urls.findOne({ slug });
    if (url) {
      res.redirect(url.url);
    }
    res.redirect(`/?error=${slug} not found.`);
  } catch (error) {
    res.redirect(`/?error=Link not found.`);
  }
});

app.post("/url", async (req, res, next) => {
  //  TODO : create a short url
  let { slug, url } = req.body;
  try {
    await schema.validate({
      slug,
      url,
    });
    if (!slug) {
      slug = nanoid(5);
    } else {
      const existing = await urls.findOne({ slug });
      if (existing) {
        throw new Error("Slug in use. 🥮");
      }
    }
    slug = slug.toLocaleLowerCase();
    // const secret = nanoid(10).toLocaleLowerCase();
    const newUrl = {
      url,
      slug,
    };

    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (error) {
    if (error.message.startsWith("E11000")) {
      error.message = "Slug in Use. 🦋";
    }
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
  });
});

app.get("/url/:id", (req, res) => {
  //  TODO : get a short url by id
});

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

const port = process.env.PORT || 1337;
app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
