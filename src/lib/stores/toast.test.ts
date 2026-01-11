import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { toast, hasToasts } from './toast';

describe('Toast Store', () => {
  beforeEach(() => {
    toast.clear();
    vi.useFakeTimers();
  });

  it('should start with empty toasts', () => {
    const toasts = get(toast);
    expect(toasts).toEqual([]);
    expect(get(hasToasts)).toBe(false);
  });

  it('should add a toast', () => {
    toast.add('info', 'Test message', 0);
    const toasts = get(toast);
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('info');
    expect(toasts[0].message).toBe('Test message');
    expect(get(hasToasts)).toBe(true);
  });

  it('should add success toast', () => {
    toast.success('Success!', 0);
    const toasts = get(toast);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('Success!');
  });

  it('should add error toast', () => {
    toast.error('Error!', 0);
    const toasts = get(toast);
    expect(toasts[0].type).toBe('error');
    expect(toasts[0].message).toBe('Error!');
  });

  it('should add warning toast', () => {
    toast.warning('Warning!', 0);
    const toasts = get(toast);
    expect(toasts[0].type).toBe('warning');
    expect(toasts[0].message).toBe('Warning!');
  });

  it('should add info toast', () => {
    toast.info('Info!', 0);
    const toasts = get(toast);
    expect(toasts[0].type).toBe('info');
    expect(toasts[0].message).toBe('Info!');
  });

  it('should remove toast by id', () => {
    const id = toast.add('info', 'Test', 0);
    expect(get(toast)).toHaveLength(1);

    toast.remove(id);
    expect(get(toast)).toHaveLength(0);
  });

  it('should clear all toasts', () => {
    toast.add('info', 'Test 1', 0);
    toast.add('success', 'Test 2', 0);
    toast.add('error', 'Test 3', 0);
    expect(get(toast)).toHaveLength(3);

    toast.clear();
    expect(get(toast)).toHaveLength(0);
  });

  it('should auto-remove toast after duration', () => {
    toast.add('info', 'Auto remove', 1000);
    expect(get(toast)).toHaveLength(1);

    vi.advanceTimersByTime(1000);
    expect(get(toast)).toHaveLength(0);
  });

  it('should not auto-remove toast with duration 0', () => {
    toast.add('info', 'Persistent', 0);
    expect(get(toast)).toHaveLength(1);

    vi.advanceTimersByTime(10000);
    expect(get(toast)).toHaveLength(1);
  });

  it('should generate unique ids for each toast', () => {
    const id1 = toast.add('info', 'Test 1', 0);
    const id2 = toast.add('info', 'Test 2', 0);
    expect(id1).not.toBe(id2);
  });
});
