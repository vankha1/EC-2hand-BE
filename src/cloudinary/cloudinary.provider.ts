import { v2 as cloudinary } from 'cloudinary';
import { envConfig } from 'src/config';

export const CloudinaryProvider = {
  provide: 'Cloudinary',
  useFactory: (): any => {
    const config = envConfig();

    return cloudinary.config({
      cloud_name: config.cloud_name,
      api_key: config.cloud_api_key,
      api_secret: config.cloud_api_secret,
    });
  },
};
