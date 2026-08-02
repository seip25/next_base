try { require("dotenv").config(); } catch {}
const fs = require("fs");
const path = require("path");

const tasksDir = path.join(__dirname, "tasks");

async function initWorker() {
  const { queue } = await import("../services/queue.js");
  const tasks = {};

  if (fs.existsSync(tasksDir)) {
    const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".js"));
    for (const file of files) {
      const taskName = file.replace(".js", "");
      tasks[taskName] = require(path.join(tasksDir, file));
    }
  }

  const loadedTaskNames = Object.keys(tasks);
  if (loadedTaskNames.length > 0) {
    console.log(`[Worker] Loaded task handlers: ${loadedTaskNames.join(", ")}`);
  } else {
    console.log("[Worker] No task files found in jobs/tasks/ directory.");
  }

  try {
    await queue.createWorker(async (job) => {
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
  } catch (err) {
    console.error("\x1b[31m%s\x1b[0m", err.message || err);
    process.exit(1);
  }
}

initWorker().catch((err) => {
  console.error("\x1b[31m%s\x1b[0m", err.message || err);
  process.exit(1);
});

