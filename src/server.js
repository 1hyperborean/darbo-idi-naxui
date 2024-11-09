const http = require('http');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const serveStatic = (req, res) => {
	const filePath = path.join(__dirname, 'public', req.url);
	fs.readFile(filePath, (err, fileContent) => {
		if (err) {
			res.writeHead(404);
			res.end('Not Found');
		} else {
			const ext = path.extname(filePath);
			const mimeTypes = {
				'.css': 'text/css',
				'.js': 'application/javascript',
				'.html': 'text/html',
			};
			res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
			res.end(fileContent);
		}
	});
};

const renderPage = (res, fileName, data = {}) => {
	const filePath = path.join(__dirname, 'views', `${fileName}.ejs`);
	ejs.renderFile(filePath, data, (err, renderedContent) => {
		if (err) {
			res.writeHead(500, { 'Content-Type': 'text/html' });
			res.end('<h1>500 Server Error</h1>');
			console.error(err);
			return;
		}
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(renderedContent);
	});
};

const server = http.createServer((req, res) => {
	if (req.url === '/') {
		renderPage(res, 'login');
	} else if (req.url.startsWith('/catalogue')) {
		const query = new URL(req.url, `http://${req.headers.host}`).searchParams;
		const username = query.get('username') || 'Guest';
		renderPage(res, 'catalogue', {
			username,
			catalogueItems: ['ITEM 1', 'ITEM 2', 'ITEM 3'],
		});
	} else if (req.url.startsWith('/details')) {
		const query = new URL(req.url, `http://${req.headers.host}`).searchParams;
		const item = query.get('item');
		renderPage(res, 'details', { item });
	} else if (req.url.startsWith('/css/') || req.url.startsWith('/js/')) {
		serveStatic(req, res);
	} else {
		res.writeHead(404, { 'Content-Type': 'text/html' });
		res.end('<h1>404 Not Found</h1>');
	}
});

server.listen(3000, () => {
	console.log('Server running at http://localhost:3000');
});
