const Queue = require('../utils/queue');

test("enqueue and dequeue work", () => {
    const queue = new Queue();
    queue.enqueue(10);
    queue.enqueue(20);

    expect(queue.dequeue()).toBe(10);
    expect(queue.dequeue()).toBe(20);
});