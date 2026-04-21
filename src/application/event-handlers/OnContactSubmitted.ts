import { ContactSubmittedEvent } from '../../domain/events/ContactSubmittedEvent'

export class OnContactSubmitted {
  async handle(event: ContactSubmittedEvent): Promise<void> {
    // Mail notification will be triggered here via IMailService port (backend responsibility)
    console.info(Contact submitted by  at )
  }
}
