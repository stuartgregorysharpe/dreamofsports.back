import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, UpdateDateColumn } from "typeorm";
import { CEntity } from "./_entity";
import { CAthlet } from "./athlet";
import { CFirm } from "./firm";
import { CUserImage } from "./user.image";
import { CUserVideo } from "./user.video";
import { CUserOther } from "./user.other";
import { CLang } from "./lang";
import { CUserPhone } from "./user.phone";
import { CUserEmail } from "./user.email";
import { CUserLink } from "./user.link";
import { CUserSocial } from "./user.social";
import { CFavorite } from "./favorite";
import { CPost } from "./posts";
import { CUserFollow } from "./user.follow";

export type TUserType = "athlet" | "firm" | "fan";

@Entity({name: "a7_users"})
export class CUser extends CEntity {
    @Column({nullable: false, default: 1})
    public lang_id: number;

    @Index()
    @Column({type: "enum", enum: ["athlet", "firm", "fan"], nullable: false, default: "athlet"})
    public type: TUserType;

    @Column({nullable: false, unique: true})
    public email: string;

    @Column({nullable: false, select: false})
    public password: string;

    @Column({nullable: false, default: true})
    public active: boolean;

    @Column({nullable: false, default: false})
    public filled: boolean;

    @Index()
    @Column({type:"timestamp", nullable: true, default: null})
    public payed_at: Date;

    @Index()
    @Column({type:"timestamp", nullable: true, default: null})
    public payed_until: Date;

    @Index()
    @CreateDateColumn({nullable: false, type: "timestamp"}) 
    public created_at: Date;

    @UpdateDateColumn({nullable: false, type: "timestamp", select: false})
    public updated_at: Date; 

    // relations
    @ManyToOne(type => CLang, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
    @JoinColumn({name: "lang_id"})
    public lang: CLang; 
    
    @OneToOne(type => CAthlet, athlet => athlet.user, {onDelete:"RESTRICT", onUpdate: "CASCADE", cascade: true})
    public athlet: CAthlet; // профайл спортсмена

    @OneToOne(type => CFirm, firm => firm.user, {onDelete:"RESTRICT", onUpdate: "CASCADE", cascade: true})
    public firm: CFirm; // профайл компании

    @OneToMany(type => CUserPhone, phone => phone.user, {cascade: true})
    public phones: CUserPhone[];

    @OneToMany(type => CUserEmail, email => email.user, {cascade: true})
    public emails: CUserEmail[];

    @OneToMany(type => CUserLink, link => link.user, {cascade: true})
    public links: CUserLink[];

    @OneToMany(type => CUserSocial, social => social.user, {cascade: true})
    public socials: CUserSocial[];

    @OneToMany(type => CUserImage, image => image.user, {cascade: true})
    public images: CUserImage[];

    @OneToMany(type => CUserVideo, video => video.user, {cascade: true})
    public videos: CUserVideo[];

    @OneToMany(type => CUserOther, other => other.user, {cascade: true}) 
    public others: CUserOther[]; // это "прочие файлы"

    @OneToMany(type => CFavorite, favorite => favorite.user, {cascade: false}) 
    public favorites: CFavorite[]; 

    @OneToMany(type => CPost, post => post.user, {cascade: false}) 
    public posts: CPost[]; 

    @OneToMany(type => CUserFollow, follow => follow.user, {cascade: false}) 
    public followers: CUserFollow[]; 

    // utils
    public fakeInit(type: TUserType, counter: number): CUser {
        this.lang_id = 1;
        this.type = type;
        this.email = `test${counter}@test.test`;
        this.password = "123";
        this.active = true;
        this.filled = true;
        this.payed_at = new Date();
        this.payed_at.setDate(this.payed_at.getDate() - this.random(1,100));
        this.payed_until = new Date();
        this.payed_until.setFullYear(this.payed_until.getFullYear() + this.random(0,3));
        this.athlet = new CAthlet().fakeInit(counter);
        this.firm = new CFirm().fakeInit(counter);        
        return this;
    }
}
