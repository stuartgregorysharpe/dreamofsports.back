import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SupabaseClient, SupabaseClientOptions, createClient } from "@supabase/supabase-js";
import { FileObject } from "@supabase/storage-js";
import { CSetting } from "src/model/entities/setting";
import { Repository } from "typeorm";
import { IGetList } from "src/model/dto/getlist.interface";
import { TSupabaseCompatible } from "./supabase.compatible.type";
import { ISupabaseFile } from "./supabase.file.interface";

@Injectable()
export class CSupabaseService {
    constructor(@InjectRepository(CSetting) private settingRepository: Repository<CSetting>) {}

    public async uploadFile(bucket: string, path: string, file: TSupabaseCompatible, contentType?: string): Promise<void> {
        const options: any = {};
        if (contentType) options.contentType = contentType;
        const client = await this.initClient();
        const {data, error} = await client.storage.from(bucket).upload(path, file, options);        
        if (error) throw new Error(error.message); 
    }

    public async deleteFiles(bucket: string, paths: string[]): Promise<void> {
        const client = await this.initClient();
        const {data, error} = await client.storage.from(bucket).remove(paths);        
        if (error) throw new Error(error.message); 
    }

    public async folderChunk(bucket: string, folder: string, dto: IGetList): Promise<ISupabaseFile[]> {
        const client = await this.initClient("storage");
        const sortDir = dto.sortDir === 1 ? "asc" : "desc";
        // лучше брать из БД, чтобы отфильтровать лишнее (более простой способ - client.storage.from(bucket).list, но он не фильтрует служебные файлы)
        const { data, error } = await client
            .from('objects')
            .select()
            .filter("bucket_id", "eq", bucket)
            .filter("path_tokens", "cs", `{"${folder}"}`)
            .not("path_tokens", "cs", '{".emptyFolderPlaceholder"}')
            .order(dto.sortBy, {ascending: dto.sortDir === 1})
            .range(dto.from, dto.from + dto.q);        
        if (error) throw new Error(error.message); 
        return data as ISupabaseFile[];
    }
    
    public async folderLength(bucket: string, folder: string): Promise<number> {
        const client = await this.initClient("storage");
        const {count, error} = await client
            .from('objects')
            .select("*", {count: "exact"})
            .filter("bucket_id", "eq", bucket)
            .filter("path_tokens", "cs", `{"${folder}"}`)
            .not("path_tokens", "cs", '{".emptyFolderPlaceholder"}');        
        if (error) throw new Error(error.message); 
        return count;
    }

    ///////////////
    // utils
    ///////////////
    
    private async initClient(schema?: string): Promise<SupabaseClient> {
        const apiUrl: string = (await this.settingRepository.findOne({where: {p: "supabase-url"}}))?.v;   
        const apiKey: string = (await this.settingRepository.findOne({where: {p: "supabase-key"}}))?.v;   
        if (!apiUrl || !apiKey) throw new Error("SupabaseService: no settings");
        const options: SupabaseClientOptions<any> = schema ? {db: {schema}, auth: {persistSession: false}} : {auth: {persistSession: false}};
        return createClient(apiUrl, apiKey, options);
    }
}