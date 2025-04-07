// import { Injectable } from "@nestjs/common";
// import { AwsConfig } from "../config/aws.config";
// import * as multer from "multer";

// @Injectable()
// export class S3Service {
//     constructor(private readonly awsConfig: AwsConfig) {}

//     async uploadFile(file: Express.Multer.File): Promise<string> {
//         const s3 = this.awsConfig.s3;

//         const params = {
//             Bucket: process.env.AWS_BUCKET_NAME,
//             Key: `uploads/${file.originalname}`,
//             Body: file.buffer,
//             ContentType: file.mimetype,
//         };

//         try {
//             const data = await s3.upload(params).promise();
//             return data.Location;
//         } catch (error) {
//             throw new Error(`Error uploading file: ${error.message}`);
//         }
//     }
// }
