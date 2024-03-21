import * as dotenv from 'dotenv' 
dotenv.config() 
export default {
    port: process.env.PORT || 3000,
    cloudName: process.env.CLOUD_NAME,
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
}
