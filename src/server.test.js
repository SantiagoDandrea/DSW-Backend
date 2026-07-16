const test = require("node:test");
const assert = require("node:assert/strict");

const { createServer } = require("./server");

test("GET /api/health devuelve estado OK", async () => {
  const server = createServer();

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { service: "DSW-Backend", status: "ok" });

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});
