import { Injectable, BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync, promises as fs, mkdirSync, writeFileSync } from "fs";
import { ConfigService } from "@nestjs/config";
import { STORAGE_PATH } from "../../../helper/constants";

interface file {
    size: number;
    buffer: Buffer;
    originalname: string;
}
@Injectable()
export class UploadService {
    private uploadPath: string;

    constructor(private configService: ConfigService) {
        this.uploadPath = path.join(this.configService.get("UPLOAD_PATH", "../uploads"), "profile");
    }

    getDiskStorageOptions(destinationPath: string) {
        return {
            storage: diskStorage({
                destination: destinationPath,
                filename: (req, file, cb) => {
                    // const filename = `${uuidv4()}${path.extname(file.originalname)}`;
                    const timestamp = new Date()
                        .toISOString()
                        .replace(/[-:.T]/g, "")
                        .slice(0, 14);
                    // const originalName = path.parse(file.originalname).name;
                    const extension = path.extname(file.originalname);
                    const uniqueFileName = `${timestamp}${extension}`;
                    cb(null, uniqueFileName);
                },
            }),
            limits: { fileSize: 1024 * 1024 * 5 },
        };
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new BadRequestException("No file provided");
        }

        const timestamp = new Date()
            .toISOString()
            .replace(/[-:.T]/g, "")
            .slice(0, 14);
        const extension = path.extname(file.originalname);
        const uniqueFileName = `${timestamp}${extension}`;
        const folderPath = path.join(__dirname, "../../../", "public/uploads/profile");

        const filePath = path.join(folderPath, uniqueFileName);

        await fs.mkdir(folderPath, { recursive: true });

        await fs.writeFile(filePath, file.buffer);

        return uniqueFileName;
    }

    generateFileUrl(filename: string, pathPrefix: string): string {
        return `${pathPrefix}/${filename}`;
    }

    // async deleteFile(image: string) {
    //     try {
    //         const filePath = path.join(__dirname, "../../../", "public/uploads/profile", image);
    //         await fs.unlink(filePath);
    //     } catch (error) {
    //         console.error("Error deleting file:", error);
    //         throw new Error("File deletion failed");
    //     }
    // }
    async deleteFile(image: string) {
        try {
            const filePath = path.join(__dirname, "../../../", "public/uploads/profile", image);

            await fs.access(filePath);

            await fs.unlink(filePath);
        } catch (error) {
            if (error.code === "ENOENT") {
                console.warn(`File not found: ${image}`);
            } else {
                console.error("Error deleting file:", error);
                throw new Error("File deletion failed");
            }
        }
    }

    async uploadLogo(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new BadRequestException("No file provided");
        }

        const uploadPath = path.join(__dirname, "../../../", "public/uploads/school/logo");

        // Create a timestamp and generate a unique file name
        const timestamp = new Date()
            .toISOString()
            .replace(/[-:.T]/g, "")
            .slice(0, 14);
        const extension = path.extname(file.originalname);
        const uniqueFileName = `${timestamp}${extension}`;

        const filePath = path.join(uploadPath, uniqueFileName);

        // Ensure the directory exists
        await fs.mkdir(uploadPath, { recursive: true });

        // Write the file buffer to the local file system
        await fs.writeFile(filePath, file.buffer);

        return uniqueFileName; // Return the new file name
    }

    async removeLogo(existingLogoPath: string) {
        try {
            const filePath = path.join(__dirname, "../../../", "public/uploads/school/logo", existingLogoPath);

            await fs.access(filePath);

            await fs.unlink(filePath);
        } catch (error) {
            if (error.code === "ENOENT") {
            } else {
                console.error("Error deleting file:", error);
                throw new Error("File deletion failed");
            }
        }
    }

    async uploadStudyMaterial(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new BadRequestException("No file provided");
        }

        const timestamp = new Date()
            .toISOString()
            .replace(/[-:.T]/g, "")
            .slice(0, 14);
        const extension = path.extname(file.originalname);
        const uniqueFileName = `${timestamp}_${file.originalname}${extension}`;
        const folderPath = path.join(__dirname, "../../../", "public/uploads/studyMaterial");

        const filePath = path.join(folderPath, uniqueFileName);

        await fs.mkdir(folderPath, { recursive: true });

        await fs.writeFile(filePath, file.buffer);

        let fileName = `studyMaterial/${uniqueFileName}`;
        return fileName;
    }

    async uploadDynamicFiles(dir: string, file: file) {
        let storageDirExists = existsSync(STORAGE_PATH.PATH);
        if (!storageDirExists) {
            mkdirSync(STORAGE_PATH.PATH);
        }

        const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");

        const fileName = `${dir}/${randomName}${path.extname(file.originalname)}`;
        const checkDirExist = existsSync(`${STORAGE_PATH.PATH}/${dir}`);

        if (!checkDirExist) {
            mkdirSync(`${STORAGE_PATH.PATH}/${dir}`, { recursive: true });
        }
        writeFileSync(`${STORAGE_PATH.PATH}/${fileName}`, file.buffer);
        return fileName;
    }
}
