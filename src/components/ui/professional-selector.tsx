
'use client'

import { useState } from 'react'
import { ProfessionalRole } from '@/types'
import { PROFESSIONAL_CATEGORIES, getProfessionalCategory } from '@/lib/professional-categories'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ProfessionalRoleSelectorProps {
  selectedRole?: ProfessionalRole
  onRoleSelect: (role: ProfessionalRole) => void
  className?: string
}

export function ProfessionalRoleSelector({ selectedRole, onRoleSelect, className }: ProfessionalRoleSelectorProps) {
  const [expandedRole, setExpandedRole] = useState<ProfessionalRole | null>(null)

  const toggleExpansion = (roleId: ProfessionalRole) => {
    setExpandedRole(expandedRole === roleId ? null : roleId)
  }

  const handleCategoryClick = (category: any) => {
    onRoleSelect(category.id)
  }

  const handleToggleClick = (e: React.MouseEvent, roleId: ProfessionalRole) => {
    e.stopPropagation() // Prevent category selection when clicking toggle
    toggleExpansion(roleId)
  }

  return (
    <div className={cn("space-y-4 mb-6", className || "")} style={{ zIndex: 100 }}>
            
      <div className="grid grid-cols-1 gap-3 relative">
        {PROFESSIONAL_CATEGORIES.map((category) => (
          <div key={category.id} className="relative" style={{ zIndex: expandedRole === category.id ? 200 : 100 }}>
            <button
              type="button"
              onClick={() => handleCategoryClick(category)}
              className={cn(
                "w-full p-4 rounded-lg border-2 text-left transition-all duration-200 relative",
                "hover:shadow-lg hover:scale-[1.02]",
                selectedRole === category.id
                  ? "border-current shadow-lg scale-[1.02]"
                  : "border-gray-600 hover:border-gray-400"
              )}
              style={{
                borderColor: selectedRole === category.id ? category.color : undefined,
                backgroundColor: selectedRole === category.id ? `${category.color}15` : 'rgba(17, 24, 39, 0.8)',
                zIndex: expandedRole === category.id ? 300 : 150
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-400"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h4 
                      className="font-semibold text-sm"
                      style={{ 
                        color: selectedRole === category.id ? category.color : '#ffffff'
                      }}
                    >
                      {category.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedRole === category.id && (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleToggleClick(e, category.id)}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                    aria-label="Toggle details"
                  >
                    {expandedRole === category.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </button>
            
            {/* Expanded Details */}
            {expandedRole === category.id && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 p-4 rounded-lg border shadow-xl backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  borderColor: category.color,
                  zIndex: 400
                }}
              >
                <div className="space-y-3">
                  <div>
                    <h5 className="font-semibold text-white mb-2">Who Belongs Here:</h5>
                    <p className="text-sm text-gray-300">{category.detailedDescription}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-white mb-2">Examples:</h5>
                    <ul className="space-y-1">
                      {category.examples.map((example, index) => (
                        <li key={index} className="text-sm text-gray-300">
                          • {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface ProfessionalBadgeProps {
  role: ProfessionalRole
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
  className?: string
}

export function ProfessionalBadge({ role, size = 'md', showDescription = false, className }: ProfessionalBadgeProps) {
  const category = getProfessionalCategory(role)
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const textColor = role === 'white' ? 'text-black' : role === 'yellow' ? 'text-black' : 'text-white'

  return (
    <div className={cn("inline-flex items-center space-x-2", className || "")}>
      <span
        className={cn(
          "rounded-full font-medium",
          sizeClasses[size],
          textColor
        )}
        style={{ backgroundColor: category.color }}
      >
        {category.description}
      </span>
      {showDescription && (
        <span className="text-sm text-gray-600">{category.detailedDescription}</span>
      )}
    </div>
  )
}
