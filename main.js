const path = require("path");
const fs = require("fs");
const IpManager = require("./modules/ip_manager")

const manager = new IpManager();

function main() {

    try {
    console.log('Creating Pool...');
    manager.createPool('pool1', '192.168.10.0/24');

    console.log('Allocating IP:', manager.allocateIp('pool1'));
    console.log('Allocating IP:', manager.allocateIp('pool1'));

    console.log('Current Pools:', manager.listPools());
    console.log('Allocated:', manager.listAllocated('pool1'));

    manager.releaseIp('pool1', '192.168.10.2');
    console.log('After Release:', manager.listAllocated('pool1'));

    }
    catch {
        //TODO: Add proper error logging.
        console.log("ERROR")
    }
}

main();