import React from 'react';

/**
 * ChatWizard - a lightweight chat-like stepper overlay
 * Props:
 * - isOpen: boolean to render overlay
 * - title: string heading
 * - steps: Array of step configs [{
 *     key: string,
 *     prompt: string,
 *     type: 'text'|'email'|'password'|'tel'|'select'|'chips'|'toggle',
 *     placeholder?: string,
 *     options?: string[], // for select
 *     optional?: boolean,
 *     validate?: (value, data) => string | null // return error message or null
 *   }]
 * - initialData: object of defaults
 * - onBack: function called when closing (navigate back)
 * - onComplete: async (data) => Promise<void>
 * - loading: boolean busy state
 * - error: string top-level error to show
 */
const ChatWizard = ({
  isOpen,
  title,
  steps,
  initialData = {},
  onBack,
  onComplete,
  loading = false,
  error = ''
}) => {
  const [current, setCurrent] = React.useState(0);
  const [data, setData] = React.useState(initialData);
  // input can be string | boolean | string[] | object (for group fields)
  const [input, setInput] = React.useState('');
  // Track password visibility per key (works for single and group fields)
  const [revealByKey, setRevealByKey] = React.useState({});
  const [localError, setLocalError] = React.useState('');
  const containerRef = React.useRef(null);

  const step = steps[current];
  const total = steps.length;

  React.useEffect(() => {
    // initialize current input from data
    if (!step) return;
    if (step.type === 'chips') {
      setInput('');
    } else if (step.type === 'toggle') {
      setInput(Boolean(data[step.key]));
    } else if (step.type === 'group' && Array.isArray(step.fields)) {
      const obj = {};
      step.fields.forEach((f) => {
        if (f.type === 'checkbox') {
          obj[f.key] = Boolean(data[f.key]);
        } else {
          obj[f.key] = typeof data[f.key] === 'string' ? data[f.key] : '';
        }
      });
      setInput(obj);
    } else {
      setInput(typeof data[step.key] === 'string' ? data[step.key] : '');
    }
    setLocalError('');
    // initialize reveal state for password fields
    if (step.type === 'group' && Array.isArray(step.fields)) {
      const reveals = {};
      step.fields.forEach((f) => { if (f.type === 'password') reveals[f.key] = false; });
      setRevealByKey(reveals);
    } else if (step.type === 'password') {
      setRevealByKey({ [step.key]: false });
    } else {
      setRevealByKey({});
    }
  }, [current, step, data]);

  React.useEffect(() => {
    // focus scroll to bottom
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [current, localError]);

  if (!isOpen) return null;

  const submit = async () => {
    if (!step) return;
    let value = input;

    // Normalize types
    if (step.type === 'toggle') {
      value = Boolean(value);
    } else if (step.type === 'chips') {
      value = Array.isArray(data[step.key]) ? data[step.key] : [];
    } else if (step.type === 'group' && Array.isArray(step.fields)) {
      // Ensure object shape
      value = typeof input === 'object' && input !== null ? input : {};
    } else {
      value = (value || '').toString().trim();
    }

    if (!step.optional) {
      if (step.type === 'chips') {
        if (!value || value.length === 0) {
          setLocalError('This field is required');
          return;
        }
      } else if (step.type === 'group') {
        const fields = step.fields || [];
        const anyEmpty = fields.some((f) => !value || !String(value[f.key] ?? '').trim());
        if (anyEmpty) {
          setLocalError('Please fill out all fields');
          return;
        }
      } else if (value === '' || value === undefined) {
        setLocalError('This field is required');
        return;
      }
    }
    if (step.validate) {
      const err = step.validate(value, data);
      if (err) {
        setLocalError(err);
        return;
      }
    }

    // Merge data
    const nextData = step.type === 'group' && typeof value === 'object'
      ? { ...data, ...value }
      : { ...data, [step.key]: value };
    setData(nextData);
    setLocalError('');

    if (current + 1 < total) {
      setCurrent((c) => c + 1);
    } else {
      // complete
      await onComplete(nextData);
    }
  };

  const back = () => {
    if (current === 0) {
      onBack?.();
    } else {
      setCurrent((c) => c - 1);
    }
  };

  const addChip = (val) => {
    const v = (val || '').trim();
    if (!v) return;
    const list = Array.isArray(data[step.key]) ? data[step.key] : [];
    if (list.includes(v)) return;
    const updated = { ...data, [step.key]: [...list, v] };
    setData(updated);
    setInput('');
    setLocalError('');
  };

  const removeChip = (val) => {
    const list = Array.isArray(data[step.key]) ? data[step.key] : [];
    const updated = { ...data, [step.key]: list.filter((x) => x !== val) };
    setData(updated);
  };

  const renderControl = () => {
    // Guard against undefined step (e.g., transient states or after completion)
    if (!step) return null;
    switch (step.type) {
      case 'select':
        return (
          <select
            className="form-select w-full"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          >
            <option value="">Select an option</option>
            {step.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'password':
      case 'number':
      case 'email':
      case 'tel':
      case 'text':
        {
          const actualType = step.type === 'password' && revealByKey[step.key] ? 'text' : step.type;
          return (
            <div className="relative">
              <input
                type={actualType}
                placeholder={step.placeholder || ''}
                className="form-input w-full pr-10"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              />
              {step.type === 'password' && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 my-auto text-gray-500 hover:text-gray-800 text-sm"
                  onClick={() => setRevealByKey((prev) => ({ ...prev, [step.key]: !prev[step.key] }))}
                  aria-label={revealByKey[step.key] ? 'Hide password' : 'Show password'}
                >
                  {revealByKey[step.key] ? 'Hide' : 'Show'}
                </button>
              )}
            </div>
          );
        }
      case 'group':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(step.fields || []).map((f) => {
              const fieldType = f.type || 'text';
              const isCheckbox = fieldType === 'checkbox';
              const isPassword = fieldType === 'password';
              const actualType = isPassword && revealByKey[f.key] ? 'text' : fieldType;
              return (
                <div key={f.key} className="flex flex-col">
                  {f.label ? <label className="text-xs text-gray-600 mb-1">{f.label}</label> : null}
                  {isCheckbox ? (
                    <label className="inline-flex items-center gap-2 py-2">
                      <input
                        type="checkbox"
                        checked={!!(typeof input === 'object' && input !== null ? input[f.key] : false)}
                        onChange={(e) => setInput((prev) => ({ ...(typeof prev === 'object' && prev !== null ? prev : {}), [f.key]: e.target.checked }))}
                      />
                      <span className="text-sm text-gray-700">{f.checkboxLabel || 'Has WhatsApp'}</span>
                    </label>
                  ) : (
                    <div className="relative">
                      <input
                        type={actualType}
                        placeholder={f.placeholder || ''}
                        className="form-input w-full pr-10"
                        value={(typeof input === 'object' && input !== null ? input[f.key] : '') || ''}
                        onChange={(e) => setInput((prev) => ({ ...(typeof prev === 'object' && prev !== null ? prev : {}), [f.key]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                      />
                      {isPassword && (
                        <button
                          type="button"
                          className="absolute inset-y-0 right-2 my-auto text-gray-500 hover:text-gray-800 text-sm"
                          onClick={() => setRevealByKey((prev) => ({ ...prev, [f.key]: !prev[f.key] }))}
                          aria-label={revealByKey[f.key] ? 'Hide password' : 'Show password'}
                        >
                          {revealByKey[f.key] ? 'Hide' : 'Show'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      case 'toggle':
        return (
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={!!input} onChange={(e) => setInput(e.target.checked)} />
            <span className="text-sm text-gray-700">Yes</span>
          </label>
        );
      case 'chips':
        return (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={step.placeholder || 'Type and press Add'}
                className="form-input flex-1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addChip(input); }}
              />
              <button type="button" className="btn btn-outline" onClick={() => addChip(input)}>Add</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Array.isArray(data[step.key]) ? data[step.key] : []).map((chip) => (
                <span key={chip} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 border border-gray-300">
                  {chip}
                  <button type="button" onClick={() => removeChip(chip)} className="text-gray-500 hover:text-red-600">×</button>
                </span>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">Step {current + 1} of {total}</p>
          </div>
          <button type="button" onClick={onBack} className="text-gray-500 hover:text-gray-900" aria-label="Close">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="px-6 pt-4">
            <div className="alert alert-error">
              <div>{error}</div>
            </div>
          </div>
        )}

        <div ref={containerRef} className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Bot prompt */}
            <div className="flex gap-3 items-start">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white flex-shrink-0">W</div>
              <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 max-w-[90%]">
                <p className="text-sm text-gray-800 whitespace-pre-line">{step?.prompt}</p>
              </div>
            </div>
            {/* Current input */}
            <div className="pl-11">
              {renderControl()}
              {localError ? <p className="text-red-600 text-xs mt-1">{localError}</p> : null}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button type="button" onClick={back} className="btn btn-outline">Back</button>
          <div className="flex items-center gap-3">
            {step?.optional && (
              <button
                type="button"
                onClick={() => {
                  if (!step) return; // extra safety
                  setLocalError('');
                  setInput(step.type === 'chips' ? [] : '');
                  if (current + 1 < total) setCurrent((c) => c + 1);
                }}
                className="btn btn-secondary"
              >
                Skip
              </button>
            )}
            <button type="button" onClick={submit} disabled={loading} className="btn btn-primary">
              {current + 1 < total ? (loading ? 'Saving...' : 'Next') : (loading ? 'Creating...' : 'Finish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWizard;
