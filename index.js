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

app.post("/", cors(), async (req, res) => {
  const place = req.body.place;
  console.log(place);
  const stream = await getStreamingCompletion({
    prompt: `Please tell me the best five places to visit in ${place}`,
  });
  for await (const part of stream) {
    console.log(part.choices[0]?.delta.content || "");
    res.write(part.choices[0]?.delta.content || "");
  }
  res.end();
});

app.listen(4000, () => console.log("Listening on port 4000!"));
