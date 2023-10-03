import { IImagable } from "src/model/imagable.interface";
import { IKeyValue } from "src/model/keyvalue.interface";
import { CAppService } from "./app.service";
import { CUploadsService } from "./uploads.service";

export abstract class CImagableService {
    protected abstract folder: string;
    protected abstract resizeMap: IKeyValue<number>; // {'img': 1000, 'img_s': 300, ...}

    constructor(
        protected uploadsService: CUploadsService,
        protected appService: CAppService,
    ) {}

    protected async buildImg(x: IImagable, uploads: Express.Multer.File[]): Promise<void> {
        // if img set to null, then clear all additional fields
        if (!x.img) {
            this.resetImg(x);
            return;
        }        
        
        // process upload
        const upload = uploads.find(u => u.fieldname === "img");
        if (!upload) return;
        const resizeValues = Object.values(this.resizeMap);
        const paths = await this.uploadsService.imgUploadResize(upload, this.folder, resizeValues);
        let i = 0;

        for (let field in this.resizeMap) {
            x[field] = paths[i++];
        }        
    }  
    
    protected resetImg(x: IImagable): void {
        for (let field in this.resizeMap) {
            x[field] = null;
        }
    }

    protected async deleteUnbindedImg(current: IImagable): Promise<void>;
    protected async deleteUnbindedImg(current: IImagable[]): Promise<void>;
    protected async deleteUnbindedImg(current: IImagable, old: IImagable): Promise<void>;
    protected async deleteUnbindedImg(current: IImagable | IImagable[], old?: IImagable): Promise<void> {
        if (old === undefined) {
            if (Array.isArray(current)) {
                for (let x of current) {
                    for (let field in this.resizeMap) {
                        if (x[field]) {
                            await this.uploadsService.fileDelete(`images/${this.folder}/${x[field]}`);
                        }
                    }
                }
            } else {
                for (let field in this.resizeMap) {
                    if (current[field]) {
                        await this.uploadsService.fileDelete(`images/${this.folder}/${current[field]}`);
                    }
                }                
            }
        } else {
            if ((current as IImagable).img !== old.img && old.img) { // got new img data
                for (let field in this.resizeMap) {
                    this.uploadsService.fileDelete(`images/${this.folder}/${old[field]}`);
                }                
            }
        }
    }
}
