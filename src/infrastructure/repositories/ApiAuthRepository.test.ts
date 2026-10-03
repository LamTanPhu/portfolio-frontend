import { beforeEach, describe, expect, it } from 'vitest'
import { createApiClientMock } from '@/src/test/apiClientMock'
import { ApiAuthRepository } from './ApiAuthRepository'

// The interesting part of this repository is *which options* each call passes:
// without withCredentials the browser neither stores nor sends the httpOnly
// refresh cookie, and the session silently breaks.
describe('ApiAuthRepository', () => {
    let client: ReturnType<typeof createApiClientMock>
    let repo: ApiAuthRepository

    beforeEach(() => {
        client = createApiClientMock()
        repo = new ApiAuthRepository(client)
    })

    it('login POSTs the password with credentials and returns the access token result', async () => {
        client.post.mockResolvedValue({ accessToken: 'tok' })

        await expect(repo.login('hunter2')).resolves.toEqual({ accessToken: 'tok' })
        expect(client.post).toHaveBeenCalledWith('/auth/login', { password: 'hunter2' }, { withCredentials: true })
    })

    it('refresh POSTs an empty body with credentials (the cookie is the only credential)', async () => {
        client.post.mockResolvedValue({ accessToken: 'new' })

        await expect(repo.refresh()).resolves.toEqual({ accessToken: 'new' })
        expect(client.post).toHaveBeenCalledWith('/auth/refresh', {}, { withCredentials: true })
    })

    it('logout sends both the bearer token and the cookie', async () => {
        client.post.mockResolvedValue(undefined)

        await repo.logout('tok')

        expect(client.post).toHaveBeenCalledWith('/auth/logout', {}, { withCredentials: true, accessToken: 'tok' })
    })

    it('lets a failed login propagate so the UI can show "wrong password"', async () => {
        client.post.mockRejectedValue(new Error('401'))

        await expect(repo.login('bad')).rejects.toThrow('401')
    })
})
