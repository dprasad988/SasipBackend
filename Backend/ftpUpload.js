import { Client } from 'ssh2';
import dotenv from 'dotenv';

dotenv.config();

export async function uploadFileToSFTP(fileBuffer, remoteFileName) {
  const conn = new Client();
  const sftpConfig = {
    host: process.env.FTP_HOST,
    port: process.env.FTP_PORT,
    username: process.env.FTP_USERNAME,
    password: process.env.FTP_PASSWORD,
  };

  return new Promise((resolve, reject) => {
    conn.on('ready', () => {
      console.log('Client :: ready');
      conn.sftp((err, sftp) => {
        if (err) {
          console.error('SFTP error:', err);
          reject(err);
          return;
        }

        // Update the remote path to the correct directory
        const remoteFilePath = `/home/u543552070/domains/orangered-quail-934133.hostingersite.com/public_html/NewSasip Resources/Images/${remoteFileName}`;
        console.log('Uploading file to', remoteFilePath);

        // Create a write stream for the remote file
        const writeStream = sftp.createWriteStream(remoteFilePath);

        writeStream.on('close', () => {
          console.log(`File uploaded successfully: ${remoteFilePath}`);
          const uploadedFileUrl = `https://orangered-quail-934133.hostingersite.com/NewSasip%20Resources/Images/${remoteFileName}`;
          resolve(uploadedFileUrl);
        });

        writeStream.on('error', (writeErr) => {
          console.error('Upload error:', writeErr);
          reject(writeErr);
        });

        // End the write stream with the fileBuffer
        writeStream.end(fileBuffer);
      });
    }).connect(sftpConfig);

    conn.on('error', (err) => {
      console.error('SFTP connection error:', err);
      reject(err);
    });

    conn.on('end', () => {
      console.log('SFTP connection ended');
    });
  });
}
