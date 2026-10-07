import { LoadingLine } from '@/src/presentation/atoms/LoadingLine'

// Shown while an admin page that renders on the server (the edit pages) loads.
// Deliberately NOT at app/loading.tsx: a root loading boundary makes Next send
// "200 OK" before a page can call notFound(), so unknown /projects/x and /blog/x
// came back as 200 instead of 404.
export default function Loading() {
    return <LoadingLine />
}
