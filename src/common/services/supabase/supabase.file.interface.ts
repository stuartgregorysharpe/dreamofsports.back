export interface ISupabaseFile {
    readonly id: string;
    readonly bucket_id: string;
    readonly name: string;
    readonly owner: string;
    readonly created_at: string;
    readonly updated_at: string;
    readonly last_accessed_at: string;
    readonly metadata: ISupabaseFileMeta;
    readonly path_tokens: string[];
    readonly version: string;
}

export interface ISupabaseFileMeta {
    readonly eTag: string;
    readonly size: number;
    readonly mimetype: string;
    readonly cacheControl: string;
    readonly lastModified: string;
    readonly contentLength: number;
    readonly httpStatusCode: number;
}
