import jsonServer from "json-server";
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Sử dụng middlewares mặc định (logging, cors, etc.)
server.use(middlewares);

// Parse request body thành JSON
server.use(jsonServer.bodyParser);

// Middleware tùy chỉnh trước khi lưu: ép kiểu `id` là number
server.use((req, res, next) => {
  if (req.method === "POST" && !req.body.id) {
    const todos = router.db.get("todos").value();
    const maxId = todos.reduce((max, item) => {
      const id = parseInt(item.id);
      return isNaN(id) ? max : Math.max(max, id);
    }, 0);
    req.body.id = maxId + 1;
  }
  next();
});

// Khởi động server
server.use(router);
server.listen(3000, () => {
  console.log("✅ JSON Server is running at http://localhost:3000");
});
