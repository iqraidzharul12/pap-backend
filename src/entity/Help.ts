import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsNotEmpty } from "class-validator";

@Entity()
export class Help {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  title: String;

  @Column()
  body: String;

  @Column()
  subcategory: String;

  @Column()
  category: String;

  @Column()
  @IsNotEmpty()
  status: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}