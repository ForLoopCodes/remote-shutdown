const path = require("path");
const Service = require("node-windows").Service;

const svc = new Service({
  name: "RemoteShutdownService",
  description:
    "Remote Shutdown service - listens for shutdown requests via HTTP",
  script: path.join(__dirname, "dist", "server.js"),
  nodeOptions: [],
  workingDirectory: __dirname,
});

svc.on("install", () => {
  console.log("Service installed successfully!");
  console.log("Starting service...");
  svc.start();
});

svc.on("alreadyinstalled", () => {
  console.log("Service is already installed.");
});

svc.on("start", () => {
  console.log("Service started successfully!");
  console.log("");
  console.log(
    "The service will now run in the background and start automatically on boot."
  );
  console.log("You can manage it via Services (services.msc) or use:");
  console.log("  sc stop RemoteShutdownService");
  console.log("  sc start RemoteShutdownService");
});

svc.on("error", (err) => {
  console.error("Error:", err);
});

console.log("Installing Remote Shutdown Service...");
console.log("This requires Administrator privileges.");
console.log("");
svc.install();
