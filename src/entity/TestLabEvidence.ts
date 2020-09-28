import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Testlab } from ".";

@Entity()
export class TestLabEvidence {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  url: string;

  @ManyToOne((type) => Testlab, (testLab) => testLab.testLabEvidences)
  testLab: Testlab;

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
