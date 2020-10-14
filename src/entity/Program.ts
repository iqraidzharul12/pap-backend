import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, ManyToOne, OneToOne, JoinColumn
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Doctor, Patient, Pharmacy, ProgramEvidence, ProgramType, TestLab } from ".";

@Entity()
export class Program {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.programs)
  patient: Patient;

  @ManyToOne(() => ProgramType, (programType) => programType.programs)
  programType: ProgramType;

  @ManyToOne(() => Pharmacy, (pharmacy) => pharmacy.programs)
  pharmacy: Pharmacy;

  @ManyToOne(() => Doctor, (doctor) => doctor.programs)
  doctor: Doctor;

  @OneToMany(
    () => ProgramEvidence,
    (programEvidence) => programEvidence.program
  )
  programEvidences: ProgramEvidence[];

  @Column()
  @IsNotEmpty()
  status: number;

  @Column({ nullable: true })
  checkPoint: number;

  @Column({ nullable: true })
  message: String;

  @OneToOne(() => TestLab)
  @JoinColumn()
  testLab: TestLab;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}