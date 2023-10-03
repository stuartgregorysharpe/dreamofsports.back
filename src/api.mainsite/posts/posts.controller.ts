import { Body, Controller, Param, Post, UseGuards, Req, Request, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { IPost } from "./dto/post.interface";
import { CPostService } from "./posts.service";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { JwtService } from "@nestjs/jwt";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IPostComment } from "../post.attachment/dto/post.comment.interface";

@Controller('api/mainsite/posts')
export class CPostController {
    constructor (
        private postService: CPostService,
        private jwtService: JwtService
    ) {}

    // @Post("mine")
    // public myPost(@Body() dto: IGetList): Promise<IResponse<IPost[]>> {
    //     return this.postService.myPost(dto);
    // }

    // @Post("favorite")
    // public favorite(@Body() dto: IGetList): Promise<IResponse<IPost[]>> {
    //     return this.postService.favorite(dto);
    // }
    
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<IPost[]>> {
        return this.postService.chunk(dto);
    }

    @Post("one/:id")
    public one(@Param("id") id: number): Promise<IResponse<IPost>> {
        return this.postService.one(id);
    }    

    @UseGuards(CUserGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("create")
    public create(@Body() dto: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[], @Req() request: Request): Promise<IResponse<IPost>> {
        const token = request.headers["token"] as string;
        const user_id = this.jwtService.decode(token)["id"] as number;
        return this.postService.create(user_id, dto, uploads);
    }

    @Post("get-comments/:id")
    public getComments(@Param("id") id:number): Promise<IResponse<IPostComment[]>> {
        return this.postService.getComments(id);
    }

    @UseGuards(CUserGuard)
    @Post("toggle-like/:id")
    public toggleLike(@Param("id") post:number, @Req() request: Request): Promise<IResponse<boolean>> {
        const token = request.headers["token"] as string;
        const user_id = this.jwtService.decode(token)["id"] as number;
        return this.postService.toggleLike(user_id, post, "like");
    }

    @UseGuards(CUserGuard)
    @Post("toggle-save/:id")
    public toggleSave(@Param("id") post:number, @Req() request: Request): Promise<IResponse<boolean>> {
        const token = request.headers["token"] as string;
        const user_id = this.jwtService.decode(token)["id"] as number;
        return this.postService.toggleLike(user_id, post, "save");
    }

    @UseGuards(CUserGuard)
    @Post("block/:id")
    public block(@Param("id") post:number, @Req() request: Request): Promise<IResponse<boolean>> {
        const token = request.headers["token"] as string;
        const user_id = this.jwtService.decode(token)["id"] as number;
        return this.postService.toggleLike(user_id, post, "block");
    }

    @UseGuards(CUserGuard)
    @Post("delete/:id")
    public delete(@Param("id") post:number, @Req() request: Request): Promise<IResponse<boolean>> {
        const token = request.headers["token"] as string;
        const user_id = this.jwtService.decode(token)["id"] as number;
        return this.postService.delete(user_id, post, "save");
    }

    @UseGuards(CUserGuard)
    @Post("comment/:id")
    public comment(@Param("id") post: number, @Body() dto: IPostComment, @Req() request: Request) {
        const token = request.headers["token"] as string;
        const user_id = this.jwtService.decode(token)["id"] as number;
        return this.postService.comment(user_id, post, dto);
    }

    @UseGuards(CUserGuard)
    @Post("if-like/:id")
    public ifLike(@Param("id") post:number, @Body() dto, @Req() request: Request): Promise<IResponse<boolean>> {
        const token = request.headers["token"] as string;
        const user_id = this.jwtService.decode(token)["id"] as number;
        return this.postService.ifLike(user_id, post, dto.type);
    }
}
