export declare class AWSCredentialsDto {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
}
export declare class GCPCredentialsDto {
    projectId: string;
    keyFile: string;
    bucketName: string;
}
export declare class AzureCredentialsDto {
    accountName: string;
    accountKey: string;
    containerName: string;
}
export declare class LocalCredentialsDto {
    storagePath: string;
}
export declare class ConfigureCredentialsDto {
    credentials: AWSCredentialsDto | GCPCredentialsDto | AzureCredentialsDto | LocalCredentialsDto;
}
