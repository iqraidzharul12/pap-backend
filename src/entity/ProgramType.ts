import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { TestlabType } from ".";

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

  @OneToMany((type) => TestlabType, (testLabType) => testLabType.programType)
  testLabTypes: TestlabType[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
