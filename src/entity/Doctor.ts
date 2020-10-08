import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { IsNotEmpty, IsEmail, Length } from "class-validator";
import { Program, TestLab } from ".";

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  fullname: string;

  @Column()
  @IsNotEmpty()
  dateOfBirth: Date;

  @Column()
  @Length(16)
  idNumber: string;

  @Column()
  @IsNotEmpty()
  idPicture: string;

  @Column()
  @IsNotEmpty()
  selfiePicture: string;

  @Column()
  @IsNotEmpty()
  gender: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  @IsNotEmpty()
  code: string;

  @Column()
  @IsNotEmpty()
  status: number;

  @OneToMany(() => TestLab, (testLab) => testLab.doctor)
  testLabs: TestLab[];

  @OneToMany(() => Program, (program) => program.doctor)
  programs: Program[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
