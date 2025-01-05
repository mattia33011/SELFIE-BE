import multerS3 from "multer-s3";
import multer, { Multer, StorageEngine } from "multer";
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Request } from "express";
import userRepository from "../repositories/userRepository";
import { DBUser } from "../types/user";
import path from "path";

class FileManager {
  private readonly s3: S3Client;
  private readonly storage: StorageEngine;
  readonly uploadMiddleware: Multer;

  constructor() {
    if (!process.env.MINIO_URL) throw new Error("MINIO_URL is not defined");

    if (!process.env.MINIO_ACCESS_KEY)
      throw new Error("MINIO_ACCESS_KEY is not defined");
    if (!process.env.MINIO_SECRET_KEY)
      throw new Error("MINIO_SECRET_KEY is not defined");

    this.s3 = new S3Client({
      endpoint: process.env.MINIO_URL, // MinIO_URL
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY, // Access key di MinIO
        secretAccessKey: process.env.MINIO_SECRET_KEY, // Secret key di MinIO
      },
      region: "ita", // Regione (puoi usare qualsiasi valore)
      forcePathStyle: true, // Impostato su true per supportare MinIO
    });

    this.storage = multerS3({
      s3: this.s3,
      bucket: "selfie",
      acl: "public-read",
      key: async (req, file, cb) => {
        const user = (await userRepository.read(
          (req as Request).params.userid,
          false,
          true
        )) as DBUser;
        if (user.imagePath) {
          this.deleteFile(user.imagePath)
        }
        const fileName = `profile-pictures/${user._id.toHexString()}${path.extname(
          file.originalname
        )}`;
        await userRepository.putProfilePicture(user.email, fileName);
        cb(null, fileName);
      },
    });

    this.uploadMiddleware = multer({ storage: this.storage });
    this.createBucket("selfie");
  }
  private async createBucket(bucketName: string) {
    try {
      const command = new CreateBucketCommand({
        Bucket: bucketName,
      });
      await this.s3.send(command);
    } catch (err: any) {
      if (err.name !== "BucketAlreadyOwnedByYou") {
        throw new Error("MinIO Cannot create the bucket 'selfie'");
      }
    }
  }


  async deleteFile(imgUrl: string){
    // if user has already an image
    try {
      const command = new DeleteObjectCommand({
        Bucket: "selfie",
        Key: imgUrl,
      });
      await this.s3.send(command);
      return true
    }
     catch (e: any) {
      return false
     }
  }

  async getFile(fileName: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: "selfie", //
        Key: fileName,
      });
      return await this.s3.send(command);
    } catch (e: any) {
      return undefined;
    }
  }
}

const fileManager = new FileManager();

export default fileManager;
