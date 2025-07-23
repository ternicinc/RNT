const path = require("path");
const fs = require("fs");

// Custom Imports
const IpManager = require("./modules/ip_manager")

const manager = new IpManager();

function main() {
    try {
        console.log('Hello, World.');
    }
    catch {
        error("ERROR")
    }
}

main();