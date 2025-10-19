import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'candidates' })
export class Candidate {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  party: string;
}
