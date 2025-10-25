import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const StepHeader = ({ step, total, title, subtitle }) => (
  <div className="mb-4">
    <div className="text-xs text-gray-500">Step {step} of {total}</div>
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    {subtitle ? <p className="text-sm text-gray-600 mt-1">{subtitle}</p> : null}
  </div>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-gray-800/40" onClick={onClose} />
    <div className="relative bg-white w-full max-w-2xl mx-4 rounded-xl shadow-xl border border-gray-200">
      {children}
    </div>
  </div>
);

const ConfirmModal = ({ open, title, message, confirmLabel = 'Save & Exit', cancelLabel = 'Discard & Exit', onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-800/40" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-md mx-4 rounded-xl shadow-xl border border-gray-200 p-5">
        <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn btn-outline" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn btn-primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

const initialFromUser = (user) => ({
  name: user?.name || '',
  email: user?.email || '',
  phone: user?.phone || '',
  secondaryPhone: user?.secondaryPhone || '',
  primaryHasWhatsApp: !!user?.primaryHasWhatsApp,
  secondaryHasWhatsApp: !!user?.secondaryHasWhatsApp,
  companyDetails: {
    companyName: user?.companyDetails?.companyName || '',
    officialEmail: user?.companyDetails?.officialEmail || user?.email || '',
    website: user?.companyDetails?.website || '',
    contactPersonRole: user?.companyDetails?.contactPersonRole || '',
    industry: user?.companyDetails?.industry || '',
    companySize: user?.companyDetails?.companySize || '',
    companyAddress: user?.companyDetails?.companyAddress || '',
    city: user?.companyDetails?.city || '',
    state: user?.companyDetails?.state || ''
  }
});

const validate = (data, stepIdx) => {
  const errors = {};
  if (stepIdx === 0) {
    if (!data.companyDetails.companyName?.trim()) errors.companyName = 'Company name is required';
    if (!data.companyDetails.industry?.trim()) errors.industry = 'Industry is required';
    // Website and size optional
  } else if (stepIdx === 1) {
    // Basic phone validation
    if (data.phone && !/^\+?\d[\d\s-]{6,}$/.test(data.phone)) errors.phone = 'Enter a valid phone';
  } else if (stepIdx === 2) {
    // Location optional overall; no hard requirements
  }
  return errors;
};

const EmployerProfileWizard = ({ open, onClose }) => {
  const { user, updateProfile } = useAuth();
  const totalSteps = 3;
  const [step, setStep] = useState(0);
  const [subStep, setSubStep] = useState(0); // for company info field-by-field
  const [busy, setBusy] = useState(false); // only for blocking actions (final save/exit)
  const [saving, setSaving] = useState(false); // background autosave indicator
  const [err, setErr] = useState('');
  const [form, setForm] = useState(() => initialFromUser(user));
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const stepTitles = useMemo(() => [
    {
      title: 'Company Information',
      subtitle: 'Tell candidates who you are. Website and size are optional.'
    },
    {
      title: 'Contact Person',
      subtitle: 'Who should candidates or our team contact?'
    },
    {
      title: 'Location Details',
      subtitle: 'Where is your company located? (optional)'
    }
  ], []);

  // Determine initial position ONCE when modal opens (first incomplete field)
  React.useEffect(() => {
    if (!open) {
      setHasInitialized(false);
      return;
    }
    if (hasInitialized) return; // Don't re-run on user updates
    
    const cd = user?.companyDetails || {};
    // If required fields are missing, stay on company step at the first missing
    if (!cd.companyName) {
      setStep(0);
      setSubStep(0);
      setHasInitialized(true);
      return;
    }
    if (!cd.industry) {
      setStep(0);
      setSubStep(1);
      setHasInitialized(true);
      return;
    }
    // If requireds are done, continue company optional fields if missing, else go to Contact
    if (!cd.companySize) {
      setStep(0);
      setSubStep(2);
      setHasInitialized(true);
      return;
    }
    if (!cd.website) {
      setStep(0);
      setSubStep(3);
      setHasInitialized(true);
      return;
    }
    // All company sub-steps complete → move to Contact
    setStep(1);
    setSubStep(0);
    setHasInitialized(true);
  }, [open, user, hasInitialized]);

  const onInput = (e) => {
    const { name, value, type, checked } = e.target;
    if (name in form) {
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    } else {
      setForm(prev => ({
        ...prev,
        companyDetails: { ...prev.companyDetails, [name]: value }
      }));
    }
  };

  const companyFields = [
    { key: 'companyName', label: 'Company Name', required: true, placeholder: 'e.g., Acme Pvt Ltd' },
    { key: 'industry', label: 'Industry', required: true, type: 'select' },
    { key: 'companySize', label: 'Company Size', required: false, type: 'select' },
    { key: 'website', label: 'Website (optional)', required: false, placeholder: 'https://example.com' },
  ];

  const autoSaveCompanyField = async (idx) => {
    const field = companyFields[idx];
    const val = form.companyDetails[field.key];
    if (field.required && !val?.trim()) {
      throw new Error(`${field.label} is required`);
    }
    // For optional fields, only save if provided
    const payload = {};
    if (val && val !== '') {
      payload.companyDetails = { [field.key]: val };
    }
    if (Object.keys(payload).length === 0) return; // nothing to save
    const res = await updateProfile(payload);
    if (!res.success) throw new Error(res.error || 'Failed to auto-save');
    // Keep local form as-is to prevent flicker/disappearing values; auth state is already updated
  };

  const next = async () => {
    setErr('');
    if (step === 0) {
      // Validate current field locally
      const field = companyFields[subStep];
      const val = (form.companyDetails?.[field.key] || '').toString();
      if (field.required && !val.trim()) {
        setErr(`${field.label} is required`);
        return;
      }
      // Advance immediately
      const atEnd = subStep >= companyFields.length - 1;
      if (atEnd) {
        setStep(1);
        setSubStep(0);
      } else {
        setSubStep(s => s + 1);
      }
      // Background save
      try {
        setSaving(true);
        const payload = { companyDetails: {} };
        if (val) payload.companyDetails[field.key] = val;
        await updateProfile(payload);
      } catch (e) {
        // Non-blocking error
        setErr(e.message || 'Failed to save, but you can continue');
      } finally {
        setSaving(false);
      }
      return;
    }
    // Steps 1 and 2: advance optimistically, save in background
    const nextStep = Math.min(step + 1, totalSteps - 1);
    setStep(nextStep);
    try {
      setSaving(true);
      if (step === 1) {
        const payload = {
          name: form.name,
          phone: form.phone,
          secondaryPhone: form.secondaryPhone,
          primaryHasWhatsApp: form.primaryHasWhatsApp,
          secondaryHasWhatsApp: form.secondaryHasWhatsApp,
          companyDetails: { contactPersonRole: form.companyDetails.contactPersonRole }
        };
        await updateProfile(payload);
      } else if (step === 2) {
        const payload = {
          companyDetails: {
            companyAddress: form.companyDetails.companyAddress,
            city: form.companyDetails.city,
            state: form.companyDetails.state,
          }
        };
        await updateProfile(payload);
      }
    } catch (e) {
      setErr(e.message || 'Failed to save, but you can continue');
    } finally {
      setSaving(false);
    }
  };

  const back = () => {
    setErr('');
    if (step === 0) {
      setSubStep(s => Math.max(0, s - 1));
    } else {
      setStep(s => Math.max(0, s - 1));
    }
  };

  const save = async () => {
    const v = validate(form, step);
    if (Object.keys(v).length) {
      setErr(Object.values(v)[0]);
      return;
    }
    setBusy(true);
    setErr('');
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        secondaryPhone: form.secondaryPhone,
        primaryHasWhatsApp: form.primaryHasWhatsApp,
        secondaryHasWhatsApp: form.secondaryHasWhatsApp,
        companyDetails: form.companyDetails
      };
      const res = await updateProfile(payload);
      if (!res.success) throw new Error(res.error || 'Failed to update');
      // Close modal - auth context is already updated by updateProfile
      onClose?.();
    } catch (e) {
      setErr(e.message || 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  // Save & Exit performs a lenient save of currently filled fields without gating validation
  const saveAndExit = async () => {
    setBusy(true);
    setErr('');
    try {
      const partial = { ...form };
      // Build a minimal payload only with non-empty fields to avoid overwriting existing data
      const payload = {};
      if (partial.name) payload.name = partial.name;
      if (partial.phone) payload.phone = partial.phone;
      if (partial.secondaryPhone) payload.secondaryPhone = partial.secondaryPhone;
      if (typeof partial.primaryHasWhatsApp === 'boolean') payload.primaryHasWhatsApp = partial.primaryHasWhatsApp;
      if (typeof partial.secondaryHasWhatsApp === 'boolean') payload.secondaryHasWhatsApp = partial.secondaryHasWhatsApp;
      const cd = partial.companyDetails || {};
      const filteredCd = {};
      ['companyName','officialEmail','website','contactPersonRole','industry','companySize','companyAddress','city','state']
        .forEach(k => { if (cd[k]) filteredCd[k] = cd[k]; });
      if (Object.keys(filteredCd).length) payload.companyDetails = filteredCd;

      const res = await updateProfile(payload);
      if (!res.success) throw new Error(res.error || 'Failed to update');
      // Close confirmation modal and main wizard - auth context is already updated
      setConfirmExitOpen(false);
      onClose?.();
    } catch (e) {
      setErr(e.message || 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <Modal onClose={onClose}>
      <div className="p-6 relative">
        {/* Close button (X) in top-right corner */}
        <button
          type="button"
          onClick={() => setConfirmExitOpen(true)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Exit"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <StepHeader step={step + 1} total={totalSteps} {...stepTitles[step]} />

        {(saving || err) ? (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded">{err}</div>
        ) : null}
        {saving ? (
          <div className="mb-2 text-xs text-gray-500">Saving…</div>
        ) : null}

        {step === 0 && (
          <div>
            <div className="mb-3 text-xs text-gray-500">Company details • {subStep + 1} of {companyFields.length}</div>
            {(() => {
              const field = companyFields[subStep];
              if (field.type === 'select' && field.key === 'industry') {
                return (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                    <select name="industry" value={form.companyDetails.industry} onChange={onInput} className="form-input w-full">
                      <option value="">Select Industry</option>
                      <option value="IT">IT</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Construction">Construction</option>
                      <option value="Education">Education</option>
                      <option value="Food Service">Food Service</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                );
              }
              if (field.type === 'select' && field.key === 'companySize') {
                return (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <select name="companySize" value={form.companyDetails.companySize} onChange={onInput} className="form-input w-full">
                      <option value="">Select Size</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="200+">200+</option>
                    </select>
                  </div>
                );
              }
              // Defaults to input
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                  <input
                    name={field.key}
                    value={form.companyDetails[field.key]}
                    onChange={onInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!busy) next();
                      }
                    }}
                    className="form-input w-full"
                    placeholder={field.placeholder || ''}
                  />
                </div>
              );
            })()}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name</label>
              <input name="name" value={form.name} onChange={onInput} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role / Position</label>
              <input name="contactPersonRole" value={form.companyDetails.contactPersonRole} onChange={onInput} className="form-input w-full" placeholder="e.g., HR Manager" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone</label>
              <input name="phone" value={form.phone} onChange={onInput} className="form-input w-full" placeholder="+91 XXXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Phone</label>
              <input name="secondaryPhone" value={form.secondaryPhone} onChange={onInput} className="form-input w-full" placeholder="Optional" />
            </div>
            <div className="col-span-1">
              <label className="inline-flex items-center text-sm text-gray-700">
                <input type="checkbox" name="primaryHasWhatsApp" checked={form.primaryHasWhatsApp} onChange={onInput} className="mr-2" />
                Primary phone has WhatsApp
              </label>
            </div>
            <div className="col-span-1">
              <label className="inline-flex items-center text-sm text-gray-700">
                <input type="checkbox" name="secondaryHasWhatsApp" checked={form.secondaryHasWhatsApp} onChange={onInput} className="mr-2" />
                Secondary phone has WhatsApp
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
              <textarea name="companyAddress" value={form.companyDetails.companyAddress} onChange={onInput} rows={2} className="form-input w-full" placeholder="Full address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input name="city" value={form.companyDetails.city} onChange={onInput} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input name="state" value={form.companyDetails.state} onChange={onInput} className="form-input w-full" />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <div>
            {step > 0 || (step === 0 && subStep > 0) ? (
              <button type="button" onClick={back} className="btn btn-outline">Back</button>
            ) : null}
          </div>
          <div className="flex gap-2">
            {step < totalSteps - 1 ? (
              <button type="button" onClick={next} disabled={busy} className="btn btn-primary">{step === 0 ? 'Next' : 'Save & Continue'}</button>
            ) : (
              <button type="button" onClick={save} disabled={busy} className="btn btn-primary">
                {busy ? 'Saving…' : 'Save & Finish'}
              </button>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        open={confirmExitOpen}
        title="Exit setup?"
        message="Would you like to save your current details before exiting?"
        onConfirm={saveAndExit}
        onCancel={() => { setConfirmExitOpen(false); onClose?.(); }}
      />
    </Modal>
  );
};

export default EmployerProfileWizard;
