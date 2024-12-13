export default () => ({
  port: parseInt(process.env.PORT),
  database: process.env.DATABASE_URI,
  secret: process.env.SECRET,
  expired: process.env.EXPIRED,
  // client_host: process.env.CLIENT_HOST,
  client_host_local: process.env.CLIENT_HOST_LOCAL,
  cloud_name: process.env.CLOUD_NAME,
  cloud_api_key: process.env.CLOUD_API_KEY,
  cloud_api_secret: process.env.CLOUD_API_SECRET,
  payos_api_key: process.env.PAYOS_API_KEY,
  payos_client_id: process.env.PAYOS_CLIENT_ID,
  payos_checksum_key: process.env.PAYOS_CHECKSUM_KEY,
  redirect_url_success: process.env.REDIRECT_URL_SUCCESS,
  redirect_url_cancel: process.env.REDIRECT_URL_CANCEL,
  mail_from: process.env.MAIL_FROM,
  mail_password: process.env.MAIL_PASSWORD,
});
