const logger = require('../common/logger');
const multer = require('multer');
const mongo = require('mongodb');
const sharp = require('sharp');
const fs = require('fs');
// const Grid = require('gridfs-stream');

const { ObjectId } = mongo;
const upload = multer({ dest: 'uploads/' });

function shouldCreateThumbnail(type: string) {
  switch (type) {
    case 'image/png':
    case 'image/gif':
    case 'image/jpeg':
      return true;
    default:
      return false;
  }
}

// module.exports = function (app, apiRouter) {
//   const gfs = Grid(app.db, mongo); // eslint-disable-line
//
//   // Upload attachments.
//   apiRouter.post('/file', upload.single('attachment'), (req, res) => {
//     if (!req.user) {
//       logger.error('Unauthorized file upload.');
//       res.status(401).send({ err: 'unauthorized' });
//       return;
//     }
//
//     // logger.info('post/file', req.file);
//     if (shouldCreateThumbnail(req.file.mimetype)) {
//       // Create two images: a full-sized one and a thumbnail.
//       const transformer = sharp().resize(70).max();
//       const wsThumb = gfs.createWriteStream({
//         filename: req.file.originalname,
//         mode: 'w',
//         content_type: req.file.mimetype,
//         metadata: {
//           mark: true, // For garbage collection.
//         },
//       });
//       fs.createReadStream(req.file.path).pipe(transformer).pipe(wsThumb);
//       wsThumb.on('close', () => {
//         const wsFull = gfs.createWriteStream({
//           filename: req.file.originalname,
//           mode: 'w',
//           content_type: req.file.mimetype,
//           metadata: {
//             mark: true, // For garbage collection.
//             thumb: wsThumb.id,
//           },
//         });
//         fs.createReadStream(req.file.path).pipe(wsFull);
//         wsFull.on('close', () => {
//           // Delete the temp file.
//           fs.unlink(req.file.path, () => {
//             res.json({
//               name: wsFull.name,
//               id: wsFull.id,
//               url: `/api/file/${wsFull.id}/${wsFull.name}`,
//               thumb: `/api/file/${wsThumb.id}/${wsFull.name}`,
//             });
//           });
//         });
//       });
//     } else {
//       // For non-image attachments.
//       const ws = gfs.createWriteStream({
//         filename: req.file.originalname,
//         mode: 'w',
//         content_type: req.file.mimetype,
//         metadata: {
//           mark: true, // For garbage collection.
//         },
//       });
//       fs.createReadStream(req.file.path).pipe(ws);
//       ws.on('close', () => {
//         // Delete the temp file.
//         fs.unlink(req.file.path, () => {
//           res.json({
//             name: ws.name,
//             id: ws.id,
//             url: `/api/file/${ws.id}/${ws.name}`,
//           });
//         });
//       });
//     }
//   });
//
//   apiRouter.get('/file/:id/:name', (req, res) => {
//     const rs = gfs.createReadStream({
//       _id: new ObjectId(req.params.id),
//     });
//     res.set('Content-Type', rs.content_type);
//     rs.pipe(res);
//   });
// };
