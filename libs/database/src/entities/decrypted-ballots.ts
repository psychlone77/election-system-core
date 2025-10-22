import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('decrypted_ballots')
export class DecryptedBallot {
  @PrimaryColumn('uuid')
  ballot_id: string;

  @Column('text')
  decrypted_ballot: string;

  @Column('text')
  encrypted_ballot: string;

  @Column()
  iv: string;

  @Column()
  encrypted_key: string;

  @Column()
  token: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
