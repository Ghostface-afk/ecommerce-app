// utils/hashTable.js
class HashTable {
    constructor(size = 50) {
        this.size = size;
        this.table = new Array(size);
    }

    // Simple hash function
    _hash(key) {
        let hashValue = 0;
        for (let char of key) {
            hashValue += char.charCodeAt(0);
        }
        return hashValue % this.size;
    }

    set(key, value) {
        const index = this._hash(key);
        
        if (!this.table[index]) {
            this.table[index] = [];
        }

        const existing = this.table[index].find(item => item[0] === key);

        if (existing) {
            existing[1] = value;
        } else {
            this.table[index].push([key, value]);
        }
    }

    get(key) {
        const index = this._hash(key);
        const bucket = this.table[index];

        if (!bucket) return undefined;

        const item = bucket.find(item => item[0] === key);
        return item ? item[1] : undefined;
    }

    remove(key) {
        const index = this._hash(key);
        const bucket = this.table[index];

        if (!bucket) return false;

        const itemIndex = bucket.findIndex(item => item[0] === key);
        
        if (itemIndex >= 0) {
            bucket.splice(itemIndex, 1);
            return true;
        }

        return false;
    }
}

module.exports = HashTable;