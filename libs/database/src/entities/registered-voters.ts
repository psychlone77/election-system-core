import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('registered_voters')
export class RegisteredVoters {
  @PrimaryColumn()
  NIC: string;

  @Column()
  public_key: string;

  @Column({ name: 'token_issued', default: false })
  token_issued: boolean;
}
