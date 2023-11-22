import express from "express";
import cors from "cors";
import "dotenv/config";
import OpenAI from "openai";
import bodyParser from "body-parser";

const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_KEY}`,
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

export const getStreamingCompletion = async ({ prompt }) => {
  return openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });
};

export const getOpenAiCompletion = async ({ prompt }) => {
  return openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });
};

app.use(cors());

// This will stream the summary of the places to the react component
app.post("/placeSummary", async (req, res) => {
  const place = req.body.place;

  const stream = await getStreamingCompletion({
    prompt: `Please give me a 5 line summary of how good ${place} is to visit `,
  });
  for await (const part of stream) {
    if (part.choices[0]?.delta.content)
      res.write(part.choices[0]?.delta.content || "");
  }
  res.end();
});

// This initial list of places will be used to the react component and also go to the lambda function which will get an image from the google places api
app.post("/topFivePlaces", async (req, res) => {
  const place = req.body.place;
  const response = await getOpenAiCompletion({
    prompt: `Please give me the top five places to visit in ${place} with no summary or numbers or special characters and the places separated by a comma`,
  });
  const topFivePlaces = response.choices[0].message.content.split(",");
  res.json(topFivePlaces || []);
});

// This will send the summary of the place to the react component
app.post("/recommendedPlaceDescription", async (req, res) => {
  const place = req.body.place;
  const response = await getOpenAiCompletion({
    prompt: `Please give me a five line summary of why ${place} is good to visit`,
  });

  res.json(response.choices[0].message.content || "");
});

app.listen(4000, () => console.log("Listening on port 4000!"));
