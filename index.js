import express from "express";
import cors from "cors";
import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_KEY}`,
});

const app = express();

export const getStreamingCompletion = async ({ userPrompt }) => {
  return openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: userPrompt }],
    stream: true,
  });
};

app.get("/", cors(), async (req, res) => {
  const data = req.body;
  const stream = await getStreamingCompletion({ userPrompt: "London" });
  for await (const part of stream) {
    res.write(part.choices[0]?.delta.content || "");
  }

  res.end();
});

app.listen(4000, () => console.log("Listening on port 4000!"));
