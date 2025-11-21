import {
  CopyObjectParams,
  UploadResult,
} from "@/common/interfaces/storage.interface";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import * as fs from "fs";
import { FilterQuery, Model, Types } from "mongoose";
import * as path from "path";
import { ERROR_CODES } from "../../common/constants/error-code.constansts";
import { AppException } from "../../common/dto/app-exception";
import { File, FileDocument } from "../../schemas/file.schema";
import { StorageService } from "../storage/storage.service";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { GetFilesRequestDto } from "./dto/get-files-request.dto";
import { UploadFileDto } from "./dto/upload-file.dto";
import { PreviewService } from "./preview/preview.service";
import { GetFilesResponseDto } from "./dto/get-files-response.dto";
import { CopyObjectsDto } from "./dto/copy-object.dto";
import { MoveObjectsDto } from "./dto/move-object.dto";
import { dbFullPathOf, providerKeyOf } from "./utils/key-transfomers";
import { CreateSharingUrlDto } from "./dto/create-sharing-url.dto";
import { JwtService } from "@nestjs/jwt";
import { User, UserDocument } from "@/schemas/user.schema";
import { UserStorageConfig } from "@/schemas/user-storage-config.schema";
import { GetFileDetailsResponseDto } from "./dto/get-file-details-response.dto";
import { RenameDto } from "./dto/rename.dto";
import { ChangeVisibilityDto } from "./dto/toggle-visibility-dto";

@Injectable()
export class FilesService {
  logger: Logger = new Logger(FilesService.name);
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    private storageService: StorageService,
    private previewService: PreviewService, // 👈 ADD THIS
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  public async uploadFile(
    file: Express.Multer.File,
    userId: string,
    uploadFileDto: UploadFileDto,
  ): Promise<UploadResult & { provider: string }> {
    // ): Promise<FileDocument> {
    if (!file) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.NO_FILE_UPLOADED,
        message: "Files.uploadFile.noFile",
        userMessage: "No file uploaded",
        details: "Please select a file to upload.",
      });
    }

    const tempFilePath = file.path;
    const originalName = file.originalname;
    const fileSize = file.size;
    const mimeType = file.mimetype;
    const fileExtension = path.extname(originalName).toLowerCase();

    this.logger.debug(
      JSON.stringify({
        tempFilePath,
        originalName,
        fileSize,
        mimeType,
        fileExtension,
        fileExists: fs.existsSync(tempFilePath),
        ...uploadFileDto,
      }),
    );

    // validate files locaiton:
    if (!fs.existsSync(tempFilePath)) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.FILE_NOT_FOUND,
        message: "Files.uploadFile.fileNotFound",
        userMessage: "File not found",
        details: "The uploaded file could not be found on the server.",
      });
    }

    try {
      // Generate unique filename for cloud storage
      const uniqueFileName = this.generateUniqueFileName(originalName);
      this.logger.debug(`uniqueFileName => ${JSON.stringify(uniqueFileName)}`);

      // Upload to cloud storage
      const uploadResult = await this.storageService.uploadFile(userId, {
        tmpLocation: tempFilePath,
        mimeType,
        fullPath: `${uploadFileDto.folderPath ?? ""}${uniqueFileName}`,
      });

      this.logger.debug(`uploadResult => ${JSON.stringify(uploadResult)}`);

      // Ensure folder path exists
      const folderPath = await this.ensureFolderPath(
        userId,
        uploadFileDto.folderPath,
      );
      this.logger.debug(`folderPath => ${JSON.stringify(folderPath)}`);
      const parentPath = this.extractParentPath(uploadResult.fullPath);
      this.logger.debug(`parentPath => ${JSON.stringify(parentPath)}`);

      // let previewFileDoc: any = null;
      // if (previewLocalPath) {
      //   const previewUploadResult = await this.storageService.uploadFile(
      //     userId,
      //     {
      //       tmpLocation: previewLocalPath,
      //       mimeType: "image/jpeg",
      //       fullPath: `.imaginary/${uniqueFileName}_preview.jpg`,
      //     },
      //   );

      //   this.logger.debug(
      //     `previewUploadResult => ${JSON.stringify(previewUploadResult)}`,
      //   );

      //   // save preview file metadata to database
      //   previewFileDoc = new this.fileModel({
      //     ownerId: new Types.ObjectId(userId),
      //     type: "file",
      //     originalName: `${originalName}_preview.jpg`,
      //     fileName: `${uniqueFileName}_preview.jpg`,
      //     fullPath: `_rt/${previewUploadResult.fullPath}`,
      //     parentPath: this.extractParentPath(previewUploadResult.fullPath),
      //     mimeType: "image/jpeg",
      //     fileExtension: ".jpg",
      //     storageProvider: previewUploadResult.provider,
      //     fileUrl: previewUploadResult.fileUrl,
      //     metadata: {
      //       uploadedAt: new Date(),
      //       provider: previewUploadResult.provider,
      //       isPreview: true,
      //     },
      //   });

      //   await previewFileDoc.save();
      //   // Clean up preview temp file
      //   fs.unlinkSync(previewLocalPath);
      // }

      // Save file metadata to database

      const previewFileId = await this.generatePreview(
        tempFilePath,
        userId,
        uniqueFileName,
        originalName,
      );

      const fileDoc = new this.fileModel({
        ownerId: new Types.ObjectId(userId),
        type: "file",
        originalName: originalName,
        fileName: uniqueFileName,
        fullPath: dbFullPathOf(uploadResult.fullPath),
        parentPath,
        mimeType,
        fileExtension,
        storageProvider: uploadResult.provider,
        fileUrl: uploadResult.fileUrl,
        metadata: {
          uploadedAt: new Date(),
          provider: uploadResult.provider,
          previewImageId: previewFileId,
        },
      });

      await fileDoc.save();
      this.logger.debug(
        `fileDoc.toObject() => ${JSON.stringify(fileDoc.toObject())}`,
      );

      // Clean up temporary file
      fs.unlinkSync(tempFilePath);

      return fileDoc.toObject();
    } catch (error) {
      // Clean up temporary file in case of error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw error;
    }
  }

  public async generatePreview(
    tempFilePath: string,
    userId: string,
    uniqueFileName: string,
    originalName: string,
  ): Promise<string | null> {
    if (tempFilePath) {
      try {
        const previewLocalPath =
          await this.previewService.generatePreview(tempFilePath);

        if (!previewLocalPath) return null;

        const previewUploadResult = await this.storageService.uploadFile(
          userId,
          {
            tmpLocation: previewLocalPath,
            mimeType: "image/jpeg",
            fullPath: `.imaginary/${uniqueFileName}_preview.jpg`,
          },
        );

        this.logger.debug(
          `previewUploadResult => ${JSON.stringify(previewUploadResult)}`,
        );

        // save preview file metadata to database
        const previewFileDoc = new this.fileModel({
          ownerId: new Types.ObjectId(userId),
          type: "file",
          originalName: `${originalName}_preview.jpg`,
          fileName: `${uniqueFileName}_preview.jpg`,
          fullPath: dbFullPathOf(previewUploadResult.fullPath),
          parentPath: this.extractParentPath(previewUploadResult.fullPath),
          mimeType: "image/jpeg",
          fileExtension: ".jpg",
          storageProvider: previewUploadResult.provider,
          fileUrl: previewUploadResult.fileUrl,
          metadata: {
            uploadedAt: new Date(),
            provider: previewUploadResult.provider,
            isPreview: true,
          },
        });

        await previewFileDoc.save();
        // Clean up preview temp file
        fs.unlinkSync(previewLocalPath);
        return previewFileDoc._id;
      } catch (error) {
        this.logger.error(`Failed to generate preview: ${error.message}`);
        return null;
      }
    }
    return null;
  }

  public async getFiles(
    userId: string,
    GetFilesRequestDto: GetFilesRequestDto,
  ): Promise<{
    items: { type: "file" | "folder"; name: string; fullPath: string }[];
  }> {
    const {
      search,
      mimeType,
      sortBy = "createdAt",
      sortOrder = "desc",
      prefix,
    } = GetFilesRequestDto;

    this.logger.debug(
      `GetFilesRequestDto => ${JSON.stringify(GetFilesRequestDto)}`,
    );

    // Build query
    const query: FilterQuery<FileDocument> = {
      ownerId: new Types.ObjectId(userId),
      deletedAt: null,
      parentPath: prefix ? dbFullPathOf(prefix) : dbFullPathOf(),
    };

    // ✅ Text search on file/folder names
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: "i" } },
        { "metadata.tags": { $regex: search, $options: "i" } },
      ];
    }

    // ✅ Filter by mimeType (only affects files)
    if (mimeType) {
      query.mimeType = mimeType;
    }

    this.logger.debug(`query => ${JSON.stringify(query)}`);

    // === Build Sort Object ===
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // === Fetch Files/Folders ===
    const files = await this.fileModel
      .find(query)
      .sort(sort)
      .select(
        "ownerId type originalName fullPath fileSize mimeType fileUrl metadata providerMetadata createdAt",
      )
      .lean();
    this.logger.debug(`files.length => ${JSON.stringify(files.length)}`);

    return {
      items: files
        .sort((a, b) => -1 * a.type.localeCompare(b.type))
        .map((f) =>
          GetFilesResponseDto.prototype.fromFileDocument(
            f,
            this.config.get("PROXY_URL"),
          ),
        ),
    } as any;
  }

  public async getFileById(
    fileId: string,
    userId: string,
  ): Promise<FileDocument> {
    const file = await this.fileModel.findOne({
      _id: fileId,
      ownerId: new Types.ObjectId(userId),
      deletedAt: null,
    });

    if (!file) {
      throw new AppException({
        statusCode: HttpStatus.NOT_FOUND,
        code: ERROR_CODES.FILE_NOT_FOUND,
        message: "Files.getFileById.fileNotFound",
        userMessage: "File not found",
      });
    }

    return file;
  }

  public async createFolder(
    userId: string,
    createFolderDto: CreateFolderDto,
  ): Promise<{ fullPath: string }> {
    try {
      const { fullPath } = createFolderDto;
      return { fullPath: await this.ensureFolderPath(userId, fullPath) };
    } catch (error) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.BAD_REQUEST,
        message: "Files.createFolder.failed",
        userMessage: "Failed to create folder",
        details: error.message,
      });
    }
  }

  /**
   * Copy multiple objects (files or folders) into a destination folder.
   * Returns an array of results for each sourceId with either newId or error.
   */
  public async copyObjects(
    userId: string,
    copyDto: CopyObjectsDto,
  ): Promise<
    Array<{
      sourceId: string;
      type?: "file" | "folder";
      newId?: string;
      error?: string;
    }>
  > {
    const results: Array<any> = [];

    // Handle destination - either a specific folder ID or root
    let destFolder: FileDocument | null = null;
    let destinationPath: string;

    if (copyDto.destinationFolderId && copyDto.destinationFolderId !== "root") {
      // Moving to a specific folder
      destFolder = await this.fileModel.findOne({
        _id: copyDto.destinationFolderId,
        ownerId: new Types.ObjectId(userId),
        type: "folder",
        deletedAt: null,
      });

      if (!destFolder) {
        throw new AppException({
          statusCode: HttpStatus.BAD_REQUEST,
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: "Files.copyObjects.destinationNotFound",
          userMessage: "Destination folder not found",
        });
      }
      destinationPath = destFolder.fullPath;
    } else {
      // Moving to root folder
      destinationPath = "_rt/";
      // Create a virtual root folder object for compatibility
      destFolder = {
        _id: null,
        fullPath: "_rt/",
        type: "folder",
      } as any;
    }

    // Iterate over each source id
    for (const sourceId of copyDto.sourceIds) {
      try {
        const src = await this.getFileById(sourceId, userId); // throws if not found

        if (src.type === "file") {
          // Single file copy
          const newFileDoc = await this._copySingleFile(
            userId,
            src,
            destFolder,
          );
          results.push({
            sourceId,
            type: "file",
            newId: newFileDoc._id.toString(),
          });
        } else if (src.type === "folder") {
          // Folder copy: duplicate structure and files
          const newFolderDoc = await this._copyFolderRecursive(
            userId,
            src,
            destFolder,
          );
          results.push({
            sourceId,
            type: "folder",
            newId: newFolderDoc._id.toString(),
          });
        } else {
          results.push({
            sourceId,
            error: `Unsupported source type: ${src.type}`,
          });
        }
      } catch (err: any) {
        this.logger.error(
          `Copy failed for ${sourceId}: ${err?.message || err}`,
        );
        results.push({ sourceId, error: err?.message || String(err) });
      }
    }

    return results;
  }

  /**
   * Copy a single file DB entry and storage object to the destination folder.
   * Returns the newly created file document (saved).
   */
  private async _copySingleFile(
    userId: string,
    src: FileDocument,
    destFolder: FileDocument,
  ) {
    // generate unique filename to avoid collision in dest folder
    const uniqueFileName = await this._generateUniqueFileNameInFolder(
      userId,
      destFolder,
      src.originalName,
    );

    // provider keys
    const srcProviderKey = providerKeyOf(src.fullPath); // e.g. "images/a.jpg"
    const destProviderKey = `${providerKeyOf(destFolder.fullPath)}${uniqueFileName}`;

    // copy on provider
    try {
      await this.storageService.copyObject(userId, {
        from: srcProviderKey,
        to: destProviderKey,
      } as CopyObjectParams);
    } catch (err) {
      throw new Error(`Storage copy failed: ${err?.message || err}`);
    }

    // Copy preview if exists
    let newPreviewId: string | null = null;
    if (src.metadata?.previewImageId) {
      try {
        const previewDoc = await this.fileModel.findById(
          src.metadata.previewImageId,
        );
        if (previewDoc) {
          // compute preview provider keys; original preview key may be `_rt/.imaginary/...`
          const previewSrcKey = providerKeyOf(previewDoc.fullPath);
          // choose new preview key under .imaginary with new filename
          const previewDestKey = `.imaginary/${uniqueFileName}_preview.jpg`;

          await this.storageService.copyObject(userId, {
            from: previewSrcKey,
            to: previewDestKey,
          } as CopyObjectParams);

          // create preview doc
          const previewFileDoc = new this.fileModel({
            ownerId: new Types.ObjectId(userId),
            type: "file",
            originalName: `${uniqueFileName}_preview.jpg`,
            fileName: `${uniqueFileName}_preview.jpg`,
            fullPath: dbFullPathOf(previewDestKey),
            parentPath: this.extractParentPath(previewDestKey),
            mimeType: "image/jpeg",
            fileExtension: ".jpg",
            storageProvider: previewDoc.storageProvider || src.storageProvider,
            fileUrl: previewDoc.fileUrl
              ? previewDoc.fileUrl.replace(
                  providerKeyOf(previewDoc.fullPath),
                  previewDestKey,
                )
              : undefined,
            metadata: {
              uploadedAt: new Date(),
              provider: previewDoc.storageProvider || src.storageProvider,
              isPreview: true,
            },
          });
          await previewFileDoc.save();
          newPreviewId = previewFileDoc._id;
        }
      } catch (err) {
        // Preview copy failure should not abort the main file copy — surface a warning in metadata (or log)
        this.logger.error(
          `Preview copy failed for ${src._id}: ${err?.message || err}`,
        );
        newPreviewId = null;
      }
    }

    // create DB entry for new file
    const fileDoc = new this.fileModel({
      ownerId: new Types.ObjectId(userId),
      type: "file",
      originalName: src.originalName,
      fileName: uniqueFileName,
      fullPath: dbFullPathOf(destProviderKey),
      parentPath: destFolder.fullPath, // already has _rt/
      mimeType: src.mimeType,
      fileExtension: src.fileExtension,
      storageProvider: src.storageProvider,
      fileUrl: src.fileUrl
        ? src.fileUrl.replace(providerKeyOf(src.fullPath), destProviderKey)
        : undefined,
      metadata: {
        ...src.metadata,
        copiedFrom: src._id,
        uploadedAt: new Date(),
        provider: src.storageProvider,
        previewImageId: newPreviewId,
      },
    });

    await fileDoc.save();
    return fileDoc;
  }

  /**
   * Copy a folder recursively under destFolder.
   * Returns the new root folder document created.
   */
  private async _copyFolderRecursive(
    userId: string,
    srcFolder: FileDocument,
    destFolder: FileDocument,
  ) {
    // Step 1: create a new folder in DB under destination (ensure unique name)
    const newFolderName = await this._generateUniqueFolderNameInFolder(
      userId,
      destFolder,
      srcFolder.originalName,
    );
    const newFolderFullPath = `${destFolder.fullPath}${newFolderName}/`; // destFolder.fullPath already has `_rt/...` and trailing slash
    const newFolderDoc = await this.fileModel.create({
      ownerId: new Types.ObjectId(userId),
      type: "folder",
      originalName: newFolderName,
      fileName: newFolderName,
      fullPath: newFolderFullPath,
      parentPath: destFolder.fullPath,
      storageProvider: srcFolder.storageProvider || "aws",
      metadata: { createdAt: new Date() },
    });

    // Step 2: fetch entire subtree (folders + files) from DB excluding the root folder itself (we already created root)
    const prefix = srcFolder.fullPath; // starts with _rt/
    const descendants = await this.fileModel
      .find({
        ownerId: new Types.ObjectId(userId),
        deletedAt: null,
        fullPath: { $regex: `^${this._escapeRegex(prefix)}` }, // all under this path
      })
      .sort({ fullPath: 1 })
      .lean();

    // Build maps: oldFolderFullPath -> newFolderFullPath, oldFolderId -> newFolderId
    const folderPathMap = new Map<string, string>();
    const folderIdMap = new Map<string, Types.ObjectId>();

    folderPathMap.set(srcFolder.fullPath, newFolderDoc.fullPath);
    folderIdMap.set(srcFolder._id.toString(), newFolderDoc._id);

    // We'll collect file copy mappings to call storageService.batchCopy
    const fileMappings: Array<{
      from: string;
      to: string;
      srcDoc: any;
      parentNewFullPath: string;
    }> = [];

    // Process descendants in order
    for (const desc of descendants) {
      // skip the root (same id as srcFolder)
      if (desc._id.toString() === srcFolder._id.toString()) continue;

      const relativePath = desc.fullPath.slice(prefix.length); // remove srcFolder.fullPath prefix; may start with something like 'sub1/' or 'sub1/file.jpg'
      if (desc.type === "folder") {
        // create folder in DB
        const srcParentFullPath = desc.parentPath; // e.g. _rt/a/b/
        // compute new parent full path from map
        const mappedParentFullPath = folderPathMap.get(srcParentFullPath);
        if (!mappedParentFullPath) {
          // parent not created? this shouldn't happen if sorted ascending, but guard
          throw new Error(`Parent folder mapping missing for ${desc.fullPath}`);
        }
        const newFolderFullPath = `${mappedParentFullPath}${desc.originalName}/`;
        const newFolder = await this.fileModel.create({
          ownerId: new Types.ObjectId(userId),
          type: "folder",
          originalName: desc.originalName,
          fileName: desc.fileName || desc.originalName,
          fullPath: newFolderFullPath,
          parentPath: mappedParentFullPath,
          storageProvider:
            desc.storageProvider || srcFolder.storageProvider || "aws",
          metadata: { createdAt: new Date() },
        });

        folderPathMap.set(desc.fullPath, newFolderFullPath);
        folderIdMap.set(desc._id.toString(), newFolder._id);
      } else if (desc.type === "file") {
        // schedule file copy
        // compute new parent path (database full path)
        const mappedParentFullPath = folderPathMap.get(desc.parentPath);
        if (!mappedParentFullPath) {
          throw new Error(
            `Parent folder mapping missing for file ${desc.fullPath}`,
          );
        }

        // generate new unique filename within the new parent folder
        const newUniqueName = await this._generateUniqueFileNameInFolder(
          userId,
          { fullPath: mappedParentFullPath } as any,
          desc.originalName,
        );

        const srcProviderKey = providerKeyOf(desc.fullPath);
        const destProviderKey = `${providerKeyOf(mappedParentFullPath)}${newUniqueName}`;

        fileMappings.push({
          from: srcProviderKey,
          to: destProviderKey,
          srcDoc: desc,
          parentNewFullPath: mappedParentFullPath,
        });
      }
    }

    // Step 3: perform batch copy for files (use storageService.batchCopy)
    const batchMappings = fileMappings.map((f) => ({ from: f.from, to: f.to }));
    if (batchMappings.length > 0) {
      try {
        await this.storageService.batchCopy(userId, batchMappings, 8);
      } catch (err) {
        // on failure, you could attempt retries or rollbacks. For now surface error.
        throw new Error(`Batch copy failed: ${err?.message || err}`);
      }
    }

    // Step 4: create DB entries for copied files (and their previews)
    for (const fm of fileMappings) {
      const srcDoc = fm.srcDoc;
      const newFileName = fm.to.split("/").pop(); // last segment
      const newFileDoc = new this.fileModel({
        ownerId: new Types.ObjectId(userId),
        type: "file",
        originalName: srcDoc.originalName,
        fileName: newFileName,
        fullPath: dbFullPathOf(fm.to),
        parentPath: fm.parentNewFullPath, // already _rt/ prefixed
        mimeType: srcDoc.mimeType,
        fileExtension: srcDoc.fileExtension,
        storageProvider: srcDoc.storageProvider,
        fileUrl: srcDoc.fileUrl
          ? srcDoc.fileUrl.replace(providerKeyOf(srcDoc.fullPath), fm.to)
          : undefined,
        metadata: {
          ...srcDoc.metadata,
          copiedFrom: srcDoc._id,
          uploadedAt: new Date(),
          provider: srcDoc.storageProvider,
        },
      });

      // handle preview if any: copy preview similarly
      if (srcDoc.metadata?.previewImageId) {
        try {
          const previewDoc = await this.fileModel
            .findById(srcDoc.metadata.previewImageId)
            .lean();
          if (previewDoc) {
            const previewSrcKey = providerKeyOf(previewDoc.fullPath);
            const previewDestKey = `.imaginary/${newFileName}_preview.jpg`;
            // copy preview synchronously (small)
            await this.storageService.copyObject(userId, {
              from: previewSrcKey,
              to: previewDestKey,
            } as CopyObjectParams);

            // create preview doc
            const previewFileDoc = await this.fileModel.create({
              ownerId: new Types.ObjectId(userId),
              type: "file",
              originalName: `${newFileName}_preview.jpg`,
              fileName: `${newFileName}_preview.jpg`,
              fullPath: dbFullPathOf(previewDestKey),
              parentPath: this.extractParentPath(previewDestKey),
              mimeType: "image/jpeg",
              fileExtension: ".jpg",
              storageProvider:
                previewDoc.storageProvider || srcDoc.storageProvider,
              fileUrl: previewDoc.fileUrl
                ? previewDoc.fileUrl.replace(
                    providerKeyOf(previewDoc.fullPath),
                    previewDestKey,
                  )
                : undefined,
              metadata: {
                uploadedAt: new Date(),
                provider: previewDoc.storageProvider || srcDoc.storageProvider,
                isPreview: true,
              },
            });

            newFileDoc.metadata.previewImageId = previewFileDoc._id;
          }
        } catch (err) {
          this.logger.error(
            `Preview copy failed for ${srcFolder._id}: ${err?.message || err}`,
          );
          // don't fail whole operation due to preview copy
        }
      }

      await newFileDoc.save();
    }

    return newFolderDoc;
  }

  public async moveObjects(
    userId: string,
    moveDto: MoveObjectsDto,
  ): Promise<Array<{ sourceId: string; newId?: string; error?: string }>> {
    const results: any[] = [];

    // Handle destination - either a specific folder ID or root
    let destFolder: FileDocument | null = null;
    let destinationPath: string;

    if (moveDto.destinationFolderId && moveDto.destinationFolderId !== "root") {
      // Moving to a specific folder
      destFolder = await this.fileModel.findOne({
        _id: moveDto.destinationFolderId,
        ownerId: new Types.ObjectId(userId),
        type: "folder",
        deletedAt: null,
      });

      if (!destFolder) {
        throw new AppException({
          statusCode: HttpStatus.BAD_REQUEST,
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: "Files.moveObjects.destinationNotFound",
          userMessage: "Destination folder not found",
        });
      }
      destinationPath = destFolder.fullPath;
    } else {
      // Moving to root folder
      destinationPath = "_rt/";
      // Create a virtual root folder object for compatibility
      destFolder = {
        _id: null,
        fullPath: "_rt/",
        type: "folder",
      } as any;
    }

    // Validate source list
    const sourceDocs = await this.fileModel.find({
      _id: { $in: moveDto.sourceIds },
      ownerId: new Types.ObjectId(userId),
      deletedAt: null,
    });

    for (const src of sourceDocs) {
      try {
        if (src.type === "file") {
          const updatedFile = await this._moveSingleFile(
            userId,
            src,
            destFolder,
          );
          results.push({
            sourceId: src._id.toString(),
            newId: updatedFile._id.toString(),
          });
        } else if (src.type === "folder") {
          const updatedFolder = await this._moveFolderRecursive(
            userId,
            src,
            destFolder,
          );
          results.push({
            sourceId: src._id.toString(),
            newId: updatedFolder._id.toString(),
          });
        }
      } catch (err: any) {
        results.push({
          sourceId: src._id.toString(),
          error: err?.message || String(err),
        });
      }
    }

    return results;
  }

  private async _moveSingleFile(
    userId: string,
    src: FileDocument,
    destFolder: FileDocument,
  ) {
    const oldKey = providerKeyOf(src.fullPath);
    const newKey = `${providerKeyOf(destFolder.fullPath)}${src.fileName}`;

    // S3 MOVE
    await this.storageService.moveObject(userId, {
      from: oldKey,
      to: newKey,
    });

    // TODO: Move preview if present - no need to move the preview right now
    // if (src.metadata?.previewImageId) {
    //   const previewDoc = await this.fileModel.findById(
    //     src.metadata.previewImageId,
    //   );
    //   if (previewDoc) {
    //     const previewOldKey = providerKeyOf(previewDoc.fullPath);
    //     const previewNewKey = `.imaginary/${src.fileName}_preview.jpg`;

    //     await this.storageService.moveObject(userId, {
    //       from: previewOldKey,
    //       to: previewNewKey,
    //     });

    //     // Update preview DB
    //     previewDoc.fullPath = `_rt/${previewNewKey}`;
    //     previewDoc.parentPath = this.extractParentPath(previewNewKey);
    //     await previewDoc.save();
    //   }
    // }

    // Update DB
    src.parentPath = destFolder.fullPath;
    src.fullPath = dbFullPathOf(newKey);
    await src.save();

    return src;
  }

  private async _moveFolderRecursive(
    userId: string,
    srcFolder: FileDocument,
    destFolder: FileDocument,
  ) {
    //
    // 1. VALIDATION
    //
    if (destFolder.fullPath.startsWith(srcFolder.fullPath)) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.BAD_REQUEST,
        message: "Files.moveFolderRecursive.invalidDestination",
        userMessage: "Invalid destination folder",
        details: "Cannot move a folder into itself or its own descendant.",
      });
    }

    //
    // 2. Compute new root path
    //
    const oldPrefix = srcFolder.fullPath; // _rt/a/b/
    const newPrefix = `${destFolder.fullPath}${srcFolder.originalName}/`; // _rt/x/y/b/

    const oldPrefixKey = providerKeyOf(oldPrefix);
    const newPrefixKey = providerKeyOf(newPrefix);

    //
    // 3. Fetch all descendant DB nodes
    //
    const descendants = await this.fileModel
      .find({
        ownerId: new Types.ObjectId(userId),
        deletedAt: null,
        fullPath: { $regex: `^${this._escapeRegex(oldPrefix)}` },
      })
      .sort({ fullPath: 1 });

    //
    // 4. MOVE ROOT FOLDER DB
    //
    srcFolder.parentPath = destFolder.fullPath;
    srcFolder.fullPath = newPrefix;
    await srcFolder.save();

    //
    // 5. BUILD MOVE MAPPINGS (files only)
    //
    const fileMoves: Array<{ from: string; to: string; doc: any }> = [];

    for (const node of descendants) {
      if (node._id.equals(srcFolder._id)) continue;

      const oldFullPath = node.fullPath;
      const rel = oldFullPath.substring(oldPrefix.length);
      const newFullPath = newPrefix + rel;

      // Folder: update DB only
      if (node.type === "folder") {
        node.fullPath = newFullPath;
        node.parentPath = newFullPath.replace(/[^/]+\/$/, "");
        await node.save();
        continue;
      }

      // File: schedule S3 move
      const oldKey = providerKeyOf(oldFullPath);
      const newKey = providerKeyOf(newFullPath);

      fileMoves.push({ from: oldKey, to: newKey, doc: node });
    }

    //
    // 6. EXECUTE FILE MOVES
    //
    for (const fm of fileMoves) {
      await this.storageService.moveObject(userId, {
        from: fm.from,
        to: fm.to,
      });

      // update DB
      fm.doc.fullPath = dbFullPathOf(fm.to);
      fm.doc.parentPath = this.extractParentPath(fm.to);
      await fm.doc.save();

      // TODO: preview move - no need to move the preview right now
      // if (fm.doc.metadata?.previewImageId) {
      //   const previewDoc = await this.fileModel.findById(
      //     fm.doc.metadata.previewImageId,
      //   );
      //   if (previewDoc) {
      //     const oldPreviewKey = providerKeyOf(previewDoc.fullPath);
      //     const newPreviewKey = `.imaginary/${fm.doc.fileName}_preview.jpg`;

      //     await this.storageService.moveObject(userId, {
      //       from: oldPreviewKey,
      //       to: newPreviewKey,
      //     });

      //     previewDoc.fullPath = dbFullPathOf(newPreviewKey);
      //     previewDoc.parentPath = this.extractParentPath(newPreviewKey);
      //     await previewDoc.save();
      //   }
      // }
    }

    return srcFolder;
  }

  public async softDeleteObjects(userId: string, sourceIds: string[]) {
    const results = [];

    const sources = await this.fileModel.find({
      _id: { $in: sourceIds },
      ownerId: new Types.ObjectId(userId),
      deletedAt: null,
    });

    for (const src of sources) {
      try {
        await this._softDeleteTree(src);
        results.push({ sourceId: src._id.toString(), success: true });
      } catch (err: any) {
        this.logger.error(`Soft delete failed for ${src._id}: ${err?.message}`);
        results.push({ sourceId: src._id.toString(), error: err?.message });
      }
    }

    return results;
  }

  private async _softDeleteTree(root: FileDocument) {
    const { all } = await this._collectDescendants(root);
    // debugger;
    const now = new Date();

    for (const doc of all) {
      if (!doc.metadata) doc.metadata = {};

      // store original location for restore
      if (!doc.metadata.originalParentPath) {
        doc.metadata.originalParentPath = doc.parentPath;
      }

      doc.deletedAt = now;
      await doc.save();
    }
  }

  public async hardDeleteObjects(userId: string, sourceIds: string[]) {
    const results = [];

    const sources = await this.fileModel.find({
      _id: { $in: sourceIds },
      ownerId: new Types.ObjectId(userId),
    });

    for (const src of sources) {
      try {
        await this._hardDeleteTree(userId, src);
        results.push({ sourceId: src._id.toString(), success: true });
      } catch (err: any) {
        this.logger.error(`Hard delete failed for ${src._id}: ${err?.message}`);
        results.push({ sourceId: src._id.toString(), error: err?.message });
      }
    }

    return results;
  }

  private async _hardDeleteTree(userId: string, root: FileDocument) {
    const { all, files, previews } = await this._collectDescendants(root);

    // 1. Delete file objects from storage
    for (const f of files) {
      const key = providerKeyOf(f.fullPath);
      try {
        await this.storageService.deleteFile(userId, { fileName: key });
      } catch (err) {
        this.logger.error(`Failed to delete file from storage: ${key}`);
      }
    }

    // 2. Delete preview objects
    for (const p of previews) {
      const key = providerKeyOf(p.fullPath);
      try {
        await this.storageService.deleteFile(userId, { fileName: key });
      } catch (err) {
        this.logger.error(`Failed to delete preview: ${key}`);
      }
    }

    // 3. Delete DB documents
    const ids = [root._id, ...all.map((d) => d._id)];
    this.logger.debug(`Deleting DB docs(${ids.length}): ${ids.join(", ")}`);
    await this.fileModel.deleteMany({ _id: { $in: ids } });
  }

  private async _collectDescendants(root: FileDocument) {
    const prefix = root.fullPath; // _rt/a/b/

    const all = await this.fileModel.find({
      ownerId: root.ownerId,
      deletedAt: null, // include soft deleted? choose yes/no later
      fullPath: { $regex: `^${this._escapeRegex(prefix)}` },
    });
    // .lean();

    const files = all.filter((d) => d.type === "file");
    const folders = all.filter((d) => d.type === "folder");

    // Find preview docs
    const previewIds = files
      .map((f) => f.metadata?.previewImageId)
      .filter(Boolean);

    const previews = previewIds.length
      ? await this.fileModel.find({ _id: { $in: previewIds } })
      : [];

    return { all, files, folders, previews };
  }

  async createSharingUrl(
    userId: string,
    dto: CreateSharingUrlDto,
  ): Promise<string> {
    try {
      const file = await this.fileModel.findOne({
        _id: new Types.ObjectId(dto.fileId),
        ownerId: new Types.ObjectId(userId),
      });

      if (!file) {
        throw new AppException({
          statusCode: HttpStatus.NOT_FOUND,
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: "Files.createSharingUrl.fileNotFound",
          userMessage: "File not found",
        });
      }

      let exp: number;

      if (dto.expiresAt) {
        exp = Math.floor(dto.expiresAt.getTime() / 1000);
      } else if (dto.durationSeconds) {
        exp = Math.floor(
          (Date.now() + (dto.durationSeconds || 3600) * 1000) / 1000,
        );
      } else {
        exp = Math.floor((Date.now() + 3600 * 1000) / 1000); // default 1 hour
      }

      const payload = {
        type: "share",
        fileId: file._id.toString(),
        ownerId: file.ownerId.toString(),
      };

      const url = new URL(this.config.get("PROXY_URL"));
      url.pathname = `/${file.ownerId.toString()}/${file._id.toString()}`;
      url.searchParams.set(
        "token",
        this.jwtService.sign(payload, {
          secret: this.config.get("SHARING_TOKEN_SECRET"),
          expiresIn: exp - Math.floor(Date.now() / 1000),
        }),
      );

      return url.toString();
    } catch (error) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.BAD_REQUEST,
        message: "Files.createSharingUrl.failed",
        userMessage: "Failed to create sharing URL",
        details: error.message,
      });
    }
  }

  async getDetails(
    userId: string,
    fileId: string,
  ): Promise<GetFileDetailsResponseDto> {
    try {
      type ActualPopulatedDocument = Omit<FileDocument, "ownerId"> & {
        ownerId: UserDocument;
      };
      const fileWithDetails = (await this.fileModel
        .findOne({
          _id: new Types.ObjectId(fileId),
          ownerId: new Types.ObjectId(userId),
          deletedAt: null,
        })
        .populate<User>("ownerId")
        .lean()) as ActualPopulatedDocument | null;

      if (!fileWithDetails) {
        throw new AppException({
          statusCode: HttpStatus.NOT_FOUND,
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: "Files.getDetails.fileNotFound",
          userMessage: "File not found",
        });
      }

      return GetFileDetailsResponseDto.prototype.fromFileDocument(
        fileWithDetails,
        this.config.get("PROXY_URL"),
      );
    } catch (error) {
      this.logger.error(`Get file details failed: ${error.message}`);
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.BAD_REQUEST,
        message: "Files.getDetails.failed",
        userMessage: "Failed to get file details",
        details: error.message,
      });
    }
  }

  // only shallow rename not path change
  // no name update in actual storage
  public async renameObject(userId: string, dto: RenameDto) {
    try {
      const file = await this.fileModel.findOne({
        ownerId: new Types.ObjectId(userId),
        _id: new Types.ObjectId(dto.id),
        deletedAt: null,
      });

      if (!file) {
        throw new AppException({
          statusCode: HttpStatus.NOT_FOUND,
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: "Files.renameObject.fileNotFound",
          userMessage: "File not found",
        });
      }

      // Check for name collision in the same folder
      const existing = await this.fileModel.findOne({
        ownerId: new Types.ObjectId(userId),
        parentPath: file.parentPath,
        originalName: dto.newName,
        deletedAt: null,
      });

      if (existing) {
        throw new AppException({
          statusCode: HttpStatus.BAD_REQUEST,
          code: ERROR_CODES.BAD_REQUEST,
          message: "Files.renameObject.nameCollision",
          userMessage:
            "An object with the same name already exists in the target folder",
        });
      }

      // Perform shallow rename
      file.originalName = dto.newName;

      await file.save();
      return file.toObject();
    } catch (error) {
      this.logger.error(`Rename object failed: ${error.message}`);
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.BAD_REQUEST,
        message: "Files.renameObject.failed",
        userMessage: "Failed to rename object",
        details: error.message,
      });
    }
  }

  public async changeVisibility(userId: string, dto: ChangeVisibilityDto) {
    try {
      const files = await this.fileModel.find({
        ownerId: new Types.ObjectId(userId),
        _id: { $in: dto.id.map((id) => new Types.ObjectId(id)) },
        deletedAt: null,
      });

      if (!files || files.length === 0) {
        throw new AppException({
          statusCode: HttpStatus.NOT_FOUND,
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: "Files.toggleVisibility.fileNotFound",
          userMessage: "File not found",
        });
      }

      const result = [];

      files.forEach(async (file) => {
        try {
          if (file.type === "file") {
            file.isPublic = dto.isPublic;
            this.logger.debug(`Setting isPublic=${dto.isPublic} for ${file._id}`);
            await file.save();
            result.push({
              fileId: file._id,
              isPublic: file.isPublic,
            });
            // return file.toObject();
          } else if (file.type === "folder") {
            // make folder and all descendants private
            const prefix = file.fullPath;
            const descendants = await this.fileModel.find({
              ownerId: new Types.ObjectId(userId),
              deletedAt: null,
              fullPath: { $regex: `^${this._escapeRegex(prefix)}` },
            });
            
            for (const doc of descendants) {
              doc.isPublic = dto.isPublic;
              this.logger.debug(`Setting isPublic=${dto.isPublic} for ${doc._id}`);
              result.push({
                id: doc._id,
                isPublic: doc.isPublic,
              });
              await doc.save();
            }
            
            file.isPublic = dto.isPublic;
            this.logger.debug(`Setting isPublic=${dto.isPublic} for folder ${file._id}`);
            await file.save();
            result.push({
              folderId: file._id,
              updatedCount: descendants.length + 1,
              isPublic: file.isPublic,
            });
            // return file.toObject();
          }
        } catch (error) {
          this.logger.error(
            `Change visibility failed for ${file._id}: ${error.message}`,
          );
          result.push(error);
        }
      });

      return {
        success: result.length === 0,
        result,
      };
    } catch (error) {
      this.logger.error(`Toggle visibility failed: ${error.message}`);
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.BAD_REQUEST,
        message: "Files.toggleVisibility.failed",
        userMessage: "Failed to toggle visibility",
        details: error.message,
      });
    }
  }

  /**
   * Generate a unique file name inside a folder to avoid collisions.
   * This tries originalName, then originalName (copy), originalName (copy 2), etc.
   */
  private async _generateUniqueFileNameInFolder(
    userId: string,
    parentFolder: { fullPath: string },
    originalName: string,
  ) {
    const extension = path.extname(originalName);
    const base = path.basename(originalName, extension);
    let candidate = `${Date.now()}-${Math.round(Math.random() * 1e6)}${extension}`; // use random timestamp-based unique name by default
    // NOTE: you can implement nicer " (copy)" logic here by checking existing names in DB.
    return candidate;
  }

  /**
   * Generate a unique folder name inside a folder to avoid collisions.
   */
  private async _generateUniqueFolderNameInFolder(
    userId: string,
    parentFolder: FileDocument,
    originalName: string,
  ) {
    // quick check: if folder with same name exists under parent, append suffix
    const exists = await this.fileModel.findOne({
      ownerId: new Types.ObjectId(userId),
      parentPath: parentFolder.fullPath,
      originalName,
      type: "folder",
      deletedAt: null,
    });

    if (!exists) return originalName;

    // try suffixes
    for (let i = 1; i < 100; i++) {
      const candidate = `${originalName} (copy${i > 1 ? ` ${i}` : ""})`;
      const e = await this.fileModel.findOne({
        ownerId: new Types.ObjectId(userId),
        parentPath: parentFolder.fullPath,
        originalName: candidate,
        type: "folder",
        deletedAt: null,
      });
      if (!e) return candidate;
    }

    // fallback unique
    return `${this.generateUniqueFileName(originalName)}}`;
  }

  /** Escape regex helper for building prefix queries */
  private _escapeRegex(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Ensures all folders in a path exist for the given user.
   * Creates missing folders in the database.
   */
  private async ensureFolderPath(userId: string, folderPath: string) {
    if (!folderPath) return "_rt/"; // root-level

    const segments = folderPath.split("/").filter(Boolean);
    let currentPath = "";

    for (const segment of segments) {
      const fullPath = currentPath + segment + "/";
      const parentPath = currentPath; // parent of this folder

      // Check if folder exists
      const existing = await this.fileModel.findOne({
        ownerId: userId,
        type: "folder",
        fullPath: dbFullPathOf(fullPath),
        deletedAt: null,
      });

      if (!existing) {
        await this.fileModel.create({
          ownerId: userId,
          type: "folder",
          originalName: segment,
          fileName: segment, // folder name can be same as originalName
          fullPath: dbFullPathOf(fullPath),
          parentPath: dbFullPathOf(parentPath),
          storageProvider: "aws", // or your default provider
          metadata: { createdAt: new Date() },
        });
        ``;
      }

      currentPath = fullPath;
    }

    return currentPath; // return last folder fullPath
  }

  private generateUniqueFileName(originalName: string): string {
    const fileExtension = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    return `${timestamp}-${randomSuffix}${fileExtension}`;
  }

  /**
   * Extracts the parent path from a fullPath.
   *
   * Examples:
   *  fullPath: "images/cat.jpg" => "_rt/images/"
   *  fullPath: "images/"       => "_rt/images/"
   *  fullPath: ""             => "_rt/"
   */
  private extractParentPath(fullPath: string): string {
    if (!fullPath) return "_rt/";

    const normalized = fullPath.replace(/\\/g, "/"); // normalize slashes
    const parts = normalized.split("/").filter(Boolean);

    if (parts.length <= 1) {
      return "_rt/"; // means it's at root
    }

    // Remove last segment (file or folder name)
    parts.pop();

    return parts.length > 0 ? "_rt/" + parts.join("/") + "/" : "_rt/";
  }
}
