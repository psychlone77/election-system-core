import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'issued_tokens' })
export class IssuedToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nic' })
  nic: string;

  // the blinded token as hex or base64 - stored to prevent re-issuance
  @Column({ name: 'blinded_token', type: 'text' })
  blinded_token: string;

  // the blind signature produced by ES (hex/base64)
  @Column({ name: 'blind_signature', type: 'text', nullable: true })
  blind_signature?: string;

  @CreateDateColumn({ name: 'issued_at' })
  issued_at: Date;
}
