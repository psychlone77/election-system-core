import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'eligible_voters' })
export class EligibleVoter {
  @PrimaryColumn()
  NIC: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column('int')
  age: number;

  @Column({ name: 'registration_code' })
  registration_code: string;

  @Column({ default: false })
  disabled: boolean;
}
