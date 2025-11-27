const path = require("path");
const Service = require("node-windows").Service;

const svc = new Service({
  name: "RemoteShutdownService",
  script: path.join(__dirname, "dist", "server.js"),
});

svc.on("uninstall", () => {
  console.log("Service uninstalled successfully!");
});

svc.on("stop", () => {
  console.log("Service stopped.");
});

console.log("Uninstalling Remote Shutdown Service...");
console.log("This requires Administrator privileges.");
console.log("");
svc.uninstall();
