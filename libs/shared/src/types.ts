export type ServerCheck = {
  service: string;
  status: string;
};

export type RegisterDto = {
  NIC: string;
  registration_code: string;
  public_key: string;
};
