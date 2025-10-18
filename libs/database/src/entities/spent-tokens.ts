import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('spent_tokens')
export class SpentTokens {
  @PrimaryColumn()
  token: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
