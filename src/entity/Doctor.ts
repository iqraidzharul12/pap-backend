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
  @Length(16)
  idNumber: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  isApproved: boolean;

  @Column({ nullable: true })
  message: String;

  @Column()
  @IsNotEmpty()
  status: number;

  @Column({ nullable: true })
  consent: String;

  @Column({ nullable: true })
  hospital: String;

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
