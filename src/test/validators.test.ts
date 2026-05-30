import { describe, it, expect } from 'vitest'
import {
  required,
  dateRequired,
  rating,
  depth,
  visibility,
  airTemp,
  waterTemp,
  intensity,
  notesLength,
  positiveNumber,
  quantity,
  validateEntryForm,
} from '@/shared/validators'

describe('required', () => {
  it('returns error for undefined', () => expect(required(undefined)).toBe('error.required'))
  it('returns error for null', () => expect(required(null)).toBe('error.required'))
  it('returns error for empty string', () => expect(required('')).toBe('error.required'))
  it('returns null for valid string', () => expect(required('hello')).toBeNull())
  it('returns null for 0', () => expect(required(0)).toBeNull())
})

describe('dateRequired', () => {
  it('returns error for falsy', () => expect(dateRequired(null)).toBe('error.dateRequired'))
  it('returns error for empty string', () => expect(dateRequired('')).toBe('error.dateRequired'))
  it('returns null for valid date string', () => expect(dateRequired('2024-01-01')).toBeNull())
})

describe('rating', () => {
  it('returns error for null', () => expect(rating(null)).toBe('error.ratingRequired'))
  it('returns error for undefined', () => expect(rating(undefined)).toBe('error.ratingRequired'))
  it('returns error for 0', () => expect(rating(0)).toBe('error.ratingRange'))
  it('returns error for 6', () => expect(rating(6)).toBe('error.ratingRange'))
  it('returns null for 1', () => expect(rating(1)).toBeNull())
  it('returns null for 5', () => expect(rating(5)).toBeNull())
  it('returns null for 3', () => expect(rating(3)).toBeNull())
})

describe('depth', () => {
  it('returns null for empty', () => expect(depth('')).toBeNull())
  it('returns null for null', () => expect(depth(null)).toBeNull())
  it('returns null for 0', () => expect(depth(0)).toBeNull())
  it('returns null for 100 (max)', () => expect(depth(100)).toBeNull())
  it('returns error for 101 (max+1)', () => expect(depth(101)).toBe('error.depthRange'))
  it('returns error for negative', () => expect(depth(-1)).toBe('error.depthRange'))
  it('returns null for 50', () => expect(depth(50)).toBeNull())
})

describe('visibility', () => {
  it('returns null for empty', () => expect(visibility('')).toBeNull())
  it('returns null for 0', () => expect(visibility(0)).toBeNull())
  it('returns null for 50 (max)', () => expect(visibility(50)).toBeNull())
  it('returns error for 51 (max+1)', () => expect(visibility(51)).toBe('error.visibilityRange'))
  it('returns error for negative', () => expect(visibility(-1)).toBe('error.visibilityRange'))
})

describe('airTemp', () => {
  it('returns null for empty', () => expect(airTemp('')).toBeNull())
  it('returns null for -5 (min)', () => expect(airTemp(-5)).toBeNull())
  it('returns null for 50 (max)', () => expect(airTemp(50)).toBeNull())
  it('returns error for -6', () => expect(airTemp(-6)).toBe('error.airTempRange'))
  it('returns error for 51', () => expect(airTemp(51)).toBe('error.airTempRange'))
})

describe('waterTemp', () => {
  it('returns null for empty', () => expect(waterTemp('')).toBeNull())
  it('returns null for 0 (min)', () => expect(waterTemp(0)).toBeNull())
  it('returns null for 40 (max)', () => expect(waterTemp(40)).toBeNull())
  it('returns error for -1', () => expect(waterTemp(-1)).toBe('error.waterTempRange'))
  it('returns error for 41', () => expect(waterTemp(41)).toBe('error.waterTempRange'))
})

describe('intensity', () => {
  it('returns null for empty', () => expect(intensity('')).toBeNull())
  it('returns null for 0', () => expect(intensity(0)).toBeNull())
  it('returns null for 10', () => expect(intensity(10)).toBeNull())
  it('returns error for -1', () => expect(intensity(-1)).toBe('error.intensityRange'))
  it('returns error for 11', () => expect(intensity(11)).toBe('error.intensityRange'))
})

describe('notesLength', () => {
  it('returns null for null', () => expect(notesLength(null)).toBeNull())
  it('returns null for short string', () => expect(notesLength('hello')).toBeNull())
  it('returns null for exactly 500 chars', () => expect(notesLength('a'.repeat(500))).toBeNull())
  it('returns error for 501 chars', () => expect(notesLength('a'.repeat(501))).toBe('error.notesLength'))
})

describe('positiveNumber', () => {
  it('returns null for empty', () => expect(positiveNumber('', 'error.weightPositive')).toBeNull())
  it('returns null for null', () => expect(positiveNumber(null, 'error.weightPositive')).toBeNull())
  it('returns null for positive', () => expect(positiveNumber(5, 'error.weightPositive')).toBeNull())
  it('returns error for negative', () => expect(positiveNumber(-1, 'error.weightPositive')).toBe('error.weightPositive'))
})

describe('quantity', () => {
  it('returns null for null', () => expect(quantity(null)).toBeNull())
  it('returns null for 1 (min)', () => expect(quantity(1)).toBeNull())
  it('returns error for 0', () => expect(quantity(0)).toBe('error.quantityMin'))
  it('returns error for negative', () => expect(quantity(-1)).toBe('error.quantityMin'))
})

describe('validateEntryForm', () => {
  it('returns invalid for missing date and rating', () => {
    const result = validateEntryForm({})
    expect(result.valid).toBe(false)
    expect(result.errors.date).toBeTruthy()
    expect(result.errors.rating).toBeTruthy()
  })

  it('returns valid for minimal valid data', () => {
    const result = validateEntryForm({ date: '2024-01-01', rating: 3 })
    expect(result.valid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  it('returns invalid for depth out of range', () => {
    const result = validateEntryForm({ date: '2024-01-01', rating: 3, depth: 101 })
    expect(result.valid).toBe(false)
    expect(result.errors.depth).toBe('error.depthRange')
  })
})
