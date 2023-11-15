import amqp from "amqplib";
const logger = require("./log/index");
const queue = "blog-post";

const producer = async (msg) => {
  let connection;
  try {
    connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
    logger.log("debug", `Sent message to comsumer ${msg}`);
    await channel.close();
  } catch (err) {
    console.warn(err);
  } finally {
    if (connection) await connection.close();
  }
};
export default producer;
