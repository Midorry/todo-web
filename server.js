import jsonServer from "json-server";
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Sử dụng middlewares mặc định (logging, cors, etc.)
server.use(middlewares);

// Parse request body thành JSON
server.use(jsonServer.bodyParser);

// Middleware tự động tăng ID cho các bảng như 'todos', 'users', ...
server.use((req, res, next) => {
  if (req.method === "POST" && !req.body.id) {
    const collectionName = req.path.replace(/^\/+|\/+$/g, ""); // loại bỏ dấu /
    try {
      const collection = router.db.get(collectionName).value();
      const maxId = collection.reduce((max, item) => {
        const id = parseInt(item.id);
        return isNaN(id) ? max : Math.max(max, id);
      }, 0);
      req.body.id = maxId + 1;
    } catch (e) {
      console.warn(`⚠️ Không thể tự tăng ID cho "${collectionName}"`);
    }
  }
  next();
});

// Khởi động server
server.use(router);
server.listen(3000, () => {
  console.log("✅ JSON Server is running at http://localhost:3000");
});
