const fs = require('fs');
const path = require('path');
const ip = require('ip'); 

class IpManager {
    constructor(storageFile = 'ip_data.json') {
        this.storagePath = path.resolve(storageFile);
        this.pools = this._loadData();
    }

    _loadData() {
        if (fs.existsSync(this.storagePath)) {
            return JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
        }
        return [];
    }

    _saveData() {
        fs.writeFileSync(this.storagePath, JSON.stringify(this.pools, null, 2));
    }

    createPool(name, subnet) {
        if (this.pools.find(p => p.name === name)) {
            throw new Error(`Pool with name '${name}' already exists`);
        }
        const range = ip.cidrSubnet(subnet);
        if (!range) throw new Error('Invalid CIDR subnet');

        const available = [];
        let current = ip.toLong(range.firstAddress);
        const end = ip.toLong(range.lastAddress);

        while (current <= end) {
            const currentIp = ip.fromLong(current);
            if (currentIp !== range.networkAddress && currentIp !== range.broadcastAddress) {
                available.push(currentIp);
            }
            current++;
        }

        const pool = {
            name,
            subnet,
            available,
            allocated: []
        };

        this.pools.push(pool);
        this._saveData();
        return pool;
    }

    allocateIp(poolName) {
        const pool = this.pools.find(p => p.name === poolName);
        if (!pool) throw new Error('Pool not found');
        if (pool.available.length === 0) throw new Error('No IPs available');

        const allocatedIp = pool.available.shift();
        pool.allocated.push(allocatedIp);
        this._saveData();
        return allocatedIp;
    }

    releaseIp(poolName, ipAddress) {
        const pool = this.pools.find(p => p.name === poolName);
        if (!pool) throw new Error('Pool not found');

        const index = pool.allocated.indexOf(ipAddress);
        if (index === -1) throw new Error('IP not allocated');

        pool.allocated.splice(index, 1);
        pool.available.push(ipAddress);
        this._saveData();
    }

    listPools() {
        return this.pools.map(p => ({ name: p.name, subnet: p.subnet, available: p.available.length, allocated: p.allocated.length }));
    }

    listAllocated(poolName) {
        const pool = this.pools.find(p => p.name === poolName);
        return pool ? pool.allocated : [];
    }
}

module.exports = IpManager;