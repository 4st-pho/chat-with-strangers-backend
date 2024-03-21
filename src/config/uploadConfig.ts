import { v2 as cloudinary } from 'cloudinary' 
import config from './config'
import multer from 'multer' 

const storage = multer.memoryStorage() 
const upload = multer({ storage: storage }) 

cloudinary.config({
  cloud_name: config.cloudName,
  api_key: config.apiKey,
  api_secret: config.apiSecret,
}) 

export { upload, cloudinary} 