require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { queue } = require("../services/queue.js");

const tasksDir = path.join(__dirname, "tasks");

async function initWorker() {
  const tasks = {};

  if (fs.existsSync(tasksDir)) {
    const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".js"));
    for (const file of files) {
      const taskName = file.replace(".js", "");
      tasks[taskName] = require(path.join(tasksDir, file));
    }
  }

  queue.createWorker(async (job) => {
    console.log(`[Worker] Processing job: ${job.name}`);
    if (tasks[job.name]) {
      try {
        const result = await tasks[job.name](job.data);
        console.log(`[Worker] Job ${job.name} completed.`);
        return result;
      } catch (err) {
        console.error(`[Worker] Job ${job.name} failed:`, err);
        throw err;
      }
    } else {
      console.warn(`[Worker] No handler found for job: ${job.name}`);
    }
  });

  console.log("[Worker] Started and listening for jobs...");
}

initWorker().catch(console.error);
