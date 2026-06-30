import { useState } from 'react'
import { Plus } from 'lucide-react'
import { FilterChip } from '@/components/ui/FilterChip'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import {
  PROJECT_SKILLS,
} from '@/lib/projectSkills'

export type SkillPickerProps = {
  value: string[]
  onChange: (skills: string[]) => void
  error?: string
  className?: string
  allowCustom?: boolean
  maxSkills?: number
  presets?: readonly string[]
  customPlaceholder?: string
}

export function SkillPicker({
  value,
  onChange,
  error,
  className,
  allowCustom = false,
  maxSkills,
  presets = PROJECT_SKILLS,
  customPlaceholder = 'Custom skill',
}: SkillPickerProps) {
  const [adding, setAdding] = useState(false)
  const [customSkill, setCustomSkill] = useState('')

  const atMax = maxSkills != null && value.length >= maxSkills
  const presetSet = new Set<string>(presets)

  const toggle = (skill: string) => {
    if (value.includes(skill)) {
      onChange(value.filter((item) => item !== skill))
      return
    }
    if (atMax) return
    onChange([...value, skill])
  }

  const addCustom = () => {
    const trimmed = customSkill.trim()
    if (!trimmed || value.includes(trimmed) || atMax) {
      setCustomSkill('')
      setAdding(false)
      return
    }
    onChange([...value, trimmed])
    setCustomSkill('')
    setAdding(false)
  }

  const customSelected = value.filter((skill) => !presetSet.has(skill))

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((skill) => {
          const selected = value.includes(skill)
          const disabled = !selected && atMax

          return (
            <FilterChip
              key={skill}
              active={selected}
              disabled={disabled}
              onClick={() => toggle(skill)}
            >
              {skill}
            </FilterChip>
          )
        })}
        {customSelected.map((skill) => (
          <FilterChip
            key={skill}
            active
            onClick={() => onChange(value.filter((s) => s !== skill))}
          >
            {skill}
          </FilterChip>
        ))}
        {allowCustom && !adding && (
          <button
            type="button"
            disabled={atMax}
            onClick={() => setAdding(true)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border border-dashed px-3 py-1.5 text-xs font-medium transition-colors',
              atMax
                ? 'cursor-not-allowed border-ink-200 text-ink-300'
                : 'border-ink-300 text-ink-500 hover:border-brand-300 hover:text-brand-600',
            )}
          >
            <Plus className="size-3.5" aria-hidden />
            Add
          </button>
        )}
      </div>
      {allowCustom && adding && (
        <div className="flex gap-2">
          <Input
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            placeholder={customPlaceholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustom()
              }
            }}
          />
          <FilterChip active onClick={addCustom} disabled={atMax}>
            Save
          </FilterChip>
          <FilterChip active={false} onClick={() => setAdding(false)}>
            Cancel
          </FilterChip>
        </div>
      )}
      {maxSkills != null && (
        <p className="text-xs text-ink-400">
          {value.length}/{maxSkills} selected
        </p>
      )}
      {error && (
        <p className="text-xs leading-4 text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
