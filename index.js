//include express module or package

import express from "express";
import cors from "cors";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

//create instance of express
const app = express();

export const getStreamingCompletion = async ({ userPrompt }) => {
  return openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: userPrompt }],
    stream: true,
  });
};

app.get("/", cors(), async (req, res) => {
  //   const completion = await openai.chat.completions.create({
  //     model: "gpt-3.5-turbo",
  //     messages: [
  //       {
  //         role: "user",
  //         content: `Please tell me the best five places to visit in London`,
  //       },
  //     ],
  //     stream: true,
  //   });

  const data = req.body;
  //   let starttime = Date.now();
  const stream = await getStreamingCompletion({ userPrompt: "London" });
  for await (const part of stream) {
    // here express will stream the response
    console.log(part.choices[0]?.delta.content || "");
    res.write(part.choices[0]?.delta.content || "");
  }
  // here express sends the closing/done/end signal for the stream consumer
  res.end();

  //   for await (const chunk of completion) {
  //     if (chunk?.choices[0]?.delta?.content) {
  //       res.write(chunk?.choices[0]?.delta?.content || "");
  //     }
  //     console.log(chunk.choices[0].delta.content);
  //     // if (chunk.choices[0].finish_reason === "stop") return res.end();

  //     // res.write(chunk.choices[0].delta.content);
  //   }
  //   res.end();
});

app.listen(4000, () => console.log("Listening on port 4000!"));
