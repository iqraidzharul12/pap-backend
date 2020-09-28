import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Length, IsNotEmpty, IsEmail } from "class-validator";
import * as bcrypt from "bcryptjs";
import { TestLab } from ".";

@Entity()
export class Patient {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  fullname: string;

  @Column()
  @IsNotEmpty()
  dateOfBirth: Date;

  @Column()
  @Length(16)
  idNumber: string;

  @Column()
  @IsNotEmpty()
  idPicture: string;

  @Column()
  @IsNotEmpty()
  selfiePicture: string;

  @Column()
  @IsNotEmpty()
  gender: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @IsNotEmpty()
  @Length(8)
  password: string;

  @Column()
  @IsNotEmpty()
  representativeName: string;

  @Column()
  @IsNotEmpty()
  representativePhone: string;

  @Column()
  @IsNotEmpty()
  representativeRelationship: string;

  @Column()
  @IsNotEmpty()
  status: number;

  @OneToMany(() => TestLab, (testLab) => testLab.patient)
  testLabs: TestLab[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
