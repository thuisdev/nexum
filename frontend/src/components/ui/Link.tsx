import { type AnchorHTMLAttributes } from 'react'
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom'
import { cn } from '@/lib/utils'

type BaseProps = {
  className?: string
  children: string
}

type InternalLinkProps = BaseProps &
  RouterLinkProps & {
    href?: never
  }

type ExternalLinkProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    to?: never
  }

export type AppLinkProps = InternalLinkProps | ExternalLinkProps

const linkClassName =
  'text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 visited:text-brand-700'

export function Link(props: AppLinkProps) {
  const { className, children, ...rest } = props

  if ('to' in rest && rest.to !== undefined) {
    return (
      <RouterLink className={cn(linkClassName, className)} {...rest}>
        {children}
      </RouterLink>
    )
  }

  const { href, ...anchorRest } = rest as ExternalLinkProps

  return (
    <a href={href} className={cn(linkClassName, className)} {...anchorRest}>
      {children}
    </a>
  )
}
