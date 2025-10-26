'use client'

import { VIBGYORRole } from '@/types'
import { VIBGYOR_CATEGORIES, getVIBGYORCategory } from '@/lib/vibgyor'
import { cn } from '@/lib/utils'

interface VIBGYORRoleSelectorProps {
  selectedRole?: VIBGYORRole
  onRoleSelect: (role: VIBGYORRole) => void
  className?: string
}

export function VIBGYORRoleSelector({ selectedRole, onRoleSelect, className }: VIBGYORRoleSelectorProps) {
  return (
    <div className={cn("space-y-4 mb-6", className || "")}>
      <h3 className="text-lg font-semibold mb-4">Select Your Professional Category</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
        {VIBGYOR_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onRoleSelect(category.id)}
            className={cn(
              "p-4 rounded-lg border-2 text-left transition-all duration-200 relative z-20",
              "hover:shadow-lg hover:scale-105 hover:z-30",
              selectedRole === category.id
                ? "border-current shadow-lg scale-105 z-30"
                : "border-gray-200 hover:border-gray-300"
            )}
            style={{
              borderColor: selectedRole === category.id ? category.color : undefined,
              backgroundColor: selectedRole === category.id ? `${category.color}10` : undefined
            }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <div>
                <h4 className="font-semibold" style={{ color: category.color }}>
                  {category.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {category.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

interface VIBGYORBadgeProps {
  role: VIBGYORRole
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
  className?: string
}

export function VIBGYORBadge({ role, size = 'md', showDescription = false, className }: VIBGYORBadgeProps) {
  const category = getVIBGYORCategory(role)
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <div className={cn("inline-flex items-center space-x-2", className || "")}>
      <span
        className={cn(
          "rounded-full font-medium text-white",
          sizeClasses[size]
        )}
        style={{ backgroundColor: category.color }}
      >
        {category.name}
      </span>
      {showDescription && (
        <span className="text-sm text-gray-600">{category.description}</span>
      )}
    </div>
  )
}
