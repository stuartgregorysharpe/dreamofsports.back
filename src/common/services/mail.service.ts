import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as Nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/sendmail-transport";
import { CSetting } from "src/model/entities/setting";
import { CErrorsService } from "./errors.service";
import { CMailtemplate } from "src/model/entities/mailtemplate";
import { IMailtemplateData } from "src/model/mailtemplate.data.inteface";
import { CMessage } from "src/model/entities/message";
import { cfg } from "src/app.config";
import { CAppService } from "./app.service";

@Injectable()
export class CMailService {
    constructor(
        @InjectRepository(CSetting) private settingRepository: Repository<CSetting>,
        @InjectRepository(CMailtemplate) private mailtemplateRepository: Repository<CMailtemplate>,  
        private errorsService: CErrorsService,
        private appService: CAppService,
    ) {}

    public async adminEmailVerification(email: string, code: string): Promise<void> {
        try {    
            const subject: string = "E-mail verification for A7 administration panel";
            const content: string = `Your security code: ${code}`;
            await this.send(email, subject, content);                 
        } catch (err) {
            await this.errorsService.log("CMailService.adminEmailVerification", err);
        }
    }

    public async adminMessage(email: string, message: CMessage): Promise<void> {
        try {    
            const subject: string = `New message on ${cfg.mainsiteUrl} site`;
            const content: string = `
                <table>
                <tr><td><strong>Name:</strong></td><td>${message.name}</td></tr>
                <tr><td><strong>E-mail:</strong></td><td>${message.email}</td></tr>
                <tr><td valign='top'><strong>Content:</strong></td><td>${message.content}</td></tr>
                </table>
            `;
            await this.send(email, subject, content);                 
        } catch (err) {
            await this.errorsService.log("CMailService.adminMessage", err);
        }
    }

    public async adminComplaint(email: string, url: string, text: string): Promise<void> {
        try {    
            const subject: string = `New complaint on ${cfg.mainsiteUrl} site`;
            const content: string = `
                <table>
                <tr><td><strong>Link:</strong></td><td>${url}</td></tr>
                <tr><td valign='top'><strong>Content:</strong></td><td>${text}</td></tr>
                </table>
            `;
            await this.send(email, subject, content);                 
        } catch (err) {
            await this.errorsService.log("CMailService.adminMessage", err);
        }
    }

    public async userEmailVerification(email: string, lang_id: number, code: string): Promise<void> {
        try {    
            const mtd = await this.getMailtemplateData("verification", lang_id);             
            const subject: string = mtd.subject;
            const content: string = mtd.content                
                .replace(/{{code}}/g, code);
            await this.send(email, subject, content);
        } catch (err) {
            await this.errorsService.log("CMailService.userEmailVerification", err);
        }
    }

    public async userSubscriptionEnds(email: string, lang_id: number, date: string): Promise<void> {
        try {    
            const mtd = await this.getMailtemplateData("subscription-ends", lang_id); 
            const subject: string = mtd.subject;
            const content: string = mtd.content                
                .replace(/{{date}}/g, date)
                .replace(/{{url}}/g, cfg.mainsiteUrl);
            await this.send(email, subject, content);
        } catch (err) {
            await this.errorsService.log("CMailService.userSubscriptionEnds", err);
        }
    }

    public async userSubscriptionProlonged(email: string, lang_id: number, date: string): Promise<void> {
        try {    
            const mtd = await this.getMailtemplateData("subscription-prolonged", lang_id); 
            const subject: string = mtd.subject;
            const content: string = mtd.content                
                .replace(/{{date}}/g, date)
                .replace(/{{url}}/g, cfg.mainsiteUrl);
            await this.send(email, subject, content);
        } catch (err) {
            await this.errorsService.log("CMailService.userSubscriptionProlonged", err);
        }
    }

    /////////////////////
    // utils    
    /////////////////////

    private async send(to: string, subject: string, html: string): Promise<void> {        
        const host = (await this.settingRepository.findOne({where: {p: "smtp-host"}}))?.v;                
        const port = (await this.settingRepository.findOne({where: {p: "smtp-port"}}))?.v;                                
        const login = (await this.settingRepository.findOne({where: {p: "smtp-login"}}))?.v;
        const from = (await this.settingRepository.findOne({where: {p: "smtp-from"}}))?.v;           
        const pw = (await this.settingRepository.findOne({where: {p: "smtp-pw"}}))?.v;
        const secure = (await this.settingRepository.findOne({where: {p: "smtp-secure"}}))?.v;
        const hostname = (await this.settingRepository.findOne({where: {p: "smtp-hostname"}}))?.v;

        if (this.appService.arrayHasUndefined([host, port, login, from, pw, secure, hostname])) {
            throw new Error("some SMTP setting not found");
        }    
                
        const transporter = Nodemailer.createTransport({host, name: hostname, port: parseInt(port), secure: secure === "true", auth: {user: login, pass: pw}});        
        const data = await transporter.sendMail({from, to, subject, html});            
        console.log(`Email sent: ${new Date()}, ${data.response}`);               
    }   
    
    private async getMailtemplateData(name: string, lang_id: number): Promise<IMailtemplateData> {
        const mt = await this.mailtemplateRepository.findOne({where: {name}, relations: ["translations"]});            
        
        if (!mt) {
            throw new Error("mailtemplate not found");
        }

        const mtt = mt.translations.find(t => t.lang_id === lang_id);
        const subject = mtt?.subject || "";
        const content = mtt?.content || "";
        return {subject, content};
    }

    private buildCycledFragment(content: string, array: any[], arrayName: string, arrayElementName: string, arrayElementFields: string[]): string {
        const cycledRawStart = `{{foreach ${arrayName} ${arrayElementName}}}`;
        const cycledRawEnd = "{{endforeach}}";
        const cycledRawStartPos = content.indexOf(cycledRawStart) + cycledRawStart.length;            
        const cycledRawEndPos = content.indexOf(cycledRawEnd, cycledRawStartPos);
        const cycledRawInner = content.substr(cycledRawStartPos, cycledRawEndPos - cycledRawStartPos);
        const cycledRaw = cycledRawStart + cycledRawInner + cycledRawEnd;
        let cycledCompiled = "";

        for (let x of array) {
            let item = cycledRawInner;

            for (let field of arrayElementFields) {
                let expressionToReplace = new RegExp(`{{${arrayElementName}.${field}}}`, "g");
                item = item.replace(expressionToReplace, x[field] || "");
            }            
            
            cycledCompiled += item;
        }

        return content.replace(cycledRaw, cycledCompiled);
    }     
}
