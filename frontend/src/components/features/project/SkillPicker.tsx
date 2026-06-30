import { useState } from 'react'
import { Plus } from 'lucide-react'
import { FilterChip } from '@/components/ui/FilterChip'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { PROJECT_SKILLS, type ProjectSkill } from '@/lib/projectSkills'

export type SkillPickerProps = {
  value: string[]
  onChange: (skills: string[]) => void
  error?: string
  className?: string
  allowCustom?: boolean
}

export function SkillPicker({
  value,
  onChange,
  error,
  className,
  allowCustom = false,
}: SkillPickerProps) {
  const [adding, setAdding] = useState(false)
  const [customSkill, setCustomSkill] = useState('')

  const toggle = (skill: ProjectSkill) => {
    if (value.includes(skill)) {
      onChange(value.filter((item) => item !== skill))
      return
    }
    onChange([...value, skill])
  }

  const addCustom = () => {
    const trimmed = customSkill.trim()
    if (!trimmed || value.includes(trimmed)) {
      setCustomSkill('')
      setAdding(false)
      return
    }
    onChange([...value, trimmed])
    setCustomSkill('')
    setAdding(false)
  }

  const customSelected = value.filter(
    (skill) => !PROJECT_SKILLS.includes(skill as ProjectSkill),
  )

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-wrap gap-1.5">
        {PROJECT_SKILLS.map((skill) => (
          <FilterChip
            key={skill}
            active={value.includes(skill)}
            onClick={() => toggle(skill)}
          >
            {skill}
          </FilterChip>
        ))}
        {customSelected.map((skill) => (
          <FilterChip key={skill} active onClick={() => onChange(value.filter((s) => s !== skill))}>
            {skill}
          </FilterChip>
        ))}
        {allowCustom && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-600"
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
            placeholder="Custom skill"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustom()
              }
            }}
          />
          <FilterChip active onClick={addCustom}>
            Save
          </FilterChip>
          <FilterChip active={false} onClick={() => setAdding(false)}>
            Cancel
          </FilterChip>
        </div>
      )}
      {error && (
        <p className="text-xs leading-4 text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
