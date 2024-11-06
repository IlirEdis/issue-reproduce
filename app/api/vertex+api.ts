import { VertexAI } from "@google-cloud/vertexai";

export async function POST(request: Request) {
  //   alert("PRRR", request);
  const prompt = await request?.json();
  console.log("WWWW", prompt);

  const vertexAI = new VertexAI({
    project: process.env.VERTEX_PROJECT_ID,
    location: "us-central1",
  });

  const generativeModel = vertexAI.getGenerativeModel({
    model: "gemini-1.5-flash-001",
  });

  //   const prompt =
  //     "What's a good name for a flower shop that specializes in selling bouquets of dried flowers?";

  const resp = await generativeModel.generateContent(prompt);
  //   const contentResponse = await resp.response;
  //   console.log("from APIII", JSON.stringify(resp.response));

  return Response.json({ contentResponse: resp.response });
}
