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
import { Doctor, Laboratorium, Patient, TestLabEvidence, TestlabType } from ".";

@Entity()
export class TestLab {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.testLabs)
  patient: Patient;

  @ManyToOne(() => TestlabType, (testLabType) => testLabType.testLabs)
  testLabType: TestlabType;

  @ManyToOne(() => Laboratorium, (laboratorium) => laboratorium.testLabs)
  laboratorium: Laboratorium;

  @ManyToOne(() => Doctor, (doctor) => doctor.testLabs)
  doctor: Doctor;

  @OneToMany(
    () => TestLabEvidence,
    (testLabEvidence) => testLabEvidence.testLab
  )
  testLabEvidences: TestLabEvidence[];

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
