const orderQueue = require('../utils/orderQueue');

setInterval(() => {
    if (!orderQueue.isEmpty()) {
        const order = orderQueue.dequeue();
        
        console.log("Processing order:", order.id);

        // Simulate background processing
        // e.g. update status → notify customer
    }
}, 5000); // every 5 seconds
