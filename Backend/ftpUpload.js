import { Client as SSHClient } from 'ssh2';
import Client from 'ssh2-sftp-client';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid'; // Import the UUID library

dotenv.config();

// Function to upload a file to SFTP with a random filename
export async function uploadFileToSFTP(fileBuffer, providedFileName = null) {
  const conn = new SSHClient();
  const sftpConfig = {
    host: process.env.FTP_HOST,
    port: process.env.FTP_PORT,
    username: process.env.FTP_USERNAME,
    password: process.env.FTP_PASSWORD,
  };

  // Generate a random filename if one is not provided
  const randomFileName = providedFileName ? providedFileName : `${uuidv4()}-${Date.now()}`;

  return new Promise((resolve, reject) => {
    conn.on('ready', () => {
      console.log('Client :: ready');
      conn.sftp((err, sftp) => {
        if (err) {
          console.error('SFTP error:', err);
          reject(err);
          return;
        }

        // Update the remote path to the correct directory with the random filename
        const remoteFilePath = `/home/u543552070/domains/orangered-quail-934133.hostingersite.com/public_html/NewSasip Resources/Images/${randomFileName}`;
        console.log('Uploading file to', remoteFilePath);

        // Create a write stream for the remote file
        const writeStream = sftp.createWriteStream(remoteFilePath);

        writeStream.on('close', () => {
          console.log(`File uploaded successfully: ${remoteFilePath}`);
          const uploadedFileUrl = `https://orangered-quail-934133.hostingersite.com/NewSasip%20Resources/Images/${randomFileName}`;
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

// Function to delete a file from SFTP
export const deleteFileFromSFTP = async (fileUrl) => {
  const sftp = new Client();
  const sftpConfig = {
    host: process.env.FTP_HOST,
    port: process.env.FTP_PORT,
    username: process.env.FTP_USERNAME,
    password: process.env.FTP_PASSWORD,
  };

  // Construct the full remote file path
  const remoteFileName = fileUrl.split('/').pop();
  const remoteFilePath = `/home/u543552070/domains/orangered-quail-934133.hostingersite.com/public_html/NewSasip Resources/Images/${remoteFileName}`;

  try {
    await sftp.connect(sftpConfig);
    console.log(`Attempting to delete file from path: ${remoteFilePath}`);
    await sftp.delete(remoteFilePath);
    console.log(`File deleted successfully: ${remoteFilePath}`);
  } catch (err) {
    console.error(`Failed to delete file from SFTP: ${err.message}`);
    throw new Error(`Failed to delete file from SFTP: ${err.message}`);
  } finally {
    await sftp.end();
  }
};
