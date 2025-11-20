const HashTable = require('../utils/hashTable');

test("set and get work", () => {
    const table = new HashTable();
    table.set("apple", 100);

    expect(table.get("apple")).toBe(100);
});
