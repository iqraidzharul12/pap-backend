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
import { Doctor, Laboratorium, Patient, Program, TestLabEvidence, TestLabType, Voucher } from ".";

@Entity()
export class TestLab {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.testLabs)
  patient: Patient;

  @ManyToOne(() => TestLabType, (testLabType) => testLabType.testLabs)
  testLabType: TestLabType;

  @ManyToOne(() => Laboratorium, (laboratorium) => laboratorium.testLabs)
  laboratorium: Laboratorium;

  @ManyToOne(() => Voucher, (voucher) => voucher.testLabs)
  voucher: Voucher;

  @ManyToOne(() => Doctor, (doctor) => doctor.testLabs)
  doctor: Doctor;

  @OneToMany(
    () => TestLabEvidence,
    (testLabEvidence) => testLabEvidence.testLab
  )
  testLabEvidences: TestLabEvidence[];

  @OneToMany(
    () => Program,
    (program) => program.testLab
  )
  programs: Program[];

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
