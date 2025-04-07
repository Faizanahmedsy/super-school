import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createOBSClient } from "../config/obs.config";
import * as crypto from "crypto";
import { Stream } from "stream";
@Injectable()
export class OBSFileService {
    private obsClient: any;
    private bucketName: string;

    constructor(private readonly configService: ConfigService) {
        this.obsClient = createOBSClient(configService);
        this.bucketName = this.configService.get<string>("HUAWEI_CLOUD_BUCKET_NAME");

        console.log("🚀 ~ file: aws.module.ts:14 ~ OBSFileService ~ constructor ~ bucketName:", this.bucketName);

        this.obsClient.initLog({
            file_full_path: "./logs/OBS-SDK.log", //Set the path to the log file.
            max_log_size: 20480, //Set the size of the log file, in bytes.
            backups: 10, //Set the maximum number of log files that can be stored.
            level: "warn", //Set the log level.
            log_to_console: true, //Set whether to print the log to console.
        });
    }

    /*
     *   Check directory exist or not in OBS
     */
    async ensureDirectoryExists(directoryPath: string) {
        try {
            const response = await new Promise((resolve, reject) => {
                this.obsClient.getObjectMetadata(
                    {
                        Bucket: this.bucketName,
                        Key: directoryPath,
                    },
                    (err, result) => {
                        if (err && err.statusCode === 404) {
                            resolve(null); // Directory does not exist
                        } else if (err) {
                            reject(err);
                        } else {
                            resolve(result); // Directory exists
                        }
                    }
                );
            });

            return response;
        } catch (error) {
            throw new Error(`Failed to ensure directory exists: ${error.message}`);
        }
    }

    /*
     *   Upload Object in OBS
     */
    async uploadObject(objectKey: string, fileBuffer: Stream, contentType?: string) {
        try {
            const obsServer = process.env.HUAWEI_CLOUD_OBS_ENDPOINT;

            // Remove protocol and any trailing slashes from the server URL
            const serverDomain = obsServer.replace(/^https?:\/\//, "").replace(/\/+$/, "");

            const result = await this.obsClient.putObject({
                Bucket: this.bucketName,
                Key: objectKey,
                Body: fileBuffer,
                ContentType: contentType,
            });

            if (result.CommonMsg.Status === 200) {
                console.log("Upload successful!");
                const fileUrl = `https://${this.bucketName}.${serverDomain}/${objectKey}`;

                console.log("Object URL:", fileUrl);
                return result;
            } else {
                console.error("Failed to upload object:", result.CommonMsg);
            }
        } catch (error) {
            throw new Error(`Failed to upload object: ${error.message}`);
        }
    }

    /*
     *   Fetch an object from OBS
     */
    async getObject(objectKey: string, expiresInSeconds: number = 3600) {
        const bucketName = "nsc";

        const result = this.obsClient.createSignedUrlSync({
            Method: "GET",
            Bucket: bucketName,
            Key: objectKey,
            Expires: expiresInSeconds, // Set the expiration time in seconds
            QueryParams: {
                "response-content-disposition": "inline", // This ensures the file opens in browser
            },
        });

        if (!result.SignedUrl) {
            throw new Error("Failed to generate signed URL");
        }

        return result.SignedUrl; // This is the signed URL
    }

    /*
     *   Delete object from the OBS
     */
    async deleteObject(objectKey: string) {
        try {
            return await new Promise((resolve, reject) => {
                this.obsClient.deleteObject(
                    {
                        Bucket: this.bucketName,
                        Key: objectKey,
                    },
                    (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    }
                );
            });
        } catch (error) {
            throw new Error(`Failed to delete object: ${error.message}`);
        }
    }
}
