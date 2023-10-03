import { Column, PrimaryGeneratedColumn } from "typeorm";

export abstract class CEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({nullable: false, default: false})
    public defended: boolean;

    // utils
    protected random(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}