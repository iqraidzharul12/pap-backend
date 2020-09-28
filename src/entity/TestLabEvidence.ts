import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { TestLab } from ".";

@Entity()
export class TestLabEvidence {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  url: string;

  @ManyToOne(() => TestLab, (testLab) => testLab.testLabEvidences)
  testLab: TestLab;

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
