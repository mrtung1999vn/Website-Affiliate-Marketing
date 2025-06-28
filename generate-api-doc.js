const app = require('./server');
const fs = require('fs');

function getRoutes(stack, prefix = '') {
  let routes = [];
  stack.forEach(layer => {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
      routes.push({
        method: methods.join(', '),
        path: (prefix + layer.route.path).replace(/\/\//g, '/')
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      // Lấy prefix từ layer.regexp nếu có
      let match = layer.regexp && layer.regexp.source.match(/\\\/([a-zA-Z0-9_-]+)\\\//);
      let newPrefix = prefix;
      if (match && match[1]) {
        newPrefix += '/' + match[1];
      }
      routes = routes.concat(getRoutes(layer.handle.stack, newPrefix));
    }
  });
  return routes;
}

const routes = getRoutes(app._router.stack);

// Thêm trường mô tả mẫu cho từng API (có thể sửa thủ công sau)
const routesWithDesc = routes.map(route => ({
  ...route,
  desc: 'Mô tả API ở đây',
  curl: `curl -X ${route.method} http://localhost:3000${route.path}`,
  params: [],
  headers: [],
  body: null,
  token: false,
  exampleRequest: `${route.method} ${route.path}`,
  exampleResponse: ''
}));

fs.writeFileSync('api-docs.json', JSON.stringify(routesWithDesc, null, 2));
console.log('Đã xuất danh sách API ra api-docs.json');