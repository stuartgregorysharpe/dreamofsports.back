import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { CUser } from "./user";
import { CFirmTranslation } from "./firm.translation";
import { CCountry } from "./country";
import { CEntity } from "./_entity";

@Entity({name: "a7_firms"})
export class CFirm extends CEntity {
    @Column({nullable: false})
    public user_id: number;

    @Index()
    @Column({nullable: true, default: null})
    public img: string;

    @Index()
    @Column({nullable: true, default: null})
    public img_s: string;

    @Column({nullable: true, default: null})
    public reg_no: string;

    @Column({nullable: true, default: "firm"})
    public sub_type: string;

    @Column({type: "date", nullable: true, default: null})
    public reg_date: string;

    @Column({nullable: true, default: null})
    public reg_country_id: number;

    @Column({nullable: true, default: null})
    public fact_country_id: number;
    
    // relations
    @OneToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "user_id"})
    public user: CUser;

    @OneToMany(type => CFirmTranslation, translation => translation.firm, {cascade: true})
    public translations: CFirmTranslation[];

    @ManyToOne(type => CCountry, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
    @JoinColumn({name: "reg_country_id"})
    public reg_country: CCountry;

    @ManyToOne(type => CCountry, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
    @JoinColumn({name: "fact_country_id"})
    public fact_country: CCountry;

    // utils
    public fakeInit(counter: number): CFirm {        
        this.reg_no = this.random(10000000, 200000000).toString();
        this.reg_date = `${this.random(1980,2005)}-${this.random(1,12)}-${this.random(1,28)}`;
        this.reg_country_id = [2,3,4,5,6][this.random(0,4)];
        this.fact_country_id = [2,3,4,5,6][this.random(0,4)];

        const t1 = new CFirmTranslation();
        t1.lang_id = 1;
        t1.name = `Company name ${counter}`;
        t1.branch = `Branch name ${counter}`;
        t1.founder = `Founder name ${counter}`;
        t1.reg_addr = `Registration address ${counter}`;
        t1.fact_addr = `Actual address ${counter}`;
        t1.about = `About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company\n\nAbout this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company About this company`;

        const t2 = new CFirmTranslation();
        t2.lang_id = 2;
        t2.name = `Название компании ${counter}`;
        t2.branch = `Вид деятельности ${counter}`;
        t2.founder = `Имя основателя ${counter}`;
        t2.reg_addr = `Адрес регистрации ${counter}`;
        t2.fact_addr = `Фактический адрес ${counter}`;
        t2.about = `Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании\n\nТекст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании Текст о компании`;

        const t3 = new CFirmTranslation();
        t3.lang_id = 17;
        t3.name = `اسم الشركة ${counter}`;
        t3.branch = `نوع النشاط ${counter}`;
        t3.founder = `اسم المؤسس ${counter}`;
        t3.reg_addr = `عنوان التسجيل ${counter}`;
        t3.fact_addr = `العنوان الفعلي ${counter}`;
        t3.about = `نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة\n\nنص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة نص عن الشركة`;

        this.translations = [t1,t2,t3];    
        return this;
    }
}