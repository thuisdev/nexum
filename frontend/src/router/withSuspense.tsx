import { Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import { PageLoader } from './PageLoader'

export function withSuspense(Page: LazyExoticComponent<ComponentType>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Page />
    </Suspense>
  )
}
