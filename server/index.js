const express = require("express");

const cors = require("cors"); //cross over regions

const dotenv = require("dotenv"); //.env

const connectDB = require("./utils/db");
 
// 🔹 NEW: imports for summarize endpoint

const multer = require("multer");

const axios = require("axios");

// Import pdf-parse node module for CJS
const pdfParse = require("pdf-parse/node");
 
// Load environment variables

dotenv.config();
 
// Initialize express app

const app = express();
 
// Connect to MongoDB

connectDB();
 
// Middleware

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
 
// Serve static files

app.use("/uploads", express.static("public/uploads"));
 
// 🔹 NEW: multer config (keep uploaded files in memory)

const upload = multer({ storage: multer.memoryStorage() });
 
// Routes

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/courses", require("./routes/courseRoutes"));
 
/**

* 🔹 Summary route using local Ollama (llama3)

* Expects multipart/form-data with:

*  - mode: "text" | "pdf"

*  - text: string (if mode === "text")

*  - file: PDF file (if mode === "pdf")

*/

app.post("/api/summarize", upload.single("file"), async (req, res) => {

  try {

    const mode = req.body.mode; // "text" or "pdf"

    let textToSummarize = "";
 
    if (mode === "text") {

      const inputText = req.body.text || "";

      if (!inputText.trim()) {

        return res.status(400).json({ error: "No text provided" });

      }

      textToSummarize = inputText;

    } else if (mode === "pdf") {

      const file = req.file;
 
      if (!file) {

        console.error("PDF mode but no file received");

        return res.status(400).json({ error: "No PDF file uploaded" });

      }
 
      console.log("Received PDF:", {

        originalname: file.originalname,

        mimetype: file.mimetype,

        size: file.size,

      });
 
      try {

        // Validate pdf parser is loaded
        if (typeof pdfParse !== 'function') {
          console.error('PDF parser is not available or not a function. Type:', typeof pdfParse);
          return res.status(500).json({ 
            error: "PDF parsing library is not properly initialized. Please try again." 
          });
        }

        // Try to extract text from the PDF buffer
        const data = await pdfParse(file.buffer);

        textToSummarize = data.text || "";
 
        if (!textToSummarize.trim()) {

          console.error("No text extracted from PDF");

          return res.status(400).json({

            error:

              "Could not extract any text from the PDF. It might be scanned or image-only.",

          });

        }

      } catch (pdfErr) {

        console.error(

          "Error parsing PDF:",

          pdfErr.message || pdfErr.toString() || pdfErr

        );

        return res.status(500).json({

          error:

            "Error reading the PDF file: " +

            (pdfErr.message || pdfErr.toString() || "Unknown PDF error"),

        });

      }

    } else {

      console.error("Invalid mode:", mode);

      return res.status(400).json({ error: "Invalid mode" });

    }
 
    // Build prompt for Ollama

    const prompt = `

You are a helpful assistant. Summarize the following content clearly and concisely.

Focus on the main ideas and key points.
 
Content:

${textToSummarize}

`;
 
    try {

      // Call Ollama local server (llama3)

      const ollamaResponse = await axios.post(

        "http://localhost:11434/api/generate",

        {

          model: "llama3",

          prompt,

          stream: false,

        },

        { timeout: 300000 } // up to 5 minutes for large PDFs

      );
 
      const summary =

        (ollamaResponse.data && ollamaResponse.data.response) || "";
 
      if (!summary.trim()) {

        console.error("Ollama returned empty summary:", ollamaResponse.data);

        return res

          .status(500)

          .json({ error: "Ollama did not return a summary" });

      }
 
      return res.json({ summary });

    } catch (ollamaErr) {

      console.error(

        "Error calling Ollama:",

        ollamaErr.response?.data || ollamaErr.message || ollamaErr

      );

      return res.status(500).json({

        error:

          "Error calling Ollama. Make sure Ollama is running and the llama3 model is available.",

      });

    }

  } catch (err) {

    console.error("Summarize route error:", err.message || err);

    return res.status(500).json({

      error: "Something went wrong while summarizing with Ollama.",

    });

  }

});
 
// Health check route

app.get("/api/health", (req, res) => {

  res.status(200).json({

    status: "success",

    message: "Server is running",

    timestamp: new Date().toISOString(),

  });

});
 
// Error handling middleware

app.use(require("./middleware/errorHandler"));
 
// 404 handler

app.use((req, res) => {

  res.status(404).json({

    status: "error",

    message: "Route not found",

  });

});
 
// Start server

const PORT = process.env.PORT || 5000; // your server prints 5000

app.listen(PORT, () => {

  console.log(`Server is running on port ${PORT}`);

  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

});
 
module.exports = app;

 