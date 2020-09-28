import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { ProgramType, Testlab } from ".";

@Entity()
export class Laboratorium {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  address: string;

  @Column()
  @IsNotEmpty()
  status: number;

  @OneToMany((type) => Testlab, (testLab) => testLab.laboratorium)
  testLabs: Testlab[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
