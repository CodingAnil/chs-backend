const { chatModel } = require("../configs/openAi");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { symptomPrompt } = require("../utils/symptomPrompt");
const { sendResponse } = require("../utils");

const generateSymptomSummary = async (req, res) => {
  try {
    const { symptoms, age, height, weight } = req.body;
    console.log("Received data:", req.body);

    if (!symptoms || !age || !height || !weight) {
      return res.status(400).json({
        message: "All fields (symptoms, age, height, weight) are required.",
      });
    }

    const formattedPrompt = await symptomPrompt.format({
      symptoms,
      age,
      height,
      weight,
    });

    const outputParser = new StringOutputParser();
    const llmChain = symptomPrompt.pipe(chatModel).pipe(outputParser);

    let summary = "";

    for await (const chunk of await llmChain.stream({
      symptoms,
      age,
      height,
      weight,
    })) {
      summary += chunk;
      global.io.emit("summary", { summary });

      res.write(chunk);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    console.log("Generated summary:", summary);

    res.end();
  } catch (error) {
    console.error("Error in generateSymptomSummary:", error);
    if (!res.headersSent) {
      return sendResponse(
        res,
        500,
        "An error occurred while generating the symptom report."
      );
    }
  }
};

const analyzePatientReport = async (req, res) => {
  try {
    const { patientReport, reportId } = req.body;
    console.log("Received Patient Report:", patientReport);

    if (!patientReport) {
      return res.status(400).json({ message: "Patient report is required." });
    }

    // Prepare AI model input
    const formattedPrompt = [
      {
        role: "system",
        content:
          "You are a medical expert providing treatment recommendations based on patient reports.",
      },
      {
        role: "user",
        content: `Analyze the following patient report and provide the best treatment plan, including medication recommendations:\n\n${patientReport}`,
      },
    ];

    const outputParser = new StringOutputParser();

    // Await AI model response
    const aiResponse = await chatModel.invoke(formattedPrompt);

    // Extract treatment plan from AI response
    const treatmentPlan = await outputParser.parse(aiResponse.content); // Ensure parsing of content

    console.log("Generated Treatment Plan:", treatmentPlan);

    // Emit real-time update via WebSockets
    // global.io.emit("treatment", { treatmentPlan });

    // Send response to client
    return sendResponse(
      res,
      200,
      "analyzePatientReport fetched successfully.",
      { reportId, treatmentPlan }
    );
    // res.status(200).json({ reportId, treatmentPlan });
  } catch (error) {
    console.error("Error in analyzePatientReport:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({
          message: "An error occurred while analyzing the patient report.",
        });
    }
  }
};

module.exports = { generateSymptomSummary, analyzePatientReport };
