import { Request, Response, NextFunction } from 'express'
import { images } from '../utils/storagePath'
import { cloudinary } from '../config/uploadConfig'


export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: 'No file provided for upload' })
  }

  try {
    cloudinary.uploader.upload_stream(
      { folder: images },
      (error, result) => {
        if (error) {
          return res
            .status(500)
            .json({ message: 'Upload to Cloudinary failed', error })
        }
        if (!result) {
          return res.status(500).json({ message: 'Upload result is undefined' })
        }
        return res.status(200).json({ imageUrl: result.url })
      }
    ).end(req.file.buffer)
  } catch (error) {
    next(error)
  }
} 