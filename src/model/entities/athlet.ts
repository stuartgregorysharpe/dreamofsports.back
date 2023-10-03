import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { CUser } from "./user";
import { CCountry } from "./country";
import { CCat } from "./cat";
import { CAthletTranslation } from "./athlet.translation";
import { CEntity } from "./_entity";
import { CReward } from "./reward";

export type TGender = "m" | "f";

@Entity({name: "a7_athlets"})
export class CAthlet extends CEntity {
    @Column({nullable: false})
    public user_id: number;

    @Column({nullable: true, default: null})
    public cat_id: number;

    @Column({nullable: true, default: null})
    public country_id: number;

    @Index()
    @Column({nullable: true, default: null})
    public img: string;

    @Index()
    @Column({nullable: true, default: null})
    public img_s: string;

    @Index()
    @Column({nullable: false, default: 1})
    public category: number;

    @Column({type:"text", nullable: true, default: null})
    public metrics: string;

    @Index()
    @Column({nullable: false, default: "Athlet"})
    public sub_type: string;

    @Index()
    @Column({type: "date", nullable: true, default: null})
    public birthdate: string;

    @Index()
    @Column({type: "enum", enum: ["m", "f"], nullable: false, default: "m"})
    public gender: TGender;

    @Column({nullable: true, default: null, type: "float"})
    public height_meter: number;

    @Column({nullable: true, default: null, type: "float"})
    public height_foot: number;

    @Column({nullable: true, default: null, type: "float"})
    public weight_kg: number;

    @Column({nullable: true, default: null, type: "float"})
    public weight_pound: number;

    @Column({nullable: true, default: null})
    public no: string; // номер игрока на всякий случай пусть будет string
    
    // relations
    @OneToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "user_id"})
    public user: CUser;

    @ManyToOne(type => CCountry, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
    @JoinColumn({name: "country_id"})
    public country: CCountry;

    @ManyToOne(type => CCat, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
    @JoinColumn({name: "cat_id"})
    public cat: CCat;

    @OneToMany(type => CAthletTranslation, translation => translation.athlet, {cascade: true})
    public translations: CAthletTranslation[];

    @OneToMany(type => CReward, reward => reward.athlet, {cascade: true})
    public rewards: CReward[];

    // utils
    public fakeInit(counter: number): CAthlet {        
        this.cat_id = [17,18,19,23,24][this.random(0,4)];
        this.country_id = [2,3,4,5,6][this.random(0,4)];
        this.birthdate = `${this.random(1980,2005)}-${this.random(1,12)}-${this.random(1,28)}`;
        this.gender = ["m", "f"][this.random(0,1)] as TGender;
        this.height_meter = this.random(160,200) / 100;
        this.height_foot = parseFloat((this.height_meter * 3.3).toFixed(1));
        this.weight_kg = this.random(40, 100);
        this.weight_pound = parseFloat((this.weight_kg * 2.2).toFixed(1));
        this.no = this.random(1,10).toString();
        
        const t1 = new CAthletTranslation();
        t1.lang_id = 1;
        t1.firstname = `Firstname ${counter}`;
        t1.lastname = `Lastname ${counter}`;
        t1.region = `Region name ${counter}`;
        t1.city = `City name ${counter}`;
        t1.bio = `Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography\n\nText of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography Text of biography`;
        t1.team = `Team name ${counter}`;
        t1.role = `My role ${counter}`;

        const t2 = new CAthletTranslation();
        t2.lang_id = 2;
        t2.firstname = `Имя ${counter}`;
        t2.lastname = `Фамилия ${counter}`;
        t2.region = `Название региона ${counter}`;
        t2.city = `Город ${counter}`;
        t2.bio = `Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии\n\nТекст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии Текст биографии`;
        t2.team = `Название команды ${counter}`;
        t2.role = `Роль в команде ${counter}`;

        const t3 = new CAthletTranslation();
        t3.lang_id = 17;
        t3.firstname = `اسم ${counter}`;
        t3.lastname = `اسم العائلة ${counter}`;
        t3.region = `اسم المنطقة ${counter}`;
        t3.city = `مدينة ${counter}`;
        t3.bio = `سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص سيرة ذاتية نص \n\n نص السيرة الذاتية نص السيرة الذاتية نص السيرة الذاتية نص السيرة الذاتية نص السيرة الذاتية نص السيرة الذاتية نص السيرة الذاتية نص السيرة الذاتية نص السيرة الذاتية نص السيرة الذاتية نص السيرة الذاتية نص السيرة الذاتية نص السيرة الذاتية`;
        t3.team = `اسم الفريق ${counter}`;
        t3.role = `دور في الفريق ${counter}`;

        this.translations = [t1,t2,t3];        
        return this;
    }
}