import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsNotEmpty } from "class-validator";

@Entity()
export class News {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  title: String;

  @Column()
  body: String;

  @Column({ nullable: true })
  image: String;

  @Column({ nullable: true })
  writer: String;


  @Column({ nullable: true })
  tag: String;

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
