import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ballot_storage')
export class BallotStorage {
  @PrimaryGeneratedColumn('uuid')
  ballot_id: string;

  @Column('text')
  encrypted_ballot: string;

  @Column()
  iv: string;

  @Column()
  tag: string;

  @Column()
  signature: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
