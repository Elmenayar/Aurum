import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/notify-admin", (req, res) => {
    const { adminEmail, activity } = req.body;
    
    // In a real production app, you would use a service like SendGrid, Resend, or AWS SES
    // For this demonstration, we will log the notification to the server console
    // simulating the "sending" process.
    
    console.log(`[EMAIL NOTIFICATION] To: ${adminEmail}`);
    console.log(`[ACTIVITY SUMMARY]`);
    console.log(`Broker: ${activity.brokerName}`);
    console.log(`Action: ${activity.action}`);
    console.log(`Lead: ${activity.leadName}`);
    console.log(`Details: ${activity.details}`);
    console.log(`-----------------------------------`);

    res.json({ status: "success", message: "Notification logged on server" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
