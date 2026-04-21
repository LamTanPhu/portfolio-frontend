import { IContactWriteRepository } from '../../../../domain/repositories/contact/IContactWriteRepository'
import { ITurnstileVerifier } from '../../../ports/ITurnstileVerifier'
import { ContactSubmittedEvent } from '../../../../domain/events/ContactSubmittedEvent'
import { ValidationError } from '../../../../domain/errors/ValidationError'
import { Email } from '../../../../domain/value-objects/Email'

interface Input {
  name: string
  email: string
  message: string
  turnstileToken: string
  ipAddress: string
}

export class SubmitContactCommand {
  constructor(
    private readonly repo: IContactWriteRepository,
    private readonly turnstile: ITurnstileVerifier,
  ) {}

  async execute(input: Input): Promise<ContactSubmittedEvent> {
    const isHuman = await this.turnstile.verifyToken(input.turnstileToken)
    if (!isHuman) throw new ValidationError('Turnstile verification failed')

    const email = new Email(input.email)

    await this.repo.save({ ...input, email: email.toString() })

    return new ContactSubmittedEvent(input.name, email.toString(), input.message)
  }
}
