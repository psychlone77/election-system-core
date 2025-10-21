import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'admins' })
export class Admin {
  @PrimaryColumn()
  email: string;

  @Column()
  password: string;
}
