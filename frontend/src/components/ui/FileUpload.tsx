import { Upload, X, File as FileIcon } from 'lucide-react'
import { useRef, type ChangeEvent, type DragEvent } from 'react'
import { cn } from '@/lib/utils'
import { InlineAlert } from '@/components/ui/InlineAlert'

export type FileUploadProps = {
  file: File | null
  onFileChange: (file: File | null) => void
  error?: string | null
  accept?: string
  maxSizeMb?: number
  className?: string
}

export function FileUpload({
  file,
  onFileChange,
  error,
  accept,
  maxSizeMb = 10,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndSet = (next: File | null) => {
    if (!next) {
      onFileChange(null)
      return
    }
    if (next.size > maxSizeMb * 1024 * 1024) {
      onFileChange(null)
      return
    }
    onFileChange(next)
  }

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null
    validateAndSet(picked)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0] ?? null
    validateAndSet(dropped)
  }

  const sizeError =
    file && file.size > maxSizeMb * 1024 * 1024
      ? `File too large (max ${maxSizeMb}MB)`
      : null

  if (file && !sizeError) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="flex items-center justify-between rounded-[10px] border border-ink-200 px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileIcon className="size-4 shrink-0 text-ink-500" aria-hidden />
            <span className="truncate text-sm text-ink-900">{file.name}</span>
          </div>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="text-ink-400 hover:text-ink-600"
            aria-label="Remove file"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-1.5 rounded-[10px] border border-dashed bg-ink-50 px-6 py-6 transition-colors hover:border-brand-500 hover:bg-brand-50',
          error || sizeError ? 'border-red-600' : 'border-ink-200',
        )}
      >
        <Upload className="size-5 text-ink-400" aria-hidden />
        <p className="text-sm text-ink-500">Drag a file or click to upload</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onInputChange}
        />
      </div>
      {(error || sizeError) && (
        <InlineAlert variant="error">{error ?? sizeError!}</InlineAlert>
      )}
    </div>
  )
}
