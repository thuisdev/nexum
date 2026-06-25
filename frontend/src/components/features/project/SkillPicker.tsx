import { FilterChip } from '@/components/ui/FilterChip'
import { cn } from '@/lib/utils'
import { PROJECT_SKILLS, type ProjectSkill } from '@/lib/projectSkills'

export type SkillPickerProps = {
  value: ProjectSkill[]
  onChange: (skills: ProjectSkill[]) => void
  error?: string
  className?: string
}

export function SkillPicker({ value, onChange, error, className }: SkillPickerProps) {
  const toggle = (skill: ProjectSkill) => {
    if (value.includes(skill)) {
      onChange(value.filter((item) => item !== skill))
      return
    }
    onChange([...value, skill])
  }

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
      </div>
      {error && (
        <p className="text-xs leading-4 text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
