import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('tallying_results')
export class TallyingResults {
  @PrimaryColumn('uuid')
  candidate_id: string;

  @Column('text')
  candidate_name: string;

  @Column('text')
  candidate_party: string;

  @Column('int')
  votes: number;
}
