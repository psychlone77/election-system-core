import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'candidates' })
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  party: string;
}
