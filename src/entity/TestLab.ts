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
export class Testlab {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @ManyToOne((type) => Patient, (patient) => patient.testLabs)
  patient: Patient;

  @ManyToOne((type) => TestlabType, (testLabType) => testLabType.testLabs)
  testLabType: TestlabType;

  @ManyToOne((type) => Laboratorium, (laboratorium) => laboratorium.testLabs)
  laboratorium: Laboratorium;

  @ManyToOne((type) => Doctor, (doctor) => doctor.testLabs)
  doctor: Doctor;

  @OneToMany(
    (type) => TestLabEvidence,
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
