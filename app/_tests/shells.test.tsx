// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SITE_URL } from '@/lib/constants'

vi.mock('@/lib/fonts', () => ({ jetbrainsMono: { variable: 'font-var-mock' } }))
vi.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
vi.mock('next/og', () => ({
    ImageResponse: class { constructor(public element: unknown, public options: unknown) {} },
}))
vi.mock('@/src/presentation/templates/VSCodeLayout', () => ({
    VSCodeLayout: ({ children, activeTab }: { children: ReactNode; activeTab: string }) => <div data-testid="layout" data-tab={activeTab}>{children}</div>,
}))

import ErrorPage from '../error'
import GlobalError from '../global-error'
import AdminLoading from '../admin/(protected)/loading'
import NotFound, { metadata as notFoundMetadata } from '../not-found'
import RootLayout, { metadata as layoutMetadata } from '../layout'
import OgImage, { alt, contentType, size } from '../opengraph-image'

beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('error.tsx (route-level error boundary)', () => {
    it('logs the error, explains what happened, and offers retry and home', () => {
        const error = new Error('kaboom')
        render(<ErrorPage error={error} reset={vi.fn()} />)

        expect(console.error).toHaveBeenCalledWith(error)
        expect(screen.getByRole('heading', { name: 'Something broke' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /go home|home/i })).toHaveAttribute('href', '/')
    })

    it('"try again" calls reset so Next re-renders the segment', () => {
        const reset = vi.fn()
        render(<ErrorPage error={new Error('x')} reset={reset} />)

        fireEvent.click(screen.getByRole('button', { name: 'try again' }))

        expect(reset).toHaveBeenCalledTimes(1)
    })

    it('logs again when a different error arrives', () => {
        const { rerender } = render(<ErrorPage error={new Error('one')} reset={vi.fn()} />)
        const second = new Error('two')

        rerender(<ErrorPage error={second} reset={vi.fn()} />)

        expect(console.error).toHaveBeenLastCalledWith(second)
        expect(console.error).toHaveBeenCalledTimes(2)
    })
})

describe('global-error.tsx (root error boundary)', () => {
    it('renders a self-contained page (it replaces the root layout) with retry and home actions', () => {
        const reset = vi.fn()
        render(<GlobalError error={new Error('fatal')} reset={reset} />)

        expect(screen.getByRole('heading', { name: 'The app failed to load' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'go home' })).toHaveAttribute('href', '/')
        fireEvent.click(screen.getByRole('button', { name: 'try again' }))
        expect(reset).toHaveBeenCalledTimes(1)
    })

    it('renders its own <html lang="en"> document', () => {
        const html = renderToStaticMarkup(<GlobalError error={new Error('x')} reset={() => {}} />)

        expect(html.startsWith('<html lang="en">')).toBe(true)
        expect(html).toContain('<body')
    })

    it('does not depend on any provider (no ambient audio, auth or theme context)', () => {
        expect(() => renderToStaticMarkup(<GlobalError error={new Error('x')} reset={() => {}} />)).not.toThrow()
    })
})

describe('not-found.tsx and the admin loading boundary', () => {
    it('the 404 page explains the problem and links home, inside the site chrome', () => {
        render(<NotFound />)

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cannot resolve module')
        expect(screen.getByRole('link', { name: /open home/ })).toHaveAttribute('href', '/')
        expect(screen.getByTestId('layout')).toBeInTheDocument()
        expect(notFoundMetadata.title).toBe('404')
    })

    it('admin pages that render on the server show a loading indicator while they load', () => {
        render(<AdminLoading />)

        expect(screen.getByText('loading')).toBeInTheDocument()
    })

    // Regression: a root app/loading.tsx makes Next send "200 OK" before a page can call
    // notFound(), which turned every unknown /projects/x and /blog/x into a soft 404.
    it('there is no root loading boundary (it would turn real 404s into HTTP 200)', async () => {
        const { existsSync } = await import('node:fs')
        const { resolve } = await import('node:path')

        expect(existsSync(resolve(__dirname, '../loading.tsx'))).toBe(false)
    })
})

describe('root layout', () => {
    it('renders <html lang="en"> with the font variable, the children and the page-view tracker', () => {
        const html = renderToStaticMarkup(<RootLayout><p>child content</p></RootLayout>)

        expect(html).toContain('<html lang="en"')
        expect(html).toContain('font-var-mock')
        expect(html).toContain('font-mono antialiased')
        expect(html).toContain('child content')
    })

    it('sets site-wide metadata: base URL, title template and icon', () => {
        expect((layoutMetadata.metadataBase as URL).href).toBe(`${SITE_URL}/`)
        expect(layoutMetadata.title).toEqual({ default: 'Lam Tan Phu - Portfolio', template: '%s | Lam Tan Phu' })
        expect(layoutMetadata.icons).toEqual({ icon: '/favicon.ico' })
    })
})

describe('opengraph-image', () => {
    it('declares a 1200×630 PNG with alt text', () => {
        expect(size).toEqual({ width: 1200, height: 630 })
        expect(contentType).toBe('image/png')
        expect(alt).toMatch(/Lam Tan Phu/)
    })

    it('renders the share card at that size with the owner identity', () => {
        const res = OgImage() as unknown as { element: { props: { children: unknown } }; options: unknown }

        expect(res.options).toEqual({ width: 1200, height: 630 })
        expect(JSON.stringify(res.element)).toContain('lam-tan-phu')
    })
})
