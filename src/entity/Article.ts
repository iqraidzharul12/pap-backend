import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsNotEmpty } from "class-validator";

@Entity()
export class Article {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  title: String;

  @Column()
  body: String;

  @Column()
  image: String;

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
