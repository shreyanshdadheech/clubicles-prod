'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ValidatedInputProps {
  label?: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'password'
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  error?: string
  hasError?: boolean
  required?: boolean
  disabled?: boolean
  className?: string
  inputClassName?: string
}

interface ValidatedTextareaProps {
  label?: string
  name: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: () => void
  error?: string
  hasError?: boolean
  required?: boolean
  disabled?: boolean
  rows?: number
  className?: string
  textareaClassName?: string
}

interface ValidatedSelectProps {
  label?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: () => void
  error?: string
  hasError?: boolean
  required?: boolean
  disabled?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
  selectClassName?: string
}

export function ValidatedInput({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hasError,
  required,
  disabled,
  className,
  inputClassName
}: ValidatedInputProps) {
  return (
    <div className={cn('space-y-2', className || '')}>
      {label && (
        <Label htmlFor={name} className="text-white font-medium">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
      )}
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={cn(
          'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40',
          hasError ? 'border-red-500 focus:border-red-500' : '',
          inputClassName || ''
        )}
        required={required}
      />
      {hasError && error && (
        <p className="text-red-400 text-sm font-medium">{error}</p>
      )}
    </div>
  )
}

export function ValidatedTextarea({
  label,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hasError,
  required,
  disabled,
  rows = 4,
  className,
  textareaClassName
}: ValidatedTextareaProps) {
  return (
    <div className={cn('space-y-2', className || '')}>
      {label && (
        <Label htmlFor={name} className="text-white font-medium">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
      )}
      <Textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        rows={rows}
        className={cn(
          'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40',
          hasError ? 'border-red-500 focus:border-red-500' : '',
          textareaClassName || ''
        )}
        required={required}
      />
      {hasError && error && (
        <p className="text-red-400 text-sm font-medium">{error}</p>
      )}
    </div>
  )
}

export function ValidatedSelect({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  hasError,
  required,
  disabled,
  options,
  placeholder,
  className,
  selectClassName
}: ValidatedSelectProps) {
  return (
    <div className={cn('space-y-2', className || '')}>
      {label && (
        <Label htmlFor={name} className="text-white font-medium">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={cn(
          'w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 disabled:opacity-50',
          hasError ? 'border-red-500 focus:border-red-500' : '',
          selectClassName || ''
        )}
      >
        {placeholder && (
          <option value="" disabled className="bg-gray-800">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-800">
            {option.label}
          </option>
        ))}
      </select>
      {hasError && error && (
        <p className="text-red-400 text-sm font-medium">{error}</p>
      )}
    </div>
  )
}

// Utility component for displaying form errors
export function FormErrorSummary({ errors }: { errors: string[] }) {
  if (!errors.length) return null

  return (
    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
      <h4 className="text-red-400 font-medium mb-2">Please fix the following errors:</h4>
      <ul className="text-red-300 text-sm space-y-1">
        {errors.map((error, index) => (
          <li key={index}>• {error}</li>
        ))}
      </ul>
    </div>
  )
}
