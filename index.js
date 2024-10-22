require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 8000;

// Initialize OpenAI with your API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static HTML/CSS/JS files

// Route for the root URL
app.get("/", (req, res) => {
  res.send("Hello, world! Your server is running.");
});

// Endpoint to handle AI conversation
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // or "gpt-4" if you have access
      messages: [
        {
          role: "system",
          content: `You shorten and summarize articles in websites sent to you.`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      max_tokens: 150, // Set this based on your token limit preferences
    });

    const aiResponse = completion.data.choices[0]?.message?.content || "No response";

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in OpenAI API:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Uncomment and modify if you're adding payments
/*
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

app.post('/register', async (req, res) => {
    const { email, username, password, paymentIntentId } = req.body;

    try {
        // Verify payment status
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment verification failed.' });
        }

        // Continue with registration if payment is successful
        // Save user details to the database
        res.json({ message: 'Registration successful!' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying payment.' });
    }
});
*/