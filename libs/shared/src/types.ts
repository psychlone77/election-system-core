export type ServerCheck = {
  service: string;
  status: string;
};

export type RegisterDto = {
  NIC: string;
  registration_code: string;
  public_key: string;
};

export type RequestTokenDto = {
  NIC: string;
  blinded_token: string;
  signature: string;
};

export type SubmitBallotDto = {
  encryptedBallot: string;
  iv: string;
  encryptedKey: string;
  token: string;
  token_signature: string;
};

export type BallotPayload = Record<string, number>;

export type LoginDto = {
  email: string;
  password: string;
};
