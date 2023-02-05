import bcrypt from 'bcrypt';

export async function hash(source: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = bcrypt.hashSync(source, salt);

  return hash;
}
