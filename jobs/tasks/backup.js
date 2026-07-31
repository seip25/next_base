const { spawnSync } = require("child_process");
const path = require("path");

function runCommand(command) {
  const result = spawnSync(command, [], {
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command}`);
  }
}

module.exports = async function (data) {
  const dbUser = process.env.DB_USER || "next_base";
  const dbPass = process.env.DB_PASSWORD || "next_base";
  const dbName = process.env.DB_NAME || "next_base";
  const date = new Date().toISOString().replace(/[:.]/g, "-");

  const backupsDir = path.join(process.cwd(), "backups");
  runCommand(`mkdir -p ${backupsDir}`);

  const file = path.join(backupsDir, `backup-${date}.sql`);

  console.log(`[backup] Starting database backup to ${file}...`);
  const isDocker = process.env.PM2_HOME !== undefined;

  if (!isDocker) {
    runCommand(
      `docker compose exec -T mysql mysqldump -u"${dbUser}" -p"${dbPass}" "${dbName}" > ${file}`,
    );
  } else {
    runCommand(
      `mysqldump -h mysql -u"${dbUser}" -p"${dbPass}" "${dbName}" > ${file}`,
    );
  }

  console.log(`[backup] Backup completed successfully.`);
  return { file };
};
