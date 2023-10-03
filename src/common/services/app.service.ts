import { Injectable } from "@nestjs/common";
import { spawn } from "child_process";
import { IDate } from "src/model/date.interface";
import { IChildable } from "src/model/childable.interface";
import { Repository } from "typeorm";
import * as Mime from "mime-types";

@Injectable()
export class CAppService {
    ////////////////////////
    // strings
    ////////////////////////

    public isNumeric(str: string): boolean { // if string can be converted to number
        return !isNaN(parseFloat(str));
    }

    public twoDigits(n: number): string {
        return (n < 10) ? `0${n}` : `${n}`;
    }  

    ////////////////////////
    // dates
    ////////////////////////

    public humanDate(date: Date, withTime = false): string {
        if (!date) return "";
        return withTime ? 
            `${this.twoDigits(date.getDate())}.${this.twoDigits(date.getMonth()+1)}.${date.getFullYear()} ${this.twoDigits(date.getHours())}:${this.twoDigits(date.getMinutes())}` : 
            `${this.twoDigits(date.getDate())}.${this.twoDigits(date.getMonth()+1)}.${date.getFullYear()}`;
    }

    public mysqlDate(date: Date, format: "date" | "datetime-short" | "datetime" = "date"): string {
        if (!date) return "";

        switch (format) {
            case "date":
                return `${date.getFullYear()}-${this.twoDigits(date.getMonth()+1)}-${this.twoDigits(date.getDate())}`;
            case "datetime":
                return `${date.getFullYear()}-${this.twoDigits(date.getMonth()+1)}-${this.twoDigits(date.getDate())} ${this.twoDigits(date.getHours())}:${this.twoDigits(date.getMinutes())}:${this.twoDigits(date.getSeconds())}`;
            case "datetime-short":
                return `${date.getFullYear()}-${this.twoDigits(date.getMonth()+1)}-${this.twoDigits(date.getDate())} ${this.twoDigits(date.getHours())}:${this.twoDigits(date.getMinutes())}`;
        }
    } 
    
    public isDateValid(date: any): boolean {
        return !isNaN(date) && date instanceof Date;
    }

    public splitMysqlDate(date: string): IDate {
        const parts = date.split('-').map(p => parseInt(p));
        return {
            year: parts[0],
            month: parts[1],
            day: parts[2],
        };
    }

    // 2020-01-02 -> 02.01.2020
    public mysqlDateToHumanDate(date: string): string {
        const sections = date.split("-");
        return `${sections[2]}.${sections[1]}.${sections[0]}`;
    }

    public age(birthdate: Date): number {
        var diff = Date.now() - birthdate.getTime();
        var ageDate = new Date(diff); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    public daysInMonth(month: number, year: number): number {
        return 32 - new Date(year, month, 32).getDate()
    }
    
    ////////////////////////
    // processes
    //////////////////////// 

    public spawn(cmd: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const process = spawn(cmd, {shell: true});     
            process.on("error", err => reject(err)); // start failed
            process.on("close", code => code ? reject(`spawn [${cmd}] failed with code ${code}`) : resolve(code));
            process.stdout.on('data', data => console.log(data.toString()));
            process.stderr.on('data', (data) => console.error(`stderr: ${data}`));          
        });
    }

    ////////////////////////
    // randomizing
    ////////////////////////

    public random(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public randomString(length: number, mode: string = "full"): string {
        let result: string = '';
        let characters: string = "";
        
        if (mode === "full") characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        if (mode === "lowercase") characters = "abcdefghijklmnopqrstuvwxyz0123456789";
        if (mode === "digits") characters = "0123456789"; 
        if (mode === "hex") characters = "0123456789abcdef";        
        
        var charactersLength = characters.length;
        
        for (let i: number = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        
        return result;
    }

    ////////////////////////
    // arrays
    ////////////////////////

    public arrayUnique(array: any[]): any[] {
        return [...new Set(array)];
    }

    public arraySplit(array: any[], chunkLength: number): any[][] {
        const chunks = [];

        for (let i = 0; i < array.length; i += chunkLength) {
            const chunk = array.slice(i, i + chunkLength);
            chunks.push(chunk);
        }

        return chunks;
    }

    public range(a: number, b: number): number[] {
        const arr: number[] = [];

        for (let i = a; i <= b; i++) {
            arr.push(i);
        }

        return arr;
    }  

    public arrayHasUndefined(array: any[]): boolean {
        for (let x of array) {
            if (x === undefined) {
                return true;
            }
        }

        return false;
    }

    // разбиение массива с балансировкой - разбиваем на N максимально равных групп (если 25 делим на три группы, то получаем две группы по 8 и одну по 9)
    public balancedChunkify(arr: any[], n: number): any[] {
        if (n < 2) return [arr];
    
        const len = arr.length;
        const out = [];
        let i = 0;
        let size;
    
        if (len % n === 0) {
            size = Math.floor(len / n);

            while (i < len) {
                out.push(arr.slice(i, i += size));
            }
        } else {
            while (i < len) {
                size = Math.ceil((len - i) / n--);
                out.push(arr.slice(i, i += size));
            }
        }
    
        return out;
    }

    ////////////////////////
    // models
    ////////////////////////

    public async buildChildren(x: IChildable, repository: Repository<any>, sortBy: string, sortDir: number, onlyActive: boolean = false, relations: string[] = []): Promise<IChildable[]> {
        const where: any = {parent_id: x.id};
        onlyActive && (where.active = true);
        const children = await repository.find({where, order: {[sortBy]: sortDir}, relations});

        for (let child of children) {
            child.children = await this.buildChildren(child, repository, sortBy, sortDir, onlyActive, relations);
        }

        return children;
    }

    public tree2list(tree: IChildable[]): IChildable[] {
        let list: IChildable[] = [];
        const buildChildren = (children: IChildable[], level: number) => {            
            let res: IChildable[] = [];
            
            for (let child of children) {
                child._level = level;
                child._shift = "";

                for (let i: number = 0; i < level; i++) {
                    child._shift += "&nbsp;&nbsp;&nbsp;";
                }

                res.push(child);
                res = res.concat(buildChildren(child.children as IChildable[], level+1));
            }     
            
            return res;
        };

        for (let x of tree) {
            list.push(x);
            list = list.concat(buildChildren(x.children as IChildable[], 1));
        }
        
        return list;
    }  

    ////////////////////////
    // files
    ////////////////////////

    public getFileExtensionByName(filename: string): string {
        return /(?:\.([^.]+))?$/.exec(filename)[1] || "dat";
    }
    
    public getFileExtensionByData(data: string): string {
        const mimeString = this.getContentType(data);
        return Mime.extension(mimeString) || "txt";
    }

    public getContentType(data: string): string {
        return data.substring(data.indexOf(":")+1, data.indexOf(";"));
    }

    ////////////////////////
    // misc
    ////////////////////////

    public pause(ms: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), ms);
        });
    } 
}
