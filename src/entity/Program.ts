import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, ManyToOne, OneToOne, JoinColumn
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Doctor, Patient, Pharmacy, Price, ProgramEvidence, ProgramType, TestLab } from ".";

@Entity()
export class Program {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ nullable: true })
  isApproved: boolean

  @Column({ nullable: true })
  isDrugsTaken: boolean

  @Column({ nullable: true })
  isTerminated: boolean

  @Column({ nullable: true })
  enrollDate: Date

  @Column({ nullable: true })
  drugsTakenDate: Date

  @Column({ nullable: true })
  terminatedMessage: String

  @Column({ nullable: true })
  terminatedDate: Date

  @Column({ nullable: true })
  carryOverDate: Date

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

  @ManyToOne(() => TestLab, (testLab) => testLab.programs)
  testLab: TestLab;

  @ManyToOne(() => Price, (price) => price.programs)
  price: Price;

  @ManyToOne((type) => Program, (program) => program.nextPrograms)
  prevProgram: Program;

  @OneToMany((type) => Program, (program) => program.prevProgram)
  nextPrograms: Program[];

  // @OneToOne(() => TestLab)
  // @JoinColumn()
  // testLab: TestLab;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}