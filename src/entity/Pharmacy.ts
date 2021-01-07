import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { IsEmail, IsNotEmpty, Length } from "class-validator";
import { Program } from ".";
import * as bcrypt from "bcryptjs";

@Entity()
export class Pharmacy {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  address: string;

  @Column({ nullable: true })
  city: String;

  @Column({ nullable: true })
  certificate: String;

  @Column({ nullable: true })
  isApproved: boolean;

  @Column({ nullable: true })
  message: String;

  @Column({ unique: true , nullable: true })
  @IsEmail()
  email: string;

  @Column()
  @IsNotEmpty()
  @Length(8)
  password: string;

  @Column()
  @IsNotEmpty()
  status: number;

  @OneToMany(() => Program, (program) => program.pharmacy)
  programs: Program[];

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
