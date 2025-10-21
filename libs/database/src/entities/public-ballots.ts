import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('public_ballots')
export class PublicBallot {
  @PrimaryColumn()
  ballot_id: string;

  @Column('text')
  hashed_ballot: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
