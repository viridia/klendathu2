import * as express from 'express';
import * as fs from 'fs';
import * as multer from 'multer';
import * as passport from 'passport';
import * as r from 'rethinkdb';
import * as sharp from 'sharp';
import { logger } from '../logger';

const ReGrid = require('rethinkdb-regrid');

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

export const bucket = ReGrid({ db: process.env.DB_NAME });

export default function (apiRouter: express.Router, conn: r.Connection): Promise<any> {
  const upload = multer({ dest: 'uploads/' });

  // Upload attachments.
  apiRouter.post('/file',
      passport.authenticate('jwt', { session: false }),
      upload.single('attachment'),
  (req, res) => {
    if (!(req as any).user) {
      logger.error('Unauthorized file upload.');
      res.status(401).send({ err: 'unauthorized' });
      return;
    }
    logger.info('Uploading:', req.file.originalname, req.file.mimetype);

    r.uuid().run(conn).then(id => {
      if (shouldCreateThumbnail(req.file.mimetype)) {
        // Create two images: a full-sized one and a thumbnail.
        const transformer = sharp().resize(70, 70).max().withoutEnlargement();

        // Open a write stream to ReGrid
        const wsThumb = bucket.upload(`${id}-thumb`, {
          metadata: {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            mark: true, // For garbage collection.
          },
        });
        fs.createReadStream(req.file.path).pipe(transformer).pipe(wsThumb);
        wsThumb.on('error', (e: any) => {
          logger.error(e);
          fs.unlink(req.file.path, () => {
            res.status(500).json({ err: 'upload' });
          });
        });
        wsThumb.on('finish', async () => {
          const thumbInfo = await bucket.getFilename(`${id}-thumb`);
          const wsFull = bucket.upload(id, {
            metadata: {
              filename: req.file.originalname,
              thumb: thumbInfo.id,
              contentType: req.file.mimetype,
              mark: true, // For garbage collection.
            },
          });
          fs.createReadStream(req.file.path).pipe(wsFull);
          wsFull.on('error', (e: any) => {
            logger.error(e);
            fs.unlink(req.file.path, () => {
              res.status(500).json({ err: 'upload' });
            });
          });
          wsFull.on('finish', async () => {
            const fileInfo = await bucket.getFilename(id);
            // Delete the temp file.
            fs.unlink(req.file.path, () => {
              res.json({
                name: req.file.originalname,
                id: fileInfo.id,
                url: `/api/file/${fileInfo.id}/${req.file.originalname}`,
                thumb: `/api/file/${thumbInfo.id}/${req.file.originalname}`,
              });
            });
          });
        });
      } else {
        // For non-image attachments.
        const ws = bucket.upload(id, {
          metadata: {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            mark: true, // For garbage collection.
          },
        });
        fs.createReadStream(req.file.path).pipe(ws);
        ws.on('error', (e: any) => {
          logger.error(e);
          fs.unlink(req.file.path, () => {
            res.status(500).json({ err: 'upload' });
          });
        });
        ws.on('finish', async () => {
          // Delete the temp file.
          const fileInfo = await bucket.getFilename(`${id}`);
          fs.unlink(req.file.path, () => {
            res.json({
              name: req.file.originalname,
              id: fileInfo.id,
              url: `/api/file/${fileInfo.id}/${req.file.originalname}`,
            });
          });
        });
      }
    });
  });

  apiRouter.get('/file/:id/:name', async (req, res) => {
    const record = await bucket.getMetadata(req.params.id);
    const rs = bucket.downloadId(req.params.id);
    res.set('Content-Type', record.metadata.contentType);
    rs.pipe(res);
  });

  return bucket.initBucket();
}
