import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { TestLabType } from ".";

@Entity()
export class ProgramType {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  status: number;

  @Column()
  @IsNotEmpty()
  description: string;

  @OneToMany((type) => TestLabType, (testLabType) => testLabType.programType)
  testLabTypes: TestLabType[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
