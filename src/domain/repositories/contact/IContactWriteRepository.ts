export interface IContactWriteRepository {
  save(data: { name: string; email: string; message: string; ipAddress: string }): Promise<void>
}
