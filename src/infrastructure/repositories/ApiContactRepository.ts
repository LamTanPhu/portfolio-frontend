import type { IApiClient }              from '../../application/ports/IApiClient'
import { ApiError }                     from '../api/httpClient'
import { ValidationError }              from '../../domain/errors/ValidationError'
import { SubmitContactRequestDTO, SubmitContactResponseDTO } from '@/src/application/dtos/ContactDTO'
import { RateLimitedError } from '@/src/domain/errors/RateLimitedError'
import { ServerError } from '@/src/domain/errors/ServerError'
import { IContactRepository } from '@/src/domain/repositories/contact/IContactRepository'

// =============================================================================
// ApiContactRepository
// submit — POST /contact
// Translates transport-level failure (HTTP status) into domain errors here —
// this is the one place in the app allowed to know what a 400/429/5xx means.
// Everything above this layer only ever sees ValidationError / RateLimitedError
// / ServerError, never a raw status code.
// =============================================================================
export class ApiContactRepository implements IContactRepository {
    constructor(private readonly client: IApiClient) {}

    async submit(name: string, email: string, message: string, turnstileToken: string): Promise<void> {
        const body: SubmitContactRequestDTO = { name, email, message, turnstileToken }

        try {
            await this.client.post<SubmitContactResponseDTO>('/contact', body)
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 400) {
                throw new ValidationError(err.message)
                }
                if (err.status === 429) {
                throw new RateLimitedError('Too many messages sent. Please wait a moment and try again.')
                }
                throw new ServerError('The server failed to process your message. Please try again later.')
            }
            // Network failure, JSON parse failure, etc. — not an ApiError, but still
            // not the caller's fault, so treat it the same as a server-side failure.
            throw new ServerError('Could not reach the server. Please check your connection and try again.')
        }
    }
}